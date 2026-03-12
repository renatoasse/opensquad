# Formats System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Formats system that injects platform+content-type-specific instructions into any agent's execution context, replacing the existing platform files.

**Architecture:** Format files live in `_opensquad/core/formats/` with `{platform}-{type}.md` naming. Pipeline steps declare `format: {name}` in their frontmatter. The Pipeline Runner injects the format content between agent overlays and skill instructions. The Architect asks about formats during squad creation and configures steps accordingly.

**Tech Stack:** Markdown prompt engineering (YAML frontmatter + markdown body). No code changes — all modifications are to `.md` and `.yaml` prompt files.

---

### Task 1: Create formats directory and instagram-feed.md

**Files:**
- Create: `_opensquad/core/formats/instagram-feed.md`

**Step 1: Create the directory**

```bash
mkdir -p "_opensquad/core/formats"
```

**Step 2: Create instagram-feed.md**

Migrate content from `_opensquad/core/platforms/instagram.md` into the format schema. The format file must include YAML frontmatter with parseable constraints, plus 6 markdown sections. Use the existing instagram.md as the source — restructure it into the format schema:

```yaml
---
name: "Instagram Feed Post"
platform: "instagram"
content_type: "feed"
description: "Carousels and single image posts for the Instagram feed"
constraints:
  caption_max_chars: 2200
  caption_visible_chars: 125
  max_hashtags: 30
  recommended_hashtags: "5-15"
  carousel_max_slides: 20
  recommended_slides: "6-10"
  image_ratio: "4:5 portrait"
  image_resolution: "1080x1350px"
version: "1.0.0"
---
```

Sections to include (sourced from instagram.md):
- **Platform Rules**: Algorithm & Reach section (engagement weights, carousel reach, early engagement), Posting Timing
- **Content Structure**: Carousel Structure pattern (hook slide → context → body → summary → CTA), Caption Structure pattern, Single Image guidance
- **Writing Guidelines**: Carousel best practices (hook slide, 30 words max/slide, 6-10 slides, CTA last slide), Caption best practices (front-load value, first 125 chars, line breaks, end with question), Hashtag Strategy (5-15, mix niche/mid/broad)
- **Output Format**: Template showing expected output structure for a carousel post (hook, slides, caption, hashtags)
- **Quality Criteria**: From instagram.md best practices — checkable items like "hook in first 125 chars", "max 30 words per slide", "CTA on last slide", "5-15 hashtags"
- **Anti-Patterns**: From instagram.md anti-patterns section (links in captions, too much text, no CTA, etc.)

**Step 3: Commit**

```bash
git add _opensquad/core/formats/instagram-feed.md
git commit -m "feat(formats): add instagram-feed format file"
```

---

### Task 2: Create instagram-reels.md and instagram-stories.md

**Files:**
- Create: `_opensquad/core/formats/instagram-reels.md`
- Create: `_opensquad/core/formats/instagram-stories.md`

**Step 1: Create instagram-reels.md**

Source: Reels-specific content from `_opensquad/core/platforms/instagram.md`.

```yaml
---
name: "Instagram Reels"
platform: "instagram"
content_type: "reels"
description: "Short-form vertical video for Instagram Reels"
constraints:
  max_duration_seconds: 90
  recommended_duration: "15-30s"
  aspect_ratio: "9:16 vertical"
  caption_max_chars: 2200
  caption_visible_chars: 125
  max_hashtags: 30
version: "1.0.0"
---
```

Sections:
- **Platform Rules**: Reels-specific algorithm (discovery format, watch time, completion rate, non-follower reach)
- **Content Structure**: Reel Structure (hook 0-2s → setup 2-5s → delivery 5-60s → CTA last 3-5s)
- **Writing Guidelines**: Hook in first 1-2 seconds, trending audio, captions/subtitles, loop-friendly cuts, caption writing for Reels
- **Output Format**: Template for a Reel script (hook text, scene descriptions, CTA, caption)
- **Quality Criteria**: Hook in first 2 seconds, subtitles present, 15-30s duration, loop-friendly ending
- **Anti-Patterns**: Landscape video, no subtitles, slow intros, no hook

