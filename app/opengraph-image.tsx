import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "radial-gradient(circle at top left, #34d399, #0f172a)",
        color: "#f8fafc",
        fontFamily:
          'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 42,
          letterSpacing: 14,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        AI PRONUNCIATION
      </div>
      <div>
        <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 1 }}>
          Words
        </div>
        <div style={{ fontSize: 42, marginTop: 20, maxWidth: 800 }}>
          Hear every English word pronounced perfectly with neural Google Cloud
          Text-to-Speech.
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 12, fontSize: 28, alignItems: "center" }}
      >
        <div
          style={{
            height: 48,
            width: 48,
            borderRadius: 16,
            background: "rgba(15, 23, 42, 0.3)",
            display: "grid",
            placeItems: "center",
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          ?
        </div>
        <span>Instant Google Cloud Text-to-Speech playback</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
