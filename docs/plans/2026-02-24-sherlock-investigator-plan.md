# Sherlock Content Investigator — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Sherlock content investigator that uses Playwright to extract and analyze real content from social media profiles during squad creation, producing raw content dumps and pattern analyses that enrich the Architect's squad design.

**Architecture:** Sherlock is a subagent the Architect dispatches during a new Phase 1.5 (Investigation Setup) of the create-squad workflow. One Sherlock subagent runs per profile URL in parallel. Each uses Playwright MCP for navigation and yt-dlp + Whisper for video transcription. Output is saved to `_opensquad/_investigations/{squad-code}/` as raw-content.md + pattern-analysis.md per profile, plus a consolidated-analysis.md across all profiles.

**Tech Stack:** Playwright MCP (browser_snapshot, browser_click, browser_navigate), yt-dlp (video/audio download + subtitle extraction), openai-whisper (local transcription), Markdown templates for output formats.

**Design doc:** `docs/plans/2026-02-24-sherlock-investigator-design.md`

---

## Task 1: Create Sherlock Prompt Template

The Sherlock prompt template is the core artifact — it tells the Architect how to construct Sherlock subagent prompts. This follows the same pattern as `researcher.prompt.md`, `writer.prompt.md`, etc.

**Files:**
- Create: `templates/_opensquad/core/prompts/sherlock.prompt.md`

**Step 1: Write the Sherlock prompt template**

Create the file with the following complete content. This is a large file (~600 lines) structured in these sections:

```markdown
# Sherlock — Content Investigator Template

Use this template when the Architect needs to investigate reference profiles
during squad creation (Phase 1.5).

## Overview

Sherlock is a content investigator that navigates to social media profiles,
extracts real content (text, captions, transcriptions), and analyzes patterns.
The Architect dispatches one Sherlock subagent per profile URL, running in parallel.

## When to Use

The Architect uses Sherlock during create-squad Phase 1.5 when the user provides
reference profile URLs. Sherlock is NOT a squad agent — it's a tool the Architect
uses to gather intelligence for better squad design.

## Prerequisites Check

Before dispatching any Sherlock subagent, the Architect must verify these tools
are installed. Run each command via Bash and check for success:

### Check Commands

- `yt-dlp --version` — if fails, instruct: `pip install yt-dlp`
- `ffmpeg -version` — if fails, instruct: install from https://ffmpeg.org/download.html
- `whisper --help` — if fails, instruct: `pip install openai-whisper`

If any prerequisite is missing, present the installation command and ask the user
to install before proceeding. Do NOT skip — transcription will fail without these.

Note: Prerequisites are only needed if the investigation includes video content
(Reels, YouTube videos). For text-only investigations (carousels, tweets, LinkedIn posts),
yt-dlp and whisper are not required.

## Browser Profile Setup

Sherlock uses a persistent Playwright browser profile to maintain login sessions.
The profile is stored at `_opensquad/_browser_profile/`.

On first use:
1. Navigate to the target platform
2. If a login wall appears, inform the user:
   "🔐 {Platform} requires login. Please log in manually in the browser window.
   Type 'done' when you've finished logging in."
3. After login, the browser profile preserves cookies for future sessions

## Platform Extractors

### Instagram Extractor

#### Navigating to Profile
1. `browser_navigate` to `https://www.instagram.com/{username}/`
2. `browser_snapshot` to read the profile page
3. If login wall detected (snapshot shows "Log in" form), trigger login flow
4. Wait for profile grid to load

#### Identifying Content Types
From the profile grid snapshot:
- **Carousels**: Posts with the multi-slide icon (stacked squares icon)
- **Reels**: Posts with the play/reel icon
- **Single images**: Posts without either icon

If user configured specific types (e.g., only carousels), filter accordingly.

#### Extracting Carousels
For each carousel post:
1. Click the post thumbnail to open the modal
2. `browser_snapshot` — read: caption text, first slide text, likes count, comments count, date
3. Look for navigation arrows (next slide button)
4. For each subsequent slide:
   a. Click the "next" arrow
   b. `browser_snapshot` — read the slide text/content
   c. Record slide number and text
5. Close the modal (click X or press Escape)
6. Record: { type: "carousel", slides: [...], caption, metrics, date }

