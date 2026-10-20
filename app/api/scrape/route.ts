import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/http";
import { scrapePublicPage } from "@/lib/scraper";
import { getSource } from "@/lib/config";
export const runtime = "nodejs";
export const maxDuration = 15;
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const p = request.nextUrl.searchParams;
  const source = p.get("source") || "";
  const url = p.get("url") || undefined;
  const q = p.get("q") || undefined;
  if (!source || !getSource(source) || source === "anilist") return NextResponse.json({ ok: false, error: "Choose source=itachi, uniquestream, or xanime." }, { status: 400 });
  if (!!url === !!q) return NextResponse.json({ ok: false, error: "Provide exactly one of url or q." }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, result: await scrapePublicPage(source, url, q) });
  } catch (error) {
    return NextResponse.json({ ok: false, source, error: error instanceof Error ? error.message : "Scrape failed" }, { status: 502 });
  }
}
