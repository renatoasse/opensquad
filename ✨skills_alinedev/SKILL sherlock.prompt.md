# Sherlock — Content Investigator Template

Use this template when the Architect needs to investigate real content from reference profiles during squad creation. Sherlock is NOT a squad agent — it is a tool the Architect dispatches as a subagent during Phase 1.5 (Investigation) of the create-squad workflow.

## Purpose

When a user provides reference profile URLs during squad discovery ("follow the style of @username"), the Architect dispatches one Sherlock subagent per profile URL. Each subagent navigates to the profile using Playwright MCP, extracts real content (captions, text, slide content, video transcriptions), and produces a structured analysis of patterns found.

The investigation output feeds directly into squad data files — making agents, frameworks, quality criteria, and voice guidance grounded in real high-performing content rather than generic best practices.

## How It Works

1. The Architect receives reference URLs from the user during Phase 1 Discovery (question 5)
2. For each URL, the Architect launches a Sherlock subagent in the background using the Task tool
3. Each subagent runs independently — one profile per subagent
4. Subagents produce two files each: `raw-content.md` and `pattern-analysis.md`
5. After all subagents complete, the Architect consolidates findings into `consolidated-analysis.md`
6. The consolidated analysis enriches all Phase 3 extraction artifacts

---

## Screenshot Saving Rule

When saving a browser screenshot as a file (using `browser_take_screenshot`), always specify the full path:

```
squads/{squad-name}/_investigations/{username}/screenshots/{filename}.png
```

Never call `browser_take_screenshot` without a full output path — omitting the path saves the file to the current working directory (the repo root), polluting the project.

For content reading and navigation, prefer `browser_snapshot` (returns a live view, no file saved) over `browser_take_screenshot`.

The `{squad-name}` value is always provided by the Architect in the Sherlock subagent prompt.

---

## Investigation Mode

The Architect always passes an `investigation_mode` parameter in the subagent prompt. Read this value and follow the corresponding behavior:

| Mode | Meaning | Behavior |
|------|---------|----------|
| `single_post` | User provided a direct post/reel/tv URL — just analyze that one post | Skip profile grid navigation. Go directly to the post URL. Extract that post only. |
| `profile_1` | Scan profile, get 1 post only | Navigate to profile grid. Collect the most recent 1 post. Stop after 1. |
| `profile_5_10` | Scan profile for patterns | Navigate to profile grid. Collect up to 10 posts. Stop at 10 even if more are available. |

**If no `investigation_mode` is specified:** default to `profile_5_10`.

This mode applies to Instagram only. YouTube, Twitter/X, and LinkedIn use their own quantity configuration.

---

## Prerequisites Check

Before running any Sherlock investigation, verify the required tools are available. Run each check as a Bash command.

### Required for All Investigations

