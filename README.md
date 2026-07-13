# House Protocols

House Protocols is an experimental set of model-independent data contracts for persistent agent systems. It defines how events, context references, evidence, initiatives, memory resignatures, Keel documents, and memory policy decisions can be exchanged across different runtimes.

It does not claim that a model is conscious, and it does not treat model output as inherently true.

> A sentence produced by a model proves only that the model produced that sentence. It cannot, by itself, establish an external fact. Accurate retrieval does not make retrieved content true.

## House open-source stack

The three repositories form one explicit chain:

1. **[House Protocols](https://github.com/rosie12056-afk/house-protocols)** defines what records mean and which trust boundaries must hold.
2. **[House Toolkit](https://github.com/rosie12056-afk/house-toolkit)** checks protocol, evidence, completion, and publication rules.
3. **[House Runtime](https://github.com/rosie12056-afk/house-runtime)** executes durable work while preserving those boundaries.

This repository is the definition layer. It does not schedule work or run models. See [ROADMAP.md](ROADMAP.md) and [COMPATIBILITY.md](COMPATIBILITY.md).

## What v0.2 includes

The package retains the complete `0.1` profile and adds an explicit stable `0.2` profile. Callers choose a profile; documents are never silently coerced between versions.

- **Event Envelope**: stable event identity, origin, target, time, idempotency, and tracing fields.
- **Context Manifest**: records which context references were used without copying private source text.
- **Evidence Bundle**: separates claims, sources, and evidence, including retrieval confidence and truth confidence.
- **Initiative Record**: links a goal to actual actions, outputs or results, and evidence. A model saying "completed" is not sufficient.
- **Memory Resignature**: links a later interpretation back to its source and previous interpretation without overwriting history.
- **Keel Document**: represents identity material and provenance while leaving interpretation to the instance.
- **Memory Policy Decision**: expresses allow, deny, quarantine, redact, or confirmation decisions.
- **Record Lifecycle Event (`0.2`)**: records supersession, soft deletion, and restoration without overwriting the original record.
- **Scheduler Lease (`0.2`)**: defines bounded ownership with expiry and fencing tokens.
- **Capability Grant (`0.2`)**: defines scoped operations, risk tier, and confirmation mode.

The original `0.1` schemas remain in `schemas/`; `0.2` schemas live in `schemas/v0.2/`. Cross-field rules live in `src/semantic-rules.mjs`.

```js
import { validateProtocol } from "house-protocols";

validateProtocol("event", eventV01, { profile: "0.1" });
validateProtocol("scheduler_lease", leaseV02, { profile: "0.2" });
```

## What each protocol solves

| Protocol | Problem addressed |
| --- | --- |
| Event Envelope | Identifies the same event across retries, duplicate delivery, and component boundaries |
| Context Manifest | Audits which context was used without duplicating private source content |
| Evidence Bundle | Prevents model output, retrieval matches, or summaries from being mistaken for verified external facts |
| Initiative Record | Prevents a completion claim from replacing actual work, output, and evidence |
| Memory Resignature | Preserves how an interpretation changes over time while retaining the original record |
| Keel Document | Gives identity material a stable structure while keeping real instance content private |
| Memory Policy Decision | Makes memory access, promotion, quarantine, redaction, and confirmation auditable |
| Record Lifecycle Event | Makes supersession and soft deletion append-only and reversible |
| Scheduler Lease | Prevents overlapping workers from treating stale ownership as current |
| Capability Grant | Keeps tool authority scoped, expiring, and explicit about confirmation |

## Five-minute demo

```bash
npm install
npm run demo
```

The demo uses one fictional user and two fictional agents. It shows this flow:

1. A user request is recorded as an Event.
2. A Context Manifest records references only.
3. An Initiative enters execution with a defined goal.
4. A fictional agent creates a real file artifact.
5. A second fictional agent reviews the artifact linkage.
6. An Evidence Bundle records the actions, source, and artifact.
7. The Initiative can enter `completed` only after it has a goal, a successful actual action, an output or result, and linked Evidence.
8. Persisted state is loaded again to demonstrate restart continuity.

Demo output is written to `.demo-output/`.

## Required rules

- Repeated delivery of the same event must use a stable `idempotency_key`.
- API keys, tokens, cookies, and real private data must never enter protocol files, examples, or commit history.
- External writes are disabled by default. This repository contains no external write connector.
- A `completed` Initiative must link a goal, a successful actual action, an output or result, and Evidence.
- Model output can directly prove only that the output occurred. It cannot alone establish an external fact mentioned in the output.

## Design boundaries

- A Context Manifest stores references, not the private body of referenced material.
- Evidence is auditable material, not truth. Implementations still need an explicit truth-assessment policy.
- The Keel example uses only a fictional agent. Its grounding statement is `缘起性空，性空缘起，一切皆是因果。`; it is not copied from a real House instance.
- v0.2 remains **experimental**. Any future incompatible protocol change must use a new document profile and migration fixtures.
- This release provides protocols, semantic validation, and a demo. It does not provide production scheduling, queues, databases, or model calls.

## Not included

- House Runtime Engine. It will be released separately and is not part of this repository.
- Any real agent, user, conversation, memory, Keel, prompt, or relationship configuration.
- House interest terms, daily selections, topic-selection logic, or schedules.
- Forum, email, game, search, model-provider, or other external connectors.
- Internal communities, deployment addresses, IPs, ports, secrets, or databases.

## Repository structure

```text
house-protocols/
|-- schemas/              # JSON Schema contracts
|   `-- v0.2/             # Explicit v0.2 profile; v0.1 remains at schemas/
|-- fixtures/             # Retained v0.1 and v0.1-to-v0.2 migration records
|-- src/                  # Schema validation and cross-field semantic rules
|-- examples/             # Fully fictional protocol examples
|-- demo/                 # Five-minute closed-loop demo
|-- test/                 # Regression tests for hard rules
|-- scripts/              # Pre-publication privacy and language scan
|-- CONTRIBUTING.md
|-- LICENSE               # Apache-2.0
`-- README.md
```

See [MIGRATION.md](MIGRATION.md), [ERROR-CODES.md](ERROR-CODES.md), [ROADMAP.md](ROADMAP.md), [COMPATIBILITY.md](COMPATIBILITY.md), and [CONTRIBUTING.md](CONTRIBUTING.md).