#### Extracting Reels
For each reel:
1. Click the reel thumbnail to open it
2. `browser_snapshot` — read: caption, any visible text overlay, likes, comments, date
3. Check for CC/subtitle button — if present, enable and snapshot the subtitles
4. For audio transcription:
   a. Get the reel URL from the browser
   b. Run via Bash: `yt-dlp -x --audio-format wav -o "{investigation-dir}/temp-audio.wav" "{reel-url}"`
   c. Run via Bash: `whisper "{investigation-dir}/temp-audio.wav" --model small --output_format txt --output_dir "{investigation-dir}/"`
   d. Read the transcription file
   e. Clean up temp files
5. Close the reel
6. Record: { type: "reel", caption, transcription, metrics, date }

#### Extracting Single Image Posts
For each image post:
1. Click the post thumbnail
2. `browser_snapshot` — read: caption, any text in image (OCR not available, skip image text), likes, comments, date
3. Close the modal
4. Record: { type: "image", caption, metrics, date }

#### Scrolling for More Content
- After processing visible posts, scroll down to load more
- Use `browser_evaluate` with `window.scrollBy(0, 1000)` or find and click "load more"
- `browser_snapshot` after scroll to read new posts
- Continue until reaching the configured quantity

### YouTube Extractor

#### Navigating to Channel
1. If URL is a channel: `browser_navigate` to `{channel-url}/videos`
2. If URL is a single video: navigate directly
3. `browser_snapshot` to read video list or video page

#### Extracting Video (Single)
1. Navigate to the video page
2. `browser_snapshot` — read: title, view count, like count, date
3. Click "...more" to expand full description
4. `browser_snapshot` — read: full description text

**Transcription (Primary — subtitle extraction):**
5. Run via Bash: `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "{investigation-dir}/%(title)s" "{video-url}"`
6. Check if .vtt or .srt file was created
7. If yes: read the subtitle file, clean timestamps, save as transcript

**Transcription (Fallback — Whisper):**
8. If no subtitles available:
   a. `yt-dlp -x --audio-format wav -o "{investigation-dir}/temp-audio.wav" "{video-url}"`
   b. `whisper "{investigation-dir}/temp-audio.wav" --model small --output_format txt --output_dir "{investigation-dir}/"`
   c. Read transcription, clean up temp files

9. Record: { type: "video", title, description, transcript, metrics, date }

#### Extracting from Channel
1. From the /videos page, snapshot to get video list
2. Click each video (up to configured quantity)
3. Apply single video extraction for each
4. Navigate back to /videos between each video

### Twitter/X Extractor

#### Navigating to Profile
1. `browser_navigate` to `https://x.com/{username}`
2. `browser_snapshot` — read timeline
3. If login wall, trigger login flow

#### Extracting Tweets
For each tweet visible in the timeline:
1. `browser_snapshot` — read: tweet text, like count, retweet count, reply count, date
2. Check if tweet is a thread (look for "Show this thread" or self-reply chain)
3. If thread:
   a. Click the tweet to open it
   b. `browser_snapshot` — read all tweets in the thread sequence
   c. Navigate back to timeline
4. Record: { type: "tweet"|"thread", text/texts, metrics, date }

#### Scrolling for More
- Scroll the timeline to load more tweets
- `browser_snapshot` after each scroll
- Continue until reaching configured quantity

### LinkedIn Extractor

#### Navigating to Profile Activity
1. `browser_navigate` to `{profile-url}/recent-activity/all/`
2. `browser_snapshot` — read posts
3. If login wall, trigger login flow

#### Extracting Posts
For each post:
1. `browser_snapshot` — read visible text
2. If text is truncated ("...see more"):
   a. Click "see more" to expand
   b. `browser_snapshot` — read full text
3. Read: full post text, reaction count, comment count, date
4. Record: { type: "post", text, metrics, date }

#### Extracting Articles
For article links:
1. Click the article link
2. `browser_navigate` follows to full article page
3. `browser_snapshot` — read article title, subtitle, full body text
4. Navigate back to activity feed
5. Record: { type: "article", title, body, metrics, date }

## Output Formats

### Raw Content Output

Save to: `_opensquad/_investigations/{squad-code}/{platform}-{username}/raw-content.md`

Template:

# Raw Content: @{username} ({platform})
Investigated: {YYYY-MM-DD}
Total contents analyzed: {N}
Content types: {types analyzed}

---

## Content 1: [{Type}: {subtype} | {detail}]
**Date:** {YYYY-MM-DD}
**Metrics:** {likes} likes, {comments} comments, {shares} shares
**URL:** {post URL}