**Step 2: Create instagram-stories.md**

Stories content is minimal in the current platform file. Create with what's available plus general Stories knowledge:

```yaml
---
name: "Instagram Stories"
platform: "instagram"
content_type: "stories"
description: "Ephemeral 24h vertical content with interactive elements"
constraints:
  max_duration_seconds: 60
  aspect_ratio: "9:16 vertical"
  format: "ephemeral (24h)"
  interactive_elements: "polls, questions, links, stickers, quizzes"
version: "1.0.0"
---
```

Sections:
- **Platform Rules**: Stories stay at top of feed, 24h ephemeral, interactive elements boost engagement
- **Content Structure**: Story sequence patterns (3-7 frames, hook frame first, CTA frame last)
- **Writing Guidelines**: Short text (few words per frame), use interactive stickers, vertical-native, casual tone
- **Output Format**: Template for a Story sequence (frame descriptions, text overlays, sticker placements)
- **Quality Criteria**: Vertical format, text readable, interactive element present, under 7 frames
- **Anti-Patterns**: Too much text per frame, landscape media, no interactive elements

**Step 3: Commit**

```bash
git add _opensquad/core/formats/instagram-reels.md _opensquad/core/formats/instagram-stories.md
git commit -m "feat(formats): add instagram-reels and instagram-stories format files"
```

---

### Task 3: Create linkedin-post.md and linkedin-article.md

**Files:**
- Create: `_opensquad/core/formats/linkedin-post.md`
- Create: `_opensquad/core/formats/linkedin-article.md`

**Step 1: Create linkedin-post.md**

Source: `_opensquad/core/platforms/linkedin.md` — Text Posts and Document/Carousel sections.

```yaml
---
name: "LinkedIn Post"
platform: "linkedin"
content_type: "post"
description: "Text-based posts and document carousels for the LinkedIn feed"
constraints:
  post_max_chars: 3000
  post_visible_chars: 210
  hashtags_max: 5
  recommended_hashtags: "3-5"
  carousel_max_slides: 300
  recommended_slides: "10-15"
  max_posts_per_day: 1
version: "1.0.0"
---
```

Sections from linkedin.md:
- **Platform Rules**: Algorithm (no links in body, comments > reactions, first 60 minutes, dwell time, document posts 2-3x reach)
- **Content Structure**: Post Structure (hook first 2 lines → story → insights → takeaway → CTA question → hashtags), Effective Post Formats (storytelling, thought leadership, data-driven, lessons learned)
- **Writing Guidelines**: First 2 lines = everything, short sentences, first person, line breaks, tag 2-3 max, link in comments not body
- **Output Format**: Template for a LinkedIn post (hook, body, insights, CTA, hashtags)
- **Quality Criteria**: Hook in first 210 chars, no links in body, 3-5 hashtags, CTA question present
- **Anti-Patterns**: From linkedin.md (links in body, spam tagging, editing after posting, no line breaks, corporate jargon)

**Step 2: Create linkedin-article.md**

```yaml
---
name: "LinkedIn Article"
platform: "linkedin"
content_type: "article"
description: "Long-form blog-style content hosted on LinkedIn"
constraints:
  optimal_word_count: "1500-2000"
  headline_max_chars: 220
version: "1.0.0"
---
```

Sections:
- **Platform Rules**: Articles have better SEO but lower feed reach than posts, subscribers get notified
- **Content Structure**: Article structure (headline, intro hook, body sections with subheadings, conclusion with CTA)
- **Writing Guidelines**: SEO-friendly headlines, subheadings every 200-300 words, actionable takeaways, no jargon
- **Output Format**: Template for a LinkedIn article
- **Quality Criteria**: 1500-2000 words, subheadings present, CTA at end
- **Anti-Patterns**: Walls of text, no subheadings, promotional tone throughout

