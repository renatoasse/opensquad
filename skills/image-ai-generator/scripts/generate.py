#!/usr/bin/env python3
"""
Image Generator — Opensquad Skill
Generates images via Openrouter API using AI image models.

Usage:
  # Single image
  python3 generate.py --prompt "description" --output "path/to/image.jpg" --mode test

  # Single image with reference (logo/mascot)
  python3 generate.py --prompt "description" --output "path/to/image.jpg" --reference "path/to/logo.png" --mode production

  # Batch (JSON file with list of {prompt, output} objects)
  python3 generate.py --batch "path/to/batch.json" --mode production
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error

# Model configuration per mode
MODELS = {
    "test": "sourceful/riverflow-v2-fast",
    "production": "google/gemini-3.1-flash-image-preview",
}

API_URL = "https://openrouter.ai/api/v1/chat/completions"


def load_api_key():
    """Load OPENROUTER_API_KEY from environment."""
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        # Try loading from .env in project root
        env_candidates = [
            os.path.join(os.getcwd(), ".env"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"),
        ]
        for env_path in env_candidates:
            env_path = os.path.abspath(env_path)
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("OPENROUTER_API_KEY=") and not line.startswith("#"):
                            key = line.split("=", 1)[1].strip().strip('"').strip("'")
                            break
                if key:
                    break
    if not key:
        print("ERROR: OPENROUTER_API_KEY not found in environment or .env file", file=sys.stderr)
        sys.exit(1)
    return key


def generate_image(prompt, output_path, mode, api_key, reference_image=None):
    """Generate a single image and save to output_path."""
    model = MODELS.get(mode, MODELS["test"])

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    if reference_image and os.path.exists(reference_image):
        # Multimodal: send reference image + text prompt
        ext = os.path.splitext(reference_image)[1].lower()
        mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}
        mime = mime_map.get(ext, "image/png")
        with open(reference_image, "rb") as img_f:
            img_b64 = base64.b64encode(img_f.read()).decode("utf-8")
        content = [
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
            {"type": "text", "text": f"Generate an image using the logo/mascot shown in the reference image above. {prompt}. Only output the image, no text."}
        ]
    else:
        content = f"Generate an image: {prompt}. Only output the image, no text."

    payload = json.dumps({
        "model": model,
        "messages": [{
            "role": "user",
            "content": content
        }]
    }).encode("utf-8")

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"  API error [{e.code}]: {error_body[:200]}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"  Request error: {e}", file=sys.stderr)
        return False

    images = data.get("choices", [{}])[0].get("message", {}).get("images", [])
    if not images:
        # Some models return image in content as base64
        content_resp = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if content_resp and isinstance(content_resp, str) and content_resp.startswith("data:image"):
            img_data = content_resp.split(",", 1)[1] if "," in content_resp else content_resp
        else:
            print(f"  No image returned by model {model}", file=sys.stderr)
            return False
    else:
        img_data = images[0].get("image_url", {}).get("url", "")
        if img_data.startswith("data:"):
            img_data = img_data.split(",", 1)[1]

    with open(output_path, "wb") as f:
        f.write(base64.b64decode(img_data))

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  OK: {output_path} ({size_kb:.0f} KB)")
    return True


def main():
    parser = argparse.ArgumentParser(description="Generate images via Openrouter API")
    parser.add_argument("--prompt", help="Text prompt for single image generation")
    parser.add_argument("--output", help="Output file path for single image")
    parser.add_argument("--batch", help="Path to JSON batch file")
    parser.add_argument("--mode", choices=["test", "production"], default="test",
                        help="Generation mode: test (cheap) or production (high-quality)")
    parser.add_argument("--reference", help="Path to reference image to include in the prompt")
    args = parser.parse_args()

    if not args.prompt and not args.batch:
        parser.error("Either --prompt or --batch is required")

    api_key = load_api_key()
    model = MODELS[args.mode]
    print(f"Image Generator — Mode: {args.mode} | Model: {model}")

    if args.batch:
        # Batch mode
        with open(args.batch, "r") as f:
            items = json.load(f)
        print(f"Generating {len(items)} images...\n")
        success = 0
        for i, item in enumerate(items, 1):
            prompt = item["prompt"]
            output = item["output"]
            ref = item.get("reference")
            print(f"[{i}/{len(items)}] {os.path.basename(output)}...")
            if generate_image(prompt, output, args.mode, api_key, reference_image=ref):
                success += 1
            if i < len(items):
                time.sleep(1)  # Rate limiting
        print(f"\nDone: {success}/{len(items)} images generated.")
        sys.exit(0 if success == len(items) else 1)
    else:
        # Single mode
        if not args.output:
            parser.error("--output is required for single image generation")
        print(f"Generating: {os.path.basename(args.output)}...")
        ok = generate_image(args.prompt, args.output, args.mode, api_key, reference_image=args.reference)
        sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
