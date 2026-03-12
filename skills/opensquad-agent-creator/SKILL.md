---
name: "Best-Practice Creator"
description: >
  Guides creation and maintenance of best-practice files for the Opensquad best-practices library.
  Handles format validation, cross-references, versioning, and catalog consistency.
description_pt-BR: >
  Guia a criação e manutenção de arquivos de best-practice na biblioteca de best-practices do Opensquad.
  Cuida de validação de formato, referências cruzadas, versionamento e consistência do catálogo.
description_es: >
  Guía la creación y mantenimiento de archivos de best-practice en la biblioteca de best-practices de Opensquad.
  Maneja validación de formato, referencias cruzadas, versionamiento y consistencia del catálogo.
type: prompt
version: "2.0.0"
---

# Best-Practice Creator — Workflow

Use this workflow when creating a new best-practice file for the `_opensquad/core/best-practices/` library.

## Pre-flight Checks

1. **Scan existing best-practice files**: Read `_opensquad/core/best-practices/_catalog.yaml`. Extract `id`, `name`, `whenToUse`, `file` from each entry.
2. **Check for overlap**: Verify the new best-practice file doesn't duplicate an existing entry's `whenToUse` scope. If there's overlap, clarify the differentiation before proceeding.
3. **List available skills**: Read all `skills/*/SKILL.md` files. Extract `name`, `description`, `type` from each — these may inform the best-practice file's content.

## Creation Checklist

For each new best-practice file, ensure ALL of the following:

### Frontmatter (YAML)

- [ ] `id`: lowercase kebab-case (e.g., `copywriting`)
- [ ] `name`: Display name for catalog listing (e.g., `"Copywriting & Persuasive Writing"`)
- [ ] `whenToUse`: Multi-line with positive scope AND "NOT for: ..." negative scope referencing other best-practice IDs
- [ ] `version`: `"1.0.0"` for new best-practice files

### Body (Markdown) — All sections mandatory

- [ ] **Core Principles**: 6+ numbered domain-specific decision rules, each with a bold title and detailed explanation
- [ ] **Techniques & Frameworks**: Concrete methods, models, or processes practitioners use in this discipline (e.g., diagnostic steps, framework selections, structural patterns)
- [ ] **Quality Criteria**: 4+ checkable criteria as `- [ ]` list that can be used to evaluate output
- [ ] **Output Examples**: 2+ complete examples, 15+ lines each, realistic NOT template-like
- [ ] **Anti-Patterns**: Never Do (4+) + Always Do (3+), each with explanation
- [ ] **Vocabulary Guidance**: Terms/phrases to Always Use (5+), Terms/phrases to Never Use (3+), Tone Rules (2+)

### Quality Minimums

| Section | Minimum |
|---------|---------|
| Total file lines | 200+ |
| Core Principles | 6+ numbered rules |
| Techniques & Frameworks | 3+ concrete techniques |
| Vocabulary Always Use | 5+ terms |
| Vocabulary Never Use | 3+ terms |
| Output Examples | 2 complete, 15+ lines each |
| Anti-Patterns (Never Do) | 4+ |
| Anti-Patterns (Always Do) | 3+ |
| Quality Criteria | 4+ checkable items |

## Post-Creation Steps

### 1. Update existing best-practice files' `whenToUse`

For each existing best-practice file whose scope overlaps with the new one:
- Add a "NOT for: {overlapping-scope} → See {new-best-practice-id}" line to their `whenToUse`
- Bump their version (patch increment)

### 2. Update `_catalog.yaml`

Add a new entry to `_opensquad/core/best-practices/_catalog.yaml` with:
- `id`: matching the frontmatter `id`
- `name`: matching the frontmatter `name`
- `whenToUse`: single-line summary of the scope (positive only, no "NOT for")
- `file`: `{id}.md`

Place it under the appropriate section comment (Discipline or Platform best practices).

### 3. File placement

Save to `_opensquad/core/best-practices/{id}.md`.

### 4. Validation

Re-read the created file and verify:
- [ ] All checklist items above are present
- [ ] YAML frontmatter parses correctly (no syntax errors)
- [ ] `whenToUse` references only existing best-practice IDs
- [ ] Output examples are realistic, not template placeholders
- [ ] File exceeds 200 lines
- [ ] Corresponding entry exists in `_catalog.yaml`

