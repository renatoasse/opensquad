# Sherlock — Content Investigator for Opensquad

**Date:** 2026-02-24
**Status:** Approved
**Author:** Brainstorming session

## Overview

Sherlock is a content investigation feature for Opensquad that extracts and analyzes real content from social media profiles during squad creation. Instead of relying solely on generic web research, Sherlock navigates to reference profiles, extracts actual content, and identifies patterns that feed into richer squad design.

## Trigger & Placement

Sherlock runs during **squad creation** (Architect agent), as a new Phase 1.5 (Investigation Setup) that feeds into Phase 2 (Research).

- **When:** After Discovery questions, before Research
- **How:** Architect asks "Do you have reference profiles?" → dispatches Sherlock subagents in parallel with WebSearch

## Supported Platforms (MVP)

1. **Instagram** — Carousels (slide text + captions) + Reels (transcription)
2. **YouTube** — Videos (transcription via subtitles or Whisper)
3. **Twitter/X** — Tweets + Threads
4. **LinkedIn** — Posts + Articles

## Technical Approach

### Navigation: Playwright MCP

- Uses `browser_snapshot` (accessibility mode) as primary reading method
- Persistent browser profile for authentication (login once, reuse)
- One Sherlock subagent per profile, running in parallel

### Transcription: yt-dlp + Whisper Local

- **YouTube primary:** `yt-dlp --write-auto-sub` extracts existing subtitles (instant)
- **YouTube fallback:** Download audio + Whisper local transcription
- **Instagram Reels:** `yt-dlp -x --audio-format wav` + Whisper local
- **Prerequisites:** yt-dlp, openai-whisper (or whisper.cpp), ffmpeg

## Investigation Setup (Phase 1.5)

### User Input

1. Architect asks: "Do you have reference profiles to investigate?"
2. User provides 1-5 URLs
3. Per platform, configure:
   - Content types (carousels, reels, posts, videos, threads, articles)
   - Quantity (with smart defaults and recommendations)

### Smart Recommendations

Based on squad type:
- Carousel squad → recommend carousels + reels
- Video squad → recommend long-form videos
- Generic content squad → recommend diverse mix

### Platform-Specific Defaults

| Platform | Content Types | Default Quantity |
|----------|---------------|-----------------|
| Instagram | Carousels, Reels, Single posts | 10-15 |
| YouTube | Long videos, Shorts | 5-10 |
| Twitter/X | Tweets, Threads | 15-20 |
| LinkedIn | Posts, Articles | 10-15 |

## Extraction Strategy

### Instagram

1. Navigate to profile → `browser_snapshot` to read grid
2. Identify post types (carousel icon, video icon)
3. Click each target post → read caption + slide text
4. For carousels: navigate between slides, snapshot each
5. For reels: yt-dlp download audio → Whisper transcribe
6. Extract: caption, slide texts, slide count, metrics (if visible)

### YouTube

1. Navigate to channel/video URL
2. Snapshot title, description, views, date
3. Primary: `yt-dlp --write-auto-sub` for subtitles
4. Fallback: Download audio + Whisper local
5. Extract: title, description, full transcript, metrics

### Twitter/X

1. Navigate to profile → snapshot timeline
2. Scroll to load more tweets
3. Identify tweets vs threads
4. For threads: click through to read full thread
5. Extract: text, likes, retweets, replies, date

### LinkedIn

1. Navigate to profile activity feed
2. Snapshot posts, expand truncated ones ("see more")
3. For articles: navigate to full article
4. Extract: text, reactions, comments, date

## Output Artifacts

### Per Profile

```
_opensquad/_investigations/{squad-code}/
├── {platform}-{username}/
│   ├── raw-content.md        # All extracted content
│   └── pattern-analysis.md   # Identified patterns
```

### Raw Content Format

```markdown
# Raw Content: @{username} ({platform})
Investigated: {date}
Total contents: {N}

## Content 1: [Type: Carousel | 8 slides]
**Date:** 2026-02-20
**Metrics:** 1.2k likes, 89 comments
**Caption:** {full caption text}
### Slide 1
{slide text}
### Slide 2
{slide text}
...
```

### Pattern Analysis Format

```markdown
# Pattern Analysis: @{username} ({platform})

## Executive Summary
{2-3 sentences about the most notable patterns}

## Structural Patterns
### Typical Structure
### Format Metrics

## Language Patterns
### Predominant Tone
### Recurring Hooks
### Recurring CTAs
### Frequent Vocabulary

## Engagement Patterns

## Recommendations for Squad
```

### Consolidated Analysis (multiple profiles)

```markdown
# Consolidated Investigation: {squad-name}

## Profiles Analyzed
## Universal Patterns (common to all)
## Differentiators per Profile
## Recommended Framework
```

## Integration with Architect

### Impact on Data Files

| Data File | Without Sherlock | With Sherlock |
|---|---|---|
| output-examples.md | Generic web examples | REAL examples from reference profiles |
| anti-patterns.md | Generic anti-patterns | Anti-patterns + patterns profiles avoid |
| quality-criteria.md | Generic criteria | Criteria based on real metrics |
| {domain}-framework.md | Web research framework | Calibrated with real profile structures |
| tone-of-voice.md | 6 generic tones | Tones derived from language analysis |
| research-brief.md | Generic web research | Web research + profile intelligence |

### Impact on Agent Files

- **Researcher:** Knows which patterns to look for (real reference)
- **Ideator:** Knows which hooks work in the niche (extracted from profiles)
- **Writer:** Has real examples and calibrated framework
- **Reviewer:** Quality criteria based on real metrics

### Persistence & Reuse

Investigations saved in `_opensquad/_investigations/`. Enables:
- Reuse between similar squads
- Re-investigate profiles later (compare evolution)
- Architect can ask: "Found previous investigations for this niche. Reuse?"

## Complete Flow

```
User: /opensquad create "Instagram carousel squad"

Phase 1: Discovery → 5 questions about the squad
Phase 1.5: Investigation Setup
  → "Have reference profiles?"
  → User provides URLs + configures types/quantity
  → Verify prerequisites (yt-dlp, whisper, ffmpeg)
Phase 2: Research (parallel)
  ├── WebSearch subagents (domain research)
  ├── Sherlock Instagram @profile1 (background)
  ├── Sherlock Instagram @profile2 (background)
  └── Sherlock YouTube @channel1 (background)
Consolidation
  → Read all pattern-analysis.md
  → Generate consolidated-analysis.md
Phase 3: Extraction (enriched)
  → Use real patterns + web research for data files
Phase 4-6: Design, Build, Validate (as today)
```

## Prerequisites

Users must have installed:
- `yt-dlp` (pip install yt-dlp)
- `openai-whisper` (pip install openai-whisper) or whisper.cpp
- `ffmpeg` (required by both yt-dlp and whisper)

Sherlock verifies prerequisites before starting and guides installation if missing.
