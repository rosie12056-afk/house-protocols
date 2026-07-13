# House Ecosystem Roadmap

This is the canonical version-alignment map for the five planned public repositories. It describes dependency order and release gates, not a promise that unfinished work will ship on a calendar date.

## Version alignment

```mermaid
flowchart LR
  P01["Protocols v0.1.1"] --> P02RC["Protocols v0.2 RC"] --> P02["Protocols v0.2"] --> P03RC["Protocols v0.3 RC"] --> P03["Protocols v0.3"]
  T01["Toolkit v0.1.1"] --> T02RC["Toolkit v0.2 RC"] --> T02["Toolkit v0.2"] --> T03RC["Toolkit v0.3 RC"] --> T03["Toolkit v0.3"]
  R01["Runtime alpha.1"] --> R02D["Runtime alpha.2 dev"] --> R02["Runtime alpha.2"] --> R20["Runtime v0.2"] --> R03RC["Runtime v0.3 RC"] --> R03["Runtime v0.3"]
  AWAIT["Anchor Adapter: not created"] --> A01C["Adapter v0.1 candidate"] --> A01["Adapter v0.1"] --> A02["Adapter v0.2"]
  CWAIT["Console: not created"] --> C01C["Console v0.1 alpha"] --> C01["Console v0.1"] --> C02["Console v0.2"]

  P02RC -. "fixtures required" .-> T02RC
  T02RC -. "conformance required" .-> R02D
  P02 -. "explicit adoption" .-> R02
  T02 -. "release gate" .-> R02
  R02 -. "lifecycle foundation" .-> R20
  R03RC -. "Memory Port candidate" .-> A01C
  R03RC -. "client API candidate" .-> C01C
  A01C -. "adapter feedback" .-> R03
  C01C -. "client feedback" .-> R03
  P03 -. "stable contracts" .-> A01
  T03 -. "adapter checks" .-> A01
  R03 -. "stable Runtime API" .-> C01
```

## Phase table

| Phase | Relative timing | Protocols | Toolkit | Runtime | Anchor Adapter | Console | Exit gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0: released baseline | Current | `v0.1.1` | `v0.1.1` | `v0.1.0-alpha.1` | Not created | Not created | Existing public-clone and CI checks remain green |
| T1: contract alignment | Next; about 1-2 focused development days | `v0.2 RC` | `v0.2 RC` | `alpha.2` development branch | Not created | Not created | v0.1 retention fixtures and v0.2 migration fixtures pass in Toolkit and Runtime |
| T2: controlled Runtime | After T1; about 2-4 focused development days | `v0.2` | `v0.2` | `alpha.2` | Design notes only | API observations only | Scheduler, timeout, cancellation, confirmation, Resignature, Memory Port, and restart tests pass |
| T3: 24-hour lifecycle | After T2; about 3-6 focused development days | `v0.2.x` | `v0.2.x` | `v0.2` | Local conformance fixture only | Local client fixture only | Fake-clock tests cover sleep, tick, journal, dream, handoff, and delivery feedback loops |
| T4: portability candidates | After T3; about 3-5 focused development days plus second implementations | `v0.3 RC` | `v0.3 RC` | `v0.3 RC` | Local `v0.1` candidate | Local `v0.1 alpha` candidate | Two Memory Adapters and two clients pass conformance without private House dependencies |
| T5: public portability | After T4 gates; release hardening only | `v0.3` | `v0.3` | `v0.3` | Create repository and release `v0.1` | Create repository and release `v0.1 alpha` | Public clone, migration, security, and cross-repository CI pass |

Effort estimates begin only after the previous phase passes. They exclude production House integration and may change when tests expose architectural work.

## Dependency rules

1. Protocols publishes fixtures before Toolkit claims support.
2. Toolkit publishes a conformance profile before Runtime adopts a new protocol version.
3. Runtime adopts versions explicitly through exact tags and lockfile SHAs.
4. Runtime v0.2 must prove lifecycle behavior with a fake clock before real scheduling is enabled.
5. Anchor Adapter and Console repositories are not created until Runtime v0.3 candidate ports have independent implementations to test against.
6. Production House integration is a separate shadow-and-migration project, not an automatic final phase of this public roadmap.
