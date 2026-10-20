import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ANIZEN Scraper API",
  description: "Anime metadata and authorized media-source API."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#080b14", color: "#f4f6ff" }}>{children}</body></html>;
}
