---
name: image-ai-generator
description: >
  Generates images via Openrouter API using AI image models.
  Supports two modes: test (cheap model for iteration) and production (high-quality model for final output).
  Handles prompt construction, API calls, base64 decoding, and file saving.
  Supports reference images (logos, mascots) for brand-consistent generation.
description_pt-BR: >
  Gera imagens via API do Openrouter usando modelos de IA.
  Suporta dois modos: test (modelo barato para iteração) e production (modelo de alta qualidade para output final).
  Cuida da construção de prompts, chamadas de API, decodificação base64 e salvamento de arquivos.
  Suporta imagens de referência (logos, mascotes) para geração consistente com a marca.
type: script
version: "1.0.0"
script:
  path: scripts/generate.py
  runtime: python3
  invoke: "python3 {skill_path}/scripts/generate.py --prompt \"{prompt}\" --output \"{output}\" --mode \"{mode}\""
env:
  - OPENROUTER_API_KEY
categories: [assets, images, ai, generation]
---

# Image Generator

## When to use

Use the Image Generator when you need to create visual assets from text prompts. This skill calls the Openrouter API with AI image generation models and saves the resulting images locally.

**IMPORTANT: Think twice before generating images.** Image generation costs money and takes time. Before generating:
1. Check if a suitable image already exists in the squad's assets folder
2. Check if a web search could find a free/open image that works
3. Consider if the image is truly necessary for the content quality
4. Only generate when no existing alternative is good enough
5. **Generate only what you need** — never batch-generate "test variations". One image is enough to validate a concept.

## Modes

### Test mode (`--mode test`)
- **Model:** `sourceful/riverflow-v2-fast`
- **When to use:** During iteration, testing layouts, checking composition, reviewing concepts
- **Cost:** ~R$0.01-0.02 per image (very low)
- **Quality:** Good enough for layout validation, not for final output

### Production mode (`--mode production`)
- **Model:** `google/gemini-3.1-flash-image-preview`
- **When to use:** Only when generating the final images that will be published or delivered
- **Cost:** ~R$0.07-0.10 per image
- **Quality:** High quality, suitable for social media and publishing

**Default mode is `test`.** Only switch to `production` when the user has approved the layout/composition and you are generating the final deliverable images.

## Instructions

### Single image generation

```bash
python3 skills/image-generator/scripts/generate.py \
  --prompt "A detailed description of the image to generate" \
  --output "squads/{squad}/output/{run_id}/assets/image-name.jpg" \
  --mode test
```

### With a reference image (logo, mascot, brand asset)

Use `--reference` to send a local image to the model as visual context. The model will incorporate the referenced image (e.g., a logo or mascot) into the generated output.

```bash
python3 skills/image-generator/scripts/generate.py \
  --prompt "A social media banner featuring the company logo prominently in the center" \
  --output "squads/{squad}/output/{run_id}/assets/banner.jpg" \
  --reference "squads/{squad}/assets/logo.png" \
  --mode production
```

Supported reference formats: PNG, JPEG, WEBP, GIF.

### Batch generation

```bash
python3 skills/image-generator/scripts/generate.py \
  --batch "squads/{squad}/output/{run_id}/assets/batch.json" \
  --mode production
```

The batch JSON file should contain:
```json
[
  {"prompt": "Description of image 1", "output": "path/to/image1.jpg"},
  {"prompt": "Description of image 2", "output": "path/to/image2.jpg"}
]
```

Each item can optionally include a `"reference": "path/to/ref.png"` field.

### Prompt guidelines

- Be specific about composition, lighting, style, and mood
- Specify aspect ratio or orientation when relevant (e.g., "portrait 3:4", "landscape 16:9")
- Include "hyper realistic, 4K quality" for photographic styles
- Include "clean composition" to avoid cluttered outputs
- Avoid requesting text in images — AI models struggle with text rendering

### Cost awareness

- Each production image costs approximately R$0.07-0.10
- Each test image costs approximately R$0.01-0.02
- A typical carousel with 8 images costs ~R$0.60-0.80 in production mode
- **Always use test mode first**, then regenerate only the approved concepts in production mode
- When testing, generate **1 image only** — not 3, not 5, just 1

## Available operations

- **Single generation** — Generate one image from a text prompt
- **Batch generation** — Generate multiple images from a JSON batch file
- **Mode selection** — Choose between test (cheap) and production (high-quality) models
- **Reference image** — Send a logo/mascot/brand asset as visual context for the generation

## Error handling

- If `OPENROUTER_API_KEY` is not set, the script exits with an error message. Set it in your `.env` file or environment.
- If the API returns an error, the script prints the error code and body, then exits with code 1.
- If no image is found in the API response, the script reports which model was used and exits with code 1.
- For batch mode, partial failures are reported with a success count summary.
