# Sherlock — LinkedIn Extractor

Load `sherlock-shared.md` before using this extractor.

This file contains the LinkedIn-specific extraction process. The Architect loads this file (alongside `sherlock-shared.md`) when the reference URL is a LinkedIn profile or post.

---

## URL Patterns

- Profile: `linkedin.com/in/{username}`
- Activity feed: `linkedin.com/in/{username}/recent-activity/all/`
- Post: `linkedin.com/posts/{post-id}`

---

## Activity Feed Extraction

1. Navigate to the user's recent activity page using browser automation with the saved LinkedIn session:
   ```bash
   npx playwright open --load-storage=_opensquad/_browser_profile/linkedin.json https://www.linkedin.com/in/{username}/recent-activity/all/
   ```

2. Take a snapshot to read the activity feed.

3. From the snapshot, identify posts and articles. LinkedIn posts may be truncated with a "...see more" link.

---

## Post Extraction (per post)

1. If the post text is truncated, click "...see more" to expand it.

2. Take a snapshot to capture the full post text.

3. Record: full post text, post date, reaction count, comment count, repost count.

4. If the post contains a document/carousel (PDF slides), note the slide count and extract visible slide text from the snapshots.

---

## Article Extraction

1. Identify article links in the activity feed (posts that link to LinkedIn articles).

2. Click the article link to open it.

3. Take a snapshot to read the full article.

4. Scroll down to capture the complete article if it extends beyond the viewport (e.g., `window.scrollBy(0, 1000)` or equivalent scroll action).

5. Take additional snapshots as needed.

6. Record: article title, full text, publication date, reaction count, comment count.

7. Navigate back to the activity feed using browser back navigation.

---

## Scrolling for More Posts

To load additional posts beyond the initial activity feed view, scroll down the page using browser automation (e.g., `window.scrollBy(0, 1000)` via evaluate, or equivalent scroll action).

After scrolling, take a new snapshot and continue extraction.

---

## Configuration Defaults

- Default post count: up to 3 most recent posts
- Content types: text posts, document/carousel posts, articles
- Priority: long-form text posts and articles first (higher content density), then shorter posts
- Stop condition: target count reached OR 3 consecutive scrolls with no new posts
