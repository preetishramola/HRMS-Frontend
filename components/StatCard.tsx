interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
  delay?: number;
}

export default function StatCard({ label, value, icon, color, sub, delay = 0 }: StatCardProps) {
  return (
    <div
      className="p-5 rounded-2xl animate-fade-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        {sub && (
          <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
            {sub}
          </span>
        )}
      </div>
      <div className="text-3xl font-black font-display mb-1" style={{ color: "var(--white)" }}>{value}</div>
      <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
