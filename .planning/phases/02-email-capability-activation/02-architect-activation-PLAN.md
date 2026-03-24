---
wave: 2
depends_on:
  - 01-provider-registry-PLAN.md
files_modified:
  - templates/_opensquad/core/architect.agent.yaml
  - templates/_opensquad/core/skills.engine.md
requirements:
  - ACTV-01
  - ACTV-02
autonomous: true
---

# Objective
Teach the Architect workflow to detect email intent during squad or agent design and surface the correct provider recommendation before the target artifact is written.

## must_haves
- The Architect workflow can detect when a squad or agent request needs email capability from the user's intent, not from runner-only preflight.
- When no email provider is configured, the Architect recommends Resend as the default v1 provider and can include the install/setup path in its guidance.
- When multiple configured email providers exist, the Architect asks the user to verify the provider instead of assuming Resend.
- The skill-discovery language in the skills engine matches the capability-first registry from wave 1.

## verification
- A squad-creation request that mentions email, outreach, notifications, or sending messages triggers email-capability detection in the Architect prompt.
- An agent-design request that mentions email, outreach, notifications, or sending messages also triggers email-capability detection in the Architect prompt.
- When no provider is configured, the generated guidance recommends Resend explicitly as the default v1 provider.
- When more than one provider is configured, the user is asked to choose or verify the provider before squad generation continues.
- The skills engine text no longer describes Resend as the only possible email backend.

## tasks
<task id="add-email-intent-detection-to-architect">
  <objective>Update the Architect prompt so squad and agent design can detect email capability requirements and route them to provider resolution.</objective>
  <read_first>
    - `templates/_opensquad/core/architect.agent.yaml`
    - `src/email-providers.js`
    - `src/skills.js`
  </read_first>
  <action>
    - Add an email-intent rule to the `create-squad` and agent-design workflows that treats requests containing send, email, mail, notify, outreach, newsletter, or campaign language as email-capable unless the user explicitly says otherwise.
    - Insert a design-time decision point after domain identification that asks whether the squad or agent needs email sending and, if yes, resolves the provider before the target artifact is generated.
    - When no provider is configured, the prompt must recommend `resend` as the default v1 provider and mention the install/setup path the user should follow.
    - When multiple providers are available, the prompt must ask the user to verify the provider choice and must not assume `resend`.
  </action>
  <acceptance_criteria>
    - The Architect can surface email capability during squad creation and agent design without waiting for runner preflight.
    - The prompt text clearly distinguishes no-provider, single-provider, and multi-provider cases.
    - The generated squad guidance references the resolved provider id rather than a hardcoded `resend` assumption.
  </acceptance_criteria>
</task>
<task id="align-skills-engine-with-capability-selection">
  <objective>Document the capability-first provider model so the skills engine matches the Architect behavior and future provider support stays explicit.</objective>
  <read_first>
    - `templates/_opensquad/core/skills.engine.md`
    - `templates/_opensquad/core/architect.agent.yaml`
    - `src/email-providers.js`
  </read_first>
  <action>
    - Revise the skills-engine documentation to describe email as a capability that can be satisfied by more than one provider.
    - Document the selection order as explicit choice, single configured provider, then default recommendation, and state that `resend` is the default v1 recommendation only.
    - Add a guardrail note that the engine should not hardcode `resend` as the only backend and should preserve the existing install flow when a provider is already configured.
  </action>
  <acceptance_criteria>
    - The documentation matches the provider resolution behavior introduced in wave 1.
    - The docs describe how a future provider can plug into the same selection model.
    - The skills engine still preserves the file-based install and detection flow already established in phase 1.
  </acceptance_criteria>
</task>
