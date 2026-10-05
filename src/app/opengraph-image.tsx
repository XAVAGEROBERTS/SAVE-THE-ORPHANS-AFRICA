import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Save the Orphans Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B3D2E 0%, #176B45 100%)",
          position: "relative",
          padding: "80px",
        }}
      >
        <img
          src={LOGO_URL}
          alt=""
          width={140}
          height={140}
          style={{
            borderRadius: "50%",
            marginBottom: "32px",
          }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Save the Orphans Africa
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#F4B942",
            textAlign: "center",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Every Child Deserves a Home
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#F4B942",
          }}
        />
      </div>
    ),
    { ...size }
  );
}