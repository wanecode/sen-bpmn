import { ImageResponse } from "next/og";

export const alt = "SenBPMN — Référentiel des processus hospitaliers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0 72px 60px",
          color: "#17212b",
          background: "#f6f7f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", margin: "0 -72px" }}>
          <div style={{ display: "flex", height: 8 }}><div style={{ flex: 1, background: "#158447" }} /><div style={{ flex: 1, background: "#d8af27" }} /><div style={{ flex: 1, background: "#c9423a" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "42px 72px", fontWeight: 700, fontSize: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, border: "2px solid #173b5e", borderRadius: 4, color: "#173b5e", fontSize: 22 }}>S</div>
            SenBPMN
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 980, fontSize: 66, lineHeight: 1.05, letterSpacing: "-2px", fontWeight: 600 }}>
            <div>Référentiel des processus</div>
            <div style={{ color: "#173b5e" }}>hospitaliers du Sénégal</div>
          </div>
          <div style={{ marginTop: 30, fontSize: 23, color: "#5f6b76" }}>
            24 processus hospitaliers · BPMN 2.0 · Open source · Sénégal
          </div>
        </div>
        <div style={{ display: "flex", border: "1px solid #d8dde3", background: "white" }}>
          {["Urgences", "Maternité", "Hospitalisation", "Pharmacie"].map((label, index) => (
            <div key={label} style={{ padding: "11px 18px", borderLeft: index ? "1px solid #d8dde3" : "none", fontSize: 16 }}>{label}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