**Step 3: Commit**

```bash
git add _opensquad/core/formats/linkedin-post.md _opensquad/core/formats/linkedin-article.md
git commit -m "feat(formats): add linkedin-post and linkedin-article format files"
```

---

### Task 4: Create twitter-post.md and twitter-thread.md

**Files:**
- Create: `_opensquad/core/formats/twitter-post.md`
- Create: `_opensquad/core/formats/twitter-thread.md`

**Step 1: Create twitter-post.md**

Source: `_opensquad/core/platforms/twitter.md` — Standalone Tweets section.

```yaml
---
name: "Twitter/X Post"
platform: "twitter"
content_type: "post"
description: "Single tweets and quote tweets for X (Twitter)"
constraints:
  tweet_max_chars: 280
  effective_chars: 260
  hashtags_max: 3
  recommended_hashtags: "2-3"
  images_per_tweet: 4
version: "1.0.0"
---
```

Sections from twitter.md: Standalone tweet structures, algorithm rules, engagement strategy, posting timing, anti-patterns.

**Step 2: Create twitter-thread.md**

```yaml
---
name: "Twitter/X Thread"
platform: "twitter"
content_type: "thread"
description: "Multi-tweet threads for long-form storytelling on X (Twitter)"
constraints:
  tweet_max_chars: 280
  optimal_thread_length: "5-15 tweets"
  hashtags: "only on first tweet"
version: "1.0.0"
---
```

Sections from twitter.md: Thread structure pattern, thread best practices, algorithm (2-3x more impressions), anti-patterns.

**Step 3: Commit**

```bash
git add _opensquad/core/formats/twitter-post.md _opensquad/core/formats/twitter-thread.md
git commit -m "feat(formats): add twitter-post and twitter-thread format files"
```

---

### Task 5: Create youtube-script.md and youtube-shorts.md

**Files:**
- Create: `_opensquad/core/formats/youtube-script.md`
- Create: `_opensquad/core/formats/youtube-shorts.md`

**Step 1: Create youtube-script.md**

Source: `_opensquad/core/platforms/youtube.md` — Long-form Video section.

```yaml
---
name: "YouTube Video Script"
platform: "youtube"
content_type: "script"
description: "Scripts for long-form YouTube videos (8-15 min)"
constraints:
  title_max_chars: 100
  title_optimal_chars: "50-70"
  description_max_chars: 5000
  description_visible_lines: 2
  thumbnail_size: "1280x720px"
  optimal_duration: "8-15 minutes"
  end_screen_duration: "5-20 seconds"
version: "1.0.0"
---
```

Sections from youtube.md: Long-form Video Structure, SEO & Discovery, Thumbnail guidance, algorithm (CTR + watch time), anti-patterns.

**Step 2: Create youtube-shorts.md**

```yaml
---
name: "YouTube Shorts"
platform: "youtube"
content_type: "shorts"
description: "Short-form vertical video scripts for YouTube Shorts"
constraints:
  max_duration_seconds: 60
  aspect_ratio: "9:16 vertical"
  hashtags: "3-5 max, include #Shorts"
version: "1.0.0"
---
```

Sections from youtube.md: Shorts structure, Shorts best practices, separate algorithm, anti-patterns.

**Step 3: Commit**

```bash
git add _opensquad/core/formats/youtube-script.md _opensquad/core/formats/youtube-shorts.md
git commit -m "feat(formats): add youtube-script and youtube-shorts format files"
```

---

### Task 6: Create new platform formats (WhatsApp, Email, Blog)

**Files:**
- Create: `_opensquad/core/formats/whatsapp-broadcast.md`
- Create: `_opensquad/core/formats/email-newsletter.md`
- Create: `_opensquad/core/formats/email-sales.md`
- Create: `_opensquad/core/formats/blog-post.md`
- Create: `_opensquad/core/formats/blog-seo.md`

