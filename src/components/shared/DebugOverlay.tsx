"use client";
import { useState } from "react";

interface DebugOverlayProps {
  lines: string[];
  page: string;
}

export function DebugOverlay({ lines, page }: DebugOverlayProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        style={{
          position: "fixed", top: 4, right: 4, zIndex: 99999,
          background: "#1a1a1a", color: "#0f0", border: "1px solid #0f0",
          borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "monospace",
        }}
      >
        DEBUG
      </button>
    );
  }
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: "rgba(0,0,0,0.94)", color: "#00ff88",
        padding: "8px 12px", fontFamily: "monospace", fontSize: "11px",
        zIndex: 99999, maxHeight: "50vh", overflowY: "auto", lineHeight: 1.6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#ffcc00", fontWeight: "bold" }}>🔍 DEBUG — {page}</span>
        <button onClick={() => setHidden(true)} style={{ background: "none", border: "none", color: "#aaa", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>
      {lines.length === 0 && <div style={{ color: "#888" }}>Sin logs aún…</div>}
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.startsWith("❌") ? "#ff6666" : l.startsWith("✅") ? "#66ff99" : "#00ff88" }}>
          {l}
        </div>
      ))}
    </div>
  );
}
