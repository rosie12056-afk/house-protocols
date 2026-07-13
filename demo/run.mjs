import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertProtocol } from "../src/index.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, ".demo-output");
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(join(outputDir, "artifacts"), { recursive: true });

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const writeJson = (name, value) => writeFileSync(join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);

const event = assertProtocol("event", {
  protocol_version: "0.1",
  event_id: "event:demo:request",
  event_type: "request:received",
  source: "user:avery",
  target: "agent:lantern",
  occurred_at: "2032-04-05T09:00:00.000Z",
  idempotency_key: "demo-request-2032-04-05",
  correlation_id: "run:demo:1",
  payload: { request: "Read the fictional observatory note and produce a short summary." }
});

const reviewEvent = assertProtocol("event", {
  protocol_version: "0.1",
  event_id: "event:demo:review-request",
  event_type: "artifact:review_requested",
  source: "agent:lantern",
  target: "agent:harbor",
  occurred_at: "2032-04-05T09:01:31.000Z",
  idempotency_key: "demo-review-2032-04-05",
  correlation_id: "run:demo:1",
  causation_id: "event:demo:request",
  payload: { artifact_ref: "artifact:summary:demo" }
});

const sourceText = "The fictional observatory log records rain at noon and clear skies by dusk.";
const contextManifest = assertProtocol("context_manifest", {
  protocol_version: "0.1",
  manifest_id: "manifest:demo:1",
  run_id: "run:demo:1",
  subject_id: "agent:lantern",
  created_at: "2032-04-05T09:00:01.000Z",
  entries: [
    {
      ref_id: "source:observatory:fictional",
      kind: "source",
      locator: "fictional://observatory/log-17",
      digest: digest(sourceText),
      observed_at: "2032-04-05T08:59:00.000Z",
      purpose: "Source selected for the requested summary.",
      retrieval_confidence: 0.97
    }
  ],
  budget: { item_count: 1, estimated_tokens: 24 }
});

const artifactBody = "# Fictional observatory summary\n\nRain was recorded at noon; the sky cleared by dusk.\n";
const artifactPath = join(outputDir, "artifacts", "observatory-summary.md");
writeFileSync(artifactPath, artifactBody);

const evidence = assertProtocol("evidence", {
  protocol_version: "0.1",
  bundle_id: "evidence:demo:1",
  created_at: "2032-04-05T09:02:00.000Z",
  claims: [
    {
      claim_id: "claim:artifact-written",
      claim_type: "action_result",
      statement: "The summary artifact was written.",
      truth_confidence: 1,
      status: "supported"
    },
    {
      claim_id: "claim:fictional-weather",
      claim_type: "external_fact",
      statement: "The fictional observatory log records rain at noon and clear skies by dusk.",
      truth_confidence: 0.95,
      status: "supported"
    },
    {
      claim_id: "claim:review-completed",
      claim_type: "action_result",
      statement: "The fictional reviewer completed the artifact check.",
      truth_confidence: 1,
      status: "supported"
    }
  ],
  evidence: [
    {
      evidence_id: "evidence:artifact:demo",
      supports_claim_ids: ["claim:artifact-written"],
      evidence_type: "artifact",
      source_ref: {
        ref_id: "artifact:summary:demo",
        kind: "artifact",
        locator: ".demo-output/artifacts/observatory-summary.md",
        digest: digest(artifactBody),
        observed_at: "2032-04-05T09:01:30.000Z"
      },
      observed_at: "2032-04-05T09:01:30.000Z",
      retrieval_confidence: 1
    },
    {
      evidence_id: "evidence:source:demo",
      supports_claim_ids: ["claim:fictional-weather"],
      evidence_type: "source_document",
      source_ref: {
        ref_id: "source:observatory:fictional",
        kind: "source",
        locator: "fictional://observatory/log-17",
        digest: digest(sourceText),
        observed_at: "2032-04-05T08:59:00.000Z"
      },
      observed_at: "2032-04-05T08:59:00.000Z",
      retrieval_confidence: 0.97
    },
    {
      evidence_id: "evidence:review-log:demo",
      supports_claim_ids: ["claim:review-completed"],
      evidence_type: "tool_result",
      source_ref: {
        ref_id: "result:review:demo",
        kind: "source",
        locator: "fictional://tool-results/review-demo",
        observed_at: "2032-04-05T09:01:50.000Z"
      },
      observed_at: "2032-04-05T09:01:50.000Z",
      retrieval_confidence: 1
    }
  ]
});

