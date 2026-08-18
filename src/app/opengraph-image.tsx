import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Teasoo SET — Stakeholder Engagement Tracker by Teasoo Consulting";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f1e3d 0%, #1b3a6b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#2f5bd6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800 }}>S</div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Teasoo SET</div>
        </div>
        <div style={{ fontSize: 62, fontWeight: 800, marginTop: 40, lineHeight: 1.05, maxWidth: 980 }}>
          One source of truth for stakeholder relationships
        </div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#c9d7f2", maxWidth: 900 }}>
          Log engagements, track risk and commitments, give leadership a live view. By Teasoo Consulting.
        </div>
      </div>
    ),
    { ...size },
  );
}
