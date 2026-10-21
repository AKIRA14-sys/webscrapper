import * as cheerio from "cheerio";
import { getSource } from "./config";

const USER_AGENT = process.env.SCRAPER_USER_AGENT || "ANIZEN-Scraper/1.1 (metadata-only)";
const MAX_BYTES = 1_500_000;

function absoluteUrl(value: string | undefined, base: URL): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return url.toString();
  } catch { return undefined; }
}
function clean(value: string | undefined) {
  const result = value?.replace(/\s+/g, " ").trim();
  return result ? result.slice(0, 2000) : undefined;
}
async function robotsAllows(base: URL, path: string): Promise<boolean> {
  try {
    const response = await fetch(new URL("/robots.txt", base.origin), {
      headers: { "User-Agent": USER_AGENT }, redirect: "manual",
      signal: AbortSignal.timeout(5000), cache: "no-store"
    });
    if (!response.ok || (response.status >= 300 && response.status < 400)) return false;
    const text = (await response.text()).slice(0, 100000);
    let active = false;
    const disallow: string[] = [];
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.split("#")[0].trim();
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();
      if (key === "user-agent") active = val === "*";
      else if (active && key === "disallow" && val && path.startsWith(val)) disallow.push(val);
    }
    return disallow.length === 0;
  } catch { return false; }
}

export async function scrapePublicPage(sourceId: string, rawUrl?: string, query?: string) {
  const source = getSource(sourceId);
  if (!source || source.id === "anilist") throw new Error("Unknown HTML source.");
  const base = new URL(source.baseUrl);
  const target = rawUrl ? new URL(rawUrl) : new URL("/", base);
  if (query && !rawUrl) target.searchParams.set("s", query.trim());
  if (target.protocol !== "https:" || target.hostname !== base.hostname || target.username || target.password) {
    throw new Error("Only HTTPS URLs on the configured source's exact hostname are allowed.");
  }
  if (!(await robotsAllows(base, target.pathname))) {
    throw new Error("Crawl permission could not be verified through robots.txt; request not made.");
  }
  const response = await fetch(target, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml;q=0.9" },
    redirect: "manual", signal: AbortSignal.timeout(9000), cache: "no-store"
  });
  if (response.status >= 300 && response.status < 400) throw new Error("Redirect blocked; redirects are disabled for source safety.");
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) throw new Error("Source did not return HTML.");
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) throw new Error("Page exceeds size limit.");
  const html = await response.text();
  if (Buffer.byteLength(html) > MAX_BYTES) throw new Error("Page exceeds size limit.");
  const $ = cheerio.load(html);
  const title = clean($('meta[property="og:title"]').attr("content") || $("h1").first().text() || $("title").first().text()) || source.name;
  const description = clean($('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content"));
  const image = absoluteUrl($('meta[property="og:image"]').attr("content"), target);
  const links: Array<{ title: string; url: string; image?: string }> = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    if (links.length >= 30) return false;
    const label = clean($(el).attr("title") || $(el).text());
    const url = absoluteUrl($(el).attr("href"), target);
    if (!label || label.length < 2 || !url) return;
    if (new URL(url).hostname !== base.hostname || seen.has(url)) return;
    seen.add(url);
    const thumb = absoluteUrl($(el).find("img").first().attr("data-src") || $(el).find("img").first().attr("src"), target);
    links.push({ title: label.slice(0, 180), url, ...(thumb ? { image: thumb } : {}) });
  });
  return { source: sourceId, url: target.toString(), title, ...(description ? { description } : {}), ...(image ? { image } : {}), links, note: "Generic HTML metadata only; site-specific markup may require an authorized adapter." };
}
