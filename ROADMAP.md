# Roadmap

House Protocols defines the records and trust boundaries shared by House Toolkit and House Runtime. Releases are milestone-driven rather than date-driven: a version ships only when its fixtures pass in every listed consumer.

For the five-repository dependency timeline, see [ECOSYSTEM-ROADMAP.md](ECOSYSTEM-ROADMAP.md).

| Milestone | Target gate | What it adds | Problem solved | Primary users |
| --- | --- | --- | --- | --- |
| v0.1 | Released | Event, Context Manifest, Evidence, Initiative, Resignature, Keel, and Memory Policy contracts | Gives persistent agent systems a small shared vocabulary and prevents model output from silently becoming fact or completion | Runtime authors and agent-system researchers |
| v0.2 | Released; additive lifecycle contracts enter through patch release candidates | Stable error-code catalog, identifier and timestamp rules, deletion/supersession semantics, upgrade fixtures, scheduler/capability contracts, migration examples, and lifecycle records | Makes protocol evolution testable and gives time-aware systems explicit evidence boundaries for journal, dream, and handoff material | Runtime, adapter, and audit-tool implementers |
| v0.3 | Candidate work on `t4-portability`; release after cross-repository and second-consumer conformance | Runtime client envelopes, extension governance, compatibility profiles, a second validator implementation, migration tooling contracts, and a candidate stable core | Tests that the contracts are portable across clients and not accidentally shaped around one Runtime | Third-party implementers and long-lived deployments |

## Release gates

- v0.2 does not ship until valid, invalid, boundary, and migration fixtures pass in House Toolkit and the House Runtime development branch.
- v0.3 does not ship until a second implementation consumes v0.2 without importing House Runtime internals.
- A new protocol version never becomes an automatic dependency update for an existing Runtime release.
- Real House data, instance policy, schedules, interests, relationships, and connectors remain outside this roadmap.

See [COMPATIBILITY.md](COMPATIBILITY.md) for version rules.
