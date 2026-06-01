"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { saveUser, getDashboardPath } from "@/lib/auth";
import { BarChart2, Users, Bot, User } from "lucide-react";

const DEMOS = [
  { role: "Admin",    email: "admin@hrms.com",    password: "admin@123",    color: "#e85d04", Icon: BarChart2, desc: "Full system access" },
  { role: "Manager",  email: "manager@hrms.com",  password: "manager@123",  color: "#7209b7", Icon: Users,     desc: "Team management" },
  { role: "HR",       email: "hr@hrms.com",       password: "hr@123",       color: "#0077b6", Icon: Bot,       desc: "AI-powered hiring" },
  { role: "Employee", email: "employee@hrms.com", password: "employee@123", color: "#2d9e5e", Icon: User,      desc: "Self-service portal" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [loadingRole, setLoadingRole] = useState("");
  const [error, setError]             = useState("");
  const [focused, setFocused]         = useState("");

  const doLogin = async (e: string, p: string, role = "") => {
    setLoading(true); setLoadingRole(role); setError("");
    try {
      const res = await authApi.login(e, p);
      saveUser(res.data.data);
      router.push(getDashboardPath(res.data.data.role));
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false); setLoadingRole("");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #bbb; }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
        background: "#f7f6f3",
      }}>

        {/* ── Main content ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}>

          {/* Brand */}
          <div style={{ marginBottom: "56px" }}>
            <div style={{
              display: "inline-block",
              background: "#1a1a2e",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: "4px",
              marginBottom: "18px",
            }}>
              HRMS
            </div>
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: "900",
              color: "#1a1a2e",
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              marginBottom: "10px",
            }}>
              Human Resource<br />Management System
            </h1>
            <p style={{ fontSize: "15px", color: "#888", fontWeight: "400" }}>
              Sign in to your workspace below.
            </p>
          </div>

          {/* Two-column form area */}
          <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>

            {/* Left — role cards */}
            <div style={{ flex: "0 0 auto", width: "280px" }}>
              <p style={{
                fontSize: "11px", fontWeight: "700", color: "#aaa",
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px",
              }}>
                Quick access
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {DEMOS.map(d => (
                  <button
                    key={d.role}
                    onClick={() => doLogin(d.email, d.password, d.role)}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "#fff",
                      borderTop: `1.5px solid ${loadingRole === d.role ? d.color : "#e8e8e8"}`,
                      borderRight: `1.5px solid ${loadingRole === d.role ? d.color : "#e8e8e8"}`,
                      borderBottom: `1.5px solid ${loadingRole === d.role ? d.color : "#e8e8e8"}`,
                      borderLeft: `4px solid ${d.color}`,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading && loadingRole !== d.role ? 0.45 : 1,
                      transition: "all 0.12s",
                      textAlign: "left",
                      boxShadow: loadingRole === d.role ? `0 4px 16px ${d.color}20` : "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.borderTopColor = d.color;
                        e.currentTarget.style.borderRightColor = d.color;
                        e.currentTarget.style.borderBottomColor = d.color;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${d.color}20`;
                        e.currentTarget.style.transform = "translateX(2px)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (loadingRole !== d.role) {
                        e.currentTarget.style.borderTopColor = "#e8e8e8";
                        e.currentTarget.style.borderRightColor = "#e8e8e8";
                        e.currentTarget.style.borderBottomColor = "#e8e8e8";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "8px",
                      background: `${d.color}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <d.Icon size={15} style={{ color: d.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e" }}>{d.role}</div>
                      <div style={{ fontSize: "11px", color: "#999", marginTop: "1px" }}>
                        {loadingRole === d.role ? "Signing in…" : d.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: "1px", background: "#e0e0e0", alignSelf: "stretch", flexShrink: 0, margin: "28px 0" }} />

            {/* Right — manual form */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: "11px", fontWeight: "700", color: "#aaa",
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px",
              }}>
                Sign in manually
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: `1.5px solid ${focused === "email" ? "#1a1a2e" : "#e0e0e0"}`,
                      fontSize: "14px",
                      fontFamily: "inherit",
                      color: "#1a1a2e",
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onFocus={() => setFocused("pass")}
                    onBlur={() => setFocused("")}
                    onKeyDown={e => e.key === "Enter" && doLogin(email, password)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: `1.5px solid ${focused === "pass" ? "#1a1a2e" : "#e0e0e0"}`,
                      fontSize: "14px",
                      fontFamily: "inherit",
                      color: "#1a1a2e",
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>

                {error && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "7px", fontSize: "13px",
                    background: "#fff5f5", border: "1.5px solid #fecaca", color: "#dc2626",
                  }}>{error}</div>
                )}

                <button
                  onClick={() => doLogin(email, password)}
                  disabled={loading || !email || !password}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: loading || !email || !password ? "#e8e8e8" : "#1a1a2e",
                    color: loading || !email || !password ? "#aaa" : "#fff",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: loading || !email || !password ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s",
                    letterSpacing: "0.01em",
                    marginTop: "4px",
                  }}
                  onMouseEnter={e => {
                    if (!loading && email && password)
                      e.currentTarget.style.background = "#2d2d4e";
                  }}
                  onMouseLeave={e => {
                    if (!loading && email && password)
                      e.currentTarget.style.background = "#1a1a2e";
                  }}
                >
                  {loading && loadingRole === "" ? (
                    <>
                      <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Signing in…
                    </>
                  ) : "Sign in"}
                </button>
              </div>
            </div>

          </div>

        </div>


      </div>
    </>
  );
}