const initiative = assertProtocol("initiative", {
  protocol_version: "0.1",
  initiative_id: "initiative:demo:summary",
  owner_id: "agent:lantern",
  goal: "Produce a short summary grounded in the fictional observatory note.",
  status: "completed",
  created_at: "2032-04-05T09:00:02.000Z",
  updated_at: "2032-04-05T09:02:00.000Z",
  actual_actions: [
    {
      action_id: "action:demo:write-summary",
      action_type: "artifact.write",
      started_at: "2032-04-05T09:01:00.000Z",
      finished_at: "2032-04-05T09:01:30.000Z",
      status: "succeeded",
      result_summary: "A summary file was written and hashed."
    },
    {
      action_id: "action:demo:review-summary",
      action_type: "artifact.review",
      started_at: "2032-04-05T09:01:31.000Z",
      finished_at: "2032-04-05T09:01:50.000Z",
      status: "succeeded",
      result_summary: "The fictional reviewer checked source linkage and artifact presence."
    }
  ],
  outputs: [
    {
      output_id: "artifact:summary:demo",
      output_type: "artifact",
      locator: ".demo-output/artifacts/observatory-summary.md",
      digest: digest(artifactBody)
    },
    {
      output_id: "result:review:demo",
      output_type: "decision",
      locator: "fictional://tool-results/review-demo"
    }
  ],
  evidence_refs: ["evidence:demo:1"]
});

const resignature = assertProtocol("resignature", {
  protocol_version: "0.1",
  resignature_id: "resignature:demo:1",
  subject_id: "agent:lantern",
  source_ref: {
    ref_id: "event:demo:request",
    kind: "event",
    locator: "fictional://events/demo-request",
    observed_at: "2032-04-05T09:00:00.000Z"
  },
  layer: 1,
  stance: "recognize",
  reflection_body: "The request became clearer after the source and artifact were linked explicitly.",
  facets: { carry_forward: "Keep source claims separate from action results." },
  created_at: "2032-04-05T09:03:00.000Z",
  provenance: {
    origin: "self_reflection",
    recorded_by: "agent:lantern",
    trigger_ref: {
      ref_id: "evidence:demo:1",
      kind: "evidence",
      locator: "fictional://evidence/demo-1",
      observed_at: "2032-04-05T09:02:00.000Z"
    }
  }
});

const policyDecision = assertProtocol("memory_policy_decision", {
  protocol_version: "0.1",
  decision_id: "decision:demo:1",
  operation: "promote",
  subject_id: "agent:lantern",
  resource_ref: {
    ref_id: "resignature:demo:1",
    kind: "memory",
    locator: "fictional://memory/resignature-demo-1",
    observed_at: "2032-04-05T09:03:00.000Z"
  },
  decision: "allow",
  reason_codes: ["fictional_demo_safe", "source_linked"],
  decided_at: "2032-04-05T09:03:01.000Z",
  policy_version: "demo-1"
});

const keel = assertProtocol(
  "keel",
  JSON.parse(readFileSync(join(root, "examples", "fictional-keel.json"), "utf8"))
);

const state = {
  events: [event, reviewEvent],
  context_manifest: contextManifest,
  initiative,
  evidence,
  resignature,
  memory_policy_decision: policyDecision,
  keel
};
writeJson("session.json", state);

const restored = JSON.parse(readFileSync(join(outputDir, "session.json"), "utf8"));
assertProtocol("initiative", restored.initiative);
assertProtocol("evidence", restored.evidence);

console.log("House Protocols demo: PASS");
console.log("- request event recorded");
console.log("- context references recorded without copying source text into the manifest");
console.log("- artifact written and hashed");
console.log("- a second fictional agent reviewed the artifact linkage");
console.log("- evidence validated");
console.log("- initiative completed only after action + output + evidence");
console.log("- persisted state reloaded successfully");
console.log(`- output: ${outputDir}`);
