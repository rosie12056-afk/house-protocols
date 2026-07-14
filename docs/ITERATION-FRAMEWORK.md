# Iteration Framework

## Three independent metadata fields

Every governed rule carries three independent fields:

- `origin`: `house`, `external`, `joint`, or `unknown`
- `validation_status`: `proposed`, `validating`, `validated`, `rejected`, or `retired`
- `applicability`: `house_specific`, `multi_instance`, or `candidate_general`

Advancing validation changes only `validation_status`. It never rewrites origin.

```yaml
origin: house
validation_status: validating
applicability: house_specific
```

## Edition mapping

An Edition is a visible name for a fixed internal coordinate. Editions are parallel selections, not an upgrade ladder.

| Edition | `schema_version` | `profile` | `condition_branch` |
| --- | ---: | --- | --- |
| Core Edition | 1 | `strict` | `default` |
| Continuity Edition | 1 | `relaxed` | `memory_aware` |
| Extended Edition | 2 | `modular` | `custom` |

Consumers select an Edition; implementations resolve it to the three-dimensional coordinate. A custom coordinate must not silently reuse an existing Edition name.

## Rationale boundary

A rationale answers, in at most 200 characters total:

1. What failure can occur?
2. Why can this rule reduce it?
3. What can the rule not solve?

Rationales describe failure types. They contain no real names, conversations, or identifying details. Revisions append to the history and never replace the earlier rationale.

## Demo boundary

A demo uses a fully fictional setting, runs without private services, and produces a verifiable result. A story without executable evidence is not a demo. Rationale describes the failure type; demo shows a fictional case. The two layers do not substitute for each other.

## Maintenance responsibility

Each release line declares:

- actively maintained Editions;
- Editions that accept community fixes only;
- whether security and data-corruption fixes are backported;
- whether new features are backported;
- how end of maintenance is marked and announced.

The current matrix is maintained in `COMPATIBILITY.md`; milestone timing is maintained in `ROADMAP.md` and `ECOSYSTEM-ROADMAP.md`.
