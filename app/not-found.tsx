"use client";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-8xl font-black font-display mb-4" style={{ color: "#f97316" }}>404</div>
      <p className="font-mono text-sm mb-6" style={{ color: "var(--muted)" }}>Page not found</p>
      <Link href="/" className="px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "#f97316", color: "white" }}>← Go Home</Link>
    </div>
  );
}
