import type { AnimeItem } from "./types";

const ENDPOINT = "https://graphql.anilist.co";

async function queryAniList(query: string, variables: Record<string, unknown>) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`AniList returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0]?.message || "AniList query failed");
  return payload.data;
}

const FIELDS = `id title { romaji english native } description(asHtml: false) coverImage { large extraLarge } bannerImage episodes seasonYear format averageScore genres siteUrl`;

function mapMedia(media: any): AnimeItem {
  return {
    source: "anilist",
    id: media.id,
    title: media.title?.english || media.title?.romaji || media.title?.native || "Untitled",
    url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
    image: media.coverImage?.extraLarge || media.coverImage?.large || undefined,
    description: media.description || "",
    year: media.seasonYear || undefined,
    format: media.format || undefined,
    genres: media.genres || [],
    episodes: media.episodes ?? null,
    score: media.averageScore ?? null
  };
}

export async function searchAniList(search: string, limit = 10): Promise<AnimeItem[]> {
  const query = `query ($search: String, $perPage: Int) { Page(perPage: $perPage) { media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${FIELDS} } } }`;
  const data = await queryAniList(query, { search, perPage: Math.min(Math.max(limit, 1), 20) });
  return (data.Page.media || []).map(mapMedia);
}

export async function getAniListInfo(id: number): Promise<AnimeItem | null> {
  const data = await queryAniList(`query ($id: Int) { Media(id: $id, type: ANIME) { ${FIELDS} } }`, { id });
  return data.Media ? mapMedia(data.Media) : null;
}

export async function getAniListRelations(id: number) {
  const query = `query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english native } relations { edges { relationType node { id type format title { romaji english native } coverImage { large } siteUrl } } } } }`;
  const data = await queryAniList(query, { id });
  const media = data.Media;
  if (!media) return null;
  return {
    id: media.id,
    title: media.title?.english || media.title?.romaji || media.title?.native || "Untitled",
    relations: (media.relations?.edges || []).filter((edge: any) => edge.node?.type === "ANIME").map((edge: any) => ({
      relation: edge.relationType,
      id: edge.node.id,
      title: edge.node.title?.english || edge.node.title?.romaji || edge.node.title?.native || "Untitled",
      format: edge.node.format || null,
      image: edge.node.coverImage?.large || null,
      url: edge.node.siteUrl || `https://anilist.co/anime/${edge.node.id}`
    }))
  };
}