---

# Best-Practice Updater — Workflow

Use this workflow when updating best-practice files in the `_opensquad/core/best-practices/` library.

## Versioning Rules (Semver)

| Change Type | Version Bump | Examples |
|-------------|-------------|----------|
| **Patch** (x.x.X) | Fix typos, adjust wording, minor refinements | Fix anti-pattern phrasing, correct a vocabulary term |
| **Minor** (x.X.0) | Add new content, extend capabilities | Add new principle, new output example, new technique |
| **Major** (X.0.0) | Rewrite or restructure significantly | Rewrite core principles, fundamentally change scope |

Always update the `version` field in the YAML frontmatter after any change.

## Update Scenarios

### When a best-practice file is removed from the library

1. Get the removed best-practice file's `id`
2. Remove its entry from `_opensquad/core/best-practices/_catalog.yaml`
3. Scan ALL remaining best-practice files in `_opensquad/core/best-practices/*.md`
4. For each file, check if the removed ID is referenced in `whenToUse`
   - Look for patterns: "NOT for: ... → See {removed-id}"
5. If found, remove that "NOT for" line
6. Bump the affected files' version (patch: x.x.X)

### When a new best-practice file is added to the library

The Best-Practice Creator workflow (above) handles the initial `whenToUse` cross-references during creation. This section is only needed if cross-references were missed or need adjustment after the fact.

1. Read the new best-practice file's `whenToUse` — identify its scope
2. Scan existing best-practice files for overlapping scope
3. Add "NOT for: {new-scope} → See {new-id}" where appropriate
4. Bump affected files' version (patch)
5. Ensure the new entry exists in `_catalog.yaml`

### When updating a best-practice file's content

1. Make the content changes
2. Verify ALL mandatory sections still exist:
   - [ ] Core Principles (6+ rules)
   - [ ] Techniques & Frameworks (3+ techniques)
   - [ ] Quality Criteria (4+ checkable items)
   - [ ] Output Examples (2+ complete examples)
   - [ ] Anti-Patterns (Never Do + Always Do)
   - [ ] Vocabulary Guidance (Always Use, Never Use, Tone Rules)
3. Bump version according to semver rules above
4. If the `whenToUse` scope changed, update cross-references in other best-practice files and in `_catalog.yaml`

### When updating a best-practice file's `whenToUse` scope

This is the most impactful change — it affects how the Architect selects best practices during squad creation.

1. Document the old scope and new scope
2. Update the best-practice file's `whenToUse` field
3. Scan ALL other best-practice files' `whenToUse` for references to this ID
4. Update cross-references to reflect the new scope
5. Update the `whenToUse` summary in `_catalog.yaml`
6. Bump version (minor if scope expanded, patch if scope narrowed)

## Validation Checklist

After ANY update, verify:

- [ ] Version was bumped correctly (patch/minor/major per rules above)
- [ ] All mandatory sections still present and non-empty
- [ ] `whenToUse` cross-references are consistent across ALL best-practice files
- [ ] No broken cross-references to removed best-practice IDs
- [ ] Output examples are still realistic and complete
- [ ] File still exceeds 200 lines minimum
- [ ] `_catalog.yaml` entry is in sync with frontmatter (`id`, `name`, `whenToUse`)

## Bulk Operations

### Verify catalog consistency

```
Read _opensquad/core/best-practices/_catalog.yaml
For each entry in catalog:
  1. Verify _opensquad/core/best-practices/{entry.file} exists
  2. Read the file's frontmatter
  3. Verify entry.id matches frontmatter id
  4. Verify entry.name matches frontmatter name
  5. Flag any mismatches

For each .md file in _opensquad/core/best-practices/ (excluding _catalog.yaml):
  1. Verify a corresponding entry exists in _catalog.yaml
  2. Flag any orphaned files with no catalog entry
```

### Verify cross-reference consistency

```
For each best-practice file A in _opensquad/core/best-practices/*.md:
  For each "NOT for: ... → See {id}" in A.whenToUse:
    1. Verify _opensquad/core/best-practices/{id}.md exists
    2. Verify {id}'s whenToUse covers the referenced scope
    3. Flag inconsistencies
```
