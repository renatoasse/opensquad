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
version: "1.1.0"
mcp:
  server_name: apify
  command: npx
  args: ["-y", "@apify/actors-mcp-server@latest"]
  transport: stdio
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
- Use Xquik Actors for focused public X content and audience research
- Each Actor has its own input schema -- check documentation before running

### Best practices

- Start with the simplest Actor that meets the need
- Use `maxItems` to limit results and avoid excessive costs
- Check Actor pricing before running (some have per-result costs)
- Parse results and extract only the fields you need
- Ask for explicit approval before starting a billable Actor run
- Keep `APIFY_TOKEN` in the environment, never in Actor input

## Xquik X research Actors

Use these Actors when a squad needs public X evidence:

| Need | Actor | Route |
|------|-------|-------|
| Posts, profiles, lists, threads, or engagement | [Xquik X Tweet Scraper](https://apify.com/xquik/x-tweet-scraper) | Select the matching `mode` |
| Followers, following, lists, communities, or overlap | [Xquik X Follower Scraper](https://apify.com/xquik/x-follower-scraper) | Select the matching `relation` |

Actor identifiers:

- Tweet Scraper: `xquik/x-tweet-scraper`
- Follower Scraper: `xquik/x-follower-scraper`

Before a run:

1. Use the current Apify discovery tools to fetch each selected input schema.
2. Stop unless every selected schema loads successfully.
3. Confirm every proposed field exists in the selected Actor schema.
4. Review current pricing on the Actor listing.
5. Present targets, routes, and result limits for user approval.

Do not hardcode pricing.
Treat each Actor listing as authoritative.

### Tweet Scraper routes

Use `search` for queries and `profileTweets` for profile timelines.
Direct modes include `tweet`, `tweets`, `article`, `replies`, `quotes`, `thread`,
`retweeters`, `favoriters`, and `listTweets`.

Tweet search uses the run-wide `maxItems` field.
It does not provide a separate quota per search term.
For other explicit multi-target routes, use `maxItemsPerTarget` only when the
live schema permits it.

Example:

```json
{
  "mode": "search",
  "searchTerms": ["\"AI agents\" since:2026-07-01"],
  "maxItems": 50,
  "outputVariant": "rich",
  "fieldStyle": "camelCase",
  "outputPreset": "nested",
  "includeSearchTerms": true
}
```

### Follower Scraper relations

Supported relations include `followers`, `following`, `verified_followers`,
`list_members`, `list_followers`, and `community_members`.

Use `maxItemsPerTarget` to balance follower-relation targets.
Keep `includeTargetMetadata: true` for multi-target analysis.
Use `overlapMode: true` when the task needs shared audiences.

Example:

```json
{
  "twitterHandles": ["public_brand_a", "public_brand_b"],
  "relation": "followers",
  "maxItems": 200,
  "maxItemsPerTarget": 100,
  "outputMode": "compact",
  "includeTargetMetadata": true,
  "overlapMode": true
}
```

### Data handling

Only send user-approved public identifiers, URLs, and search terms to Apify.
Tell the user that Apify receives those inputs and returns public X data.

Separate data rows from diagnostic rows before analysis.
Preserve stable post or user IDs, source targets, relations, and canonical URLs.
Report filtered, duplicate, unavailable, and partial results separately.

Never bypass private profiles, access controls, or platform restrictions.
Never retry a billable partial run without renewed approval.
A follow does not prove endorsement or intent.

## Available operations

- **Run Actor** -- Execute any Apify Actor with custom input parameters
- **Web Scraping** -- Extract structured data from any website
- **Social Media Scraping** -- Scrape profiles, posts, and engagement data from Instagram, YouTube, Twitter/X, TikTok
- **Search Scraping** -- Run Google, Bing, or other search engine queries and collect results
- **Data Export** -- Retrieve scraped datasets in JSON format

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
