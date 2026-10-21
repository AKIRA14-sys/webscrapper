import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/http";
import { getRegisteredSources } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const p = request.nextUrl.searchParams;
  const episodeId = p.get("episodeId")?.trim();
  const sourceId = p.get("sourceId")?.trim();
  const qualityId = p.get("qualityId")?.trim();
  if (!episodeId || !sourceId) return NextResponse.json({ ok: false, error: "Provide episodeId and sourceId." }, { status: 400 });
  const source = getRegisteredSources(episodeId).find((item) => item.id === sourceId);
  if (!source) return NextResponse.json({ ok: false, error: "Source is not registered. Configure an authorized provider adapter first." }, { status: 404 });
  const variant = qualityId ? source.variants.find((item) => item.id === qualityId) : undefined;
  if (qualityId && !variant) return NextResponse.json({ ok: false, error: "Requested quality was not found." }, { status: 404 });
  return NextResponse.json({ ok: true, episodeId, sourceId, provider: source.provider, format: variant?.format || source.format, playbackUrl: variant?.url || source.url, subtitles: source.subtitles, note: "URL is returned directly from the authorized provider; this API does not proxy or bypass access controls." });
}
