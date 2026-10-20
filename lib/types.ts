export type AnimeItem = {
  source: string;
  id?: string | number;
  title: string;
  url?: string;
  image?: string;
  description?: string;
  year?: number;
  format?: string;
  genres?: string[];
  episodes?: number | null;
  score?: number | null;
};

export type MediaVariant = {
  id: string;
  label: string;
  height?: number;
  bandwidth?: number;
  url: string;
  format: "hls" | "mp4" | "unknown";
};

export type PlaybackSource = {
  id: string;
  provider: string;
  episodeId: string;
  url: string;
  format: "hls" | "mp4" | "unknown";
  subtitles: Array<{ language: string; label?: string; url: string }>;
  variants: MediaVariant[];
  downloadable: boolean;
  downloadUrl?: string;
  downloadPermission?: string;
};
