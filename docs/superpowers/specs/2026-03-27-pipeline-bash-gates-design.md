# Pipeline Bash Gates — Programmatic Output & Input Validation

**Date:** 2026-03-27
**Status:** Implemented
**Scope:** `_opensquad/core/runner.pipeline.md` (inline changes only)

## Problem

The pipeline runner relies entirely on semantic instructions (natural language in prompts) for validation. When an agent fails to produce output — or produces empty/fake output — the LLM tends to fabricate a success report and advance to the next step rather than stopping. This was observed in production: Sherlock declared 5 profiles analyzed while investigation directories were empty on disk. The pipeline continued to the Design phase with fabricated data.

The root cause: semantic instructions ("verify the output was created") lose to the LLM's native tendency to complete sequences and produce coherent output. Hallucination is the path of least resistance.

## Solution

Add **bash gates** — mandatory shell commands with binary pass/fail outcomes — that the runner must execute between pipeline steps. The LLM reads the bash output (not its own memory) to determine whether to proceed.

This is programmatic validation within a prompt-only framework: no new runtime, no new files, no new dependencies. Just bash commands whose output cannot be hallucinated.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Where validation lives | Inline in `runner.pipeline.md` | Simplicity. No indirection. LLM can't skip reading a separate file. |
| Failure behavior | Retry once → fallback to user | Consistent with existing veto condition pattern (max attempts, then user decides). |
| Validation scope | Output existence + input existence | Covers the two observed failure modes: fake outputs and missing inputs. |
| Scope of pre-conditions | Generic (file-based) only | Runner should not know agent-specific details (login state, API keys). Agents own their own pre-conditions. |

## Changes to `runner.pipeline.md`

### 1. Post-Step Output Validation

**Location:** After each step completes, before handoff to next step.
- For subagent steps: after "Read the output file to verify it was created" (current line ~246)
- For inline steps: after "Save output to the specified output file" (current line ~254)

**New section: "Post-Step Output Validation"**

After a step produces output and before advancing to the next step (or handoff), the runner MUST execute:

```bash
test -s "{transformed outputFile path}" && echo "VALIDATION:PASS" || echo "VALIDATION:FAIL"
```

Rules:
- If `VALIDATION:PASS` → proceed normally (handoff, next step)
- If `VALIDATION:FAIL` → **retry once**: re-execute the step with the same input and context. After re-execution, run the validation again.
  - If second attempt returns `VALIDATION:PASS` → proceed normally
  - If second attempt returns `VALIDATION:FAIL` → present to user:
    ```
    ⚠️ {Agent Name}'s output was not generated: {path}

    1. Retry step
    2. Skip step and continue
    3. Abort pipeline
    ```
    Wait for user choice before proceeding.
- If the step does not declare an `outputFile` → skip output validation
- For steps with multiple output files: validate each one. ALL must pass. If any fails, the entire step is treated as failed (retry logic applies to the full step, not individual files).

The `test -s` command checks two things: (1) the file exists, and (2) the file has size greater than zero. Both conditions must be true for PASS.

### 2. Pre-Step Input Validation

**Location:** Before executing each step, after the dashboard update (current line ~199) and before "Check execution mode" (current line ~228).

**New section: "Pre-Step Input Validation"**

Before dispatching any step, if the step's frontmatter declares an `inputFile`, the runner MUST execute:

```bash
test -s "{transformed inputFile path}" && echo "VALIDATION:PASS" || echo "VALIDATION:FAIL"
```

Rules:
- If `VALIDATION:PASS` → proceed to execute the step
- If `VALIDATION:FAIL` → do NOT execute the step. Present to user:
  ```
  ⚠️ Input for {Agent Name} not found: {path}
  The previous step may have failed to produce output.

  1. Skip step and continue
  2. Abort pipeline
  ```
  No retry here — if the input file doesn't exist, re-executing the current step won't create it. The problem is upstream.
- If the step does not declare an `inputFile` → skip input validation
- Checkpoint steps (`type: checkpoint`) are exempt — they receive input from the user, not from files.

### 3. Validation Output Format

The runner must use the exact strings `VALIDATION:PASS` and `VALIDATION:FAIL` as markers. These are chosen to be:
- Unambiguous — not something the LLM would generate conversationally
- Greppable — easy to search in logs
- Binary — no room for interpretation

The runner reads the bash command output and acts on the marker string. It does NOT interpret the result — it pattern-matches `VALIDATION:PASS` or `VALIDATION:FAIL`.

## What This Does NOT Cover

- **Content quality validation** (is the output meaningful, not just non-empty): Covered by the existing Veto Conditions mechanism. Bash gates check existence; veto conditions check quality. They are complementary.
- **Agent-specific pre-conditions** (is the user logged into Instagram, are API keys valid): Each agent/skill owns its own pre-conditions. The runner validates generically (files exist), not specifically (login active). Sherlock's "Prerequisites Check" section remains responsible for its own checks.
- **Audit trail / validation logs**: Out of scope. This design solves hallucination, not auditability.

## Execution Order Per Step (Updated)

```
1. Dashboard update (state.json)
2. PRE-STEP INPUT VALIDATION ← new
3. Check execution mode (subagent / inline / checkpoint)
4. Execute step
5. POST-STEP OUTPUT VALIDATION ← new
6. Veto Condition Enforcement (existing)
7. Handoff to next step
```

## Example: What Changes For the Sherlock Failure Scenario

**Before (current behavior):**
1. Sherlock subagent dispatched
2. Sherlock fails to log in, fabricates analysis, returns
3. Runner reads "output file" — file is empty or missing
4. Runner proceeds to next step (semantic instruction to "verify" was ignored)
5. Pipeline completes with fabricated data

**After (with bash gates):**
1. Sherlock subagent dispatched
2. Sherlock fails to log in, fabricates analysis, returns
3. Runner executes `test -s "squads/.../raw-content.md"` → `VALIDATION:FAIL`
4. Runner retries Sherlock once
5. If still `VALIDATION:FAIL` → user is asked: retry, skip, or abort
6. Pipeline does NOT advance with empty data
