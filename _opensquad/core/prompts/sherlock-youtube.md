# Sherlock — YouTube Extractor

Load `sherlock-shared.md` before using this extractor.

This file contains the YouTube-specific extraction process. The Architect loads this file (alongside `sherlock-shared.md`) when the reference URL is a YouTube channel or video.

---

## URL Patterns

- Channel: `youtube.com/@{handle}`, `youtube.com/channel/{id}`, `youtube.com/@{handle}/videos`
- Video: `youtube.com/watch?v={id}`
- Short URL: `youtu.be/{id}`

---

## Channel Video List Extraction

1. Navigate to the channel's videos page using browser automation with the saved YouTube session:
   ```bash
   npx playwright open --load-storage=_opensquad/_browser_profile/youtube.json https://www.youtube.com/@{handle}/videos
   ```

2. Take a snapshot to read the video list.

3. From the snapshot, identify video titles, view counts, and upload dates.

4. Select videos to extract based on configuration (most recent, most viewed, or a mix).

---

## Individual Video Extraction

1. Click the video title to open it.

2. Take a snapshot to read the title, view count, like count, and upload date.

3. Expand the video description by clicking "...more" or the description area.

4. Take another snapshot to capture the full description text.

5. Record: title, full description, view count, like count, comment count, upload date.

---

## Video Transcription — Primary Method (Subtitles)

Use yt-dlp to download auto-generated or manual subtitles:

```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download -o "squads/{squad-name}/_investigations/{channel}/%(id)s" "https://www.youtube.com/watch?v={video-id}"
```

If subtitles are available, read the `.vtt` or `.srt` file and extract the text content (strip timestamps).

---

## Video Transcription — Fallback Method (Audio + Whisper)

If no subtitles are available, download the audio and transcribe:

```bash
yt-dlp -x --audio-format wav -o "squads/{squad-name}/_investigations/{channel}/%(id)s.%(ext)s" "https://www.youtube.com/watch?v={video-id}"
```

```bash
whisper "squads/{squad-name}/_investigations/{channel}/{video-id}.wav" --model small --output_dir "squads/{squad-name}/_investigations/{channel}/" --output_format txt
```

Read the transcription file and include it in the raw content output.

---

## Navigating Back to Video List

After extracting a video, navigate back to the channel videos page using browser automation (navigate back in history or navigate directly to the channel URL).

---

## Configuration Defaults

- Default video count: up to 3 most recent videos
- Transcription method: subtitles first, audio+whisper fallback
- Priority: most recent uploads first, then highest viewed
- Stop condition: target count reached OR end of uploads page
