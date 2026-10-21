import { NextRequest, NextResponse } from "next/server";
import { getAniListInfo } from "@/lib/anilist";
import { checkAccess, parsePositiveInt } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const id = parsePositiveInt(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ ok: false, error: "Provide a positive AniList numeric id in ?id=." }, { status: 400 });
  try {
    const anime = await getAniListInfo(id);
    if (!anime) return NextResponse.json({ ok: false, error: "Anime not found." }, { status: 404 });
    return NextResponse.json({ ok: true, anime });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "AniList request failed" }, { status: 502 });
  }
}