- **Playwright MCP**: The browser tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_evaluate`) must be available. These are provided by the Playwright MCP server and are required for every investigation.

### Required Only for Video Content (Reels, YouTube, TikTok)

Video transcription requires three CLI tools. Check each one:

```bash
yt-dlp --version
```

If missing: `pip install yt-dlp` or `brew install yt-dlp`

```bash
ffmpeg -version
```

If missing: `brew install ffmpeg` or download from https://ffmpeg.org/download.html

```bash
whisper --help
```

If missing: `pip install openai-whisper`

### When Prerequisites Are Not Met

- If Playwright MCP is unavailable, Sherlock cannot run. Inform the user and fall back to Phase 2 web research only.
- If yt-dlp, ffmpeg, or whisper are missing, Sherlock can still run but will skip video transcription. Text-based content (carousels, tweets, LinkedIn posts, text posts) can still be extracted. Log a warning: "Video transcription tools not available — skipping Reel/video transcription. Text content will still be extracted."
- Always inform the user which tools are missing and provide installation commands.

---

## Browser Profile Setup

Sherlock uses a persistent browser profile to preserve login sessions across investigations.

### Profile Location

The browser profile is stored at `_opensquad/_browser_profile/`. This directory persists between runs so that login cookies are preserved.

### First-Time Setup

On the first investigation for a given platform, Sherlock may encounter a login wall. When this happens:

1. Navigate to the platform URL using `browser_navigate`
2. Take a snapshot with `browser_snapshot` to detect login prompts or walls
3. If a login wall is detected, inform the user: "I need you to log in to {platform} so I can access the content. I'll open the browser — please log in manually."
4. Wait for the user to confirm login is complete
5. The browser profile will preserve the session cookies for future investigations

### Subsequent Runs

After the first login, cookies are preserved in the browser profile. Sherlock should still check for login walls on each run (platforms may expire sessions) and re-prompt the user if needed.

---

## Platform Extractors

Each platform has a dedicated extraction process. Sherlock detects the platform from the URL and applies the corresponding extractor.

### Instagram Extractor

**URL patterns:** `instagram.com/{username}`, `instagram.com/{username}/`, `instagram.com/p/{post-id}`, `instagram.com/reel/{reel-id}`

#### Pre-extraction: Check Investigation Mode

Before starting extraction, check the `investigation_mode` value from the Architect's prompt:

- **`single_post`**: Skip "Profile Grid Extraction" entirely. The Architect provided the exact post URL. Jump directly to the relevant extraction section (Carousel Extraction, Reel Extraction, or Single Image Extraction) using that URL.
- **`profile_1`** or **`profile_5_10`**: Proceed with Profile Grid Extraction below. For `profile_1`, stop after collecting 1 post. For `profile_5_10`, stop after collecting 10 posts.

#### Profile Grid Extraction

1. Navigate to the profile page:
   ```
   browser_navigate: https://www.instagram.com/{username}/
   ```

2. Take a snapshot to read the profile grid:
   ```
   browser_snapshot
   ```

3. From the snapshot, identify the content grid. Each grid item has visual indicators for content type:
   - Carousel icon (stacked squares) in the top-right corner = multi-slide post
   - Reel icon (play button / clapperboard) = video Reel
   - No icon = single image post

4. Note the total post count from the profile header.

#### Carousel Extraction (per post)

1. Click the carousel post in the grid:
   ```
   browser_click: [ref to grid item]
   ```

2. Take a snapshot of the opened post modal to read the caption:
   ```
   browser_snapshot
   ```

3. Record the full caption text, post date, and engagement metrics (likes, comments) from the snapshot.

4. Read the text content of the current slide from the snapshot.

5. Navigate to the next slide by clicking the right arrow:
   ```
   browser_click: [ref to right arrow button]
   ```

6. Take a snapshot of the new slide:
   ```
   browser_snapshot
   ```

7. Record the slide text content.

8. Repeat steps 5-7 until no more right arrow is available (last slide reached).

9. Close the modal by pressing Escape or clicking the close button:
   ```
   browser_press_key: Escape
   ```

#### Reel Extraction (per reel)

1. Click the Reel in the grid:
   ```
   browser_click: [ref to grid item]
   ```

2. Take a snapshot to read the caption and engagement metrics:
   ```
   browser_snapshot
   ```

3. Record the caption text, post date, likes, comments, and views.

4. Extract the Reel URL from the browser address bar or the snapshot.

5. Download the audio for transcription using yt-dlp:
   ```bash
   yt-dlp -x --audio-format wav -o "squads/{squad-name}/_investigations/{username}/reel-{id}.%(ext)s" "https://www.instagram.com/reel/{reel-id}/"
   ```

6. Transcribe the audio using whisper:
   ```bash
   whisper "squads/{squad-name}/_investigations/{username}/reel-{id}.wav" --model small --output_dir "squads/{squad-name}/_investigations/{username}/" --output_format txt
   ```

7. Read the transcription file and include it in the raw content output.

8. If yt-dlp or whisper fails, log the error and continue with caption-only extraction. Note in the output: "Transcription unavailable — caption only."

9. Close the Reel modal:
   ```
   browser_press_key: Escape
   ```

#### Single Image Post Extraction

1. Click the post in the grid:
   ```
   browser_click: [ref to grid item]
   ```

2. Take a snapshot:
   ```
   browser_snapshot
   ```

3. Record the caption text, post date, and engagement metrics.

4. Close the modal:
   ```
   browser_press_key: Escape
   ```

#### Scrolling for More Content

To load additional posts beyond the initial grid view:

```
browser_evaluate: window.scrollBy(0, 1000)
```

After scrolling, wait briefly for new content to load, then take a new snapshot:

```
browser_snapshot
```

Repeat the scroll-and-snapshot cycle until the target number of posts has been extracted or no new content loads.

#### Instagram Configuration Defaults

- Default content count: 12-15 most recent posts
- Content types to extract: all (carousels, reels, single images)
- Priority: extract carousels and reels first (higher signal content), then single images
- Stop condition: target count reached OR 3 consecutive scrolls with no new content

---

### YouTube Extractor

**URL patterns:** `youtube.com/@{handle}`, `youtube.com/channel/{id}`, `youtube.com/watch?v={id}`, `youtube.com/@{handle}/videos`

#### Channel Video List Extraction

1. Navigate to the channel's videos page:
   ```
   browser_navigate: https://www.youtube.com/@{handle}/videos
   ```

2. Take a snapshot to read the video list:
   ```
   browser_snapshot
   ```

3. From the snapshot, identify video titles, view counts, and upload dates.

4. Select videos to extract based on configuration (most recent, most viewed, or a mix).

#### Individual Video Extraction

1. Click the video title to open it:
   ```
   browser_click: [ref to video title]
   ```

2. Take a snapshot to read the title, view count, like count, and upload date:
   ```
   browser_snapshot
   ```

3. Expand the video description by clicking "...more" or the description area:
   ```
   browser_click: [ref to description expand button]
   ```

4. Take another snapshot to capture the full description text:
   ```
   browser_snapshot
   ```

5. Record: title, full description, view count, like count, comment count, upload date.

#### Video Transcription — Primary Method (Subtitles)

Use yt-dlp to download auto-generated or manual subtitles:

```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download -o "squads/{squad-name}/_investigations/{channel}/%(id)s" "https://www.youtube.com/watch?v={video-id}"
```

If subtitles are available, read the `.vtt` or `.srt` file and extract the text content (strip timestamps).

#### Video Transcription — Fallback Method (Audio + Whisper)

If no subtitles are available, download the audio and transcribe:

```bash
yt-dlp -x --audio-format wav -o "squads/{squad-name}/_investigations/{channel}/%(id)s.%(ext)s" "https://www.youtube.com/watch?v={video-id}"
```

```bash
whisper "squads/{squad-name}/_investigations/{channel}/{video-id}.wav" --model small --output_dir "squads/{squad-name}/_investigations/{channel}/" --output_format txt
```

Read the transcription file and include it in the raw content output.

#### Navigating Back to Video List

After extracting a video, navigate back to the channel videos page:

```
browser_navigate_back
```

Or navigate directly:

```
browser_navigate: https://www.youtube.com/@{handle}/videos
```

#### YouTube Configuration Defaults

- Default video count: 8-10 most recent videos
- Transcription method: subtitles first, audio+whisper fallback
- Priority: most recent uploads first, then highest viewed
- Stop condition: target count reached OR end of uploads page

---

### Twitter/X Extractor

**URL patterns:** `x.com/{username}`, `twitter.com/{username}`, `x.com/{username}/status/{id}`

#### Timeline Extraction

1. Navigate to the user's profile:
   ```
   browser_navigate: https://x.com/{username}
   ```

2. Take a snapshot to read the timeline:
   ```
   browser_snapshot
   ```

3. From the snapshot, identify individual tweets and threads. Thread indicators include "Show this thread" links or reply chains from the same author.

#### Tweet Extraction (per tweet)

1. From the timeline snapshot, record for each tweet:
   - Full tweet text
   - Post date and time
   - Engagement metrics: likes, retweets, replies, bookmarks, views (if visible)
   - Whether it is a standalone tweet or part of a thread

2. If the tweet text is truncated in the timeline view, click the tweet to open it:
   ```
   browser_click: [ref to tweet]
   ```

3. Take a snapshot of the full tweet:
   ```
   browser_snapshot
   ```

4. Record the complete text and all metrics.

5. Navigate back to the timeline:
   ```
   browser_navigate_back
   ```

#### Thread Extraction

1. Identify threads in the timeline (tweets with "Show this thread" or self-reply chains).

2. Click the first tweet in the thread to open it:
   ```
   browser_click: [ref to thread tweet]
   ```

3. Take a snapshot to read the full thread:
   ```
   browser_snapshot
   ```

4. Scroll down within the thread to capture all tweets in the chain:
   ```
   browser_evaluate: window.scrollBy(0, 800)
   ```

5. Take additional snapshots as needed to capture the complete thread.

6. Record all tweets in the thread as a single content unit, preserving their order.

7. Navigate back to the timeline:
   ```
   browser_navigate_back
   ```

#### Scrolling for More Tweets

To load older tweets beyond the initial timeline view:

```
browser_evaluate: window.scrollBy(0, 1000)
```

After scrolling, take a new snapshot and continue extraction.

#### Twitter/X Configuration Defaults

- Default tweet count: 15-20 most recent tweets (excluding replies to others)
- Content types: standalone tweets and threads (skip replies to other users unless they are high-engagement)
- Priority: threads first (higher content density), then standalone tweets by engagement
- Stop condition: target count reached OR 3 consecutive scrolls with no new tweets

---

### LinkedIn Extractor

**URL patterns:** `linkedin.com/in/{username}`, `linkedin.com/in/{username}/recent-activity/all/`, `linkedin.com/posts/{post-id}`

#### Activity Feed Extraction

1. Navigate to the user's recent activity page:
   ```
   browser_navigate: https://www.linkedin.com/in/{username}/recent-activity/all/
   ```

2. Take a snapshot to read the activity feed:
   ```
   browser_snapshot
   ```

3. From the snapshot, identify posts and articles. LinkedIn posts may be truncated with a "...see more" link.

#### Post Extraction (per post)

1. If the post text is truncated, click "...see more" to expand it:
   ```
   browser_click: [ref to "see more" link]
   ```

2. Take a snapshot to capture the full post text:
   ```
   browser_snapshot
   ```

3. Record: full post text, post date, reaction count, comment count, repost count.

4. If the post contains a document/carousel (PDF slides), note the slide count and extract visible slide text from the snapshots.

#### Article Extraction

1. Identify article links in the activity feed (posts that link to LinkedIn articles).

2. Click the article link to open it:
   ```
   browser_click: [ref to article link]
   ```

3. Take a snapshot to read the full article:
   ```
   browser_snapshot
   ```

4. Scroll down to capture the complete article if it extends beyond the viewport:
   ```
   browser_evaluate: window.scrollBy(0, 1000)
   ```

5. Take additional snapshots as needed.

6. Record: article title, full text, publication date, reaction count, comment count.

7. Navigate back to the activity feed:
   ```
   browser_navigate_back
   ```

#### Scrolling for More Posts

```
browser_evaluate: window.scrollBy(0, 1000)
```

After scrolling, take a new snapshot and continue extraction.

#### LinkedIn Configuration Defaults

- Default post count: 10-15 most recent posts
- Content types: text posts, document/carousel posts, articles
- Priority: long-form text posts and articles first (higher content density), then shorter posts
- Stop condition: target count reached OR 3 consecutive scrolls with no new posts

---

## Output Formats

Sherlock produces three output files per investigation. The first two are per-profile, the third is a consolidation across all profiles.

### Raw Content File: `raw-content.md`

One file per profile, saved to `squads/{squad-name}/_investigations/{username}/raw-content.md`.

```markdown
# Raw Content: @{username} ({platform})