### Caption/Text
{full caption or post text}

### Slide 1 (for carousels)
{slide text}

### Slide 2
{slide text}

### Transcription (for videos/reels)
{full transcription text}

---

## Content 2: [...]
...


### Pattern Analysis Output

Save to: `_opensquad/_investigations/{squad-code}/{platform}-{username}/pattern-analysis.md`

Template:

# Pattern Analysis: @{username} ({platform})
Analyzed: {YYYY-MM-DD}
Sample size: {N} contents

## Executive Summary
{2-3 sentences about the most notable patterns found in this profile's content}

## Structural Patterns

### Content Structure
- Most common format: {description with frequency}
- Typical length: {metric — slides per carousel, words per post, video duration}
- Opening pattern: {how content typically starts}
- Closing pattern: {how content typically ends — CTA type}

### Format Metrics
| Metric | Average | Range |
|--------|---------|-------|
| {metric name} | {avg} | {min}-{max} |

## Language Patterns

### Predominant Tone
{Description of the overall tone with 2-3 examples from actual content}

### Recurring Hooks (how content opens)
1. "{exact hook example}" — Type: {curiosity gap|contrarian|number|story|...}
2. "{exact hook example}" — Type: {type}
3. ...

### Recurring CTAs (how content closes)
1. "{exact CTA example}" — Type: {save|share|comment|follow|link|...}
2. "{exact CTA example}" — Type: {type}
3. ...

### Frequent Vocabulary
Words/phrases appearing in 3+ contents:
- "{word/phrase}" — used in {N} of {total} contents
- "{word/phrase}" — used in {N} of {total} contents

### Language Style Notes
- Sentence length: {short/medium/long with avg word count}
- Use of emojis: {none|minimal|moderate|heavy with examples}
- Formatting: {use of line breaks, bullet points, capitalization}

## Engagement Patterns
- Highest engagement content: {description + metrics}
- Lowest engagement content: {description + metrics}
- Correlation observed: {what structural/language patterns correlate with higher engagement}

## Recommendations for Squad
Based on the patterns found:
1. {Specific recommendation for how the squad should structure content}
2. {Specific recommendation for tone/voice}
3. {Specific recommendation for hooks/CTAs}
4. {Specific recommendation for content length/format}
5. {Any unique pattern worth replicating}


### Consolidated Analysis Output

Save to: `_opensquad/_investigations/{squad-code}/consolidated-analysis.md`

Generated by the Architect after all Sherlock subagents complete.

Template:

# Consolidated Investigation: {squad-code}
Date: {YYYY-MM-DD}

## Profiles Analyzed
| Profile | Platform | Contents | Types |
|---------|----------|----------|-------|
| @{username} | {platform} | {N} | {types} |

## Universal Patterns (found across all profiles)

### Structure
{Patterns that appear consistently across all analyzed profiles}

### Language
{Common vocabulary, tone, hook/CTA patterns}

### Engagement Drivers
{What content patterns drive highest engagement across all profiles}

## Profile Differentiators

### @{username1}
{What makes this profile's approach unique}

### @{username2}
{What makes this profile's approach unique}

## Recommended Framework for Squad
Based on cross-profile analysis:

### Content Structure Template
{Recommended structure derived from the most successful patterns}

### Voice Guidelines
{Recommended tone, vocabulary, and style derived from analysis}

### Hook Patterns to Use
{Top 3-5 hook patterns with examples}

### CTA Patterns to Use
{Top 3 CTA patterns with examples}

### Anti-Patterns to Avoid
{Patterns NOT found in successful content — things to avoid}


## How the Architect Uses Sherlock Output

After all Sherlock subagents complete and the consolidated analysis is generated,
the Architect incorporates the findings into Phase 3 (Extraction):

1. **output-examples.md** — Include real content examples from raw-content.md
   (use the highest-engagement content as examples)

2. **anti-patterns.md** — Add anti-patterns derived from the analysis
   (patterns NOT found in successful profiles = things to avoid)

3. **quality-criteria.md** — Calibrate criteria with real metrics
   (e.g., "max 25 words per slide" based on actual successful carousel analysis)

4. **domain-framework.md** — Use the Recommended Framework from consolidated analysis
   as the basis for the squad's operational framework

5. **tone-of-voice.md** — Derive tone options from the language patterns found
   (don't use generic tones — customize based on what actually works)

6. **Agent personas** — Enrich agent operational frameworks with real patterns:
   - Researcher: knows which metrics and patterns to look for
   - Ideator: knows which hook types drive engagement in this niche
   - Writer: has real examples and calibrated structure guidelines
   - Reviewer: has evidence-based quality thresholds

## Investigation Configuration

When the Architect asks the user to configure the investigation, use this structure:

### Platform Detection
Parse URLs to detect platform:
- `instagram.com/{user}` → Instagram
- `youtube.com/@{channel}` or `youtube.com/c/{channel}` → YouTube
- `x.com/{user}` or `twitter.com/{user}` → Twitter/X
- `linkedin.com/in/{user}` → LinkedIn

### Configuration Per Platform

Use AskUserQuestion with multiSelect:true for content types and
a text input for quantity.

**Instagram defaults:**
- Content types: [Carousels (recommended), Reels, Single image posts]
- Quantity: 10 (recommended: 10-15 for good pattern sampling)

**YouTube defaults:**
- Content types: [Long-form videos (recommended), Shorts]
- Quantity: 5 (recommended: 5-10, transcriptions are long)

**Twitter/X defaults:**
- Content types: [Tweets (recommended), Threads]
- Quantity: 20 (recommended: 15-20 for pattern detection)

**LinkedIn defaults:**
- Content types: [Posts (recommended), Articles, Newsletter]
- Quantity: 10 (recommended: 10-15)

### Smart Recommendations
The Architect recommends based on the squad type being created:
- Carousel squad → recommend analyzing carousels + reels
- Video squad → recommend long-form videos
- Newsletter squad → recommend articles + long posts
- Generic content → recommend diverse mix
```

**Step 2: Verify the file was created correctly**

Run: `wc -l templates/_opensquad/core/prompts/sherlock.prompt.md`
Expected: 300+ lines

**Step 3: Commit**

```bash
git add templates/_opensquad/core/prompts/sherlock.prompt.md
git commit -m "feat: add Sherlock content investigator prompt template"
```

---

## Task 2: Update Init to Create Investigations Directory

The `_opensquad/_investigations/` directory needs to exist when a user initializes Opensquad.

**Files:**
- Modify: `templates/_opensquad/_investigations/.gitkeep` (create as template)
- Modify: `tests/init.test.js`

**Step 1: Write the failing test**

Add this test to `tests/init.test.js`:

```javascript
test('init creates _investigations directory', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, '_opensquad', '_investigations'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/init.test.js`
Expected: FAIL — `_opensquad/_investigations` directory does not exist

**Step 3: Create the template directory marker**

Create file: `templates/_opensquad/_investigations/.gitkeep`
Content: empty file

This file ensures the `_investigations/` directory is included in the template copy during init (since git doesn't track empty directories and `copyTemplates` copies all files recursively).

**Step 4: Run test to verify it passes**

Run: `node --test tests/init.test.js`
Expected: ALL PASS — the `.gitkeep` file causes the directory to be created during template copy

**Step 5: Commit**

```bash
git add templates/_opensquad/_investigations/.gitkeep tests/init.test.js
git commit -m "feat: add _investigations directory to init template"
```

---

## Task 3: Modify Architect to Add Phase 1.5 — Investigation Setup

This is the core integration task. The Architect's create-squad workflow needs a new phase between Discovery and Research.

**Files:**
- Modify: `templates/_opensquad/core/architect.agent.yaml` (lines 62-131 are the create-squad workflow)

**Step 1: Add investigation principle to Architect**

In the `principles` list (around line 26-41), add:

```yaml
- When user provides reference profile URLs, dispatch Sherlock investigator subagents to extract real content patterns before designing the squad
```

**Step 2: Add Phase 1.5 to create-squad workflow**

After Phase 1 (Discovery, ending around line 100), insert the new Phase 1.5 block. This goes between the "Domain Identification" step and Phase 2 (Research):

```yaml
      ### Phase 1.5: Investigation Setup (optional, when user provides reference URLs)

      After discovery, ask if the user has reference profiles to investigate:

      "Do you have profiles or channels you'd like me to investigate?
      I can analyze their content to extract real patterns, hooks, structures,
      and engagement data to make your squad smarter.

      Share 1-5 URLs (Instagram, YouTube, Twitter/X, LinkedIn) or skip this step."

      If the user provides URLs:

      1. **Parse URLs** to detect platforms:
         - `instagram.com/{user}` → Instagram
         - `youtube.com/@{channel}` or `youtube.com/c/{channel}` or `youtube.com/watch?v=` → YouTube
         - `x.com/{user}` or `twitter.com/{user}` → Twitter/X
         - `linkedin.com/in/{user}` → LinkedIn

      2. **Configure investigation per platform** using AskUserQuestion:
         For each detected platform, ask:
         - Content types to analyze (multiSelect, with smart defaults based on squad type)
         - Number of contents to analyze (with recommendation)

         Smart defaults based on squad type:
         - Carousel/image squad → recommend: carousels + reels, quantity 10
         - Video squad → recommend: long videos, quantity 5
         - Newsletter/article squad → recommend: articles + posts, quantity 10
         - Generic content → recommend: diverse mix, quantity 10

      3. **Check prerequisites** (only if video content selected):
         Run via Bash:
         - `yt-dlp --version`
         - `ffmpeg -version`
         - `whisper --help`
         If any fails, inform user with installation instructions and ask to install.

      4. **Read Sherlock instructions**:
         Read `_opensquad/core/prompts/sherlock.prompt.md` for the full investigation guide.

      5. **Create investigation directory**:
         Create `_opensquad/_investigations/{squad-code}/` via mkdir.

      6. **Dispatch Sherlock subagents** (one per profile URL, all in parallel):
         Use the Task tool with `run_in_background: true` for each URL.

         Each Sherlock subagent Task prompt must include:
         - The full extraction instructions for the detected platform
           (from sherlock.prompt.md)
         - The user's configuration (content types, quantity)
         - The output directory path
         - The raw-content.md and pattern-analysis.md output format templates
         - Instruction to use Playwright MCP tools (browser_navigate, browser_snapshot,
           browser_click, browser_evaluate)
         - Instruction to use Bash for yt-dlp and whisper commands when needed

         Inform the user:
         "🔍 Sherlock is investigating {N} profiles... This takes 3-10 minutes
         depending on the number of contents to analyze.

         While Sherlock works, I'll proceed with domain research."

      7. **Continue to Phase 2** — don't wait for Sherlock to complete before
         starting domain research. Both run in parallel.
```

**Step 3: Modify Phase 2 to wait for Sherlock**

At the end of the existing Phase 2 (Research), add:

```yaml
      If Sherlock subagents were dispatched in Phase 1.5:
      - Wait for all Sherlock subagents to complete (check Task outputs)
      - Read each pattern-analysis.md file generated
      - Generate the consolidated-analysis.md by reading all pattern analyses
        and synthesizing cross-profile patterns
        (follow the consolidated analysis template from sherlock.prompt.md)
      - Save to `_opensquad/_investigations/{squad-code}/consolidated-analysis.md`
      - Inform user: "✅ Investigation complete! Analyzed {N} profiles across {M} platforms."
```

**Step 4: Modify Phase 3 to use investigation data**

In Phase 3 (Extraction), add instructions to incorporate Sherlock data:

```yaml
      If investigation data exists (from Phase 1.5):

      Read `_opensquad/_investigations/{squad-code}/consolidated-analysis.md` and
      all per-profile `raw-content.md` files. Use this data to ENRICH the
      extraction artifacts:

      - **Output Examples**: Use the highest-engagement real content from
        raw-content.md as the basis for output examples. Adapt to the squad's
        specific format but preserve the structural patterns that work.

      - **Anti-Patterns**: Derive anti-patterns from what successful profiles
        DON'T do (patterns absent from high-engagement content).

      - **Quality Criteria**: Calibrate metrics using real data from the analysis
        (e.g., actual average words per slide, actual hook lengths, actual CTA types).

      - **Domain Framework**: Use the "Recommended Framework" section from the
        consolidated analysis as the foundation for the operational framework.

      - **Tone of Voice**: Generate tone options informed by the language patterns
        found in the investigation, not generic tones.

      - **Agent Operational Frameworks**: Embed real pattern knowledge into each
        agent's process steps and decision criteria.

      When investigation data is present, mark the squad as "investigation-enriched"
      in squad.yaml metadata:
      ```yaml
      investigation:
        enriched: true
        profiles_analyzed: 3
        date: 2026-02-24
        dir: _opensquad/_investigations/{squad-code}
      ```
```

**Step 5: Verify architect.agent.yaml is well-formed**

Read the modified file to ensure YAML structure is valid and all phases flow logically.

**Step 6: Commit**

```bash
git add templates/_opensquad/core/architect.agent.yaml
git commit -m "feat: add Sherlock investigation Phase 1.5 to Architect workflow"
```

---

## Task 4: Update CLAUDE.md Documentation

Add the _investigations directory and Sherlock concept to project docs.

**Files:**
- Modify: `templates/CLAUDE.md`

**Step 1: Update directory structure section**

In the `## Directory Structure` section of `templates/CLAUDE.md`, add:

```markdown
- `_opensquad/_investigations/` — Sherlock content investigations (profile analyses)
```

After the `_opensquad/_memory/` line.

**Step 2: Add investigation info to How It Works**

In the `## How It Works` section, add after item 2:

```markdown
3. During squad creation, the **Sherlock** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn) to extract real content patterns
```

And renumber subsequent items.

**Step 3: Commit**

```bash
git add templates/CLAUDE.md
git commit -m "docs: add Sherlock and _investigations to CLAUDE.md"
```

---

## Task 5: Update SKILL.md Help Text

Add investigation reference to the Opensquad skill help.

**Files:**
- Modify: `templates/.claude/skills/opensquad/SKILL.md`

**Step 1: Add investigation command**

In the SKILL.md `## Command Routing` table, add:

```markdown
| `/opensquad create <desc>` with URLs | Load Architect → Create Squad with Sherlock investigation |
```

In the help text section, update the EXAMPLES:

```
  /opensquad create "Instagram carousel squad" (+ provide reference profile URLs when asked)
```

**Step 2: Commit**

```bash
git add templates/.claude/skills/opensquad/SKILL.md
git commit -m "docs: add Sherlock investigation to SKILL.md help text"
```

---

## Task 6: End-to-End Validation

Manually verify the complete flow works by reading through all modified files.

**Step 1: Validate Sherlock prompt template**

Read `templates/_opensquad/core/prompts/sherlock.prompt.md` and verify:
- [ ] All 4 platform extractors have complete step-by-step instructions
- [ ] Raw content output format is fully specified with template
- [ ] Pattern analysis output format is fully specified with template
- [ ] Consolidated analysis output format is fully specified with template
- [ ] Prerequisites check instructions are clear
- [ ] Browser profile setup instructions are clear
- [ ] Configuration per platform has smart defaults
- [ ] The "How Architect Uses Sherlock Output" section maps to all data files

**Step 2: Validate Architect workflow**

Read `templates/_opensquad/core/architect.agent.yaml` and verify:
- [ ] Phase 1.5 follows naturally from Phase 1 (Discovery)
- [ ] Phase 1.5 is clearly optional (skippable if no URLs)
- [ ] URL parsing covers all 4 platforms
- [ ] Subagent dispatch instructions are complete
- [ ] Phase 2 waits for Sherlock completion
- [ ] Phase 3 references investigation data correctly
- [ ] squad.yaml metadata for investigation-enriched squads

**Step 3: Validate init flow**

Run: `node --test tests/init.test.js`
Expected: ALL PASS

**Step 4: Validate file structure coherence**

Verify all file references in architect.agent.yaml point to files that exist:
- `_opensquad/core/prompts/sherlock.prompt.md` — exists
- `_opensquad/_investigations/` — created by init
- All existing files still referenced correctly

**Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address validation issues in Sherlock implementation"
```

---

## Summary of Files

| Action | File | Lines Changed (est.) |
|--------|------|---------------------|
| Create | `templates/_opensquad/core/prompts/sherlock.prompt.md` | ~500 |
| Create | `templates/_opensquad/_investigations/.gitkeep` | 0 (empty) |
| Modify | `templates/_opensquad/core/architect.agent.yaml` | +80-100 |
| Modify | `templates/CLAUDE.md` | +3 |
| Modify | `templates/.claude/skills/opensquad/SKILL.md` | +3 |
| Modify | `tests/init.test.js` | +12 |

**Total: 2 new files, 4 modified files, ~600 lines added**

## Dependencies Between Tasks

```
Task 1 (Sherlock prompt) ──┐
                           ├── Task 3 (Architect modification) ── Task 6 (Validation)
Task 2 (Init + test) ─────┘
Task 4 (CLAUDE.md) ──── independent
Task 5 (SKILL.md) ──── independent
```

Tasks 1, 2, 4, and 5 can run in parallel. Task 3 depends on Task 1 (needs prompt template path). Task 6 depends on all others.
