# Governance

House Protocols accepts three paths of evolution:

| Path | Meaning | Validation source |
| --- | --- | --- |
| Mainline growth | A rule emerges from a private House instance | The instance retains its complete validation chain |
| Conditional branch | Another instance adds a condition for its own setting | The contributor states its evidence source and applicability |
| Community evolution | Protocols, Runtime, Toolkit, Console, and Keel use normal open-source review | issue -> proposal -> review -> merge |

## Contribution flow

1. Open an issue that states the failure mode, proposed contract change, and known limitation.
2. Mark the proposal's origin, validation status, and applicability independently.
3. Add valid, invalid, and boundary fixtures using fictional data only.
4. Record compatibility impact and consumer versions.
5. Submit a PR for review. A House-derived proposal is not automatically general.

## Review standard

A change must preserve provenance, avoid converting model output or retrieval into external fact, and avoid treating a completion claim as completed work. Incompatible contract changes require a new protocol profile or an explicitly experimental surface with migration fixtures.

## Trust boundaries

- A model-produced statement proves only that the statement was produced.
- Accurate retrieval does not make retrieved content true.
- `validated` is a technical lifecycle state, not truth certification.
- Private instance data, relationship material, prompts, connectors, credentials, addresses, and schedules do not belong in this repository.

## Non-implications

- "Validated by House" does not mean suitable for another deployment.
- Parallel Editions do not imply equivalent features or outcomes.
- Accepting a community contribution does not make House responsible for another instance's use.
- These protocols do not establish consciousness, identity, experience, or moral status.

Keel-specific rule lifecycle and mainline authority belong in the Keel repository's own `GOVERNANCE.md`.
