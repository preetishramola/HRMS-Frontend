"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, Spinner } from "@/components/UI";
import { employeeApi } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/dashboard/admin", icon: "📊" },
  { label: "Employees", href: "/dashboard/admin/employees", icon: "👥" },
  { label: "Payroll", href: "/dashboard/admin/payroll", icon: "💰" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchEmployees(); }, [page]);

  const fetchEmployees = async () => {
    setLoading(true);
    employeeApi.getAll(page, 10).then(res => {
      setEmployees(res.data.data?.content || []);
      setTotal(res.data.data?.totalElements || 0);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const deactivate = async (id: number) => {
    if (!confirm("Deactivate this employee?")) return;
    await employeeApi.deactivate(id).catch(console.error);
    fetchEmployees();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar navItems={NAV} role="ROLE_ADMIN" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Employee Management" subtitle={`${total} total employees`} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>All Employees</div>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{total} total</span>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <div className="spin" style={{ width: "24px", height: "24px", margin: "0 auto", border: "2px solid #f9731630", borderTopColor: "#ea580c", borderRadius: "50%" }} />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Employee", "Designation", "Department", "Salary", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "var(--muted)", fontWeight: "400" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp: any) => (
                      <tr key={emp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(249,115,22,0.15)", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                              {emp.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-strong)" }}>{emp.fullName}</div>
                              <div style={{ fontSize: "11px", color: "var(--muted)" }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text)" }}>{emp.designation || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text)" }}>{emp.departmentName || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text)" }}>₹{Number(emp.salary || 0).toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontSize: "10px", padding: "3px 8px", borderRadius: "5px",
                            background: emp.status === "ACTIVE" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                            color: emp.status === "ACTIVE" ? "#16a34a" : "#ef4444",
                          }}>{emp.status}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {emp.status === "ACTIVE" && (
                            <button onClick={() => deactivate(emp.id)} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer" }}>Deactivate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Showing {employees.length} of {total}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface2)", color: page === 0 ? "#334155" : "var(--text)", fontSize: "12px", cursor: page === 0 ? "not-allowed" : "pointer" }}>← Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 10 >= total}
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface2)", color: (page + 1) * 10 >= total ? "#334155" : "var(--text)", fontSize: "12px", cursor: (page + 1) * 10 >= total ? "not-allowed" : "pointer" }}>Next →</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
