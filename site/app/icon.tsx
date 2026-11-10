import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Browser-tab icon: initials in the desk-lamp colour. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f1c",
          borderRadius: 14,
          color: "#ffb86b",
          fontSize: 34,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -2,
        }}
      >
        SS
      </div>
    ),
    size,
  );
}
