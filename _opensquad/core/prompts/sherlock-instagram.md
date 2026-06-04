# Sherlock — Instagram Extractor

Load `sherlock-shared.md` before using this extractor.

This file contains the Instagram-specific extraction process. The Architect loads this file (alongside `sherlock-shared.md`) when the reference URL is an Instagram profile or post.

---

## URL Patterns

- Profile: `instagram.com/{username}`, `instagram.com/{username}/`
- Post: `instagram.com/p/{post-id}`
- Reel: `instagram.com/reel/{reel-id}`

---

## Pre-Extraction: Check Investigation Mode

Before starting extraction, check the `investigation_mode` value from the Architect's prompt:

- **`single_post`**: Skip "Profile Grid Extraction" entirely. The Architect provided the exact post URL. Jump directly to the relevant extraction section (Carousel Extraction, Reel Extraction, or Single Image Extraction) using that URL.
- **`profile_1`** or **`profile_3`**: Proceed with Profile Grid Extraction below. For `profile_1`, stop after collecting 1 post. For `profile_3`, stop after collecting 3 posts.

Load the Instagram session before navigating:
```bash
npx playwright open --load-storage=_opensquad/_browser_profile/instagram.json https://www.instagram.com/{username}/
```

---

## Profile Grid Extraction

1. Navigate to the profile page using browser automation with the saved Instagram session.

2. Take a snapshot to read the profile grid.

3. From the snapshot, identify the content grid. Each grid item has visual indicators for content type:
   - Carousel icon (stacked squares) in the top-right corner = multi-slide post
   - Reel icon (play button / clapperboard) = video Reel
   - No icon = single image post

4. Note the total post count from the profile header.

---

## Carousel Extraction (per post)

1. Click the carousel post in the grid.

2. Take a snapshot of the opened post modal to read the caption.

3. Record the full caption text, post date, and engagement metrics (likes, comments) from the snapshot.

4. Read the text content of the current slide from the snapshot.

5. Navigate to the next slide by clicking the right arrow.

6. Take a snapshot of the new slide.

7. Record the slide text content.

8. Repeat steps 5-7 until no more right arrow is available (last slide reached).

9. Close the modal by pressing Escape or clicking the close button.

---

## Reel Extraction (per reel)

1. Click the Reel in the grid.

2. Take a snapshot to read the caption and engagement metrics.

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

9. Close the Reel modal by pressing Escape or clicking the close button.

---

## Single Image Post Extraction

1. Click the post in the grid.

2. Take a snapshot.

3. Record the caption text, post date, and engagement metrics.

4. Close the modal by pressing Escape or clicking the close button.

---

## Scrolling for More Content

To load additional posts beyond the initial grid view, scroll down the page using browser automation (e.g., `window.scrollBy(0, 1000)` via evaluate, or equivalent scroll action).

After scrolling, wait briefly for new content to load, then take a new snapshot.

Repeat the scroll-and-snapshot cycle until the target number of posts has been extracted or no new content loads.

---

## Configuration Defaults

- Default content count: up to 3 most recent posts
- Content types to extract: all (carousels, reels, single images)
- Priority: extract carousels and reels first (higher signal content), then single images
- Stop condition: target count reached OR 3 consecutive scrolls with no new content
