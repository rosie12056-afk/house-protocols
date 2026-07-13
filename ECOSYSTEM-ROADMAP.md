# House Ecosystem Roadmap

This is the canonical version-alignment map for the five planned public repositories. It describes dependency order and release gates, not a promise that unfinished work will ship on a calendar date.

## Version alignment

```mermaid
flowchart LR
  P01["Protocols v0.1.1"] --> P02RC["Protocols v0.2 RC"] --> P02["Protocols v0.2.1"] --> P03RC["Protocols v0.3 RC"] --> P03["Protocols v0.3"]
  T01["Toolkit v0.1.1"] --> T02RC["Toolkit v0.2 RC"] --> T02["Toolkit v0.2.1"] --> T03RC["Toolkit v0.3 RC"] --> T03["Toolkit v0.3"]
  R01["Runtime alpha.1"] --> R02D["Runtime alpha.2 dev"] --> R02["Runtime alpha.2.1"] --> R20["Runtime v0.2"] --> R03RC["Runtime v0.3 RC"] --> R03["Runtime v0.3"]
  AWAIT["Anchor Adapter design"] --> A01C["Adapter v0.1 candidate"] --> A01["Adapter v0.1"] --> A02["Adapter v0.2"]
  CWAIT["Console design"] --> C01C["Console v0.1 alpha"] --> C01["Console v0.1"] --> C02["Console v0.2"]

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

  classDef released fill:#dff2e5,stroke:#23633b,stroke-width:2px,color:#13281a;
  classDef next fill:#fff2c7,stroke:#7a5b00,stroke-width:2px,color:#2e2400;
  class P02,T02,R20,P03RC,T03RC,R03RC,A01C,C01C released;
```

## Phase table

| Phase | Relative timing | Protocols | Toolkit | Runtime | Anchor Adapter | Console | Exit gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T0: released baseline | Completed | `v0.1.1` | `v0.1.1` | `v0.1.0-alpha.1` | Not created | Not created | Historical public-clone and CI baseline passed |
| T1: contract alignment | Completed | `v0.2 RC` | `v0.2 RC` | `alpha.2` development branch | Not created | Not created | v0.1 retention fixtures and v0.2 migration fixtures passed in Toolkit and Runtime |
| T2: controlled Runtime | Completed | `v0.2.0` | `v0.2.0` | `v0.1.0-alpha.2.1` | Design notes only | API observations only | Scheduler, timeout, cancellation, confirmation, Resignature, Memory Port, and restart tests pass |
| T3: 24-hour lifecycle | Completed stable release line | `v0.2.1` | `v0.2.1` | `v0.2.0` | Not created | Not created | Fake-clock tests cover sleep, tick, journal, dream, handoff, restart, and delivery feedback loops |
| T4: portability candidates | Completed release-candidate line | `v0.3.0-rc.1` | `v0.3.0-rc.1` | `v0.3.0-rc.1` | Two standalone local adapters passed | Two Runtime clients passed | Two Memory Adapters, two clients, restart delivery, migration, and cross-repository CI pass without private House dependencies |
| T5: public portability | Current public candidate line; release hardening and second-consumer feedback remain | `v0.3.0-rc.2` | `v0.3.0-rc.3`; supersedes RC2 | `v0.3.0-rc.2` | `v0.1.0-rc.1`; real Anchor upstream integration passes | `v0.1.0-alpha.1`; real Runtime HTTP integration and browser tests pass | Public clone, Anchor compatibility, authenticated client, migration, security, and cross-repository CI pass |

Effort estimates begin only after the previous phase passes. They exclude production House integration and may change when tests expose architectural work.

## Dependency rules

1. Protocols publishes fixtures before Toolkit claims support.
2. Toolkit publishes a conformance profile before Runtime adopts a new protocol version.
3. Runtime adopts versions explicitly through exact tags and lockfile SHAs.
4. Runtime v0.2 must prove lifecycle behavior with a fake clock before real scheduling is enabled.
5. The Runtime v0.3 candidate ports now have independent public implementations. Anchor Adapter and Console release independently and do not inherit stability merely because the ports passed.
6. Production House integration is a separate shadow-and-migration project, not an automatic final phase of this public roadmap.

Toolkit `v0.3.0-rc.2` is superseded by `v0.3.0-rc.3` because RC2 checked Evidence readback against the wrong identifier field. Consumers must use RC3 or later.