These are NEW formats without existing platform files. Research best practices for each and create format files following the same schema.

**Step 1: Create whatsapp-broadcast.md**

```yaml
---
name: "WhatsApp Broadcast"
platform: "whatsapp"
content_type: "broadcast"
description: "Broadcast messages and status updates for WhatsApp Business"
constraints:
  message_max_chars: 4096
  status_duration: "24h"
  broadcast_list_max: 256
  media_types: "image, video, document, audio"
version: "1.0.0"
---
```

Key content: Message structure (short, scannable, emoji-light), CTA patterns (reply with keyword, click link), broadcast vs group vs status differences, conversational tone, anti-patterns (walls of text, no personalization, spam behavior).

**Step 2: Create email-newsletter.md**

```yaml
---
name: "Email Newsletter"
platform: "email"
content_type: "newsletter"
description: "Recurring email newsletters for audience nurturing"
constraints:
  subject_line_max_chars: 60
  subject_line_optimal: "30-50"
  preview_text_chars: 90
  optimal_word_count: "200-500"
  cta_buttons_max: 2
version: "1.0.0"
---
```

Key content: Subject line formulas, preview text optimization, above-the-fold content, single-column layout, CTA button vs text link, mobile-first design, unsubscribe compliance, anti-patterns (clickbait subjects, image-heavy, multiple competing CTAs).

**Step 3: Create email-sales.md**

```yaml
---
name: "Sales Email"
platform: "email"
content_type: "sales"
description: "Direct response sales emails for conversion"
constraints:
  subject_line_max_chars: 60
  optimal_word_count: "100-300"
  cta_count: 1
version: "1.0.0"
---
```

Key content: Cold email vs warm email patterns, subject line A/B, PAS/AIDA frameworks applied to email, single CTA rule, PS line technique, follow-up sequences, anti-patterns (long paragraphs, multiple CTAs, no personalization).

**Step 4: Create blog-post.md**

```yaml
---
name: "Blog Post"
platform: "blog"
content_type: "post"
description: "Standard blog posts for content marketing"
constraints:
  optimal_word_count: "1500-2500"
  title_max_chars: 70
  meta_description_chars: 160
  subheading_frequency: "every 200-300 words"
version: "1.0.0"
---
```