Investigated: {YYYY-MM-DD}
Total contents analyzed: {N}
Content types: {comma-separated list, e.g. "carousel, reel, single image"}

---

## Content 1: [Carousel: 8 slides | Educational]

**Date:** 2026-02-15
**Metrics:** 4,200 likes, 312 comments, 1,890 saves
**URL:** https://www.instagram.com/p/ABC123/

### Caption
The full caption text goes here, exactly as it appears on the platform.
Including all line breaks, emojis, hashtags, and mentions.

No editing, no summarizing — raw text only.

### Slide 1
The exact text content visible on slide 1. If the slide is purely visual
with no text overlay, note: "[Visual only — no text overlay]"

### Slide 2
Text content of slide 2.

### Slide 3
Text content of slide 3.

(Continue for all slides in the carousel.)

---

## Content 2: [Reel: 45 seconds | Storytelling]

**Date:** 2026-02-12
**Metrics:** 89,000 views, 3,100 likes, 478 comments
**URL:** https://www.instagram.com/reel/DEF456/

### Caption
Full caption text as it appears on the platform.

### Transcription
The complete spoken-word transcription of the Reel audio.
Every word, including filler words, pauses noted as [pause],
and any on-screen text that differs from the spoken content
noted in brackets: [on-screen: "different text here"].

