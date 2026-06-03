"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { leaveApi } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Loader, Calendar } from "lucide-react";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/hr",             icon: "📊" },
  { label: "Recruitment", href: "/dashboard/hr/recruitment", icon: "📋" },
  { label: "Leave",       href: "/dashboard/hr/leaves",      icon: "🏖️" },
  { label: "Feedback",   href: "/dashboard/feedback",           icon: "💬" },
  { label: "Complaints", href: "/dashboard/complaints",         icon: "🔒" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  APPROVED: { label: "Approved", color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  REJECTED: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const load = () => {
    leaveApi.getPending()
      .then(res => setLeaves(res.data.data || []))
      .catch(() => setLeaves([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handle = async (leaveId: number, approve: boolean) => {
    setActing(leaveId);
    try {
      if (approve) await leaveApi.approve(leaveId);
      else await leaveApi.reject(leaveId);
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: approve ? "APPROVED" : "REJECTED" } : l));
    } catch {}
    setActing(null);
  };

  const filtered = filter === "ALL" ? leaves : leaves.filter(l => l.status === filter);

  const counts = {
    ALL: leaves.length,
    PENDING: leaves.filter(l => l.status === "PENDING").length,
    APPROVED: leaves.filter(l => l.status === "APPROVED").length,
    REJECTED: leaves.filter(l => l.status === "REJECTED").length,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_HR" />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)", marginBottom: "6px" }}>Leave Requests</h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "24px" }}>Review and action employee leave applications</p>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {(["PENDING", "ALL", "APPROVED", "REJECTED"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 16px", borderRadius: "8px", border: filter === f ? "none" : "1px solid var(--border)", background: filter === f ? "#4f46e5" : "var(--surface)", color: filter === f ? "#fff" : "var(--text)", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              <span style={{ fontSize: "11px", fontWeight: "700", padding: "1px 6px", borderRadius: "10px", background: filter === f ? "rgba(255,255,255,0.2)" : "var(--border)", color: filter === f ? "#fff" : "var(--muted)" }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "10px", color: "var(--muted)" }}>
            <Loader size={18} /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Calendar size={36} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <p style={{ fontSize: "15px", color: "var(--muted)" }}>No {filter === "ALL" ? "" : filter.toLowerCase()} leave requests</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((leave: any) => {
              const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.PENDING;
              const days = leave.startDate && leave.endDate
                ? Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86400000) + 1
                : null;
              return (
                <div key={leave.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#4f46e518", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "#4f46e5", flexShrink: 0 }}>
                    {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)" }}>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: "20px" }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      <strong style={{ color: "var(--text)" }}>{leave.leaveType}</strong>
                      {" · "}{leave.startDate} → {leave.endDate}
                      {days && ` · ${days} day${days > 1 ? "s" : ""}`}
                    </div>
                    {leave.reason && (
                      <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px", fontStyle: "italic" }}>"{leave.reason}"</div>
                    )}
                  </div>
                  {leave.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button onClick={() => handle(leave.id, true)} disabled={acting === leave.id}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", opacity: acting === leave.id ? 0.6 : 1 }}>
                        {acting === leave.id ? <Loader size={12} /> : <CheckCircle size={12} />} Approve
                      </button>
                      <button onClick={() => handle(leave.id, false)} disabled={acting === leave.id}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "none", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                  {leave.status !== "PENDING" && (
                    <div style={{ flexShrink: 0 }}>
                      {leave.status === "APPROVED"
                        ? <CheckCircle size={20} color="#16a34a" />
                        : <XCircle size={20} color="#ef4444" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
