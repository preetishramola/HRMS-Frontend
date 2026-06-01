"use client";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import { Bell, Search } from "lucide-react";

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  ROLE_ADMIN:    { color: "#dc2626", bg: "rgba(220,38,38,0.08)",   label: "Admin" },
  ROLE_MANAGER:  { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", label: "Manager" },
  ROLE_HR:       { color: "#0891b2", bg: "rgba(8,145,178,0.08)",  label: "HR" },
  ROLE_EMPLOYEE: { color: "#16a34a", bg: "rgba(22,163,74,0.08)",  label: "Employee" },
};

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    setUser(getUser());
    const tick = () => setTime(
      new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const rc = ROLE_CONFIG[user?.role || ""] || { color: "#1a56db", bg: "rgba(26,86,219,0.08)", label: "User" };

  return (
    <header style={{
      height: "56px", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "#fff",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Left: breadcrumb-style title */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <h1 style={{
          fontSize: "15px", fontWeight: "600",
          color: "var(--text-strong)", letterSpacing: "-0.02em",
        }}>
          {title}
        </h1>
        {subtitle && (
          <>
            <span style={{ color: "var(--border2)", fontSize: "13px" }}>/</span>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>{subtitle}</span>
          </>
        )}
      </div>

      {/* Right: time + user chip */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>
          {time}
        </span>

        <div style={{ width: "1px", height: "16px", background: "var(--border)" }} />

        {/* User chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "4px 10px 4px 6px",
          borderRadius: "20px",
          background: rc.bg,
          border: `1px solid ${rc.color}22`,
        }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%",
            background: rc.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", fontWeight: "700", color: "#fff",
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: rc.color }}>
            {user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${delay}ms`,
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "18px 20px",
        boxShadow: "var(--shadow)",
        borderTop: `3px solid ${color}`,
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: `${color}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px",
        }}>
          {icon}
        </div>
        {sub && (
          <span style={{
            fontSize: "10px", fontWeight: "500", color: "var(--muted)",
            padding: "2px 7px", borderRadius: "4px",
            background: "var(--surface2)",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            {sub}
          </span>
        )}
      </div>

      <div style={{
        fontSize: "28px", fontWeight: "700", color: "var(--text-strong)",
        letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "5px",
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>

      <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", letterSpacing: "0.01em" }}>
        {label}
      </div>
    </div>
  );
}

export function Spinner({ color = "var(--brand)" }: { color?: string }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="spin" style={{
          width: "28px", height: "28px", margin: "0 auto 12px",
          border: `2px solid ${color}22`,
          borderTopColor: color, borderRadius: "50%",
        }} />
        <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>Loading…</p>
      </div>
    </div>
  );
}
