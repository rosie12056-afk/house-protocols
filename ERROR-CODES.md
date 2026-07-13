# Validation Error Codes

Error codes are the compatibility surface. Human-readable messages may improve without changing the meaning of a code.

## Protocol and schema

| Code | Meaning |
| --- | --- |
| `E_PROTOCOL_VERSION_UNKNOWN` | The document has no supported protocol version |
| `E_PROTOCOL_PROFILE_MISMATCH` | The selected profile and document version differ |
| `E_PROTOCOL_KIND_UNKNOWN` | The kind is not defined in the selected profile |
| `E_SCHEMA_REQUIRED` | A required field is missing |
| `E_SCHEMA_ADDITIONAL_PROPERTY` | A closed schema received an unknown field |
| `E_SCHEMA_CONST` | A fixed value does not match |
| `E_SCHEMA_ENUM` | A value is outside the allowed set |
| `E_SCHEMA_FORMAT` | A formatted value is invalid |
| `E_SCHEMA_PATTERN` | A value does not match its required pattern |
| `E_SCHEMA_TYPE` | A value has the wrong JSON type |
| `E_SCHEMA_BOUNDARY` | A length, count, or numeric boundary is violated |
| `E_SCHEMA_INVALID` | Another JSON Schema rule is violated |

## Evidence and Initiative

| Code | Meaning |
| --- | --- |
| `E_EXTERNAL_FACT_MODEL_OUTPUT_ONLY` | Model output is the only support for an external fact |
| `E_CLAIM_WITHOUT_EVIDENCE` | A claim has no linked evidence item |
| `E_UNKNOWN_CLAIM_REFERENCE` | Evidence points to a claim outside its bundle |
| `E_COMPLETED_WITHOUT_ACTION` | Completion has no actual action |
| `E_COMPLETED_WITHOUT_SUCCESSFUL_ACTION` | Completion has no successful action |
| `E_COMPLETED_WITHOUT_OUTPUT` | Completion has no artifact or result |
| `E_COMPLETED_WITHOUT_EVIDENCE` | Completion has no linked Evidence |

## Memory, lifecycle, and scheduling

| Code | Meaning |
| --- | --- |
| `E_MEMORY_PROMOTION_WITHOUT_EVIDENCE` | Untrusted material is allowed into promoted memory without evidence |
| `E_HIGH_RISK_MEMORY_ACTION_WITHOUT_CONFIRMATION` | Delete or export is allowed without authenticated confirmation |
| `E_RESIGNATURE_EXTERNAL_CLAIM_WITHOUT_EVIDENCE` | A later interpretation includes an unsupported external claim |
| `E_INVALID_TIME_ORDER` | A lifecycle timestamp precedes the event it depends on |
| `E_LIFECYCLE_SELF_REPLACEMENT` | A record attempts to supersede itself |
