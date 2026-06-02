"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { employeeApi, departmentApi, payrollApi } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/admin",             icon: "📊" },
  { label: "Employees",   href: "/dashboard/admin/employees",   icon: "👥" },
  { label: "Departments", href: "/dashboard/admin/departments", icon: "🏗️" },
  { label: "Payroll",     href: "/dashboard/admin/payroll",     icon: "💰" },
  { label: "Analytics",   href: "/dashboard/admin/analytics",   icon: "📈" },
];

const COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#ea580c", "#f59e0b", "#7c3aed"];
const TOOLTIP_STYLE = {
  background: "#fff", border: "1px solid #e4e7ef",
  borderRadius: "8px", color: "#111827", fontSize: "12px",
};

export default function AnalyticsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([employeeApi.getAll(0, 500), departmentApi.getAll()])
      .then(([empRes, deptRes]) => {
        const empData = empRes.data.data;
        setEmployees(Array.isArray(empData) ? empData : (empData?.content || []));
        setDepartments(deptRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Department headcount
  const deptData = departments.map((d: any) => ({
    name: d.name,
    count: employees.filter((e: any) => e.departmentId === d.id).length,
  })).filter(d => d.count > 0);

  // Salary distribution buckets
  const salaryBuckets: Record<string, number> = {
    "< 40K": 0, "40–60K": 0, "60–80K": 0, "80–100K": 0, "100K+": 0,
  };
  employees.forEach((e: any) => {
    const s = Number(e.salary || 0);
    if (s < 40000) salaryBuckets["< 40K"]++;
    else if (s < 60000) salaryBuckets["40–60K"]++;
    else if (s < 80000) salaryBuckets["60–80K"]++;
    else if (s < 100000) salaryBuckets["80–100K"]++;
    else salaryBuckets["100K+"]++;
  });
  const salaryData = Object.entries(salaryBuckets).map(([range, count]) => ({ range, count }));

  // Designation breakdown
  const designationMap: Record<string, number> = {};
  employees.forEach((e: any) => {
    const d = e.designation || "Unspecified";
    designationMap[d] = (designationMap[d] || 0) + 1;
  });
  const designationData = Object.entries(designationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const totalPayroll = employees.reduce((s: number, e: any) => s + Number(e.salary || 0), 0);
  const avgSalary = employees.length ? totalPayroll / employees.length : 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_ADMIN" />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)", marginBottom: "6px" }}>Analytics</h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "28px" }}>Workforce insights at a glance</p>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--muted)" }}>Loading…</div>
        ) : (
          <>
            {/* KPI strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "Total Employees", value: employees.length, color: "#4f46e5" },
                { label: "Departments", value: departments.length, color: "#0891b2" },
                { label: "Total Monthly Payroll", value: `₹${(totalPayroll / 1000).toFixed(0)}K`, color: "#16a34a" },
                { label: "Avg. Salary", value: `₹${(avgSalary / 1000).toFixed(1)}K`, color: "#ea580c" },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px 24px" }}>
                  <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{kpi.label}</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Headcount by dept */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Headcount by Department</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Salary distribution */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Salary Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Designation pie */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Workforce by Designation</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <ResponsiveContainer width={260} height={220}>
                  <PieChart>
                    <Pie data={designationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                      {designationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {designationData.map((d, i) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--text)", flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--muted)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
