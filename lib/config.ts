export const SOURCES = [
  { id: "anilist", name: "AniList", baseUrl: "https://anilist.co", enabled: true, note: "Official GraphQL API for anime metadata and relations." },
  { id: "itachi", name: "Itachi.tv", baseUrl: "https://itachi.tv", enabled: true, note: "Generic public-page metadata only; verify crawling rules and compatibility." },
  { id: "uniquestream", name: "UniqueStream Anime", baseUrl: "https://anime.uniquestream.net", enabled: true, note: "Generic public-page metadata only; verify crawling rules and compatibility." },
  { id: "xanime", name: "XAnime", baseUrl: "https://xanime.me", enabled: true, note: "Generic public-page metadata only; verify crawling rules and compatibility." }
] as const;

export function getSource(sourceId: string) {
  return SOURCES.find((source) => source.id === sourceId);
}