If transcription was unavailable: "Transcription unavailable — audio
extraction failed. Caption only."

---

## Content 3: [Single Image | Motivational]

**Date:** 2026-02-10
**Metrics:** 2,800 likes, 145 comments
**URL:** https://www.instagram.com/p/GHI789/

### Caption
Full caption text.

---

## Content 4: [Tweet: standalone | Opinion]

**Date:** 2026-02-18
**Metrics:** 1,200 likes, 340 retweets, 89 replies, 45,000 views
**URL:** https://x.com/username/status/123456789

### Text
The full tweet text, exactly as posted.

---

## Content 5: [Thread: 7 tweets | Framework]

**Date:** 2026-02-14
**Metrics:** 3,400 likes (thread total), 890 retweets, 234 replies
**URL:** https://x.com/username/status/987654321

### Tweet 1/7
First tweet in the thread.

### Tweet 2/7
Second tweet in the thread.

### Tweet 3/7
Third tweet in the thread.

(Continue for all tweets in the thread.)

---

## Content 6: [LinkedIn Post | Thought Leadership]

**Date:** 2026-02-16
**Metrics:** 890 reactions, 67 comments, 34 reposts
**URL:** https://www.linkedin.com/posts/username_activity-123456789

### Text
The full post text after expanding "see more."
Including all formatting, line breaks, and emojis as they appear.

