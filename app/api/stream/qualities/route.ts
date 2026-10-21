import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/http";
import { getRegisteredSources, inspectRegisteredHls } from "@/lib/media";
export const runtime = "nodejs";
export const maxDuration = 10;
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const episodeId = request.nextUrl.searchParams.get("episodeId")?.trim();
  const sourceId = request.nextUrl.searchParams.get("sourceId")?.trim();
  if (!episodeId) return NextResponse.json({ ok: false, error: "Missing episodeId." }, { status: 400 });
  const sources = getRegisteredSources(episodeId);
  const source = sources.find((item) => item.id === sourceId) || (sourceId ? undefined : sources[0]);
  if (!source) return NextResponse.json({ ok: false, error: "No registered source found. Add an authorized provider adapter first." }, { status: 404 });
  try {
    const variants = await inspectRegisteredHls(source);
    return NextResponse.json({ ok: true, episodeId, sourceId: source.id, format: source.format, qualities: variants.map((v) => ({ id: v.id, label: v.label, height: v.height, bandwidth: v.bandwidth, format: v.format })) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Quality inspection failed" }, { status: 502 });
  }
}
