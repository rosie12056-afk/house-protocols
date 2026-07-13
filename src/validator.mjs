import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateProtocolSemantics } from "./semantic-rules.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const V01_SCHEMA_FILES = Object.freeze({
  event: "event.schema.json",
  context_manifest: "context-manifest.schema.json",
  evidence: "evidence.schema.json",
  initiative: "initiative.schema.json",
  resignature: "resignature.schema.json",
  keel: "keel.schema.json",
  memory_policy_decision: "memory-policy-decision.schema.json",
});

const PROFILES = Object.freeze({
  "0.1": { directory: "schemas", schemas: V01_SCHEMA_FILES },
  "0.2": {
    directory: join("schemas", "v0.2"),
    schemas: Object.freeze({
      ...V01_SCHEMA_FILES,
      record_lifecycle: "record-lifecycle.schema.json",
      scheduler_lease: "scheduler-lease.schema.json",
      capability_grant: "capability-grant.schema.json",
    }),
  },
});

export const VALIDATION_RULE_CODES = Object.freeze({
  UNKNOWN_VERSION: "E_PROTOCOL_VERSION_UNKNOWN",
  PROFILE_MISMATCH: "E_PROTOCOL_PROFILE_MISMATCH",
  UNKNOWN_KIND: "E_PROTOCOL_KIND_UNKNOWN",
  REQUIRED: "E_SCHEMA_REQUIRED",
  ADDITIONAL_PROPERTY: "E_SCHEMA_ADDITIONAL_PROPERTY",
  CONST: "E_SCHEMA_CONST",
  ENUM: "E_SCHEMA_ENUM",
  FORMAT: "E_SCHEMA_FORMAT",
  PATTERN: "E_SCHEMA_PATTERN",
  TYPE: "E_SCHEMA_TYPE",
  BOUNDARY: "E_SCHEMA_BOUNDARY",
  OTHER: "E_SCHEMA_INVALID",
});

function readSchema(directory, filename) {
  return JSON.parse(readFileSync(join(root, directory, filename), "utf8"));
}

function compileProfile({ directory, schemas }) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  ajv.addSchema(readSchema(directory, "common.schema.json"));
  return new Map(
    Object.entries(schemas).map(([kind, filename]) => [kind, ajv.compile(readSchema(directory, filename))]),
  );
}

const validatorsByProfile = new Map(
  Object.entries(PROFILES).map(([version, profile]) => [version, compileProfile(profile)]),
);

function schemaCode(keyword) {
  if (keyword === "required") return VALIDATION_RULE_CODES.REQUIRED;
  if (keyword === "additionalProperties") return VALIDATION_RULE_CODES.ADDITIONAL_PROPERTY;
  if (keyword === "const") return VALIDATION_RULE_CODES.CONST;
  if (keyword === "enum") return VALIDATION_RULE_CODES.ENUM;
  if (keyword === "format") return VALIDATION_RULE_CODES.FORMAT;
  if (keyword === "pattern") return VALIDATION_RULE_CODES.PATTERN;
  if (keyword === "type") return VALIDATION_RULE_CODES.TYPE;
  if (["minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems"].includes(keyword)) {
    return VALIDATION_RULE_CODES.BOUNDARY;
  }
  return VALIDATION_RULE_CODES.OTHER;
}

function normalizedSchemaErrors(errors = []) {
  return errors.map((error) => ({ ...structuredClone(error), code: schemaCode(error.keyword) }));
}

function protocolError(code, message, path = "/protocol_version") {
  return { code, instancePath: path, message };
}

export function protocolProfiles() {
  return Object.keys(PROFILES);
}

export function protocolKinds(profile = "0.2") {
  return [...(validatorsByProfile.get(profile)?.keys() || [])];
}

export function validateProtocol(kind, document, { profile } = {}) {
  const documentVersion = document?.protocol_version;
  const selectedProfile = profile || documentVersion;
  if (!validatorsByProfile.has(selectedProfile)) {
    return {
      ok: false,
      profile: selectedProfile ?? null,
      schema_errors: [protocolError(VALIDATION_RULE_CODES.UNKNOWN_VERSION, `Unknown protocol version: ${selectedProfile ?? "missing"}`)],
      semantic_errors: [],
    };
  }
  if (profile && documentVersion !== profile) {
    return {
      ok: false,
      profile,
      schema_errors: [protocolError(VALIDATION_RULE_CODES.PROFILE_MISMATCH, `Document version ${documentVersion ?? "missing"} does not match profile ${profile}.`)],
      semantic_errors: [],
    };
  }

  const validate = validatorsByProfile.get(selectedProfile).get(kind);
  if (!validate) {
    return {
      ok: false,
      profile: selectedProfile,
      schema_errors: [protocolError(VALIDATION_RULE_CODES.UNKNOWN_KIND, `Unknown protocol kind for profile ${selectedProfile}: ${kind}`, "/")],
      semantic_errors: [],
    };
  }

  const schemaOk = validate(document);
  const semanticErrors = schemaOk ? validateProtocolSemantics(kind, document) : [];
  return {
    ok: Boolean(schemaOk && semanticErrors.length === 0),
    profile: selectedProfile,
    schema_errors: schemaOk ? [] : normalizedSchemaErrors(validate.errors),
    semantic_errors: semanticErrors,
  };
}

export function assertProtocol(kind, document, options) {
  const result = validateProtocol(kind, document, options);
  if (!result.ok) {
    const error = new Error(`${kind} protocol validation failed`);
    error.validation = result;
    throw error;
  }
  return document;
}
