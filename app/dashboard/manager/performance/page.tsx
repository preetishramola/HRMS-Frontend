"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, Spinner } from "@/components/UI";
import { employeeApi, performanceApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/manager",             icon: "🏠" },
  { label: "Performance", href: "/dashboard/manager/performance", icon: "🎯" },
  { label: "Feedback",    href: "/dashboard/feedback",            icon: "💬" },
  { label: "Complaints",  href: "/dashboard/complaints",          icon: "🔒" },
];

const QUARTER_OPTIONS = [
  { value: 1, label: "Q1 (Jan–Mar)" },
  { value: 2, label: "Q2 (Apr–Jun)" },
  { value: 3, label: "Q3 (Jul–Sep)" },
  { value: 4, label: "Q4 (Oct–Dec)" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear];

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  5: { label: "Exceptional",          color: "#16a34a" },
  4: { label: "Exceeds Expectations", color: "#0891b2" },
  3: { label: "Meets Expectations",   color: "#4f46e5" },
  2: { label: "Needs Improvement",    color: "#ea580c" },
  1: { label: "Unsatisfactory",       color: "#ef4444" },
};

function Stars({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onClick={() => onRate?.(i)}
          onMouseEnter={() => onRate && setHovered(i)}
          onMouseLeave={() => onRate && setHovered(0)}
          style={{
            fontSize: "24px", cursor: onRate ? "pointer" : "default",
            color: i <= (hovered || rating) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s",
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function ManagerPerformancePage() {
  const user = getUser();

  const [team, setTeam] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  // Review form state
  const [form, setForm] = useState({
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    year: currentYear,
    rating: 0,
    goals: "",
    achievements: "",
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"draft" | "submit">("draft");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ROLE_MANAGER") { logout(); return; }
    Promise.all([
      employeeApi.getMyTeam(),
      performanceApi.getTeam(),
    ]).then(([t, r]) => {
      const members = t.data.data?.content || t.data.data || [];
      setTeam(members);
      setReviews(r.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Existing review for selected employee + current form quarter/year
  const existingReview = selected
    ? reviews.find(r => r.employee?.id === selected.id && r.quarter === form.quarter && r.year === form.year)
    : null;

  const handleSelectEmployee = (emp: any) => {
    setSelected(emp);
    setSuccessMsg("");
    setErrorMsg("");
    // Pre-fill form if review already exists
    const existing = reviews.find(r => r.employee?.id === emp.id && r.quarter === form.quarter && r.year === form.year);
    if (existing) {
      setForm(f => ({
        ...f,
        rating: existing.rating || 0,
        goals: existing.goals || "",
        achievements: existing.achievements || "",
        comments: existing.comments || "",
      }));
    } else {
      setForm(f => ({ ...f, rating: 0, goals: "", achievements: "", comments: "" }));
    }
  };

  const handleSave = async (andSubmit: boolean) => {
    if (!selected) return;
    if (form.rating === 0) { setErrorMsg("Please select a rating (1–5 stars)."); return; }
    setSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const payload = {
        quarter: form.quarter,
        year: form.year,
        rating: form.rating,
        goals: form.goals,
        achievements: form.achievements,
        comments: form.comments,
      };

      let review: any;
      if (existingReview) {
        // Update not directly supported — skip re-creating; just submit if asked
        review = existingReview;
      } else {
        const res = await performanceApi.createReview(selected.id, payload);
        review = res.data.data;
        setReviews(prev => [...prev, review]);
      }

      if (andSubmit && review.status !== "SUBMITTED") {
        const subRes = await performanceApi.submit(review.id);
        const updated = subRes.data.data;
        setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
        setSuccessMsg(`Review for ${selected.firstName} submitted successfully!`);
      } else if (!andSubmit) {
        setSuccessMsg(`Review saved as draft for ${selected.firstName}.`);
      } else {
        setSuccessMsg(`Review already submitted for ${selected.firstName} this quarter.`);
      }
      // Refresh selected
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save review.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingConfig = RATING_LABELS[form.rating];

  if (loading) return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar navItems={NAV} role="ROLE_MANAGER" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Sidebar navItems={NAV} role="ROLE_MANAGER" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Team Performance" subtitle="Review and rate your direct reports" />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Left panel — team list */}
          <div style={{
            width: "280px", borderRight: "1px solid var(--border)",
            overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "8px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>
              Direct Reports ({team.length})
            </div>
            {team.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)", fontSize: "13px" }}>
                No direct reports assigned yet.
              </div>
            ) : team.map(emp => {
              const reviewed = reviews.some(r => r.employee?.id === emp.id);
              const isSelected = selected?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  style={{
                    padding: "12px 14px", borderRadius: "10px", cursor: "pointer",
                    border: isSelected ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                    background: isSelected ? "var(--brand-light)" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                      background: isSelected ? "var(--brand)" : "var(--brand-light)",
                      color: isSelected ? "#fff" : "var(--brand)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "700", fontSize: "13px",
                    }}>
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emp.designation}
                      </div>
                    </div>
                    {reviewed && (
                      <span title="Has review" style={{ fontSize: "14px" }}>✅</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel — review form or placeholder */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            {!selected ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "6px" }}>Select a team member</div>
                <div style={{ fontSize: "13px" }}>Pick someone from the left to write their performance review.</div>
              </div>
            ) : (
              <div style={{ maxWidth: "700px" }}>

                {/* Employee header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  marginBottom: "28px", padding: "18px 20px",
                  background: "#fff", border: "1px solid var(--border)", borderRadius: "12px",
                }}>
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "12px",
                    background: "var(--brand-light)", color: "var(--brand)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "800", fontSize: "18px",
                  }}>
                    {selected.firstName?.[0]}{selected.lastName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-strong)" }}>
                      {selected.firstName} {selected.lastName}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {selected.designation} · {selected.departmentName}
                    </div>
                  </div>
                  {existingReview && (
                    <div style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                      background: existingReview.status === "SUBMITTED" ? "rgba(22,163,74,0.1)" : "rgba(245,158,11,0.1)",
                      color: existingReview.status === "SUBMITTED" ? "#16a34a" : "#d97706",
                    }}>
                      {existingReview.status === "SUBMITTED" ? "✓ Submitted" : "Draft"}
                    </div>
                  )}
                </div>

                {/* Period selector */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Quarter</label>
                    <select className="form-input" value={form.quarter} onChange={e => {
                      const q = Number(e.target.value);
                      setForm(f => ({ ...f, quarter: q }));
                      const ex = reviews.find(r => r.employee?.id === selected.id && r.quarter === q && r.year === form.year);
                      if (ex) setForm(f => ({ ...f, quarter: q, rating: ex.rating || 0, goals: ex.goals || "", achievements: ex.achievements || "", comments: ex.comments || "" }));
                      else setForm(f => ({ ...f, quarter: q, rating: 0, goals: "", achievements: "", comments: "" }));
                    }}>
                      {QUARTER_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Year</label>
                    <select className="form-input" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {successMsg && (
                  <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "18px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", color: "#15803d", fontSize: "14px", fontWeight: 500 }}>
                    ✅ {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "18px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: "14px" }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "28px" }}>

                  {/* Rating */}
                  <div style={{ marginBottom: "28px" }}>
                    <label className="form-label">Overall Rating *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
                      <Stars rating={form.rating} onRate={r => setForm(f => ({ ...f, rating: r }))} />
                      {form.rating > 0 && ratingConfig && (
                        <span style={{
                          padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700",
                          color: ratingConfig.color, background: `${ratingConfig.color}18`,
                        }}>
                          {form.rating}/5 — {ratingConfig.label}
                        </span>
                      )}
                      {form.rating === 0 && (
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click a star to rate</span>
                      )}
                    </div>
                  </div>

                  {/* Goals */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Goals Set</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="What goals were set for this quarter? (e.g. Complete API refactor, onboard 2 new team members)"
                      value={form.goals}
                      onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Achievements */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Key Achievements</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="What did they achieve this quarter? Highlight wins and contributions."
                      value={form.achievements}
                      onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Comments */}
                  <div style={{ marginBottom: "28px" }}>
                    <label className="form-label">Manager Comments</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="Any additional feedback, areas for improvement, or next quarter focus areas..."
                      value={form.comments}
                      onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="btn btn-secondary"
                      disabled={submitting || existingReview?.status === "SUBMITTED"}
                      onClick={() => handleSave(false)}
                      style={{ minWidth: "130px" }}
                    >
                      {submitting ? "Saving..." : "💾 Save Draft"}
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={submitting || existingReview?.status === "SUBMITTED"}
                      onClick={() => handleSave(true)}
                      style={{ minWidth: "160px" }}
                    >
                      {submitting ? "Submitting..." : "✅ Submit Review"}
                    </button>
                  </div>
                  {existingReview?.status === "SUBMITTED" && (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                      This review has already been submitted and cannot be edited.
                    </p>
                  )}
                </div>

                {/* Historical reviews for this employee */}
                {reviews.filter(r => r.employee?.id === selected.id && r.id !== existingReview?.id).length > 0 && (
                  <div style={{ marginTop: "28px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "12px" }}>Past Reviews</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {reviews.filter(r => r.employee?.id === selected.id && r.id !== existingReview?.id).map(r => {
                        const rc = RATING_LABELS[r.rating] || { label: `${r.rating}/5`, color: "#64748b" };
                        return (
                          <div key={r.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-strong)" }}>Q{r.quarter} {r.year}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "22px", fontWeight: "800", color: rc.color }}>{r.rating}</span>
                                <span style={{ fontSize: "11px", color: rc.color, fontWeight: "600", padding: "2px 8px", borderRadius: "12px", background: `${rc.color}18` }}>{rc.label}</span>
                                <span style={{
                                  fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                                  background: r.status === "SUBMITTED" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                                  color: r.status === "SUBMITTED" ? "#16a34a" : "#f59e0b",
                                  fontWeight: "600",
                                }}>{r.status}</span>
                              </div>
                            </div>
                            {r.comments && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>"{r.comments}"</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
