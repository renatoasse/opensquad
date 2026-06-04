# Sherlock — Twitter/X Extractor

Load `sherlock-shared.md` before using this extractor.

This file contains the Twitter/X-specific extraction process. The Architect loads this file (alongside `sherlock-shared.md`) when the reference URL is a Twitter/X profile or post.

---

## URL Patterns

- Profile: `x.com/{username}`, `twitter.com/{username}`
- Post: `x.com/{username}/status/{id}`

---

## Timeline Extraction

1. Navigate to the user's profile using browser automation with the saved Twitter session:
   ```bash
   npx playwright open --load-storage=_opensquad/_browser_profile/twitter.json https://x.com/{username}
   ```

2. Take a snapshot to read the timeline.

3. From the snapshot, identify individual tweets and threads. Thread indicators include "Show this thread" links or reply chains from the same author.

---

## Tweet Extraction (per tweet)

1. From the timeline snapshot, record for each tweet:
   - Full tweet text
   - Post date and time
   - Engagement metrics: likes, retweets, replies, bookmarks, views (if visible)
   - Whether it is a standalone tweet or part of a thread

2. If the tweet text is truncated in the timeline view, click the tweet to open it.

3. Take a snapshot of the full tweet.

4. Record the complete text and all metrics.

5. Navigate back to the timeline using browser back navigation.

---

## Thread Extraction

1. Identify threads in the timeline (tweets with "Show this thread" or self-reply chains).

2. Click the first tweet in the thread to open it.

3. Take a snapshot to read the full thread.

4. Scroll down within the thread to capture all tweets in the chain (e.g., `window.scrollBy(0, 800)` or equivalent scroll action).

5. Take additional snapshots as needed to capture the complete thread.

6. Record all tweets in the thread as a single content unit, preserving their order.

7. Navigate back to the timeline using browser back navigation.

---

## Scrolling for More Tweets

To load older tweets beyond the initial timeline view, scroll down the page using browser automation (e.g., `window.scrollBy(0, 1000)` via evaluate, or equivalent scroll action).

After scrolling, take a new snapshot and continue extraction.

---

## Configuration Defaults

- Default tweet count: up to 3 most recent tweets (excluding replies to others)
- Content types: standalone tweets and threads (skip replies to other users unless they are high-engagement)
- Priority: threads first (higher content density), then standalone tweets by engagement
- Stop condition: target count reached OR 3 consecutive scrolls with no new tweets
