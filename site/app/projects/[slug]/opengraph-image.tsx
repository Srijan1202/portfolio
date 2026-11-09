import { ImageResponse } from "next/og";
import { getProject, projects } from "@/content/projects";

export const alt = "Project overview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug) ?? projects[0];
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
          background: `radial-gradient(70% 90% at 85% 10%, ${p.accent}55, #0a0f1c 70%)`,
          color: "#e8ecf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#a3adc2" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: p.accent }} />
          srijansri.tech · Srijan Srivastava
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: p.title.length > 30 ? 64 : 84, fontWeight: 700, lineHeight: 1.05 }}>{p.title}</div>
          <div style={{ fontSize: 30, color: "#a3adc2", lineHeight: 1.35, maxWidth: 980 }}>{p.oneLiner}</div>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {p.stats.slice(0, 3).map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: p.accent }}>{s.value}</div>
              <div style={{ fontSize: 20, color: "#8590a8", maxWidth: 320 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
