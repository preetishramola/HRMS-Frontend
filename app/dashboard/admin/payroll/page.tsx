"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/UI";
import { payrollApi } from "@/lib/api";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/admin",             icon: "🏠" },
  { label: "Employees",   href: "/dashboard/admin/employees",   icon: "👥" },
  { label: "Departments", href: "/dashboard/admin/departments", icon: "🏗️" },
  { label: "Payroll",     href: "/dashboard/admin/payroll",     icon: "💰" },
  { label: "Analytics",   href: "/dashboard/admin/analytics",   icon: "📈" },
  { label: "Feedback",    href: "/dashboard/feedback",          icon: "💬" },
  { label: "Complaints",  href: "/dashboard/complaints",        icon: "🔒" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(v: any) { return Number(v || 0).toLocaleString("en-IN"); }

export default function PayrollPage() {
  const now = new Date();
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year, setYear]         = useState(now.getFullYear());
  const [generating, setGenerating] = useState(false);
  const [result, setResult]     = useState<any[]>([]);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  const generate = async () => {
    setGenerating(true); setSuccess(false); setError("");
    try {
      const res = await payrollApi.generate(month, year);
      setResult(res.data.data || []);
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Payroll generation failed. It may already exist for this month.");
    } finally { setGenerating(false); }
  };

  const totalNetPay = result.reduce((sum, p) => sum + Number(p.netPay || 0), 0);
  const totalBasic  = result.reduce((sum, p) => sum + Number(p.basicSalary || 0), 0);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_ADMIN" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Payroll Management" subtitle="Generate and manage payroll" />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ maxWidth: "760px" }}>

            {/* Generate form */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", marginBottom: "24px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "20px" }}>
                Generate Monthly Payroll
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label className="form-label">Month</label>
                  <select className="form-input" value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input
                    type="number" className="form-input"
                    value={year} onChange={e => setYear(Number(e.target.value))}
                    min={2020} max={2030}
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={generating}
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px", border: "none",
                  background: generating ? "#e5e7eb" : "#ea580c",
                  color: generating ? "#9ca3af" : "#fff",
                  fontSize: "14px", fontWeight: "700", cursor: generating ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.13s",
                }}
              >
                {generating ? (
                  <>
                    <div style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Generating…
                  </>
                ) : `Generate Payroll for ${MONTHS[month - 1]} ${year}`}
              </button>
            </div>

            {/* Results */}
            {success && result.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px" }}>

                {/* Success header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✅</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-strong)" }}>
                      Payroll Generated — {MONTHS[month - 1]} {year}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {result.length} employees processed
                    </div>
                  </div>
                </div>

                {/* Summary strip */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { label: "Employees",   value: result.length,           color: "#4f46e5", suffix: "" },
                    { label: "Total Basic", value: `₹${fmt(totalBasic)}`,   color: "#0891b2", suffix: "" },
                    { label: "Total Net Pay", value: `₹${fmt(totalNetPay)}`, color: "#16a34a", suffix: "" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "14px 16px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>{s.label}</div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Employee rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                  {result.map((p: any) => (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderRadius: "10px",
                      background: "var(--bg)", border: "1px solid var(--border)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                          background: "rgba(234,88,12,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: "700", color: "#ea580c",
                        }}>
                          {p.employee?.firstName?.[0]}{p.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-strong)" }}>
                            {p.employee?.fullName || `Employee ${p.employee?.id}`}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Basic ₹{fmt(p.basicSalary)} · HRA ₹{fmt(p.hra)} · Deductions −₹{fmt(p.deductions)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>₹{fmt(p.netPay)}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>Net Pay</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
