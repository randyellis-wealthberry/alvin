import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALVIN - Vitality Monitor",
    short_name: "ALVIN",
    description: "AI-powered vitality monitoring for peace of mind",
    start_url: "/",
    display: "standalone",
    background_color: "#15162c",
    theme_color: "#2e026d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
