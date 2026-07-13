# Migrating Protocol Documents from 0.1 to 0.2

Migration is explicit and record-by-record. Keep the original `0.1` document, create a separate `0.2` document, validate both profiles, and preserve the link between them in application storage. Do not edit historical source records in place.

The machine-readable examples are in `fixtures/migrations/v0.1-to-v0.2.json`.

## Retained contracts

Event, Context Manifest, Evidence, Initiative, and Keel keep their existing fields. Their `protocol_version` changes to `0.2`, identifiers must use a namespace prefix such as `event:...`, and timestamps must be canonical UTC values ending in `Z`.

Memory Resignature adds:

- `claim_scope`: `interpretation_only` or `includes_external_claims`;
- `evidence_refs`: required when external claims are included.

Memory Policy Decision adds:

- `source_class`: distinguishes authenticated user input, external material, tool observations, system-derived material, model output, and unknown imports;
- `evidence_refs`: required as a field and required to be non-empty when untrusted material is allowed into promoted memory;
- `confirmation_ref`: required when delete or export is allowed.

## New contracts

- Record Lifecycle Event records `supersede`, `soft_delete`, and `restore` actions. A soft deletion does not erase the source record.
- Scheduler Lease records one bounded owner and a monotonic fencing token. Expired ownership must not authorize work.
- Capability Grant records scoped operations, risk level, and confirmation mode. High-risk grants require confirmation for every use.

## Consumer sequence

1. Continue validating stored `0.1` records with the `0.1` profile.
2. Generate new `0.2` records without overwriting the originals.
3. Run both profiles against the migration fixture set.
4. Upgrade Toolkit conformance before enabling Runtime writes in `0.2`.
5. Roll back by disabling `0.2` writes; retained `0.1` records remain readable.
