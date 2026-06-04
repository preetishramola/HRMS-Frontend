"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, Spinner } from "@/components/UI";
import { complaintApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

const NAV_BY_ROLE: Record<string, { label: string; href: string; icon: string }[]> = {
  ROLE_ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "🏠" },
    { label: "Employees", href: "/dashboard/admin/employees", icon: "👥" },
    { label: "Departments", href: "/dashboard/admin/departments", icon: "🏢" },
    { label: "Payroll", href: "/dashboard/admin/payroll", icon: "💰" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "📊" },
    { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
    { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
  ],
  ROLE_MANAGER: [
    { label: "Dashboard", href: "/dashboard/manager", icon: "🏠" },
    { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
    { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
  ],
  ROLE_HR: [
    { label: "Dashboard", href: "/dashboard/hr", icon: "🏠" },
    { label: "Recruitment", href: "/dashboard/hr/recruitment", icon: "🎯" },
    { label: "Leaves", href: "/dashboard/hr/leaves", icon: "🌴" },
    { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
    { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
  ],
  ROLE_EMPLOYEE: [
    { label: "Dashboard", href: "/dashboard/employee", icon: "🏠" },
    { label: "Payslips", href: "/dashboard/employee/payslips", icon: "💰" },
    { label: "Performance", href: "/dashboard/employee/performance", icon: "⭐" },
    { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
    { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
  ],
};

const CATEGORIES = [
  { value: "HARASSMENT",       label: "Harassment",       icon: "🚨" },
  { value: "DISCRIMINATION",   label: "Discrimination",   icon: "⚖️" },
  { value: "MISCONDUCT",       label: "Misconduct",       icon: "⚠️" },
  { value: "POLICY_VIOLATION", label: "Policy Violation", icon: "📋" },
  { value: "WORK_ENVIRONMENT", label: "Work Environment", icon: "🏢" },
  { value: "SAFETY",           label: "Safety",           icon: "🦺" },
  { value: "OTHER",            label: "Other",            icon: "💬" },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:         { label: "Open",         color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  UNDER_REVIEW: { label: "Under Review", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  RESOLVED:     { label: "Resolved",     color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  DISMISSED:    { label: "Dismissed",    color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

export default function ComplaintsPage() {
  const user = getUser();
  const role = user?.role || "ROLE_EMPLOYEE";
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.ROLE_EMPLOYEE;
  const isHR = role === "ROLE_HR" || role === "ROLE_ADMIN";

  const [complaints, setComplaints] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [noteInput, setNoteInput] = useState("");
  const [updating, setUpdating] = useState(false);

  // Submit form state (employee view)
  const [form, setForm] = useState({ category: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ trackingId: number } | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user) { logout(); return; }
    if (isHR) {
      Promise.all([complaintApi.getAll(), complaintApi.getSummary()])
        .then(([c, s]) => {
          setComplaints(c.data.data || []);
          setSummary(s.data.data || {});
        }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { setFormError("Please select a category."); return; }
    if (form.description.trim().length < 20) { setFormError("Description must be at least 20 characters."); return; }
    setSubmitting(true); setFormError("");
    try {
      const res = await complaintApi.submit({ category: form.category, description: form.description });
      setSubmitted(res.data.data);
      setForm({ category: "", description: "" });
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      const updated = await complaintApi.updateStatus(id, { status, hrNotes: noteInput || undefined });
      setComplaints(prev => prev.map(c => c.id === id ? updated.data.data : c));
      setSelected(updated.data.data);
      setNoteInput("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = statusFilter === "ALL" ? complaints : complaints.filter(c => c.status === statusFilter);

  if (loading) return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar navItems={nav} role={role} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar navItems={nav} role={role} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar
          title={isHR ? "Complaint Portal" : "Anonymous Complaints"}
          subtitle={isHR ? "HR confidential inbox" : "Submit complaints safely and anonymously"}
        />
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* ============== EMPLOYEE VIEW — Submit form ============== */}
          {!isHR && (
            <div style={{ maxWidth: "620px" }}>
              {/* Anonymity notice */}
              <div style={{
                display: "flex", gap: "12px", alignItems: "flex-start",
                padding: "14px 16px", borderRadius: "10px", marginBottom: "28px",
                background: "rgba(26,86,219,0.05)", border: "1px solid rgba(26,86,219,0.15)",
              }}>
                <span style={{ fontSize: "20px" }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--brand)", marginBottom: "3px" }}>
                    100% Anonymous
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: "1.5" }}>
                    Your identity is never stored. We receive only the category and description —
                    nothing that could link this submission back to you. Only HR can read complaints.
                  </div>
                </div>
              </div>

              {/* Success state */}
              {submitted ? (
                <div style={{
                  background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "36px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "var(--text-strong)" }}>
                    Complaint Submitted
                  </h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                    Your complaint has been received and will be reviewed by HR.
                  </p>
                  <div style={{
                    display: "inline-block", padding: "8px 18px", borderRadius: "8px",
                    background: "var(--bg)", border: "1px solid var(--border)",
                    fontFamily: "monospace", fontSize: "14px", color: "var(--text-strong)",
                    marginBottom: "20px",
                  }}>
                    Tracking ID: <strong>#{submitted.trackingId}</strong>
                  </div>
                  <br />
                  <button
                    className="btn btn-outline"
                    onClick={() => setSubmitted(null)}
                  >
                    Submit Another Complaint
                  </button>
                </div>
              ) : (
                <div style={{
                  background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "28px",
                }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "var(--text-strong)" }}>
                    Submit a Complaint
                  </h2>
                  <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-muted)" }}>
                    Describe your concern clearly. Your complaint will only be visible to HR.
                  </p>

                  {formError && (
                    <div style={{
                      padding: "11px 14px", borderRadius: "8px", marginBottom: "16px",
                      background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)",
                      color: "#dc2626", fontSize: "14px",
                    }}>
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                      <label className="form-label">Category *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {CATEGORIES.map(cat => (
                          <label
                            key={cat.value}
                            style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                              border: form.category === cat.value
                                ? "1.5px solid var(--brand)"
                                : "1.5px solid var(--border)",
                              background: form.category === cat.value ? "var(--brand-light)" : "#fff",
                              transition: "all 0.15s",
                            }}
                          >
                            <input
                              type="radio" name="cat" value={cat.value}
                              checked={form.category === cat.value}
                              onChange={() => setForm(f => ({ ...f, category: cat.value }))}
                              style={{ display: "none" }}
                            />
                            <span>{cat.icon}</span>
                            <span style={{
                              fontSize: "13px", fontWeight: 600,
                              color: form.category === cat.value ? "var(--brand)" : "var(--text-body)",
                            }}>
                              {cat.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-input"
                        rows={6}
                        placeholder="Describe what happened, when it occurred, and who was involved (if relevant). The more detail you provide, the better HR can investigate."
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                        style={{ resize: "vertical", minHeight: "140px" }}
                      />
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {form.description.length}/5000 characters (minimum 20)
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                      style={{ alignSelf: "flex-start", minWidth: "160px" }}
                    >
                      {submitting ? "Submitting..." : "🔒 Submit Anonymously"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ============== HR / ADMIN VIEW — Complaint inbox ============== */}
          {isHR && (
            <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 140px)" }}>

              {/* Left: list */}
              <div style={{ width: "380px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Summary chips */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { key: "ALL", label: `All (${complaints.length})` },
                    { key: "OPEN", label: `Open (${summary.open || 0})` },
                    { key: "UNDER_REVIEW", label: `Reviewing (${summary.under_review || 0})` },
                    { key: "RESOLVED", label: `Resolved (${summary.resolved || 0})` },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key)}
                      style={{
                        padding: "5px 12px", borderRadius: "20px", border: "none", cursor: "pointer",
                        fontSize: "12px", fontWeight: 600,
                        background: statusFilter === f.key ? "var(--brand)" : "var(--bg)",
                        color: statusFilter === f.key ? "#fff" : "var(--text-muted)",
                        transition: "all 0.15s",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                      <div style={{ fontSize: "14px" }}>No complaints</div>
                    </div>
                  ) : filtered.map(c => {
                    const sm = STATUS_META[c.status] || STATUS_META.OPEN;
                    const catMeta = CATEGORIES.find(x => x.value === c.category);
                    return (
                      <div
                        key={c.id}
                        onClick={() => { setSelected(c); setNoteInput(""); }}
                        style={{
                          padding: "14px 16px", borderRadius: "10px", cursor: "pointer",
                          background: selected?.id === c.id ? "var(--brand-light)" : "#fff",
                          border: selected?.id === c.id ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-strong)" }}>
                            {catMeta?.icon} {catMeta?.label || c.category}
                          </span>
                          <span style={{
                            padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600,
                            color: sm.color, background: sm.bg,
                          }}>
                            {sm.label}
                          </span>
                        </div>
                        <p style={{
                          margin: 0, fontSize: "13px", color: "var(--text-muted)",
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {c.description}
                        </p>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                          #{c.id} · {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: detail panel */}
              <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {!selected ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>👈</div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>Select a complaint</div>
                    <div style={{ fontSize: "13px" }}>Click on any complaint to view details</div>
                  </div>
                ) : (() => {
                  const sm = STATUS_META[selected.status] || STATUS_META.OPEN;
                  const catMeta = CATEGORIES.find(x => x.value === selected.category);
                  return (
                    <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-strong)", marginBottom: "4px" }}>
                            {catMeta?.icon} {catMeta?.label || selected.category}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            Complaint #{selected.id} · Submitted {selected.submittedAt
                              ? new Date(selected.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                              : ""}
                          </div>
                        </div>
                        <span style={{
                          padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                          color: sm.color, background: sm.bg,
                        }}>
                          {sm.label}
                        </span>
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: "24px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                          Description
                        </div>
                        <p style={{
                          margin: 0, fontSize: "14px", lineHeight: "1.7", color: "var(--text-body)",
                          padding: "16px", background: "var(--bg)", borderRadius: "8px",
                          borderLeft: "3px solid var(--border)",
                        }}>
                          {selected.description}
                        </p>
                      </div>

                      {/* HR Notes */}
                      {selected.hrNotes && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                            HR Notes (Internal)
                          </div>
                          <p style={{
                            margin: 0, fontSize: "14px", lineHeight: "1.7", color: "var(--text-body)",
                            padding: "16px", background: "rgba(26,86,219,0.04)", borderRadius: "8px",
                            borderLeft: "3px solid var(--brand)",
                          }}>
                            {selected.hrNotes}
                          </p>
                        </div>
                      )}

                      {/* Status update */}
                      {selected.status !== "RESOLVED" && selected.status !== "DISMISSED" && (
                        <div style={{
                          padding: "20px", background: "var(--bg)", borderRadius: "10px",
                          border: "1px solid var(--border)",
                        }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--text-strong)" }}>
                            Update Status
                          </div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Add internal notes (optional, visible to HR only)..."
                            value={noteInput}
                            onChange={e => setNoteInput(e.target.value)}
                            style={{ marginBottom: "12px", resize: "vertical" }}
                          />
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {selected.status === "OPEN" && (
                              <button
                                className="btn btn-outline"
                                disabled={updating}
                                onClick={() => handleUpdateStatus(selected.id, "UNDER_REVIEW")}
                                style={{ fontSize: "13px" }}
                              >
                                🔍 Mark Under Review
                              </button>
                            )}
                            <button
                              className="btn btn-success"
                              disabled={updating}
                              onClick={() => handleUpdateStatus(selected.id, "RESOLVED")}
                              style={{ fontSize: "13px" }}
                            >
                              ✅ Mark Resolved
                            </button>
                            <button
                              disabled={updating}
                              onClick={() => handleUpdateStatus(selected.id, "DISMISSED")}
                              style={{
                                padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)",
                                background: "#fff", cursor: "pointer", fontSize: "13px",
                                color: "var(--text-muted)",
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}

                      {(selected.status === "RESOLVED" || selected.status === "DISMISSED") && selected.resolvedAt && (
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
                          {selected.status === "RESOLVED" ? "✅ Resolved" : "Dismissed"} on{" "}
                          {new Date(selected.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
