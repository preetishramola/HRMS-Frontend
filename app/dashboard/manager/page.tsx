"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, StatCard, Spinner } from "@/components/UI";
import { performanceApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/manager",             icon: "🏠" },
  { label: "Performance", href: "/dashboard/manager/performance", icon: "🎯" },
  { label: "Feedback",    href: "/dashboard/feedback",            icon: "💬" },
  { label: "Complaints",  href: "/dashboard/complaints",          icon: "🔒" },
];

export default function ManagerDashboard() {
  const user = getUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ROLE_MANAGER") { logout(); return; }
    performanceApi.getTeam()
      .then(r => setReviews(r.data.data || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner color="#7c3aed" />;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar navItems={NAV} role="ROLE_MANAGER" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Team Dashboard" subtitle={`Managing ${user?.name?.split(" ")[0]}'s team`} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            <StatCard label="Performance Reviews" value={reviews.length} icon="📝" color="#7c3aed" />
            <StatCard label="High Performers" value={reviews.filter((r: any) => r.rating >= 4).length} icon="⭐" color="#16a34a" delay={50} />
            <StatCard label="Needs Improvement" value={reviews.filter((r: any) => r.rating < 3).length} icon="⚠️" color="#f59e0b" delay={100} />
          </div>

          <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", paddingBottom: "4px", borderBottom: "1px solid var(--border)" }}>
            Team Performance Reviews
          </div>

          {(
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reviews.length === 0 ? (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "var(--muted)" }}>No performance reviews yet</p>
                </div>
              ) : reviews.map((r: any) => {
                const ratingColor = r.rating >= 4 ? "#16a34a" : r.rating >= 3 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={r.id} className="fade-up" style={{ padding: "16px 20px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(139,92,246,0.15)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>
                          {r.employee?.firstName?.charAt(0) || "E"}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Q{r.quarter} {r.year}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "800", color: ratingColor }}>{r.rating}</span>
                        <span style={{ fontSize: "14px", color: "var(--muted)" }}>/5</span>
                      </div>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "var(--border)", marginBottom: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "2px", background: ratingColor, width: `${(r.rating / 5) * 100}%` }} />
                    </div>
                    {r.comments && <p style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>"{r.comments}"</p>}
                    <div style={{ marginTop: "8px" }}>
                      <span style={{
                        fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                        background: r.status === "SUBMITTED" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                        color: r.status === "SUBMITTED" ? "#16a34a" : "#f59e0b",
                      }}>{r.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
