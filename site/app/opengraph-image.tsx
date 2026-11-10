import { ImageResponse } from "next/og";
import { projects } from "@/content/projects";
import { profile } from "@/content/site";

export const alt = "Srijan Srivastava: portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview for the home page (project pages have their own). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(70% 90% at 85% 10%, #ffb86b44, #0a0f1c 70%)",
          color: "#e8ecf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#a3adc2" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#ffb86b" }} />
          srijansri.tech
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>{profile.name}</div>
          <div style={{ fontSize: 32, color: "#a3adc2", lineHeight: 1.35, maxWidth: 980 }}>{profile.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          {projects.map((p) => (
            <div key={p.slug} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: p.accent }} />
              {p.shortTitle}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
