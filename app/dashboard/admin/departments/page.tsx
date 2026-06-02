"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { departmentApi, employeeApi } from "@/lib/api";
import { Building2, Users, Plus, X } from "lucide-react";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/admin",             icon: "📊" },
  { label: "Employees",   href: "/dashboard/admin/employees",   icon: "👥" },
  { label: "Departments", href: "/dashboard/admin/departments", icon: "🏗️" },
  { label: "Payroll",     href: "/dashboard/admin/payroll",     icon: "💰" },
  { label: "Analytics",   href: "/dashboard/admin/analytics",   icon: "📈" },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([departmentApi.getAll(), employeeApi.getAll(0, 500)])
      .then(([dRes, eRes]) => {
        setDepartments(dRes.data.data || []);
        const empData = eRes.data.data;
        setEmployees(Array.isArray(empData) ? empData : (empData?.content || []));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const headcount = (deptId: number) =>
    employees.filter((e: any) => e.departmentId === deptId).length;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await departmentApi.create({ name: newName.trim() });
      setNewName("");
      setShowModal(false);
      load();
    } catch {
      setError("Failed to create department. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_ADMIN" />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)", marginBottom: "4px" }}>Departments</h1>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>{departments.length} department{departments.length !== 1 ? "s" : ""} in total</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            <Plus size={16} /> Add Department
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--muted)" }}>Loading…</div>
        ) : departments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <Building2 size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: "15px" }}>No departments yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {departments.map((dept: any) => (
              <div key={dept.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={18} color="#4f46e5" />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)" }}>{dept.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>ID #{dept.id}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)" }}>
                  <Users size={13} />
                  <span>{headcount(dept.id)} employee{headcount(dept.id) !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text)", margin: 0 }}>New Department</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "4px" }}>
                  <X size={18} />
                </button>
              </div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Department Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Engineering, Marketing…"
                style={{ width: "100%", marginTop: "6px", marginBottom: "16px", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "14px", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }}
              />
              {error && <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px" }}>{error}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", background: "none", color: "var(--text)", fontSize: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving || !newName.trim()}
                  style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#4f46e5", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
