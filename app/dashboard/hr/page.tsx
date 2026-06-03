"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { employeeApi, departmentApi, leaveApi, recruitmentApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Users, Building2, Clock, CheckCircle, XCircle, AlertCircle,
  Briefcase, TrendingUp, UserCheck, Calendar, ChevronRight, Loader
} from "lucide-react";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/hr",             icon: "📊" },
  { label: "Recruitment", href: "/dashboard/hr/recruitment", icon: "📋" },
  { label: "Leave",       href: "/dashboard/hr/leaves",      icon: "🏖️" },
  { label: "Feedback",   href: "/dashboard/feedback",           icon: "💬" },
  { label: "Complaints", href: "/dashboard/complaints",         icon: "🔒" },
];

const DEPT_COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#ea580c", "#f59e0b", "#7c3aed"];

function StatCard({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--text)", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function HROverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingLeave, setApprovingLeave] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const safe = (p: Promise<any>, fallback: any) => p.catch(() => ({ data: { data: fallback } }));
    Promise.all([
      safe(employeeApi.getAll(0, 500), { content: [] }),
      safe(departmentApi.getAll(), []),
      safe(leaveApi.getPending(), []),
      safe(recruitmentApi.getJobs(), []),
    ]).then(([empRes, deptRes, leaveRes, jobRes]) => {
      setEmployees(empRes.data.data?.content || []);
      setDepartments(deptRes.data.data || []);
      setPendingLeaves(leaveRes.data.data || []);
      setJobs(jobRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const u = getUser();
    if (!u || !["ROLE_HR", "ROLE_ADMIN"].includes(u.role)) {
      router.replace("/login");
      return;
    }
    setUser(u);
    load();
  }, []);

  const handleLeave = async (leaveId: number, approve: boolean) => {
    setApprovingLeave(leaveId);
    try {
      if (approve) await leaveApi.approve(leaveId);
      else await leaveApi.reject(leaveId);
      setPendingLeaves(prev => prev.filter(l => l.id !== leaveId));
    } catch {}
    setApprovingLeave(null);
  };

  const activeEmployees = employees.filter((e: any) => e.status !== "INACTIVE").length;
  const openJobs = jobs.filter((j: any) => j.status === "OPEN").length;
  const deptHeadcount = departments.map((d: any, i: number) => ({
    name: d.name,
    count: employees.filter((e: any) => e.departmentId === d.id).length,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));
  const maxCount = Math.max(...deptHeadcount.map(d => d.count), 1);
  const recentHires = [...employees]
    .filter((e: any) => e.joinDate)
    .sort((a: any, b: any) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_HR" />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)", marginBottom: "4px" }}>
            {greeting}, {user?.name?.split(" ")[0] || "HR"} 👋
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)" }}>Here's your HR overview for today</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "10px", color: "var(--muted)" }}>
            <Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        ) : (
          <>
            {/* KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
              <StatCard label="Total Employees" value={employees.length} sub={`${activeEmployees} active`} color="#4f46e5" icon={Users} />
              <StatCard label="Departments" value={departments.length} color="#0891b2" icon={Building2} />
              <StatCard label="Open Positions" value={openJobs} sub="actively hiring" color="#16a34a" icon={Briefcase} />
              <StatCard label="Pending Leaves" value={pendingLeaves.length} sub="awaiting approval" color={pendingLeaves.length > 0 ? "#ea580c" : "#6b7280"} icon={Clock} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

              {/* Pending Leave Approvals */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", margin: 0 }}>Pending Leave Requests</h3>
                  {pendingLeaves.length > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#ea580c", background: "rgba(234,88,12,0.1)", padding: "3px 8px", borderRadius: "20px" }}>
                      {pendingLeaves.length} pending
                    </span>
                  )}
                </div>

                {pendingLeaves.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
                    <CheckCircle size={28} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                    <p style={{ fontSize: "13px" }}>All caught up — no pending requests</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {pendingLeaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4f46e518", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px", fontWeight: "700", color: "#4f46e5" }}>
                          {leave.employee?.firstName?.[0] || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {leave.leaveType} · {leave.startDate} → {leave.endDate}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => handleLeave(leave.id, true)} disabled={approvingLeave === leave.id}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "none", background: "#16a34a", color: "#fff", fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                            {approvingLeave === leave.id ? <Loader size={10} /> : <CheckCircle size={10} />} Approve
                          </button>
                          <button onClick={() => handleLeave(leave.id, false)} disabled={approvingLeave === leave.id}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                            <XCircle size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingLeaves.length > 5 && (
                      <p style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center", margin: 0 }}>+{pendingLeaves.length - 5} more</p>
                    )}
                  </div>
                )}
              </div>

              {/* Headcount by Department */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Headcount by Department</h3>
                {deptHeadcount.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: "13px" }}>No departments found</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {deptHeadcount.map(d => (
                      <div key={d.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: "500" }}>{d.name}</span>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: d.color }}>{d.count}</span>
                        </div>
                        <div style={{ height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
                          <div style={{ width: `${(d.count / maxCount) * 100}%`, height: "100%", borderRadius: "3px", background: d.color, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Recent Hires */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Recent Hires</h3>
                {recentHires.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: "13px" }}>No recent hires</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {recentHires.map((emp: any) => (
                      <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#4f46e518", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#4f46e5", flexShrink: 0 }}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {emp.designation} · {emp.departmentName || "—"}
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", flexShrink: 0 }}>
                          {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Job Postings */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", margin: 0 }}>Active Job Postings</h3>
                  <a href="/dashboard/hr/recruitment" style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                    View all <ChevronRight size={12} />
                  </a>
                </div>
                {jobs.filter((j: any) => j.status === "OPEN").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: "13px" }}>No open positions</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {jobs.filter((j: any) => j.status === "OPEN").map((job: any) => (
                      <div key={job.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#4f46e518", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Briefcase size={14} color="#4f46e5" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{job.experienceYears}+ yrs · {job.department?.name || "General"}</div>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "3px 8px", borderRadius: "20px", flexShrink: 0 }}>OPEN</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
