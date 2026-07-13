import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { RULE_CODES, protocolKinds, validateProtocol } from "../src/index.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test("all v0.1 protocol kinds are registered", () => {
  assert.deepEqual(protocolKinds(), [
    "event",
    "context_manifest",
    "evidence",
    "initiative",
    "resignature",
    "keel",
    "memory_policy_decision"
  ]);
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
