import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/http";
import { getRegisteredSources } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const episodeId = request.nextUrl.searchParams.get("episodeId")?.trim();
  if (!episodeId) return NextResponse.json({ ok: false, error: "Missing episodeId." }, { status: 400 });
  // No source is fabricated: connect an authorized provider adapter or persistent registry.
  const sources = getRegisteredSources(episodeId).map(({ url, ...safe }) => ({ ...safe, hasPlaybackUrl: Boolean(url) }));
  return NextResponse.json({ ok: true, episodeId, count: sources.length, sources, note: sources.length ? undefined : "No provider adapter has registered sources for this episode. The registry is in-memory and empty after cold starts." });
}
