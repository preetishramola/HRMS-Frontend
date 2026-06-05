"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getDashboardPath } from "@/lib/auth";
import Link from "next/link";
import {
  Users, BarChart3, Brain, Zap, Shield, Globe,
  ArrowRight, CheckCircle, Star, ChevronRight, Sparkles,
  ClipboardList, DollarSign, Calendar, MessageSquare,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    color: "#1a56db",
    bg: "#eff4ff",
    title: "AI Resume Screening",
    desc: "Groq-powered Llama 3.3 ranks candidates by fit score, extracts skills, and flags gaps — in under 2 seconds.",
  },
  {
    icon: Zap,
    color: "#7c3aed",
    bg: "#f5f3ff",
    title: "AI Interviews",
    desc: "Adaptive interview questions generated per role. Candidates answer async, results scored automatically.",
  },
  {
    icon: MessageSquare,
    color: "#0891b2",
    bg: "#ecfeff",
    title: "HR Chatbot",
    desc: "Employees get instant answers about policies, leaves, payslips — no ticket needed.",
  },
  {
    icon: ClipboardList,
    color: "#16a34a",
    bg: "#f0fdf4",
    title: "Leave Management",
    desc: "Apply, approve, and track leave requests. Real-time balance across all leave types.",
  },
  {
    icon: DollarSign,
    color: "#d97706",
    bg: "#fffbeb",
    title: "Payroll",
    desc: "Auto-calculate payslips, deductions, and net pay. Download PDF payslips instantly.",
  },
  {
    icon: BarChart3,
    color: "#dc2626",
    bg: "#fef2f2",
    title: "Analytics",
    desc: "Headcount by department, salary distribution, hiring funnel — all in one dashboard.",
  },
];

const ROLES = [
  { role: "Admin",    color: "#dc2626", desc: "Full access — employees, payroll, analytics, departments",  icon: Shield },
  { role: "HR",       color: "#0891b2", desc: "Recruitment pipeline, AI screening, leave approvals",       icon: Users },
  { role: "Manager",  color: "#7c3aed", desc: "Team performance reviews and department overview",          icon: BarChart3 },
  { role: "Employee", color: "#16a34a", desc: "Self-service: leaves, payslips, performance, profile",      icon: Globe },
];

const STATS = [
  { value: "< 2s",  label: "AI screening time" },
  { value: "4",     label: "Role-based dashboards" },
  { value: "100%",  label: "Open source" },
  { value: "∞",     label: "Candidates supported" },
];

