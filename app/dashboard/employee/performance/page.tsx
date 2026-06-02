"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/UI";
import { performanceApi } from "@/lib/api";
import { getUser } from "@/lib/auth";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/employee",             icon: "🏠" },
  { label: "Attendance",  href: "/dashboard/employee/attendance",  icon: "📅" },
  { label: "Leave",       href: "/dashboard/employee/leave",       icon: "🏖️" },
  { label: "Payslips",    href: "/dashboard/employee/payslips",    icon: "💰" },
  { label: "Performance", href: "/dashboard/employee/performance", icon: "🎯" },
  { label: "Feedback",    href: "/dashboard/feedback",             icon: "💬" },
  { label: "Complaints",  href: "/dashboard/complaints",           icon: "🔒" },
];

const RATING_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: "Exceptional",          color: "#16a34a", bg: "rgba(22,163,74,0.08)"  },
  4: { label: "Exceeds Expectations", color: "#0891b2", bg: "rgba(8,145,178,0.08)"  },
  3: { label: "Meets Expectations",   color: "#4f46e5", bg: "rgba(79,70,229,0.08)"  },
  2: { label: "Needs Improvement",    color: "#ea580c", bg: "rgba(234,88,12,0.08)"  },
  1: { label: "Unsatisfactory",       color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
};

function getRc(rating: number) {
  return RATING_CONFIG[Math.round(rating)] || { label: `${rating}/5`, color: "#6b7280", bg: "rgba(107,114,128,0.08)" };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: "18px", color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const user = getUser();
  const [reviews, setReviews]   = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.employeeId) { setLoading(false); return; }
    performanceApi.getByEmployee(user.employeeId)
      .then(res => {
        const data = res.data.data || [];
        setReviews(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_EMPLOYEE" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Performance" subtitle="Your reviews and ratings" />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-muted)" }}>
              Loading…
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "8px" }}>No Reviews Yet</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Your performance reviews will appear here once your manager submits one.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

              {/* ── Left: review list ── */}
              <div style={{ width: "210px", flexShrink: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  Reviews ({reviews.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {reviews.map((r: any) => {
                    const rc = getRc(Number(r.rating));
                    const isSel = selected?.id === r.id;
                    return (
                      <button key={r.id} onClick={() => setSelected(r)} style={{
                        width: "100%", textAlign: "left", padding: "12px 14px",
                        borderRadius: "10px", border: "none", cursor: "pointer",
                        background: isSel ? "#fff" : "transparent",
                        outline: isSel ? "1.5px solid var(--border)" : "1.5px solid transparent",
                        boxShadow: isSel ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.12s",
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)" }}>
                          Q{r.quarter} {r.year}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "800", color: rc.color }}>{Number(r.rating).toFixed(1)}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>/5</span>
                          <span style={{
                            fontSize: "10px", fontWeight: "600", padding: "1px 7px", borderRadius: "8px", marginLeft: "2px",
                            color: r.status === "SUBMITTED" ? "#16a34a" : "#d97706",
                            background: r.status === "SUBMITTED" ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
                          }}>
                            {r.status === "SUBMITTED" ? "Final" : "Draft"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {reviews.length > 1 && (
                  <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Overall Avg</div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#f59e0b" }}>
                      {avgRating.toFixed(1)}<span style={{ fontSize: "12px", color: "#d97706" }}>/5</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: detail ── */}
              {selected && (
                <div style={{ flex: 1, maxWidth: "640px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  {(() => {
                    const rc = getRc(Number(selected.rating));
                    return (
                      <>
                        {/* Header */}
                        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px 28px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                            <div>
                              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                Performance Review
                              </div>
                              <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-strong)", letterSpacing: "-0.02em" }}>
                                Q{selected.quarter} {selected.year}
                              </div>
                              {selected.reviewer && (
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
                                  Reviewed by {selected.reviewer.firstName} {selected.reviewer.lastName}
                                </div>
                              )}
                            </div>
                            <span style={{
                              padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                              color: selected.status === "SUBMITTED" ? "#16a34a" : "#d97706",
                              background: selected.status === "SUBMITTED" ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
                              border: `1px solid ${selected.status === "SUBMITTED" ? "rgba(22,163,74,0.2)" : "rgba(217,119,6,0.2)"}`,
                            }}>
                              {selected.status === "SUBMITTED" ? "✓ Final" : "Draft"}
                            </span>
                          </div>

                          {/* Rating band */}
                          <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px 20px", borderRadius: "10px", background: rc.bg }}>
                            <div>
                              <div style={{ fontSize: "40px", fontWeight: "900", color: rc.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                                {Number(selected.rating).toFixed(1)}
                              </div>
                              <div style={{ fontSize: "11px", color: rc.color, opacity: 0.7, marginTop: "2px" }}>out of 5.0</div>
                            </div>
                            <div>
                              <Stars rating={Number(selected.rating)} />
                              <div style={{ fontSize: "14px", fontWeight: "700", color: rc.color, marginTop: "6px" }}>
                                {rc.label}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Goals */}
                        {selected.goals && (
                          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px 28px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Goals</div>
                            <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: "1.7", margin: 0 }}>{selected.goals}</p>
                          </div>
                        )}

                        {/* Achievements */}
                        {selected.achievements && (
                          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px 28px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Key Achievements</div>
                            <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: "1.7", margin: 0 }}>{selected.achievements}</p>
                          </div>
                        )}

                        {/* Comments */}
                        {selected.comments && (
                          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px 28px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Manager Comments</div>
                            <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>
                              "{selected.comments}"
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
