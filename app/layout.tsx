import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRMS — AI-Powered HR Management",
  description: "Next-generation Human Resource Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg)", color: "var(--text-strong)", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