---

## Content 7: [LinkedIn Article | Industry Analysis]

**Date:** 2026-02-08
**Metrics:** 1,200 reactions, 89 comments
**URL:** https://www.linkedin.com/pulse/article-title-username

### Title
The article title.

### Text
The full article text. Include all paragraphs, headers, and sub-sections
exactly as they appear in the article.

---

## Content 8: [YouTube Video: 12 min | Tutorial]

**Date:** 2026-02-11
**Metrics:** 45,000 views, 2,100 likes, 189 comments
**URL:** https://www.youtube.com/watch?v=ABC123

### Title
The video title.

### Description
The full video description text (after expanding).

### Transcription
The complete video transcription. If sourced from auto-generated subtitles,
note at the top: "[Auto-generated subtitles — may contain minor errors]"

Full transcription text goes here, paragraph by paragraph.
```

### Pattern Analysis File: `pattern-analysis.md`

One file per profile, saved to `squads/{squad-name}/_investigations/{username}/pattern-analysis.md`.

```markdown
# Pattern Analysis: @{username} ({platform})

Analyzed: {YYYY-MM-DD}
Sample size: {N} contents
Period covered: {earliest date} to {latest date}

## Executive Summary

A 3-5 sentence overview of the most significant patterns found. What makes
this creator's content distinctive? What is their primary content strategy?
What patterns correlate most strongly with high engagement?

## Structural Patterns

### Content Mix
| Type | Count | Percentage | Avg. Engagement |
|------|-------|------------|-----------------|
| Carousel | 7 | 58% | 4,200 likes |
| Reel | 3 | 25% | 45,000 views |
| Single Image | 2 | 17% | 1,800 likes |

### Format Structures
- **Carousels**: Most common structure is [N] slides. Opening slide pattern:
  [describe]. Closing slide pattern: [describe]. Typical slide text length:
  [N] words.
- **Reels**: Average length: [N] seconds. Opening hook pattern: [describe].
  Spoken vs. on-screen text ratio: [describe].
- **Posts**: Average caption length: [N] words. Line break frequency:
  [describe]. Hashtag placement: [describe].

### Posting Cadence
- Average posts per week: [N]
- Most common posting days: [days]
- Content type rotation pattern: [describe if any]

## Language Patterns

### Tone Profile
Overall tone: [describe in 2-3 sentences — formal/casual, serious/playful,
authoritative/conversational, etc.]

