"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/UI";
import { attendanceApi } from "@/lib/api";
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

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PRESENT:   { color: "#16a34a", bg: "rgba(22,163,74,0.1)",   label: "Present"   },
  ABSENT:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Absent"    },
  HALF_DAY:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Half Day"  },
  LATE:      { color: "#f97316", bg: "rgba(249,115,22,0.1)",  label: "Late"      },
  HOLIDAY:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  label: "Holiday"   },
  WEEKEND:   { color: "#d1d5db", bg: "rgba(209,213,219,0.15)", label: "Weekend"  },
};

export default function AttendancePage() {
  const user = getUser();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.employeeId) return;
    setLoading(true);
    attendanceApi.getMonthly(user.employeeId, month, year)
      .then(res => setRecords(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();

  // Map date string → record
  const recordMap: Record<string, any> = {};
  records.forEach(r => { recordMap[r.date] = r; });

  const presentCount  = records.filter(r => r.status === "PRESENT").length;
  const absentCount   = records.filter(r => r.status === "ABSENT").length;
  const halfDayCount  = records.filter(r => r.status === "HALF_DAY").length;
  const lateCount     = records.filter(r => r.status === "LATE").length;

  const changeMonth = (dir: number) => {
    let m = month + dir, y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navItems={NAV} role="ROLE_EMPLOYEE" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Attendance" subtitle="Monthly attendance overview" />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
            {[
              { label: "Present",  value: presentCount,  color: "#16a34a", bg: "rgba(22,163,74,0.06)"   },
              { label: "Absent",   value: absentCount,   color: "#ef4444", bg: "rgba(239,68,68,0.06)"   },
              { label: "Half Day", value: halfDayCount,  color: "#f59e0b", bg: "rgba(245,158,11,0.06)"  },
              { label: "Late",     value: lateCount,     color: "#f97316", bg: "rgba(249,115,22,0.06)"  },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{s.label}</div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>days this month</div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px 28px" }}>

            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <button onClick={() => changeMonth(-1)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-strong)" }}>{MONTHS[month - 1]} {year}</div>
              <button onClick={() => changeMonth(1)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>Loading…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const rec = recordMap[dateStr];
                  const dow = new Date(year, month - 1, day).getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isToday = dateStr === now.toISOString().split("T")[0];
                  const status = rec?.status || (isWeekend ? "WEEKEND" : null);
                  const sc = status ? STATUS_CONFIG[status] : null;

                  return (
                    <div key={day} style={{
                      aspectRatio: "1",
                      borderRadius: "10px",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      background: sc ? sc.bg : "var(--bg)",
                      border: isToday ? "2px solid #4f46e5" : "1px solid transparent",
                      position: "relative",
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: isToday ? "800" : "500", color: sc ? sc.color : "var(--text-muted)" }}>
                        {day}
                      </div>
                      {status && !isWeekend && (
                        <div style={{ fontSize: "8px", fontWeight: "700", color: sc?.color, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {sc?.label.charAt(0)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
              {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "WEEKEND").map(([key, cfg]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: cfg.bg, border: `1px solid ${cfg.color}50` }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
