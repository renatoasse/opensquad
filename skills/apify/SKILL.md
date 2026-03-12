---
name: apify
description: >
  Web scraping and automation platform. Extract data from any website,
  run pre-built scrapers (Actors), and automate web workflows using
  thousands of ready-made tools from the Apify Store.
description_pt-BR: >
  Plataforma de web scraping e automação. Extraia dados de qualquer site,
  execute scrapers prontos (Actors) e automatize fluxos de trabalho web
  com milhares de ferramentas da Apify Store.
description_es: >
  Plataforma de web scraping y automatización. Extrae datos de cualquier sitio web,
  ejecuta scrapers prediseñados (Actors) y automatiza flujos de trabajo web
  con miles de herramientas de la Apify Store.
type: mcp
version: "1.0.0"
mcp:
  server_name: apify
  command: npx
  args: ["-y", "@apify/actors-mcp-server@latest"]
env:
  - APIFY_TOKEN
categories: [scraping, data, automation]
---

# Apify Web Scraper

## When to use

Use Apify when you need to extract data from websites, scrape social media profiles, run search engine queries, or automate web data collection workflows. Apify provides thousands of pre-built scrapers (called Actors) that handle common scraping tasks out of the box.

## Instructions

You have access to Apify tools for web scraping and data extraction.

### Key capabilities

- Use Apify Actors (pre-built scrapers) to extract data from websites
- Popular Actors: web-scraper, instagram-scraper, google-search-scraper, youtube-scraper, twitter-scraper, tiktok-scraper
- Each Actor has its own input schema -- check documentation before running

### Best practices

- Start with the simplest Actor that meets the need
- Use `maxItems` to limit results and avoid excessive costs
- Check Actor pricing before running (some have per-result costs)
- Parse results and extract only the fields you need

## Available operations

- **Run Actor** -- Execute any Apify Actor with custom input parameters
- **Web Scraping** -- Extract structured data from any website
- **Social Media Scraping** -- Scrape profiles, posts, and engagement data from Instagram, YouTube, Twitter/X, TikTok
- **Search Scraping** -- Run Google, Bing, or other search engine queries and collect results
- **Data Export** -- Retrieve scraped datasets in JSON format
