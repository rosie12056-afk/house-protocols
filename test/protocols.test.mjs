import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { RULE_CODES, VALIDATION_RULE_CODES, protocolKinds, protocolProfiles, validateProtocol } from "../src/index.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test("all v0.1 protocol kinds are registered", () => {
  assert.deepEqual(protocolKinds("0.1"), [
    "event",
    "context_manifest",
    "evidence",
    "initiative",
    "resignature",
    "keel",
    "memory_policy_decision"
  ]);
});

test("v0.2 adds lifecycle, scheduler, and capability contracts without changing the v0.1 profile", () => {
  assert.deepEqual(protocolProfiles(), ["0.1", "0.2"]);
  for (const kind of ["record_lifecycle", "scheduler_lease", "capability_grant", "life_state", "lifecycle_opportunity", "journal_entry", "dream_record", "handoff_record"]) {
    assert.equal(protocolKinds("0.2").includes(kind), true, kind);
  }
  assert.equal(protocolKinds("0.1").includes("scheduler_lease"), false);
});

test("all retained v0.1 and migrated v0.2 fixtures validate in their explicit profiles", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "migrations", "v0.1-to-v0.2.json"), "utf8"));
  for (const record of fixture.records) {
    assert.equal(validateProtocol(record.kind, record.before, { profile: "0.1" }).ok, true, `${record.kind} v0.1`);
    assert.equal(validateProtocol(record.kind, record.after, { profile: "0.2" }).ok, true, `${record.kind} v0.2`);
  }
});

test("all new v0.2 contracts validate", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "v0.2", "new-contracts.json"), "utf8"));
  for (const record of fixture.records) assert.equal(validateProtocol(record.kind, record.document, { profile: "0.2" }).ok, true, record.kind);
});

test("all v0.2 lifecycle contracts validate", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "v0.2", "lifecycle-contracts.json"), "utf8"));
  for (const record of fixture.records) assert.equal(validateProtocol(record.kind, record.document, { profile: "0.2" }).ok, true, record.kind);
});

test("dream records are structurally non-factual", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "v0.2", "lifecycle-contracts.json"), "utf8"));
  const dream = structuredClone(fixture.records.find((item) => item.kind === "dream_record").document);
  dream.factuality = "observed";
  const result = validateProtocol("dream_record", dream, { profile: "0.2" });
  assert.equal(result.ok, false);
  assert(result.schema_errors.some((item) => item.code === VALIDATION_RULE_CODES.CONST));
});

test("journal observations cannot be recorded as fact without evidence", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "v0.2", "lifecycle-contracts.json"), "utf8"));
  const journal = structuredClone(fixture.records.find((item) => item.kind === "journal_entry").document);
  journal.events[0].evidence_refs = [];
  const result = validateProtocol("journal_entry", journal, { profile: "0.2" });
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((item) => item.code === RULE_CODES.JOURNAL_OBSERVATION_WITHOUT_EVIDENCE));
});

test("profile mismatch and unknown versions return stable rule codes", () => {
  const event = JSON.parse(readFileSync(join(root, "fixtures", "migrations", "v0.1-to-v0.2.json"), "utf8")).records[0].before;
  assert.equal(validateProtocol("event", event, { profile: "0.2" }).schema_errors[0].code, VALIDATION_RULE_CODES.PROFILE_MISMATCH);
  assert.equal(validateProtocol("event", { ...event, protocol_version: "9.9" }).schema_errors[0].code, VALIDATION_RULE_CODES.UNKNOWN_VERSION);
});

test("the fictional Keel example is valid", () => {
  const keel = JSON.parse(readFileSync(join(root, "examples", "fictional-keel.json"), "utf8"));
  assert.equal(validateProtocol("keel", keel).ok, true);
  assert.equal(keel.provenance.instance, "fictional_example");
});

test("a model output alone cannot establish an external fact", () => {
  const bundle = JSON.parse(readFileSync(join(root, "examples", "model-output-is-not-fact.json"), "utf8"));
  const result = validateProtocol("evidence", bundle);
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((error) => error.code === RULE_CODES.EXTERNAL_FACT_MODEL_OUTPUT_ONLY));
});

test("retrieval confidence does not substitute for truth evidence", () => {
  const bundle = JSON.parse(readFileSync(join(root, "examples", "model-output-is-not-fact.json"), "utf8"));
  bundle.evidence[0].retrieval_confidence = 1;
  const result = validateProtocol("evidence", bundle);
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((error) => error.code === RULE_CODES.EXTERNAL_FACT_MODEL_OUTPUT_ONLY));
});

test("a completion claim without action, output and evidence is rejected", () => {
  const result = validateProtocol("initiative", {
    protocol_version: "0.1",
    initiative_id: "initiative:test:empty",
    owner_id: "agent:lantern",
    goal: "Produce a verifiable artifact.",
    status: "completed",
    created_at: "2032-04-05T09:00:00.000Z",
    updated_at: "2032-04-05T09:01:00.000Z",
    actual_actions: [],
    outputs: [],
    evidence_refs: []
  });
  assert.equal(result.ok, false);
  assert.deepEqual(
    new Set(result.semantic_errors.map((error) => error.code)),
    new Set([
      RULE_CODES.COMPLETED_WITHOUT_ACTION,
      RULE_CODES.COMPLETED_WITHOUT_OUTPUT,
      RULE_CODES.COMPLETED_WITHOUT_EVIDENCE
    ])
  );
});

test("v0.2 blocks ungrounded external memory promotion", () => {
  const result = validateProtocol("memory_policy_decision", {
    protocol_version: "0.2",
    decision_id: "decision:fictional:unsafe",
    operation: "promote",
    subject_id: "agent:lantern",
    resource_ref: { ref_id: "memory:fictional:unsafe", kind: "memory", locator: "memories/unsafe" },
    source_class: "model_generated",
    decision: "allow",
    reason_codes: ["model_suggested"],
    evidence_refs: [],
    decided_at: "2032-04-05T09:04:00.000Z",
  });
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((item) => item.code === RULE_CODES.MEMORY_PROMOTION_WITHOUT_EVIDENCE));
});

test("v0.2 treats resignature reflection as interpretation unless external claims have evidence", () => {
  const migration = JSON.parse(readFileSync(join(root, "fixtures", "migrations", "v0.1-to-v0.2.json"), "utf8"));
  const record = structuredClone(migration.records.find((item) => item.kind === "resignature").after);
  record.claim_scope = "includes_external_claims";
  const result = validateProtocol("resignature", record);
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((item) => item.code === RULE_CODES.RESIGNATURE_EXTERNAL_CLAIM_WITHOUT_EVIDENCE));
});

test("v0.2 scheduler leases reject inverted time windows", () => {
  const fixture = JSON.parse(readFileSync(join(root, "fixtures", "v0.2", "new-contracts.json"), "utf8"));
  const lease = structuredClone(fixture.records.find((item) => item.kind === "scheduler_lease").document);
  lease.expires_at = lease.acquired_at;
  const result = validateProtocol("scheduler_lease", lease);
  assert.equal(result.ok, false);
  assert(result.semantic_errors.some((item) => item.code === RULE_CODES.INVALID_TIME_ORDER));
});
