"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, Spinner } from "@/components/UI";
import { feedbackApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

// Nav is role-dependent — imported dynamically per-role in real apps;
// here we build it inline since all roles share this page
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

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  RECOGNITION:   { label: "Recognition",   color: "#16a34a", bg: "rgba(22,163,74,0.08)",   icon: "🏆" },
  IMPROVEMENT:   { label: "Improvement",   color: "#d97706", bg: "rgba(217,119,6,0.08)",   icon: "📈" },
  COLLABORATION: { label: "Collaboration", color: "#1a56db", bg: "rgba(26,86,219,0.08)",   icon: "🤝" },
  GENERAL:       { label: "General",       color: "#6b7280", bg: "rgba(107,114,128,0.08)", icon: "💬" },
};

export default function FeedbackPage() {
  const user = getUser();
  const role = user?.role || "ROLE_EMPLOYEE";
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.ROLE_EMPLOYEE;

  const [tab, setTab] = useState<"inbox" | "sent" | "give">("inbox");
  const [received, setReceived] = useState<any[]>([]);
  const [given, setGiven] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Give feedback form state
  const [form, setForm] = useState({ toEmployeeId: "", category: "RECOGNITION", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { logout(); return; }
    Promise.all([
      feedbackApi.getReceived(),
      feedbackApi.getGiven(),
      feedbackApi.getDirectory(),
    ]).then(([r, g, e]) => {
      setReceived(r.data.data || []);
      setGiven(g.data.data || []);
      // Filter out self from the "give feedback to" list
      const all = e.data.data?.content || e.data.data || [];
      setEmployees(all.filter((emp: any) => emp.id !== user.employeeId));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toEmployeeId) { setError("Please select a recipient."); return; }
    if (form.content.trim().length < 10) { setError("Feedback must be at least 10 characters."); return; }
    setSubmitting(true); setError("");
    try {
      await feedbackApi.give({ toEmployeeId: Number(form.toEmployeeId), category: form.category, content: form.content });
      setSuccess(true);
      setForm({ toEmployeeId: "", category: "RECOGNITION", content: "" });
      // Refresh given list
      const g = await feedbackApi.getGiven();
      setGiven(g.data.data || []);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const FeedbackCard = ({ fb, mode }: { fb: any; mode: "received" | "sent" }) => {
    const cat = CATEGORY_META[fb.category] || CATEGORY_META.GENERAL;
    const person = mode === "received" ? fb.fromEmployee : fb.toEmployee;
    const personLabel = mode === "received" ? "From" : "To";
    return (
      <div style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: "10px",
        padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar */}
            <div style={{
              width: "38px", height: "38px", borderRadius: "9px", flexShrink: 0,
              background: "var(--brand-light)", color: "var(--brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "14px",
            }}>
              {person ? `${person.firstName?.[0]}${person.lastName?.[0]}` : "?"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-strong)" }}>
                {personLabel}: {person ? `${person.firstName} ${person.lastName}` : "Unknown"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {person?.designation} · {person?.department?.name}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
              color: cat.color, background: cat.bg,
            }}>
              {cat.icon} {cat.label}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
            </span>
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: "14px", color: "var(--text-body)", lineHeight: "1.6",
          padding: "12px 14px", background: "var(--bg)", borderRadius: "7px",
          borderLeft: `3px solid ${cat.color}`,
        }}>
          {fb.content}
        </p>
      </div>
    );
  };

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
        <TopBar title="Feedback" subtitle="Give & receive peer feedback" />
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
            {[
              { key: "inbox", label: `Inbox (${received.length})` },
              { key: "sent", label: `Sent (${given.length})` },
              { key: "give", label: "✏️ Give Feedback" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                style={{
                  padding: "10px 18px", border: "none", cursor: "pointer",
                  background: "transparent", fontSize: "14px", fontWeight: tab === t.key ? 600 : 400,
                  color: tab === t.key ? "var(--brand)" : "var(--text-muted)",
                  borderBottom: tab === t.key ? "2px solid var(--brand)" : "2px solid transparent",
                  marginBottom: "-1px", borderRadius: 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* INBOX */}
          {tab === "inbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "760px" }}>
              {received.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>No feedback yet</div>
                  <div style={{ fontSize: "13px" }}>When colleagues send you feedback, it will appear here.</div>
                </div>
              ) : received.map(fb => <FeedbackCard key={fb.id} fb={fb} mode="received" />)}
            </div>
          )}

          {/* SENT */}
          {tab === "sent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "760px" }}>
              {given.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>📤</div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>No feedback sent yet</div>
                  <div style={{ fontSize: "13px" }}>Use the "Give Feedback" tab to send your first one.</div>
                </div>
              ) : given.map(fb => <FeedbackCard key={fb.id} fb={fb} mode="sent" />)}
            </div>
          )}

          {/* GIVE FEEDBACK FORM */}
          {tab === "give" && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "28px 28px",
              }}>
                <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "var(--text-strong)" }}>
                  Send Feedback
                </h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-muted)" }}>
                  Feedback is private — only the recipient can see it.
                </p>

                {success && (
                  <div style={{
                    padding: "12px 16px", borderRadius: "8px", marginBottom: "18px",
                    background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)",
                    color: "#15803d", fontSize: "14px", fontWeight: 500,
                  }}>
                    ✅ Feedback sent successfully!
                  </div>
                )}
                {error && (
                  <div style={{
                    padding: "12px 16px", borderRadius: "8px", marginBottom: "18px",
                    background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)",
                    color: "#dc2626", fontSize: "14px",
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {/* Recipient */}
                  <div>
                    <label className="form-label">Recipient *</label>
                    <select
                      className="form-input"
                      value={form.toEmployeeId}
                      onChange={e => setForm(f => ({ ...f, toEmployeeId: e.target.value }))}
                      required
                    >
                      <option value="">Select a person...</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} — {emp.designation} ({emp.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="form-label">Category *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <label
                          key={key}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                            border: form.category === key
                              ? `1.5px solid ${meta.color}`
                              : "1.5px solid var(--border)",
                            background: form.category === key ? meta.bg : "#fff",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="radio" name="category" value={key} checked={form.category === key}
                            onChange={() => setForm(f => ({ ...f, category: key }))}
                            style={{ display: "none" }}
                          />
                          <span>{meta.icon}</span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: form.category === key ? meta.color : "var(--text-body)" }}>
                            {meta.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="form-label">Feedback *</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="Write your feedback here. Be specific and constructive..."
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      required
                      style={{ resize: "vertical", minHeight: "120px" }}
                    />
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {form.content.length}/2000 characters (minimum 10)
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ alignSelf: "flex-start", minWidth: "140px" }}
                  >
                    {submitting ? "Sending..." : "Send Feedback →"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