export default function LandingPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push(getDashboardPath(user.role));
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f8" }}>
        <div className="spin" style={{ width: "24px", height: "24px", border: "2px solid #e4e7ef", borderTopColor: "#1a56db", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827" }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e4e7ef",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: "60px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#1a56db",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(255,255,255,0.95)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.02em", color: "#111827" }}>HRMS</span>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#1a56db", background: "#eff4ff", padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.04em" }}>AI-POWERED</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/login" style={{ padding: "7px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", color: "#374151", textDecoration: "none", background: "transparent", border: "1px solid #e4e7ef" }}>
            Sign in
          </Link>
          <Link href="/login" style={{ padding: "7px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#fff", textDecoration: "none", background: "#1a56db" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        padding: "88px 40px 80px",
        background: "linear-gradient(180deg, #f8faff 0%, #fff 100%)",
        textAlign: "center",
        borderBottom: "1px solid #e4e7ef",
      }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: "#eff4ff", border: "1px solid #c3d3f8", marginBottom: "28px" }}>
          <Sparkles size={12} color="#1a56db" />
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a56db" }}>Powered by Groq · Llama 3.3 70B</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: "800",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          color: "#0d1117",
          maxWidth: "780px", margin: "0 auto 20px",
        }}>
          The HR platform that<br />
          <span style={{ color: "#1a56db" }}>actually thinks</span>
        </h1>

        <p style={{ fontSize: "18px", color: "#6b7280", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 40px", fontWeight: "400" }}>
          AI-powered recruitment, intelligent leave management, and real-time analytics — built for modern teams.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "8px",
            background: "#1a56db", color: "#fff",
            fontSize: "14px", fontWeight: "600", textDecoration: "none",
            boxShadow: "0 4px 14px rgba(26,86,219,0.35)",
            transition: "background 0.15s",
          }}>
            Start for free <ArrowRight size={15} />
          </Link>
          <Link href="/careers" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "8px",
            background: "#fff", color: "#374151",
            fontSize: "14px", fontWeight: "500", textDecoration: "none",
            border: "1px solid #e4e7ef",
          }}>
            View open roles <ChevronRight size={14} />
          </Link>
        </div>

        {/* Social proof strip */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", marginTop: "40px" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ width: "28px", height: "28px", borderRadius: "50%", background: `hsl(${i*60},60%,55%)`, border: "2px solid #fff", marginLeft: i > 1 ? "-8px" : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#fff" }}>
              {["A","M","H","E"][i-1]}
            </div>
          ))}
          <span style={{ fontSize: "13px", color: "#6b7280", marginLeft: "8px" }}>
            Trusted by <strong style={{ color: "#111827" }}>4 roles</strong> · Built for real teams
          </span>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "48px 40px", borderBottom: "1px solid #e4e7ef", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center", padding: "20px",
              borderRight: i < 3 ? "1px solid #e4e7ef" : "none",
            }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#0d1117", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 40px", background: "#f8faff" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a56db", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "800", letterSpacing: "-0.03em", color: "#0d1117", lineHeight: 1.2 }}>
              One platform. Every HR workflow.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} style={{
                background: "#fff", border: "1px solid #e4e7ef", borderRadius: "10px",
                padding: "24px", transition: "box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "6px", letterSpacing: "-0.01em" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role panels ── */}
      <section style={{ padding: "80px 40px", background: "#fff", borderTop: "1px solid #e4e7ef" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a56db", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
              Role-based access
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "800", letterSpacing: "-0.03em", color: "#0d1117" }}>
              Built for every member of your team
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {ROLES.map(({ role, color, desc, icon: Icon }) => (
              <div key={role} style={{
                border: `1px solid ${color}25`,
                borderTop: `3px solid ${color}`,
                borderRadius: "10px", padding: "24px",
                background: "#fff",
                transition: "box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>{role}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI callout ── */}
      <section style={{
        padding: "80px 40px",
        background: "linear-gradient(135deg, #0d1b2a 0%, #0f2d52 50%, #0a3d6b 100%)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.25)", marginBottom: "24px" }}>
            <Brain size={12} color="#60a5fa" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#60a5fa", letterSpacing: "0.04em" }}>GROQ · LLAMA 3.3 70B</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: "800", letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.15, marginBottom: "16px" }}>
            Resume screening that<br />actually reads the resume
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "36px" }}>
            Upload a PDF. Get an AI score, extracted skills, strengths, gaps, and a hire/no-hire recommendation — powered by Groq's near-instant inference.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            {["Fit score 0–100", "Skill match %", "STRONG_YES / YES / MAYBE / NO", "Strengths & gaps"].map(tag => (
              <div key={tag} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={13} color="#60a5fa" />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 40px", background: "#f8faff", borderTop: "1px solid #e4e7ef", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: "800", letterSpacing: "-0.03em", color: "#0d1117", marginBottom: "12px" }}>
            Ready to modernise your HR?
          </h2>
          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "32px" }}>
            No setup fees. No credit card. Just sign in and go.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "13px 28px", borderRadius: "8px",
            background: "#1a56db", color: "#fff",
            fontSize: "14px", fontWeight: "600", textDecoration: "none",
            boxShadow: "0 4px 14px rgba(26,86,219,0.35)",
          }}>
            Get started free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "24px 40px", borderTop: "1px solid #e4e7ef", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(255,255,255,0.95)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>HRMS</span>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>· AI-Powered Human Resources</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/careers" style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none" }}>Careers</Link>
          <Link href="/login" style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none" }}>Sign in</Link>
        </div>
      </footer>

    </div>
  );
}
