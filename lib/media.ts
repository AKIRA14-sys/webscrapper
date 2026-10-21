import type { MediaVariant, PlaybackSource } from "./types";

/**
 * Provider adapters should populate this registry only with media URLs they are
 * authorized to provide. This in-memory registry is empty on cold starts and is
 * not durable across Vercel serverless invocations. Replace with a persistent
 * database or a provider API for production.
 */
const registry = new Map<string, PlaybackSource[]>();

export function registerAuthorizedSources(episodeId: string, sources: PlaybackSource[]) {
  registry.set(episodeId, sources);
}

export function getRegisteredSources(episodeId: string): PlaybackSource[] {
  return registry.get(episodeId) || [];
}

export function parseHlsMasterPlaylist(text: string, playlistUrl: string): MediaVariant[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const variants: MediaVariant[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;
    const attrs = line.slice("#EXT-X-STREAM-INF:".length);
    const resolution = attrs.match(/RESOLUTION=(\d+)x(\d+)/i);
    const bandwidth = attrs.match(/(?:AVERAGE-BANDWIDTH|BANDWIDTH)=(\d+)/i);
    const nextUri = lines.slice(i + 1).find((candidate) => !candidate.startsWith("#"));
    if (!nextUri) continue;
    let url: string;
    try { url = new URL(nextUri, playlistUrl).toString(); } catch { continue; }
    const height = resolution ? Number(resolution[2]) : undefined;
    variants.push({
      id: `hls-${height || variants.length + 1}`,
      label: height ? `${height}p` : "Unknown quality",
      ...(height ? { height } : {}),
      ...(bandwidth ? { bandwidth: Number(bandwidth[1]) } : {}),
      url,
      format: "hls"
    });
  }
  return variants;
}

export async function inspectRegisteredHls(source: PlaybackSource): Promise<MediaVariant[]> {
  if (source.format !== "hls") return source.variants;
  const response = await fetch(source.url, {
    headers: { Accept: "application/vnd.apple.mpegurl,application/x-mpegURL,text/plain" },
    redirect: "manual",
    signal: AbortSignal.timeout(7000),
    cache: "no-store"
  });
  if (!response.ok || (response.status >= 300 && response.status < 400)) {
    throw new Error("Could not inspect playlist; it may be expired or redirects are blocked.");
  }
  const type = response.headers.get("content-type") || "";
  if (type.includes("text/html")) throw new Error("Playlist URL returned HTML, not an HLS playlist.");
  const text = (await response.text()).slice(0, 500000);
  if (!text.startsWith("#EXTM3U")) throw new Error("URL is not a valid HLS playlist.");
  return parseHlsMasterPlaylist(text, source.url);
}

export function normalizeDownloadOptions(sources: PlaybackSource[]) {
  return sources.filter((source) => source.downloadable && source.downloadUrl && source.downloadPermission)
    .map((source) => ({
      sourceId: source.id,
      provider: source.provider,
      format: source.format,
      url: source.downloadUrl,
      permission: source.downloadPermission,
      variants: source.variants.map((variant) => ({ label: variant.label, height: variant.height, format: variant.format }))
    }));
}
