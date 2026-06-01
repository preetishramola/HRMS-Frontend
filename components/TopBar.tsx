"use client";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";

const ROLE_COLORS: Record<string, string> = {
  ROLE_ADMIN: "#f97316",
  ROLE_MANAGER: "#8b5cf6",
  ROLE_HR: "#06b6d4",
  ROLE_EMPLOYEE: "#22c55e",
};

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = getUser();
  const color = ROLE_COLORS[user?.role || ""] || "#64748b";
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        height: "60px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <h1 style={{ fontSize: "15px", fontWeight: "700", color: "var(--white)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{time}</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "8px",
            background: `${color}12`,
            border: `1px solid ${color}28`,
          }}
        >
          <div
            className="pulse-dot"
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }}
          />
          <span style={{ fontSize: "12px", fontWeight: "600", color }}>{user?.name?.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}
