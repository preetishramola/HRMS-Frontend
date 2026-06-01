"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getUser } from "@/lib/auth";
import {
  LayoutDashboard, Users, DollarSign, CheckCircle, Target, Home,
  Bot, Building2, ClipboardList, TrendingUp, Receipt, Calendar,
  Umbrella, ChevronLeft, ChevronRight, LogOut, Briefcase, PanelLeft,
} from "lucide-react";

interface NavItem { label: string; href: string; icon: string; }

const ICON_MAP: Record<string, React.ElementType> = {
  "📊": LayoutDashboard,
  "👥": Users,
  "💰": DollarSign,
  "✅": CheckCircle,
  "🎯": Target,
  "🏠": Home,
  "🤖": Bot,
  "🏗️": Building2,
  "📋": ClipboardList,
  "📈": TrendingUp,
  "💼": Briefcase,
  "🎙️": Bot,
  "📅": Calendar,
  "🏖️": Umbrella,
};

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string; abbr: string }> = {
  ROLE_ADMIN:    { color: "#dc2626", bg: "rgba(220,38,38,0.08)",   label: "Admin",    abbr: "AD" },
  ROLE_MANAGER:  { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", label: "Manager",  abbr: "MG" },
  ROLE_HR:       { color: "#0891b2", bg: "rgba(8,145,178,0.08)",  label: "HR",       abbr: "HR" },
  ROLE_EMPLOYEE: { color: "#16a34a", bg: "rgba(22,163,74,0.08)",  label: "Employee", abbr: "EM" },
};

export default function Sidebar({ navItems, role }: { navItems: NavItem[]; role: string }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { setUser(getUser()); }, []);
  const rc = ROLE_CONFIG[role] || { color: "#1a56db", bg: "rgba(26,86,219,0.08)", label: "User", abbr: "U" };

  return (
    <aside style={{
      width: collapsed ? "56px" : "220px",
      flexShrink: 0,
      background: "#fff",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>

      {/* ── Logo bar ── */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "10px", height: "56px", flexShrink: 0,
        padding: collapsed ? "0 12px" : "0 14px",
        borderBottom: "1px solid var(--border)",
      }}>
        {/* App icon */}
        <div style={{
          width: "30px", height: "30px", borderRadius: "7px", flexShrink: 0,
          background: "var(--brand)", display: "flex", alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(255,255,255,0.9)"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-strong)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              HRMS
            </div>
            <div style={{ fontSize: "10px", fontWeight: "500", color: rc.color, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
              {rc.label} Portal
            </div>
          </div>
        )}

        <button onClick={() => setCollapsed(!collapsed)} style={{
          marginLeft: collapsed ? "auto" : undefined,
          width: "26px", height: "26px", flexShrink: 0,
          background: "transparent", border: "none",
          color: "var(--muted)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "5px", transition: "background 0.1s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "8px 6px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="sidebar-link"
              style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: collapsed ? "9px 0" : "8px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "6px", marginBottom: "1px",
                background: active ? "var(--brand-light)" : "transparent",
                color: active ? "var(--brand)" : "var(--muted)",
                textDecoration: "none",
                fontSize: "13px", fontWeight: active ? "600" : "400",
                borderLeft: active ? "2px solid var(--brand)" : "2px solid transparent",
                transition: "background 0.1s, color 0.1s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div style={{ padding: "6px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: collapsed ? "8px 0" : "8px 10px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: "6px",
          transition: "background 0.1s",
        }}>
          {/* Avatar */}
          <div style={{
            width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
            background: rc.bg, color: rc.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", fontWeight: "700", letterSpacing: "0.02em",
          }}>
            {user?.name?.slice(0,2).toUpperCase() || rc.abbr}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                <div style={{
                  fontSize: "12px", fontWeight: "600", color: "var(--text-strong)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {user?.name || "—"}
                </div>
                <div style={{
                  fontSize: "10px", color: "var(--muted2)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {user?.email || ""}
                </div>
              </div>
              <button onClick={logout} title="Sign out" style={{
                background: "none", border: "none", color: "var(--muted2)",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center",
                padding: "4px", borderRadius: "4px",
                transition: "color 0.1s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted2)")}
              >
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