Key content: Blog post structure (title, intro hook, body with subheadings, conclusion with CTA), readability rules, formatting (short paragraphs, bullet points, bold key phrases), internal/external linking, anti-patterns (no subheadings, walls of text, clickbait titles that don't deliver).

**Step 5: Create blog-seo.md**

```yaml
---
name: "SEO Blog Post"
platform: "blog"
content_type: "seo"
description: "Search-engine optimized blog posts for organic traffic"
constraints:
  optimal_word_count: "2000-3000"
  title_max_chars: 60
  meta_description_chars: 160
  keyword_density: "1-2%"
  subheading_frequency: "every 200-300 words"
  min_internal_links: 3
  min_external_links: 2
version: "1.0.0"
---
```

Key content: Keyword placement (title, H1, first 100 words, subheadings, meta description), content structure for featured snippets, FAQ schema opportunities, internal linking strategy, readability score targets, anti-patterns (keyword stuffing, thin content, duplicate content, no meta description).

**Step 6: Commit**

```bash
git add _opensquad/core/formats/whatsapp-broadcast.md _opensquad/core/formats/email-newsletter.md _opensquad/core/formats/email-sales.md _opensquad/core/formats/blog-post.md _opensquad/core/formats/blog-seo.md
git commit -m "feat(formats): add whatsapp, email, and blog format files"
```

---

### Task 7: Update Pipeline Runner — add format injection

**Files:**
- Modify: `_opensquad/core/runner.pipeline.md` (lines 74-111, Agent Loading section)

**Step 1: Add format injection logic**

In `_opensquad/core/runner.pipeline.md`, after the overlay resolution section (line 94) and before the skill injection section (line 100), add a new subsection for format injection.

Find the current text at line 100:
```
4. **Inject skill instructions**: Check which skills the agent declares...
```

Insert BEFORE that line (renumber 4 → 5):

```markdown
4. **Inject format context**: Check if the current step's frontmatter contains a `format:` field.
   If present:
   a. Read `_opensquad/core/formats/{format}.md` (e.g., `_opensquad/core/formats/instagram-feed.md`)
      - If the file does not exist → **WARNING**: "Format '{format}' not found in _opensquad/core/formats/. Skipping format injection." Continue without format.
   b. Parse the YAML frontmatter to extract the `name` field
   c. Extract the Markdown body (everything after the YAML frontmatter closing `---`)
   d. Append to the agent's context, after overlay resolution and before skill instructions:
      ```
      --- FORMAT: {name from frontmatter} ---

      {format file markdown body}
      ```
   e. The final agent context composition order is:
      ```
      {base agent content}
      {squad overlay (.custom.md) if applicable}

      --- FORMAT: {format name} ---

      {format content}

      --- SKILL INSTRUCTIONS ---

      {skill content if applicable}
      ```
   If the step has no `format:` field, skip this step entirely (backward compatible).
```

Then renumber the old step 4 (skill injection) to step 5.

**Step 2: Update the Pipeline Step Format section**

Find the Pipeline Step frontmatter reference in the Architect file. In the Runner, the step frontmatter is documented implicitly. No change needed in the Runner — the Runner just reads whatever frontmatter the step has. The `format:` field is new but the Runner doesn't validate step frontmatter against a schema.

**Step 3: Commit**

```bash
git add _opensquad/core/runner.pipeline.md
git commit -m "feat(runner): add format injection in agent loading"
```

---

### Task 8: Update Architect — Phase 1 Discovery

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml` (Phase 1: Discovery section, lines 65-118)

**Step 1: Add format awareness to Discovery**

After the Performance Mode question (currently question 6, around line 99), add a new discovery question about target format:

```yaml
      7. **Target Format** (for content squads only): After understanding the purpose,
         if this is a content creation squad, ask about target formats.

         "Para quais formatos/plataformas esse squad vai produzir conteúdo?"

         List available formats by scanning `_opensquad/core/formats/` directory.
         Group by platform and present as multiSelect:

         Example options:
         - Instagram Feed (carousels, single image posts)
         - Instagram Reels (short-form vertical video)
         - Instagram Stories (ephemeral 24h content)
         - LinkedIn Post (text posts and document carousels)
         - LinkedIn Article (long-form content)
         - Twitter/X Post (single tweets)
         - Twitter/X Thread (multi-tweet threads)
         - YouTube Script (long-form video)
         - YouTube Shorts (short-form vertical video)
         - WhatsApp Broadcast (broadcast messages)
         - Email Newsletter (recurring newsletters)
         - Email Sales (direct response emails)
         - Blog Post (content marketing)
         - Blog SEO (search-optimized posts)

         Save the selected format IDs (e.g., ["instagram-feed", "twitter-thread"]).
         These will be used in Phase 5 to assign `format:` to pipeline steps.

         For NON-content squads (data analysis, automation, etc.): skip this question.
```

**Step 2: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "feat(architect): add format selection to Phase 1 Discovery"
```

---

### Task 9: Update Architect — Phase 4 and Phase 5

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml` (Phase 4: Design, Phase 5: Build)

**Step 1: Update Phase 4 — Design presentation**

In the design presentation template (around line 528), add format information:

```
I'll create a squad with N agents:

1. [Icon] [Name] — [Role description]
   Tasks: [task 1] → [task 2] → [task 3]
   Format: [format name, if applicable]
2. [Icon] [Name] — [Role description]
   Tasks: [task 1] → [task 2] → [task 3]
   Format: [format name, if applicable]
...

Pipeline: ...
Formats: [list of selected formats]
Mode: [Alta Performance / Econômico]
```

**Step 2: Update Phase 5 — Pipeline Step Format**

In the Pipeline Step Format section (around line 817), add `format:` to the step frontmatter:

```yaml
---
execution: subagent
agent: {agent-id}
format: {format-id}    # OPTIONAL — only for content creation steps. E.g., "instagram-feed"
inputFile: squads/{code}/...
outputFile: squads/{code}/...
model_tier: fast
---
```

Add a comment explaining: "The `format:` field is optional. When present, the Pipeline Runner automatically injects the format file from `_opensquad/core/formats/{format}.md` into the agent's context. Use this for any step where platform-specific content rules should guide the agent."

**Step 3: Update Content Squad Pattern**

In the Content Squad Pattern section (around line 466), update the creator agent instructions:

Replace the current reference to `_opensquad/core/platforms/{platform}.md`:
```
- Read `_opensquad/core/platforms/{platform}.md` for platform knowledge
```

With:
```
- Use the format system: assign `format: {format-id}` to each creator step
  (e.g., `format: instagram-feed`). The Pipeline Runner injects the format
  automatically — do NOT manually embed platform knowledge in task files.
  The format file replaces the old `_opensquad/core/platforms/` files.
```

Also update the line at ~924 that says:
```
- Also load platform knowledge: `_opensquad/core/platforms/{platform}.md`
```

Replace with:
```
- Format knowledge is injected automatically by the Pipeline Runner via `format:`
  field in the step frontmatter. No manual loading needed.
```

**Step 4: Update Phase 6 — Validation**

In the After Validation summary (around line 1004), replace:
```
- Platform knowledge loaded: {list of platforms, if any}
```

With:
```
- Formats assigned: {list of format IDs used in pipeline steps}
```

**Step 5: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "feat(architect): integrate format system in design and build phases"
```

---

### Task 10: Deprecate platform files

**Files:**
- Modify: `_opensquad/core/platforms/instagram.md`
- Modify: `_opensquad/core/platforms/linkedin.md`
- Modify: `_opensquad/core/platforms/twitter.md`
- Modify: `_opensquad/core/platforms/youtube.md`

**Step 1: Add deprecation notice to each file**

At the top of each file (before the `#` heading), add:

```markdown
> ⚠️ **DEPRECATED**: This file is superseded by format files in `_opensquad/core/formats/`.
> Use format-specific files (e.g., `instagram-feed.md`, `instagram-reels.md`) instead.
> This file will be removed in a future version.

```

**Step 2: Commit**

```bash
git add _opensquad/core/platforms/
git commit -m "chore: deprecate platform files in favor of formats system"
```

---

### Task 11: Final verification

**Step 1: Verify all format files exist**

```bash
ls -la _opensquad/core/formats/
```

Expected: 14 files:
- instagram-feed.md, instagram-reels.md, instagram-stories.md
- linkedin-post.md, linkedin-article.md
- twitter-post.md, twitter-thread.md
- youtube-script.md, youtube-shorts.md
- whatsapp-broadcast.md
- email-newsletter.md, email-sales.md
- blog-post.md, blog-seo.md

**Step 2: Verify Runner has format injection**

Read `_opensquad/core/runner.pipeline.md` and confirm:
- Step 4 is "Inject format context"
- Step 5 is "Inject skill instructions" (renumbered from 4)
- Context order: Base Agent → Overlay → Format → Skills

**Step 3: Verify Architect references**

Search `_opensquad/core/architect.agent.yaml` for:
- No remaining references to `_opensquad/core/platforms/` (should all be replaced)
- `format:` appears in the Pipeline Step Format section
- Discovery question about formats exists

**Step 4: Verify platform files have deprecation notice**

Read first line of each platform file to confirm deprecation notice.

**Step 5: Commit (if any fixes were needed)**

```bash
git add -A && git commit -m "fix: address format system verification issues"
```
