import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateEvidenceSemantics, validateInitiativeSemantics } from "./semantic-rules.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const SCHEMA_FILES = Object.freeze({
  event: "event.schema.json",
  context_manifest: "context-manifest.schema.json",
  evidence: "evidence.schema.json",
  initiative: "initiative.schema.json",
  resignature: "resignature.schema.json",
  keel: "keel.schema.json",
  memory_policy_decision: "memory-policy-decision.schema.json",
});

function readSchema(filename) {
  return JSON.parse(readFileSync(join(root, "schemas", filename), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addSchema(readSchema("common.schema.json"));

const validators = new Map(
  Object.entries(SCHEMA_FILES).map(([kind, filename]) => {
    const schema = readSchema(filename);
    return [kind, ajv.compile(schema)];
  }),
);

export function protocolKinds() {
  return [...validators.keys()];
}

export function validateProtocol(kind, document) {
  const validate = validators.get(kind);
  if (!validate) {
    return {
      ok: false,
      schema_errors: [{ message: `Unknown protocol kind: ${kind}` }],
      semantic_errors: [],
    };
  }

  const schemaOk = validate(document);
  const semanticErrors = schemaOk
    ? kind === "evidence"
      ? validateEvidenceSemantics(document)
      : kind === "initiative"
        ? validateInitiativeSemantics(document)
        : []
    : [];

  return {
    ok: Boolean(schemaOk && semanticErrors.length === 0),
    schema_errors: schemaOk ? [] : structuredClone(validate.errors || []),
    semantic_errors: semanticErrors,
  };
}

export function assertProtocol(kind, document) {
  const result = validateProtocol(kind, document);
  if (!result.ok) {
    const error = new Error(`${kind} protocol validation failed`);
    error.validation = result;
    throw error;
  }
  return document;
}
