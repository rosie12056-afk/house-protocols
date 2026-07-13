# Compatibility

House Protocols has two related version surfaces:

- the repository/package release, such as `v0.1.1`;
- the `protocol_version` inside a document, currently `0.1` or stable `0.2`.

## v0 policy

- A patch release in the `0.1.x` package line may clarify documentation, add compatible fixtures, or fix validation behavior that contradicts the written v0.1 rules. It must not add a required field, remove an accepted field, or reinterpret a valid v0.1 document as a different claim type.
- A `0.2.x` release may introduce incompatible schemas because the project is experimental. Documents using the new surface must declare `protocol_version: "0.2"`.
- Consumers must reject unknown protocol versions. They must not silently coerce a v0.2 document into v0.1.
- Security corrections may reject previously accepted unsafe input. Such a change must include a rule code, fixture, release note, and migration guidance.

## Current matrix

| Consumer | Consumer release | Protocol package | Document version | Upgrade behavior |
| --- | --- | --- | --- | --- |
| House Toolkit | `v0.1.1` | exact Git tag `v0.1.1` | `0.1` | Does not automatically consume Protocols v0.2 |
| House Runtime | `v0.1.0-alpha.1` | exact Git tag `v0.1.1` | `0.1` | Remains on v0.1 until a tested Runtime release changes the lock |

Dependency lockfiles resolve the tags to commit SHAs. Publishing Protocols v0.2 therefore cannot change an already installed Toolkit or Runtime build.

## Adding v0.2

Protocols v0.2 exposes separate `0.1` and `0.2` profiles and retains migration fixtures for all seven original kinds. House Toolkit v0.2 validates both profiles. House Runtime adopted v0.2 explicitly and runs the shared fixtures. Compatibility is demonstrated by tests; matching version numbers alone is not sufficient.

Protocols `v0.2.1` adds lifecycle kinds without changing existing `0.2` documents. Runtime v0.2 and Toolkit v0.2.1 pass the shared lifecycle fixture set.

Package candidate `v0.3.0-rc.1` retains the `0.1` and `0.2` document profiles and adds `runtime_request` and `runtime_response` kinds to `0.2`. Two Runtime clients and cross-repository conformance consume these fixtures before a stable v0.3 release.
