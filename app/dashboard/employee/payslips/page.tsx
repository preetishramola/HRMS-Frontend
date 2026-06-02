"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/UI";
import { payrollApi } from "@/lib/api";
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(val: any) {
  return Number(val || 0).toLocaleString("en-IN");
}

export default function PayslipsPage() {
  const user = getUser();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    payrollApi.getByEmployee(user.employeeId).then(res => {
      const data = res.data.data || [];
      setPayslips(data);
      if (data.length > 0) setSelected(data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_EMPLOYEE" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="My Payslips" subtitle="View your salary history" />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── Left: payslip list ── */}
          <div style={{
            width: "220px", flexShrink: 0,
            background: "#fff", border: "1px solid var(--border)",
            borderRadius: "14px", padding: "20px 16px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
              Payslip History
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: "18px", height: "18px", border: "2px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
              </div>
            ) : payslips.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No payslips yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {payslips.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px",
                      borderRadius: "10px", border: "none", cursor: "pointer",
                      background: selected?.id === p.id ? "rgba(22,163,74,0.08)" : "transparent",
                      outline: selected?.id === p.id ? "1.5px solid rgba(22,163,74,0.3)" : "1.5px solid transparent",
                      transition: "all 0.12s",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-strong)" }}>
                      {MONTHS[p.month - 1]} {p.year}
                    </div>
                    <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>
                      ₹{fmt(p.netPay)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: payslip detail ── */}
          {selected ? (
            <div style={{ flex: 1, maxWidth: "640px" }}>

              {/* Header card */}
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "24px 28px", marginBottom: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Payslip
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-strong)", letterSpacing: "-0.02em" }}>
                      {MONTH_FULL[selected.month - 1]} {selected.year}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {user?.name}
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 16px", borderRadius: "20px",
                    background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
                    fontSize: "12px", fontWeight: "700", color: "#16a34a",
                    textAlign: "center",
                  }}>
                    <div>{selected.presentDays}/{selected.workingDays}</div>
                    <div style={{ fontSize: "10px", fontWeight: "500", marginTop: "1px" }}>days present</div>
                  </div>
                </div>
              </div>

              {/* Earnings section */}
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "20px 28px", marginBottom: "12px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                  Earnings
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { label: "Basic Salary", value: selected.basicSalary },
                    { label: "HRA (40%)", value: selected.hra },
                    { label: "Allowances (20%)", value: selected.allowances },
                  ].map((item, i, arr) => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <span style={{ fontSize: "14px", color: "var(--text-body)" }}>{item.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-strong)" }}>
                        ₹{fmt(item.value)}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0 0",
                    borderTop: "1.5px solid var(--border)",
                    marginTop: "4px",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)" }}>Gross Earnings</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-strong)" }}>
                      ₹{fmt(Number(selected.basicSalary || 0) + Number(selected.hra || 0) + Number(selected.allowances || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions section */}
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "20px 28px", marginBottom: "12px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                  Deductions
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-body)" }}>PF + Tax</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ef4444" }}>
                    − ₹{fmt(selected.deductions)}
                  </span>
                </div>
              </div>

              {/* Net Pay */}
              <div style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "1.5px solid rgba(22,163,74,0.25)",
                borderRadius: "14px", padding: "24px 28px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                    Net Pay
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#15803d", letterSpacing: "-0.03em" }}>
                    ₹{fmt(selected.netPay)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px", opacity: 0.8 }}>
                    {MONTH_FULL[selected.month - 1]} {selected.year} salary
                  </div>
                </div>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: "rgba(22,163,74,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px",
                }}>
                  💰
                </div>
              </div>

            </div>
          ) : !loading && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "14px" }}>
              Select a payslip to view details
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
