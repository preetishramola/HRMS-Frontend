"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, StatCard, Spinner } from "@/components/UI";
import { attendanceApi, leaveApi, payrollApi, chatbotApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

const NAV = [
  { label: "Dashboard", href: "/dashboard/employee", icon: "🏠" },
  { label: "Payslips", href: "/dashboard/employee/payslips", icon: "💰" },
  { label: "Feedback", href: "/dashboard/feedback", icon: "💬" },
  { label: "Complaints", href: "/dashboard/complaints", icon: "🔒" },
];

interface Msg { role: "user" | "bot"; text: string; }

export default function EmployeeDashboard() {
  const user = getUser();
  const [balance, setBalance] = useState<any>({});
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState<"attendance" | "leave" | "chat">("attendance");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 Ask me anything about your leaves, payslip, or attendance.` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [leaveForm, setLeaveForm] = useState({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveOk, setLeaveOk] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    if (!user || user.role !== "ROLE_EMPLOYEE") { logout(); return; }
    Promise.all([
      leaveApi.getBalance(user.employeeId),
      attendanceApi.getMonthly(user.employeeId, now.getMonth() + 1, now.getFullYear()),
      payrollApi.getByEmployee(user.employeeId),
    ]).then(([b, a, p]) => {
      setBalance(b.data.data || {});
      const att = a.data.data || [];
      setAttendance(att);
      setPayroll(p.data.data || []);
      const today = now.toISOString().split("T")[0];
      const todayAtt = att.find((x: any) => x.date === today);
      setCheckedIn(!!todayAtt?.checkIn && !todayAtt?.checkOut);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    await attendanceApi.checkIn(user!.employeeId).catch((e: any) => alert(e.response?.data?.message));
    setCheckedIn(true);
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    await attendanceApi.checkOut(user!.employeeId).catch((e: any) => alert(e.response?.data?.message));
    setCheckedIn(false);
    setActionLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput; setChatInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setChatLoading(true);
    const res = await chatbotApi.ask(q, chatSessionId || undefined).catch(() => null);
    const payload = res?.data?.data;
    const ans = payload?.message || res?.data?.message || "Sorry, I couldn't find that.";
    if (payload?.sessionId) setChatSessionId(payload.sessionId);
    setMsgs(p => [...p, { role: "bot", text: ans }]);
    setChatLoading(false);
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveLoading(true);
    await leaveApi.apply(user!.employeeId, leaveForm)
      .then(() => { setLeaveOk(true); setTimeout(() => setLeaveOk(false), 3000); setLeaveForm({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" }); })
      .catch((e: any) => alert(e.response?.data?.message));
    setLeaveLoading(false);
  };

  if (loading) return <Spinner color="#16a34a" />;

  const presentDays = attendance.filter((a: any) => a.status === "PRESENT").length;
  const TAB = (key: string, active: boolean) => ({
    padding: "8px 16px", borderRadius: "8px",
    border: `1px solid ${active ? "rgba(34,197,94,0.35)" : "var(--border)"}`,
    background: active ? "rgba(34,197,94,0.1)" : "transparent",
    color: active ? "#16a34a" : "var(--muted)", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar navItems={NAV} role="ROLE_EMPLOYEE" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="My Dashboard" subtitle={now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Check-in banner */}
          <div className="fade-up" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", borderRadius: "14px",
            background: checkedIn ? "rgba(34,197,94,0.08)" : "rgba(249,115,22,0.08)",
            border: `1px solid ${checkedIn ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.2)"}`,
          }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--white)", marginBottom: "4px" }}>
                {checkedIn ? "You're checked in" : "Ready to start your day?"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {checkedIn ? "Remember to check out before leaving" : "Don't forget to check in"}
              </div>
            </div>
            <button onClick={checkedIn ? handleCheckOut : handleCheckIn} disabled={actionLoading}
              style={{
                padding: "10px 24px", borderRadius: "10px", border: "none",
                background: checkedIn ? "#ef4444" : "#16a34a", color: "#fff",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                opacity: actionLoading ? 0.7 : 1,
              }}>
              {actionLoading && <div className="spin" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />}
              {checkedIn ? "Check Out" : "Check In"}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <StatCard label="Casual Leaves Left" value={balance.casual ?? "—"} icon="🌴" color="#16a34a" />
            <StatCard label="Sick Leaves Left" value={balance.sick ?? "—"} icon="🏥" color="#0891b2" delay={50} />
            <StatCard label="Days Present" value={presentDays} icon="✅" color="#f59e0b" sub={now.toLocaleString("default", { month: "short" })} delay={100} />
            <StatCard label="Latest Net Pay" value={payroll[0] ? `₹${Number(payroll[0].netPay).toLocaleString("en-IN")}` : "—"} icon="💰" color="#7c3aed" delay={150} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={TAB("attendance", tab === "attendance")} onClick={() => setTab("attendance")}>Attendance</button>
            <button style={TAB("leave", tab === "leave")} onClick={() => setTab("leave")}>Apply Leave</button>
            <button style={TAB("chat", tab === "chat")} onClick={() => setTab("chat")}>HR Chatbot</button>
          </div>

          {/* Attendance calendar */}
          {tab === "attendance" && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)", marginBottom: "16px" }}>
                Monthly Attendance — {now.toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "16px" }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", paddingBottom: "4px" }}>{d}</div>
                ))}
                {attendance.slice(0, 28).map((a: any, i) => {
                  const c = a.status === "PRESENT" ? "#16a34a" : a.status === "ABSENT" ? "#ef4444" : a.status === "HALF_DAY" ? "#f59e0b" : "var(--muted)";
                  return (
                    <div key={i} title={`${a.date} — ${a.status}`} style={{
                      aspectRatio: "1", borderRadius: "8px", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "11px", cursor: "help",
                      background: `${c}18`, color: c, border: `1px solid ${c}30`,
                    }}>
                      {new Date(a.date).getDate()}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                {[["#16a34a", "Present"], ["#ef4444", "Absent"], ["#f59e0b", "Half Day"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--muted)" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: c }} />{l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave form */}
          {tab === "leave" && (
            <div style={{ maxWidth: "480px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--white)", marginBottom: "20px" }}>Apply for Leave</div>
              {leaveOk && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#16a34a", fontSize: "13px" }}>
                  ✅ Leave request submitted!
                </div>
              )}
              <form onSubmit={submitLeave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Leave Type", el: <select value={leaveForm.leaveType} onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: "14px" }}>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="EARNED">Earned Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select> },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "8px" }}>{f.label}</label>
                    {f.el}
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {["fromDate", "toDate"].map((field, i) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "8px" }}>{i === 0 ? "From" : "To"}</label>
                      <input type="date" value={(leaveForm as any)[field]} onChange={e => setLeaveForm(p => ({ ...p, [field]: e.target.value }))} required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: "14px" }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "8px" }}>Reason (optional)</label>
                  <textarea value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} rows={3}
                    placeholder="Brief reason for leave..."
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: "14px", resize: "none" }} />
                </div>
                <button type="submit" disabled={leaveLoading} style={{
                  padding: "12px", borderRadius: "10px", border: "none",
                  background: "#16a34a", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}>
                  {leaveLoading ? "Submitting..." : "Submit Leave Request →"}
                </button>
              </form>
            </div>
          )}

          {/* Chatbot */}
          {tab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: "380px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💬</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--white)" }}>HR Assistant</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#16a34a" }}>
                    <div className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                    Online · Powered by Groq
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "75%", padding: "10px 14px", fontSize: "13px", lineHeight: "1.5",
                      background: m.role === "user" ? "#16a34a" : "var(--surface2)",
                      color: m.role === "user" ? "#fff" : "var(--text-strong)",
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: "6px", padding: "10px 14px", background: "var(--surface2)", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
                    <div className="bounce-1" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                    <div className="bounce-2" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                    <div className="bounce-3" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                  </div>
                )}
                <div ref={chatRef} />
              </div>

              <div style={{ display: "flex", gap: "10px", padding: "12px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Ask about leaves, payslip, attendance..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: "13px" }} />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{
                  padding: "10px 16px", borderRadius: "10px", border: "none",
                  background: chatLoading || !chatInput.trim() ? "var(--surface2)" : "#16a34a",
                  color: chatLoading || !chatInput.trim() ? "var(--muted)" : "#fff",
                  fontSize: "14px", cursor: "pointer",
                }}>→</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
