import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/http";
import { getRegisteredSources, normalizeDownloadOptions } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const episodeId = request.nextUrl.searchParams.get("episodeId")?.trim();
  const sourceId = request.nextUrl.searchParams.get("sourceId")?.trim();
  if (!episodeId) return NextResponse.json({ ok: false, error: "Missing episodeId." }, { status: 400 });
  const options = normalizeDownloadOptions(getRegisteredSources(episodeId));
  const selected = sourceId ? options.filter((item) => item.sourceId === sourceId) : options;
  return NextResponse.json({ ok: true, episodeId, count: selected.length, options: selected });
}