### Hook Patterns
The top 5 most effective hooks (by engagement), with the pattern they follow:

1. "{exact hook text}" — Pattern: [pattern name, e.g. "contradiction opener",
   "bold claim", "question that challenges assumption"]
2. "{exact hook text}" — Pattern: [pattern name]
3. "{exact hook text}" — Pattern: [pattern name]
4. "{exact hook text}" — Pattern: [pattern name]
5. "{exact hook text}" — Pattern: [pattern name]

### Call-to-Action Patterns
The most common CTA approaches, ranked by frequency:

1. [CTA type]: "{example}" — used in [N] of [total] posts
2. [CTA type]: "{example}" — used in [N] of [total] posts
3. [CTA type]: "{example}" — used in [N] of [total] posts

### Vocabulary Signature
Words and phrases this creator uses frequently that form part of their voice:
- "{phrase}" — appears in [N] posts, used for [context]
- "{phrase}" — appears in [N] posts, used for [context]
- "{phrase}" — appears in [N] posts, used for [context]
- "{phrase}" — appears in [N] posts, used for [context]
- "{phrase}" — appears in [N] posts, used for [context]

### Style Notes
- Sentence length tendency: [short/medium/long, with average word count]
- Emoji usage: [frequency and placement pattern]
- Formatting habits: [line breaks, bullet points, numbering, bold/caps]
- Hashtag strategy: [count, placement, type — branded vs. discovery vs. community]

## Engagement Patterns

### Highest Performing Content
| Rank | Content | Type | Key Metric | What Made It Work |
|------|---------|------|-----------|-------------------|
| 1 | "{title/hook}" | Carousel | 8,900 saves | [specific reason] |
| 2 | "{title/hook}" | Reel | 120K views | [specific reason] |
| 3 | "{title/hook}" | Post | 5,200 likes | [specific reason] |

### Engagement Drivers
Patterns that correlate with above-average engagement:
- [Pattern 1]: Posts with this pattern average [X]% higher engagement
- [Pattern 2]: Posts with this pattern average [X]% higher engagement
- [Pattern 3]: Posts with this pattern average [X]% higher engagement

### Underperforming Content
Patterns found in below-average posts:
- [Pattern]: These posts averaged [X]% lower engagement. Possible reason: [hypothesis]
- [Pattern]: These posts averaged [X]% lower engagement. Possible reason: [hypothesis]

## Recommendations for Squad

Five specific, actionable recommendations for how the squad should incorporate
patterns from this creator's content:

