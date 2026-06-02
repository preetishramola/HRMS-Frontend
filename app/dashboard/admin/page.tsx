"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, StatCard, Spinner } from "@/components/UI";
import { employeeApi, departmentApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const NAV = [
  { label: "Dashboard", href: "/dashboard/admin", icon: "📊" },
  { label: "Employees", href: "/dashboard/admin/employees", icon: "👥" },
  { label: "Payroll", href: "/dashboard/admin/payroll", icon: "💰" },
  { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
  { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
];

const TOOLTIP_STYLE = {
  background: "#fff", border: "1px solid #e4e7ef",
  borderRadius: "8px", color: "#111827", fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const DEPT_COLORS = ["#ea580c", "#7c3aed", "#0891b2", "#16a34a", "#f59e0b"];

const ATTENDANCE_DATA = [
  { day: "Mon", present: 44, absent: 4 },
  { day: "Tue", present: 47, absent: 2 },
  { day: "Wed", present: 42, absent: 6 },
  { day: "Thu", present: 46, absent: 3 },
  { day: "Fri", present: 40, absent: 9 },
];

const HIRING_DATA = [
  { month: "Jan", hires: 3 }, { month: "Feb", hires: 5 },
  { month: "Mar", hires: 2 }, { month: "Apr", hires: 7 },
  { month: "May", hires: 4 }, { month: "Jun", hires: 6 },
];

export default function AdminDashboard() {
  const user = getUser();
  const [stats, setStats] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ROLE_ADMIN") { logout(); return; }
    Promise.all([
      employeeApi.getDashboardStats(),
      employeeApi.getAll(0, 500),
      departmentApi.getAll(),
    ]).then(([s, e, d]) => {
      setStats(s.data.data || {});
      const empData = e.data.data;
      setEmployees(Array.isArray(empData) ? empData : (empData?.content || []));
      setDepartments(d.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner color="#ea580c" />;

  const deptData = departments.map((d: any, i: number) => ({
    name: d.name?.split(" ")[0] || `D${i + 1}`,
    value: employees.filter((e: any) => e.departmentId === d.id).length,
  })).filter(d => d.value > 0);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar navItems={NAV} role="ROLE_ADMIN" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Company Dashboard" subtitle={`Good ${new Date().getHours() < 12 ? "morning" : "evening"}, ${user?.name?.split(" ")[0]}`} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <StatCard label="Total Employees" value={stats.totalEmployees ?? "—"} icon="👥" color="#ea580c" delay={0} />
            <StatCard label="Active" value={stats.activeEmployees ?? "—"} icon="✅" color="#16a34a" sub="Active" delay={50} />
            <StatCard label="Departments" value={stats.totalDepartments ?? "—"} icon="🏗️" color="#7c3aed" delay={100} />
            <StatCard label="Open Positions" value={2} icon="📋" color="#0891b2" sub="Hiring" delay={150} />
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>

            {/* Attendance bar chart */}
            <div className="fade-up-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>Weekly Attendance</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>This week's overview</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ATTENDANCE_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="present" fill="#16a34a" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dept pie */}
            <div className="fade-up-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>By Department</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Headcount split</div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                    {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % 5]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                {deptData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: DEPT_COLORS[i] }} />
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-strong)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {/* Hiring trend */}
            <div className="fade-up-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>Hiring Trend</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>New hires per month</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={HIRING_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="hires" stroke="#ea580c" strokeWidth={2.5}
                    dot={{ fill: "#ea580c", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#ea580c" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent employees */}
            <div className="fade-up-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>Recent Employees</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Latest additions</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {employees.slice(0, 5).map((emp: any, i) => (
                  <div key={emp.id} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px", background: "var(--surface2)",
                    animationDelay: `${i * 50}ms`,
                  }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      background: "rgba(249,115,22,0.15)", color: "#ea580c",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: "700",
                    }}>{emp.firstName?.charAt(0)}</div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.fullName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.designation} · {emp.departmentName}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "10px", fontWeight: "600", padding: "2px 8px",
                      borderRadius: "6px", flexShrink: 0,
                      background: "rgba(34,197,94,0.1)", color: "#16a34a",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>Active</span>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                    No employees found
                  </p>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
