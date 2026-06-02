"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/UI";
import { leaveApi } from "@/lib/api";
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

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:  { color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.25)",  label: "Pending"  },
  APPROVED: { color: "#16a34a", bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.25)",  label: "Approved" },
  REJECTED: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  label: "Rejected" },
};

const LEAVE_TYPES: Record<string, { color: string; bg: string }> = {
  CASUAL: { color: "#0891b2", bg: "rgba(8,145,178,0.08)"  },
  SICK:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  EARNED: { color: "#16a34a", bg: "rgba(22,163,74,0.08)"  },
};

export default function LeavePage() {
  const user = getUser();
  const [leaves, setLeaves]   = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");

  const load = () => {
    if (!user?.employeeId) return;
    Promise.all([
      leaveApi.getByEmployee(user.employeeId),
      leaveApi.getBalance(user.employeeId),
    ]).then(([l, b]) => {
      setLeaves(l.data.data || []);
      setBalance(b.data.data || {});
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate) { setErrorMsg("Please select from and to dates."); return; }
    if (form.fromDate > form.toDate)    { setErrorMsg("From date must be before to date."); return; }
    setSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      await leaveApi.apply(user.employeeId, form);
      setSuccessMsg("Leave application submitted successfully!");
      setShowForm(false);
      setForm({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
      load();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const balanceItems = [
    { type: "Casual",  key: "casual", remaining: balance.casual ?? "—", total: 12, color: "#0891b2" },
    { type: "Sick",    key: "sick",   remaining: balance.sick   ?? "—", total: 7,  color: "#8b5cf6" },
    { type: "Earned",  key: "earned", remaining: balance.earned ?? "—", total: 15, color: "#16a34a" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_EMPLOYEE" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Leave" subtitle="Apply and track your leave requests" />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Balance cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
            {balanceItems.map(b => (
              <div key={b.key} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px 22px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  {b.type} Leave
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "30px", fontWeight: "900", color: b.color }}>{b.remaining}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/ {b.total} days</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: "5px", borderRadius: "3px", background: "var(--bg)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "3px", background: b.color,
                    width: `${typeof b.remaining === "number" ? (b.remaining / b.total) * 100 : 0}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                  {typeof b.remaining === "number" ? b.total - b.remaining : 0} taken
                </div>
              </div>
            ))}
          </div>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-strong)" }}>
              Leave Applications
              {leaves.length > 0 && <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>({leaves.length})</span>}
            </div>
            <button
              onClick={() => { setShowForm(s => !s); setErrorMsg(""); }}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "none",
                background: showForm ? "var(--bg)" : "#4f46e5",
                color: showForm ? "var(--text-muted)" : "#fff",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
              }}
            >
              {showForm ? "Cancel" : "+ Apply Leave"}
            </button>
          </div>

          {/* Success message */}
          {successMsg && (
            <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", color: "#16a34a", fontSize: "13px", fontWeight: "500" }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Apply form */}
          {showForm && (
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "18px" }}>New Leave Application</div>
              <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="form-label">Leave Type</label>
                    <select className="form-input" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
                      <option value="CASUAL">Casual</option>
                      <option value="SICK">Sick</option>
                      <option value="EARNED">Earned</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">From Date</label>
                    <input type="date" className="form-input" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label">To Date</label>
                    <input type="date" className="form-input" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Reason</label>
                  <textarea className="form-input" rows={3} placeholder="Briefly describe the reason for leave..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ resize: "vertical" }} />
                </div>
                {errorMsg && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: "13px" }}>{errorMsg}</div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: "130px" }}>
                    {submitting ? "Submitting…" : "Submit Application"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Leave list */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>Loading…</div>
          ) : leaves.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏖️</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-strong)", marginBottom: "4px" }}>No applications yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click "Apply Leave" to submit your first request.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaves.map((l: any) => {
                const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.PENDING;
                const tc = LEAVE_TYPES[l.leaveType] || LEAVE_TYPES.CASUAL;
                const from = new Date(l.fromDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                const to   = new Date(l.toDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                const days = Math.ceil((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / 86400000) + 1;
                return (
                  <div key={l.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: tc.color, background: tc.bg }}>
                          {l.leaveType}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-strong)" }}>
                            {from} → {to}
                            <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "400" }}>({days} day{days !== 1 ? "s" : ""})</span>
                          </div>
                          {l.reason && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{l.reason}</div>}
                          {l.status === "REJECTED" && l.rejectionReason && (
                            <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "3px" }}>Reason: {l.rejectionReason}</div>
                          )}
                        </div>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, whiteSpace: "nowrap" }}>
                        {sc.label}
                      </span>
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
