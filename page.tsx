const endpoints = [
  ["/api/health", "Service status"],
  ["/api/sources", "Configured metadata sources"],
  ["/api/anime/search?q=naruto", "Search anime metadata"],
  ["/api/anime/info?id=20", "AniList anime information"],
  ["/api/anime/relations?id=20", "Related anime"],
  ["/api/stream/sources?episodeId=YOUR_EPISODE_ID", "List sources registered by an authorized provider"],
  ["/api/stream/qualities?episodeId=YOUR_EPISODE_ID", "Inspect quality metadata from a registered HLS master playlist"],
  ["/api/stream/play?episodeId=YOUR_EPISODE_ID&sourceId=YOUR_SOURCE_ID", "Return a registered playback URL"],
  ["/api/download/options?episodeId=YOUR_EPISODE_ID", "List download options explicitly marked permitted by a provider"]
];

export default function Home() {
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 22px" }}>
    <p style={{ color: "#9b8cff", fontWeight: 700, letterSpacing: 2 }}>ANIZEN PROJECT</p>
    <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", marginBottom: 8 }}>Scraper API</h1>
    <p style={{ color: "#b8c0d9", lineHeight: 1.7 }}>Hybrid anime metadata and authorized media-source integration. Playback and download endpoints require a provider adapter that is authorized to supply the media URLs.</p>
    <h2 style={{ marginTop: 36 }}>Endpoints</h2>
    <div style={{ display: "grid", gap: 12 }}>{endpoints.map(([path, description]) => <div key={path} style={{ padding: 16, border: "1px solid #252c42", borderRadius: 12, background: "#101525" }}><code style={{ color: "#9b8cff", overflowWrap: "anywhere" }}>{path}</code><p style={{ color: "#b8c0d9", marginBottom: 0 }}>{description}</p></div>)}</div>
    <p style={{ color: "#8c96b5", marginTop: 32, fontSize: 14 }}>This project does not bypass DRM, paywalls, anti-bot controls, or download restrictions. Only use media sources you are authorized to access.</p>
  </main>;
}
