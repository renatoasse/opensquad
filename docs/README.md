# docs/

Design history of opensquad. Nothing here is loaded by the framework at runtime; these files exist so that decisions can be traced after the fact.

| Folder | What goes here | Naming |
|--------|----------------|--------|
| `specs/` | Design documents: the problem, the options considered, the chosen approach | `YYYY-MM-DD-<topic>-design.md` |
| `plans/` | Implementation plans derived from a spec: ordered tasks, files to touch, acceptance criteria | `YYYY-MM-DD-<topic>-plan.md` |

Conventions:

- A plan should name the spec it implements in its first lines.
- Dates are the day the document was written, not the release date.
- Once shipped, a spec is not edited; a new spec supersedes it.
- This folder is excluded from the npm package (`.npmignore`) but is tracked in git.
