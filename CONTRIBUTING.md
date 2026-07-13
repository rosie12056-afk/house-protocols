# Contributing

House Protocols v0.1 is experimental. Before proposing a change, describe the interoperability problem it solves and add tests for every new or changed hard rule.

```bash
npm install
npm run check
```

Contributions must not contain real users, agents, conversations, memories, Keels, prompts, email addresses, secrets, domains, IP addresses, ports, or absolute local paths. Every example must use fictional identities and fictional events.

A protocol field change must update all affected surfaces:

- the corresponding JSON Schema;
- cross-field rules in `src/semantic-rules.mjs`;
- at least one valid or invalid test case;
- the short explanation in the README.

v0.1 may include incompatible changes, but every such change must be identified clearly in its commit or pull request description.
