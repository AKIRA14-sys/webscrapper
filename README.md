# ANIZEN Scraper API v1.1

Standalone Next.js API for anime metadata and authorized media-source integration.

## Included
- AniList GraphQL search, anime information, and relations.
- Generic public HTML metadata extraction for Itachi.tv, anime.uniquestream.net, and XAnime.
- Endpoints for registered playback sources, HLS quality metadata, playback URL selection, and provider-declared permitted downloads.
- Optional bearer token protection.

## Honest media integration status
**No third-party streaming provider is wired in by default.** The media registry in `lib/media.ts` is intentionally empty. Stream/download endpoints return no sources until you implement an adapter for a provider you are authorized to use. This prevents the API from inventing playable links.

The registry is in-memory and not durable across Vercel serverless instances. For production, connect a provider API or store metadata in a persistent database. Never store sensitive provider tokens in client-side code.

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy to Vercel
1. Push project contents to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default Next.js build settings.
4. Optionally configure `API_ACCESS_TOKEN` in Vercel project environment variables and redeploy.
5. If the token is set, send `Authorization: Bearer YOUR_TOKEN` for protected routes.

## Endpoints
```text
GET /api/health
GET /api/sources
GET /api/anime/search?q=naruto
GET /api/anime/search?q=naruto&source=itachi
GET /api/anime/info?id=20
GET /api/anime/relations?id=20
GET /api/scrape?source=itachi&url=https%3A%2F%2Fitachi.tv%2F
GET /api/stream/sources?episodeId=EPISODE_ID
GET /api/stream/qualities?episodeId=EPISODE_ID&sourceId=SOURCE_ID
GET /api/stream/play?episodeId=EPISODE_ID&sourceId=SOURCE_ID&qualityId=QUALITY_ID
GET /api/download/options?episodeId=EPISODE_ID
GET /api/download/info?episodeId=EPISODE_ID&sourceId=SOURCE_ID
```

## Resolution detection
`parseHlsMasterPlaylist` parses `#EXT-X-STREAM-INF` entries and reports the height/resolution declared in an HLS master playlist. The `qualities` endpoint inspects only a registered provider URL. It does not crawl arbitrary URLs supplied by clients.

## Download policy
Download options are returned only when a provider adapter explicitly marks a URL downloadable and includes a permission explanation. This project does not bypass DRM, paywalls, anti-bot controls, or source download restrictions.

## Extend providers
Implement an adapter in `lib/providers/` that:
1. Uses an official/authorized provider API or permitted documented interface.
2. Validates the provider's response schema.
3. Registers sources with `registerAuthorizedSources`.
4. Sets `downloadable: true`, `downloadUrl`, and `downloadPermission` only when downloads are explicitly permitted.
5. Uses persistent storage for production instead of the in-memory registry.
