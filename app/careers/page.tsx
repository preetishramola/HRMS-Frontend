"use client";
import { useState, useEffect, useRef } from "react";
import { careersApi } from "@/lib/api";
import { Briefcase, MapPin, Clock, ChevronRight, Upload, X, FileText, CheckCircle, ArrowLeft, Loader, Building2, Star } from "lucide-react";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [resume, setResume] = useState<File | null>(null);
  const [focused, setFocused] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    careersApi.getJobs().then(res => setJobs(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    if (form.phone) fd.append("phone", form.phone);
    if (resume) fd.append("resumeFile", resume);
    await careersApi.apply(selected.id, fd).catch(console.error);
    setSubmitted(true);
    setSubmitting(false);
  };

  const inputStyle = (key: string) => ({
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    background: "#fff", border: `1px solid ${focused === key ? "#4f46e5" : "#e4e7ef"}`,
    color: "#111827", fontSize: "14px", fontFamily: "inherit",
    boxShadow: focused === key ? "0 0 0 3px rgba(79,70,229,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
    transition: "all 0.14s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>

      {/* Top nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e4e7ef", padding: "0 40px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#4f46e5" }}>H</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>HRMS</div>
            <div style={{ fontSize: "10px", color: "#9ca3af", letterSpacing: "0.06em" }}>CAREERS</div>
          </div>
        </div>
        <a href="/login" style={{ fontSize: "13px", color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Employee Login →</a>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)", padding: "64px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "20px" }}>
          <Star size={12} color="#818cf8" />
          <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: "600" }}>We're hiring</span>
        </div>
        <h1 style={{ fontSize: "42px", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "14px" }}>
          Build the future<br /><span style={{ color: "#818cf8" }}>with us</span>
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", maxWidth: "480px", margin: "0 auto 28px", lineHeight: "1.7" }}>
          Join a team that's reimagining how companies manage their most important asset — their people.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
          {[["🚀", `${jobs.length} Open Roles`], ["🤖", "AI-First Culture"], ["🏡", "Hybrid Work"]].map(([icon, label]) => (
            <div key={label as string} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px" }}>{icon}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "500" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Job list */}
        {!applying && (
          <>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Open Positions</h2>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>{jobs.length} role{jobs.length !== 1 ? "s" : ""} available</p>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div className="spin" style={{ width: "28px", height: "28px", border: "2px solid #e4e7ef", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {jobs.map(job => (
                  <div key={job.id}
                    style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: "14px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#4f46e5"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(79,70,229,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e4e7ef"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
                    onClick={() => { setSelected(job); setApplying(false); setSubmitted(false); setForm({ name: "", email: "", phone: "" }); setResume(null); }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{job.title}</h3>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#0891b2", background: "rgba(8,145,178,0.1)", padding: "2px 8px", borderRadius: "10px" }}>OPEN</span>
                        </div>
                        <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
                          {job.department?.name && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280" }}>
                              <Building2 size={12} />{job.department.name}
                            </span>
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280" }}>
                            <Clock size={12} />{job.experienceYears}+ years exp
                          </span>
                          {job.salaryRange && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280" }}>
                              <MapPin size={12} />₹{job.salaryRange}
                            </span>
                          )}
                        </div>
                        {job.requiredSkills?.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {job.requiredSkills.map((s: string) => (
                              <span key={s} style={{ fontSize: "11px", color: "#374151", background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: "10px" }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setSelected(job); setApplying(true); }}
                        style={{ marginLeft: "16px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        Apply <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "14px", border: "1px solid #e4e7ef" }}>
                    <Briefcase size={40} color="#e4e7ef" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "#9ca3af" }}>No open positions right now. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Job detail + Apply form */}
        {selected && applying && !submitted && (
          <div className="fade-in">
            <button onClick={() => { setApplying(false); setSelected(null); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginBottom: "24px" }}>
              <ArrowLeft size={14} /> Back to jobs
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "24px", alignItems: "start" }}>
              {/* Job info */}
              <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>{selected.title}</h2>
                  <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                    {selected.department?.name && <span style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px" }}><Building2 size={13} />{selected.department.name}</span>}
                    <span style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px" }}><Clock size={13} />{selected.experienceYears}+ years</span>
                    {selected.salaryRange && <span style={{ fontSize: "13px", color: "#6b7280" }}>₹{selected.salaryRange}</span>}
                  </div>
                  {selected.requiredSkills?.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Required Skills</div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {selected.requiredSkills.map((s: string) => (
                          <span key={s} style={{ fontSize: "12px", color: "#374151", background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "4px 10px", borderRadius: "10px", fontWeight: "500" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.description && (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>About the Role</div>
                      <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75" }}>{selected.description}</p>
                    </div>
                  )}
                </div>
                <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.12)" }}>
                  <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600", marginBottom: "4px" }}>🤖 AI-Powered Screening</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>Your resume will be screened by our AI to match your skills against the role. Upload a PDF for the best results.</div>
                </div>
              </div>

              {/* Application form */}
              <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "sticky", top: "80px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Apply for this role</h3>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "22px" }}>Takes less than 2 minutes</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { label: "Full Name *", key: "name", placeholder: "Your full name", type: "text" },
                    { label: "Email Address *", key: "email", placeholder: "you@email.com", type: "email" },
                    { label: "Phone Number", key: "phone", placeholder: "+91 98765 43210", type: "tel" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} onFocus={() => setFocused(key)} onBlur={() => setFocused("")}
                        style={inputStyle(key)} />
                    </div>
                  ))}

                  {/* Resume upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume / CV (PDF)</label>
                    <div onClick={() => fileRef.current?.click()} style={{
                      padding: "18px", borderRadius: "10px", border: `2px dashed ${resume ? "#4f46e5" : "#e4e7ef"}`,
                      background: resume ? "rgba(79,70,229,0.03)" : "#f8f9fc", cursor: "pointer", textAlign: "center", transition: "all 0.15s"
                    }}>
                      {resume ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <FileText size={15} color="#4f46e5" />
                          <span style={{ fontSize: "13px", color: "#4f46e5", fontWeight: "600" }}>{resume.name}</span>
                          <button onClick={e => { e.stopPropagation(); setResume(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px" }}><X size={13} /></button>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} color="#9ca3af" style={{ margin: "0 auto 6px" }} />
                          <p style={{ fontSize: "12px", color: "#9ca3af" }}>Click to upload your PDF resume</p>
                          <p style={{ fontSize: "10px", color: "#d1d5db", marginTop: "2px" }}>Enables AI skill matching & personalised interview</p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && setResume(e.target.files[0])} />
                  </div>

                  <button onClick={submit} disabled={submitting || !form.name || !form.email}
                    style={{ padding: "12px", borderRadius: "10px", border: "none", background: submitting || !form.name || !form.email ? "#f3f4f6" : "#4f46e5", color: submitting || !form.name || !form.email ? "#9ca3af" : "#fff", fontSize: "14px", fontWeight: "700", cursor: submitting || !form.name || !form.email ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: !form.name || !form.email ? "none" : "0 2px 8px rgba(79,70,229,0.3)" }}>
                    {submitting ? <><Loader size={14} className="spin" />Submitting…</> : "Submit Application →"}
                  </button>
                  <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>Your application goes directly to our HR team</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success state */}
        {submitted && selected && (
          <div className="fade-in" style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={30} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "10px" }}>Application submitted!</h2>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "6px" }}>Thanks <strong>{form.name}</strong>, we've received your application for <strong>{selected.title}</strong>.</p>
            <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "32px" }}>Our AI will screen your resume and the HR team will be in touch at <strong>{form.email}</strong> within 3–5 business days.</p>
            <button onClick={() => { setApplying(false); setSelected(null); setSubmitted(false); }}
              style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
              View other openings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