1. **[Recommendation title]**: [Detailed recommendation with specific examples
   from the analyzed content. Reference exact posts or patterns. Explain how
   to adapt this for the user's brand.]

2. **[Recommendation title]**: [Detailed recommendation.]

3. **[Recommendation title]**: [Detailed recommendation.]

4. **[Recommendation title]**: [Detailed recommendation.]

5. **[Recommendation title]**: [Detailed recommendation.]
```

### Consolidated Analysis File: `consolidated-analysis.md`

One file per investigation (across all profiles), saved to `squads/{squad-name}/_investigations/consolidated-analysis.md`.

```markdown
# Consolidated Investigation: {squad-name}

Investigated: {YYYY-MM-DD}
Total profiles analyzed: {N}
Total contents extracted: {N across all profiles}

## Profiles Analyzed

| # | Profile | Platform | Contents | Top Content Type | Avg. Engagement |
|---|---------|----------|----------|------------------|-----------------|
| 1 | @{username} | Instagram | 12 | Carousel (67%) | 4,200 likes |
| 2 | @{username} | YouTube | 8 | Long-form (100%) | 45,000 views |
| 3 | @{username} | X/Twitter | 15 | Threads (40%) | 2,100 likes |

## Universal Patterns

Patterns that appear across ALL (or most) analyzed profiles:

### Structural Patterns
- [Pattern found across multiple profiles]: Seen in [N] of [total] profiles.
  Examples: [reference specific content from different profiles].
- [Pattern]: Seen in [N] of [total] profiles. Examples: [references].
- [Pattern]: Seen in [N] of [total] profiles. Examples: [references].

### Language Patterns
- [Shared language pattern]: Found in [N] profiles. Examples: [references].
- [Shared language pattern]: Found in [N] profiles. Examples: [references].
- [Shared language pattern]: Found in [N] profiles. Examples: [references].

### Engagement Drivers
- [Universal engagement driver]: Correlates with high performance across
  [N] profiles. Evidence: [specific examples].
- [Universal engagement driver]: Evidence: [specific examples].
- [Universal engagement driver]: Evidence: [specific examples].

## Profile Differentiators

What makes each profile's approach unique (not shared with others):

### @{username1} — Unique Strengths
- [Unique pattern 1]: [description with examples]
- [Unique pattern 2]: [description with examples]

### @{username2} — Unique Strengths
- [Unique pattern 1]: [description with examples]
- [Unique pattern 2]: [description with examples]

### @{username3} — Unique Strengths
- [Unique pattern 1]: [description with examples]
- [Unique pattern 2]: [description with examples]

## Recommended Framework

A synthesized framework based on the best patterns found across all profiles.
This framework becomes the operational blueprint for the squad.

### Structure Template
The recommended content structure, synthesized from the highest-performing
patterns across all analyzed profiles:

1. **Opening/Hook**: [Recommended approach based on top-performing hooks across
   all profiles. Include 3 hook patterns that worked best, with templates.]
2. **Body Structure**: [Recommended structure — number of sections/slides/points,
   flow pattern, information density per section.]
3. **Supporting Elements**: [Evidence, examples, data — how to support claims
   based on what top creators do.]
4. **Closing/CTA**: [Recommended CTA approach synthesized from highest-performing
   CTAs across all profiles. Include 2-3 CTA templates.]

### Voice Guidelines
Synthesized voice recommendations based on patterns across all profiles:

- **Tone**: [Recommended tone direction with justification from data]
- **Vocabulary to adopt**: [5-8 words/phrases found in high-performing content
  across profiles]
- **Vocabulary to avoid**: [3-5 patterns absent from successful content or
  present in underperforming content]
- **Sentence style**: [Length, rhythm, formatting based on observed patterns]
- **Emoji and formatting**: [Recommendations based on what top performers do]

### Hook Templates
The 5 most effective hook patterns found, abstracted into reusable templates:

1. **[Pattern name]**: "[Template with {placeholders}]"
   Source: @{username}, engagement: [metric]. Why it works: [explanation].
2. **[Pattern name]**: "[Template]"
   Source: @{username}, engagement: [metric]. Why it works: [explanation].
3. **[Pattern name]**: "[Template]"
   Source: @{username}, engagement: [metric]. Why it works: [explanation].
4. **[Pattern name]**: "[Template]"
   Source: @{username}, engagement: [metric]. Why it works: [explanation].
5. **[Pattern name]**: "[Template]"
   Source: @{username}, engagement: [metric]. Why it works: [explanation].

### CTA Templates
The 3 most effective CTA patterns found:

1. **[CTA type]**: "[Template]" — Avg engagement lift: [X]%
2. **[CTA type]**: "[Template]" — Avg engagement lift: [X]%
3. **[CTA type]**: "[Template]" — Avg engagement lift: [X]%

### Anti-Patterns
Patterns that were absent from successful content or present in underperforming
content. These become "never do" rules for the squad:

1. [Anti-pattern]: Found in [N] underperforming posts, absent from top performers.
2. [Anti-pattern]: Found in [N] underperforming posts, absent from top performers.
3. [Anti-pattern]: Found in [N] underperforming posts, absent from top performers.
4. [Anti-pattern]: Found in [N] underperforming posts, absent from top performers.
```

---

## How the Architect Uses Sherlock Output

After the investigation completes, the Architect maps findings to squad data files during Phase 3 (Extraction). Each squad data file is enriched with real-world evidence from the investigation.

### Mapping: Investigation Output to Squad Data Files

| Investigation Section | Squad Data File | What Gets Extracted |
|---|---|---|
| Highest-engagement raw content | `pipeline/data/output-examples.md` | Real posts reformatted as gold-standard examples for the writer agent |
| Anti-Patterns from consolidated analysis | `pipeline/data/anti-patterns.md` | Patterns absent from successful content become "never do" rules |
| Engagement Patterns + Quality metrics | `pipeline/data/quality-criteria.md` | Real engagement benchmarks calibrate scoring thresholds |
| Recommended Framework from consolidated analysis | `pipeline/data/domain-framework.md` | Structure template, hook templates, CTA templates become the operational framework |
| Language Patterns from pattern analyses | `pipeline/data/tone-of-voice.md` | Vocabulary signature, tone profile, and style notes inform voice options |
| Research brief (web search) + pattern analyses | `pipeline/data/research-brief.md` | Web research enriched with first-party content analysis evidence |

### Agent Enrichment

Beyond data files, investigation output enriches individual agent definitions:

- **Writer agent persona**: Operational Framework includes real hook patterns and structure templates from the investigation. Voice Guidance uses the vocabulary signature. Output Examples are adapted from real high-performing content.
- **Reviewer agent persona**: Quality Criteria are calibrated against real engagement metrics from investigated profiles. The reviewer knows what "high-performing" looks like because it has seen real examples.
- **Researcher agent persona**: The research brief includes first-party data from the investigation, making the researcher's benchmarks grounded in real content, not just industry averages.
- **Ideator agent persona** (content squads): Hook templates and angle patterns from the investigation feed directly into the ideator's framework for generating viral angles.

### Priority Rules

When investigation data conflicts with web research data:

1. Investigation data (first-party, real content) takes priority over web research (third-party, aggregated)
2. Patterns found across multiple investigated profiles carry more weight than single-profile patterns
3. The Architect notes the source of each data point in the squad data files: "[Source: Investigation — @username]" vs "[Source: Web research — URL]"

---

## Investigation Configuration

### URL Parsing Rules

Sherlock detects the platform from the URL to apply the correct extractor:

| URL Contains | Platform | Extractor |
|---|---|---|
| `instagram.com` | Instagram | Instagram Extractor |
| `youtube.com` or `youtu.be` | YouTube | YouTube Extractor |
| `x.com` or `twitter.com` | Twitter/X | Twitter/X Extractor |
| `linkedin.com` | LinkedIn | LinkedIn Extractor |

If the URL does not match any known pattern, inform the user: "I don't recognize this platform. Supported platforms: Instagram, YouTube, Twitter/X, LinkedIn."

### Configuration Prompts

Before starting extraction for each profile, Sherlock asks the user for configuration using numbered lists (one question at a time):

**Content quantity:**
"How many pieces of content should I extract from @{username}?"
1. 5 (quick scan)
2. 10-15 (standard)
3. 20+ (deep dive)

**Content type focus** (platform-dependent):

For Instagram:
"What content types should I focus on for @{username}?"
1. All types
2. Carousels only
3. Reels only
4. Carousels + Reels (skip single images)

For YouTube:
"What should I extract from {channel}?"
1. Most recent videos
2. Most popular videos
3. Mix of recent and popular

For Twitter/X:
"What content should I focus on from @{username}?"
1. All tweets
2. Threads only
3. Tweets + Threads (skip replies)

For LinkedIn:
"What content should I focus on from {name}?"
1. All posts
2. Long-form posts only
3. Articles only
4. Posts + Articles

### Smart Recommendations

Sherlock recommends extraction settings based on the squad type:

- **Content creation squads** (writing, copywriting, posts): Recommend "Carousels + Reels" on Instagram, "Threads only" on Twitter, "Long-form posts" on LinkedIn. These content types have the highest signal for writing patterns.
- **Video squads** (YouTube, TikTok, Reels): Recommend "Reels only" on Instagram, "Most recent videos" on YouTube. Focus on video content and transcriptions.
- **Strategy/analysis squads**: Recommend "All types" with "deep dive" quantity. Maximum data for pattern analysis.
- **General squads**: Recommend "standard" quantity with "all types." Balanced approach.

### Timeout and Error Handling

- Maximum time per profile: 10 minutes. If extraction exceeds this, save what has been collected so far and note: "Investigation truncated at {N} contents due to time limit."
- If a platform blocks access or returns errors, retry once. If the retry fails, inform the user and skip that profile.
- If the browser crashes or becomes unresponsive, save collected data to the output file and report the failure.
- Always produce output files even on partial failure — partial data is better than no data.
