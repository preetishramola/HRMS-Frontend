"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar, Spinner } from "@/components/UI";
import { recruitmentApi, interviewApi, departmentApi } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import {
  Briefcase, Users, Brain, Mic, Plus, X, Upload, CheckCircle,
  AlertCircle, Clock, Star, FileText, ArrowRight, BarChart2,
  UserCheck, XCircle, Loader, Calendar, Link2, Mail, ChevronDown,
  Send, Award, RefreshCw
} from "lucide-react";

const NAV = [
  { label: "Dashboard",   href: "/dashboard/hr",             icon: "📊" },
  { label: "Recruitment", href: "/dashboard/hr/recruitment", icon: "📋" },
  { label: "Leave",       href: "/dashboard/hr/leaves",      icon: "🏖️" },
  { label: "Feedback",   href: "/dashboard/feedback",           icon: "💬" },
  { label: "Complaints", href: "/dashboard/complaints",         icon: "🔒" },
];

type Tab = "shortlisted" | "waiting" | "interview" | "offers" | "closed";

const TAB_META: Record<Tab, { label: string; color: string; desc: string }> = {
  shortlisted: { label: "Shortlisted",  color: "#16a34a", desc: "Passed AI screening — ready to schedule" },
  waiting:     { label: "Waiting List", color: "#f59e0b", desc: "Applied — screening in progress or below threshold" },
  interview:   { label: "Interview",    color: "#4f46e5", desc: "Interview scheduled or completed" },
  offers:      { label: "Offers",       color: "#0891b2", desc: "Offer letter sent — awaiting response" },
  closed:      { label: "Hired / Rejected", color: "#6b7280", desc: "Closed candidatures" },
};

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "10px", fontWeight: "700",
      color, background: bg, padding: "3px 9px", borderRadius: "20px", letterSpacing: "0.02em" }}>
      {label}
    </span>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "5px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: "3px", background: color }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "700", color, minWidth: "32px", textAlign: "right" }}>{score}%</span>
    </div>
  );
}

export default function HRDashboard() {
  const user = getUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("shortlisted");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Interview
  const [interview, setInterview] = useState<any>(null);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [endingInterview, setEndingInterview] = useState(false);

  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; candidate: any }>({ open: false, candidate: null });
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: "", meetingLink: "" });
  const [scheduling, setScheduling] = useState(false);

  // Offer sending
  const [sendingOffer, setSendingOffer] = useState<number | null>(null);

  // New job form
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", experienceYears: 3, salaryRange: "", requiredSkills: "", departmentId: "" });
  const [jobSaving, setJobSaving] = useState(false);

  // Screening
  const [screeningId, setScreeningId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== "ROLE_HR") { logout(); return; }
    Promise.all([recruitmentApi.getJobs(), departmentApi.getAll()])
      .then(async ([jobsRes, deptRes]) => {
        const jobList = jobsRes.data.data || [];
        setJobs(jobList);
        setDepartments(deptRes.data.data || []);
        if (jobList.length > 0) {
          setSelectedJob(jobList[0]);
          const res = await recruitmentApi.getCandidates(jobList[0].id).catch(() => null);
          setCandidates(res?.data?.data || []);
        }
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectJob = async (job: any) => {
    setSelectedJob(job);
    setSelectedCandidate(null);
    setInterview(null);
    setEvaluation(null);
    setActiveTab("shortlisted");
    const res = await recruitmentApi.getCandidates(job.id).catch(() => null);
    setCandidates(res?.data?.data || []);
  };

  const refreshCandidates = async () => {
    if (!selectedJob) return;
    const res = await recruitmentApi.getCandidates(selectedJob.id).catch(() => null);
    if (res) setCandidates(res.data.data || []);
  };

  const isInterviewTime = (c: any) => c?.scheduledInterviewAt && new Date(c.scheduledInterviewAt) <= new Date();

  // Candidate bucketing
  const shortlisted = candidates.filter(c => c.pipelineStage === "SCREENED");
  const waiting     = candidates.filter(c => ["APPLIED"].includes(c.pipelineStage));
  const inInterview = candidates.filter(c => c.pipelineStage === "INTERVIEW");
  const offers      = candidates.filter(c => c.pipelineStage === "OFFER");
  const closed      = candidates.filter(c => ["HIRED", "REJECTED"].includes(c.pipelineStage));

  const tabCounts: Record<Tab, number> = { shortlisted: shortlisted.length, waiting: waiting.length, interview: inInterview.length, offers: offers.length, closed: closed.length };
  const tabCandidates: Record<Tab, any[]> = { shortlisted, waiting, interview: inInterview, offers, closed };

  // ── Actions ──

  const screenResume = async (c: any) => {
    setScreeningId(c.id);
    await recruitmentApi.screenResume(c.id).catch(console.error);
    await refreshCandidates();
    setScreeningId(null);
  };

  const openScheduleModal = (c: any) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduleForm({ scheduledAt: tomorrow.toISOString().slice(0, 16), meetingLink: "" });
    setScheduleModal({ open: true, candidate: c });
  };

  const confirmSchedule = async () => {
    if (!scheduleModal.candidate || !scheduleForm.scheduledAt) return;
    setScheduling(true);
    const dt = new Date(scheduleForm.scheduledAt).toISOString().slice(0, 19);
    await recruitmentApi.scheduleInterview(scheduleModal.candidate.id, dt, scheduleForm.meetingLink || undefined).catch(console.error);
    await refreshCandidates();
    setScheduleModal({ open: false, candidate: null });
    setScheduling(false);
    setActiveTab("interview");
  };

  const startInterview = async (c: any) => {
    setSelectedCandidate(c);
    setInterview(null);
    setEvaluation(null);
    setInterviewAnswer("");
    setInterviewLoading(true);
    const res = await interviewApi.start(c.id).catch(() => null);
    if (res) setInterview(res.data.data);
    setInterviewLoading(false);
  };

  const sendAnswer = async () => {
    if (!interview || !interviewAnswer.trim() || interviewLoading) return;
    setInterviewLoading(true);
    const res = await interviewApi.respond(interview.sessionId, interviewAnswer).catch(() => null);
    if (res) { setInterview(res.data.data); setInterviewAnswer(""); }
    setInterviewLoading(false);
  };

  const endInterview = async () => {
    if (!interview) return;
    setEndingInterview(true);
    const res = await interviewApi.end(interview.sessionId).catch(() => null);
    if (res) {
      setEvaluation(res.data.data?.evaluation);
      setInterview((p: any) => ({ ...p, complete: true, ended: true }));
      await refreshCandidates();
    }
    setEndingInterview(false);
  };

  const sendOffer = async (c: any) => {
    setSendingOffer(c.id);
    await recruitmentApi.sendOffer(c.id).catch(console.error);
    await refreshCandidates();
    setSendingOffer(null);
    setActiveTab("offers");
  };

  const saveJob = async () => {
    setJobSaving(true);
    const payload = { ...jobForm, requiredSkills: jobForm.requiredSkills.split(",").map(s => s.trim()).filter(Boolean), departmentId: jobForm.departmentId ? Number(jobForm.departmentId) : undefined };
    const res = await recruitmentApi.createJob(payload).catch(console.error);
    if (res) {
      const newJob = res.data.data;
      setJobs(p => [newJob, ...p]);
      setSelectedJob(newJob);
      setCandidates([]);
      setShowJobForm(false);
      setJobForm({ title: "", description: "", experienceYears: 3, salaryRange: "", requiredSkills: "", departmentId: "" });
    }
    setJobSaving(false);
  };

  if (loading) return <Spinner color="#4f46e5" />;

  const inputStyle: any = { width: "100%", padding: "10px 14px", borderRadius: "9px", background: "#fff", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: "13px", fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", boxSizing: "border-box" };
  const btnPrimary: any = { padding: "10px 18px", borderRadius: "9px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };

  // Show interview panel if active
  const showInterview = selectedCandidate && (interview || interviewLoading);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar navItems={NAV} role="ROLE_HR" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Recruitment Hub" subtitle="AI-powered hiring pipeline" />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Left: Job List ── */}
          <div style={{ width: "240px", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.07em" }}>JOB OPENINGS</span>
                <button onClick={() => setShowJobForm(true)} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(79,70,229,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Plus size={12} color="#4f46e5" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
                {[["Open", jobs.filter(j => j.status === "OPEN").length, "#4f46e5"], ["Total", jobs.length, "#6b7280"], ["Closed", jobs.filter(j => j.status === "CLOSED").length, "#ef4444"]].map(([l, v, c]: any) => (
                  <div key={l} style={{ textAlign: "center", padding: "6px", borderRadius: "7px", background: "var(--surface2)" }}>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: c }}>{v}</div>
                    <div style={{ fontSize: "9px", color: "var(--muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {jobs.map(job => (
                <button key={job.id} onClick={() => selectJob(job)} style={{
                  width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: "9px",
                  background: selectedJob?.id === job.id ? "rgba(79,70,229,0.07)" : "transparent",
                  border: `1px solid ${selectedJob?.id === job.id ? "rgba(79,70,229,0.2)" : "transparent"}`,
                  cursor: "pointer", marginBottom: "3px",
                }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-strong)", marginBottom: "2px" }}>{job.title}</div>
                  <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>{job.experienceYears}+ yrs</div>
                  <span style={{ fontSize: "9px", color: job.status === "OPEN" ? "#16a34a" : job.status === "CLOSED" ? "#ef4444" : "#6b7280", background: job.status === "OPEN" ? "rgba(22,163,74,0.1)" : job.status === "CLOSED" ? "rgba(239,68,68,0.1)" : "var(--surface2)", padding: "2px 7px", borderRadius: "8px", fontWeight: "700" }}>{job.status}</span>
                </button>
              ))}
              {jobs.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>No jobs yet</p>
                  <button onClick={() => setShowJobForm(true)} style={{ marginTop: "8px", fontSize: "12px", color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}>+ Create first job</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* New Job Form */}
            {showJobForm && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "22px", maxWidth: "560px", boxShadow: "var(--shadow)" }} className="fade-in">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h2 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-strong)" }}>Create Job Posting</h2>
                  <button onClick={() => setShowJobForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={16} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ label: "Job Title *", key: "title", placeholder: "e.g. Senior React Developer" }, { label: "Salary Range", key: "salaryRange", placeholder: "e.g. ₹8–12 LPA" }].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
                      <input value={(jobForm as any)[key]} onChange={e => setJobForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Department</label>
                    <select value={jobForm.departmentId} onChange={e => setJobForm(p => ({ ...p, departmentId: e.target.value }))} style={inputStyle}>
                      <option value="">Select department</option>
                      {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min. Years Experience</label>
                    <input type="number" value={jobForm.experienceYears} onChange={e => setJobForm(p => ({ ...p, experienceYears: Number(e.target.value) }))} style={{ ...inputStyle, width: "100px" }} min={0} max={20} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Required Skills (comma separated)</label>
                    <input value={jobForm.requiredSkills} onChange={e => setJobForm(p => ({ ...p, requiredSkills: e.target.value }))} placeholder="Java, Spring Boot, React, PostgreSQL" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Job Description</label>
                    <textarea value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the role and responsibilities…" style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={saveJob} disabled={jobSaving || !jobForm.title} style={{ ...btnPrimary, opacity: !jobForm.title ? 0.5 : 1 }}>
                      {jobSaving ? <><Loader size={13} className="spin" />Saving…</> : <><Plus size={13} />Create</>}
                    </button>
                    <button onClick={() => setShowJobForm(false)} style={{ padding: "10px 16px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Interview Panel ── */}
            {showInterview && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px", maxWidth: "640px", boxShadow: "var(--shadow)" }} className="fade-in">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mic size={18} color="#4f46e5" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-strong)" }}>AI Interview — {selectedCandidate?.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>Groq · Llama 3.3 70B · Resume-aware</div>
                  </div>
                  <button onClick={() => { setSelectedCandidate(null); setInterview(null); setEvaluation(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={16} /></button>
                </div>

                {interviewLoading && !interview && (
                  <div style={{ textAlign: "center", padding: "28px" }}>
                    <div className="spin" style={{ width: "26px", height: "26px", border: "2px solid rgba(79,70,229,0.2)", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: "13px", color: "#4f46e5", fontWeight: "600" }}>Reading resume & building interview plan…</p>
                  </div>
                )}

                {interview && !evaluation && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Progress */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "9px", background: "var(--surface2)" }}>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{interview.jobTitle}</span>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#4f46e5" }}>Q{Math.min(interview.questionNumber, interview.totalQuestions)}/{interview.totalQuestions}</span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#4f46e5", width: `${(Math.min(interview.questionNumber, interview.totalQuestions) / interview.totalQuestions) * 100}%`, transition: "width 0.5s" }} />
                    </div>

                    {!interview.complete && (
                      <div style={{ padding: "16px", borderRadius: "11px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.15)" }}>
                        <div style={{ fontSize: "10px", color: "#4f46e5", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.06em" }}>AI INTERVIEWER</div>
                        <p style={{ fontSize: "14px", color: "var(--text-strong)", lineHeight: "1.7", margin: 0 }}>{interview.question}</p>
                      </div>
                    )}

                    {interview.complete && !interview.ended && (
                      <div style={{ padding: "18px", borderRadius: "11px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", textAlign: "center" }}>
                        <CheckCircle size={26} color="#16a34a" style={{ margin: "0 auto 8px" }} />
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "14px" }}>All questions answered — generate evaluation</div>
                        <button onClick={endInterview} disabled={endingInterview}
                          style={{ padding: "11px 24px", borderRadius: "9px", border: "none", background: "#16a34a", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {endingInterview ? <><Loader size={13} className="spin" />Evaluating…</> : <><BarChart2 size={13} />End Interview & Get Evaluation</>}
                        </button>
                      </div>
                    )}

                    {!interview.complete && (
                      <>
                        <textarea value={interviewAnswer} onChange={e => setInterviewAnswer(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendAnswer(); }}
                          placeholder="Type candidate's answer… (Ctrl+Enter to submit)" rows={3}
                          style={{ ...inputStyle, resize: "none" }} />
                        <button onClick={sendAnswer} disabled={interviewLoading || !interviewAnswer.trim()} style={{ ...btnPrimary, justifyContent: "center", opacity: !interviewAnswer.trim() ? 0.5 : 1 }}>
                          {interviewLoading ? <><Loader size={13} className="spin" />Processing…</> : <>Submit Answer <ArrowRight size={13} /></>}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Evaluation */}
                {evaluation && (
                  <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ textAlign: "center", padding: "4px 0 12px" }}>
                      <Award size={32} color="#4f46e5" style={{ margin: "0 auto 8px" }} />
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-strong)" }}>Evaluation Complete</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "9px" }}>
                      {[["Communication", evaluation.communication, "#3b82f6"], ["Technical", evaluation.technical, "#f59e0b"], ["Problem Solving", evaluation.problemSolving, "#8b5cf6"]].map(([l, v, c]: any) => (
                        <div key={l} style={{ padding: "14px", borderRadius: "11px", background: "var(--surface2)", textAlign: "center" }}>
                          <div style={{ fontSize: "26px", fontWeight: "800", color: c }}>{v}</div>
                          <div style={{ fontSize: "9px", color: "var(--muted)", marginTop: "3px" }}>{l}</div>
                          <div style={{ marginTop: "8px" }}><ScoreBar score={v * 10} color={c} /></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                      <div style={{ padding: "14px", borderRadius: "11px", background: "var(--surface2)", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>OVERALL</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: evaluation.overall >= 7 ? "#16a34a" : evaluation.overall >= 5 ? "#f59e0b" : "#ef4444" }}>{evaluation.overall}<span style={{ fontSize: "13px" }}>/10</span></div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "11px", background: evaluation.recommendation === "HIRE" ? "rgba(22,163,74,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${evaluation.recommendation === "HIRE" ? "rgba(22,163,74,0.2)" : "rgba(245,158,11,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>RECOMMENDATION</div>
                          <div style={{ fontSize: "20px", fontWeight: "800", color: evaluation.recommendation === "HIRE" ? "#16a34a" : "#f59e0b" }}>{evaluation.recommendation}</div>
                        </div>
                      </div>
                    </div>
                    {evaluation.summary && (
                      <div style={{ padding: "12px 14px", borderRadius: "10px", background: "var(--surface2)", fontSize: "13px", color: "var(--text-strong)", lineHeight: "1.7" }}>{evaluation.summary}</div>
                    )}
                    {evaluation.recommendation === "HIRE" && (
                      <button onClick={() => { sendOffer(selectedCandidate); setSelectedCandidate(null); setInterview(null); setEvaluation(null); }}
                        style={{ ...btnPrimary, background: "#16a34a", justifyContent: "center", padding: "12px" }}>
                        <Send size={14} />Send Offer Letter to {selectedCandidate?.name?.split(" ")[0]}
                      </button>
                    )}
                    <button onClick={() => { setSelectedCandidate(null); setInterview(null); setEvaluation(null); }} style={{ padding: "10px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>
                      Back to Pipeline
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Pipeline ── */}
            {!showInterview && selectedJob && (
              <>
                {/* Job header */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", boxShadow: "var(--shadow)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Briefcase size={15} color="#4f46e5" />
                      <h2 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-strong)", margin: 0 }}>{selectedJob.title}</h2>
                      <span style={{ fontSize: "10px", color: selectedJob.status === "OPEN" ? "#16a34a" : "#ef4444", background: selectedJob.status === "OPEN" ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "9px", fontWeight: "700" }}>{selectedJob.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {[selectedJob.department?.name, `${selectedJob.experienceYears}+ yrs`, selectedJob.salaryRange].filter(Boolean).map((v: any, i: number) => <span key={i} style={{ fontSize: "11px", color: "var(--muted)" }}>{v}</span>)}
                    </div>
                    {selectedJob.requiredSkills?.length > 0 && (
                      <div style={{ display: "flex", gap: "5px", marginTop: "7px", flexWrap: "wrap" }}>
                        {selectedJob.requiredSkills.map((s: string) => <span key={s} style={{ fontSize: "10px", color: "var(--text)", background: "var(--surface2)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: "8px" }}>{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button onClick={refreshCandidates} title="Refresh candidates" style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--muted)" }}>
                      <RefreshCw size={13} color="var(--muted)" />
                      Refresh
                    </button>
                    <a href="/careers" target="_blank" style={{ padding: "8px 14px", borderRadius: "9px", border: "1px solid rgba(79,70,229,0.25)", background: "rgba(79,70,229,0.06)", color: "#4f46e5", fontSize: "12px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                      <ArrowRight size={13} />Careers Page
                    </a>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "9px" }}>
                  {([["Shortlisted", shortlisted.length, "#16a34a", UserCheck], ["Waiting", waiting.length, "#f59e0b", Clock], ["Interview", inInterview.length, "#4f46e5", Mic], ["Offers", offers.length, "#0891b2", Send], ["Hired", closed.filter((c: any) => c.pipelineStage === "HIRED").length, "#6b7280", CheckCircle]] as any[]).map(([label, value, color, Icon]: any) => (
                    <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "11px", padding: "13px 14px", boxShadow: "var(--shadow)" }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                        <Icon size={13} color={color} />
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-strong)" }}>{value}</div>
                      <div style={{ fontSize: "10px", color: "var(--muted)" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
                  {(Object.keys(TAB_META) as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding: "9px 14px", borderRadius: "8px 8px 0 0", border: "1px solid transparent",
                      borderBottom: activeTab === tab ? "2px solid " + TAB_META[tab].color : "2px solid transparent",
                      background: activeTab === tab ? "var(--surface)" : "transparent",
                      color: activeTab === tab ? TAB_META[tab].color : "var(--muted)",
                      fontSize: "12px", fontWeight: activeTab === tab ? "700" : "500", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      {TAB_META[tab].label}
                      {tabCounts[tab] > 0 && (
                        <span style={{ background: activeTab === tab ? TAB_META[tab].color : "var(--surface2)", color: activeTab === tab ? "#fff" : "var(--muted)", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "9px" }}>{tabCounts[tab]}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab description */}
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "-8px 0 0" }}>{TAB_META[activeTab].desc}</p>

                {/* Candidate cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tabCandidates[activeTab].length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)", fontSize: "13px", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                      {activeTab === "waiting"
                        ? "No candidates waiting — all have been processed by AI screening."
                        : activeTab === "shortlisted"
                        ? "No shortlisted candidates yet. Applications auto-screen when resume is uploaded."
                        : `No candidates in this stage yet.`}
                    </div>
                  )}
                  {tabCandidates[activeTab].map((c: any) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      activeTab={activeTab}
                      screeningId={screeningId}
                      sendingOffer={sendingOffer}
                      isInterviewTime={isInterviewTime}
                      onScreen={() => screenResume(c)}
                      onProceed={() => openScheduleModal(c)}
                      onStartInterview={() => startInterview(c)}
                      onSendOffer={() => sendOffer(c)}
                    />
                  ))}
                </div>
              </>
            )}

            {!selectedJob && !showInterview && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", textAlign: "center" }}>
                <Briefcase size={44} color="var(--border)" style={{ marginBottom: "14px" }} />
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-strong)", marginBottom: "6px" }}>No job postings yet</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "18px" }}>Create a job to start receiving applications</p>
                <button onClick={() => setShowJobForm(true)} style={btnPrimary}><Plus size={13} />Create Job Posting</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Schedule Modal ── */}
      {scheduleModal.open && scheduleModal.candidate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "26px", width: "420px", maxWidth: "95vw", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid var(--border)" }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={16} color="#4f46e5" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-strong)" }}>Proceed with Candidature</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>{scheduleModal.candidate.name}</div>
                </div>
              </div>
              <button onClick={() => setScheduleModal({ open: false, candidate: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={16} /></button>
            </div>

            {/* AI score summary */}
            {scheduleModal.candidate.aiScore && (
              <div style={{ padding: "11px 13px", borderRadius: "9px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>✓ AI Score: {scheduleModal.candidate.aiScore}%</span>
                <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>{scheduleModal.candidate.aiRecommendation}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Interview Date & Time *</label>
                <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(p => ({ ...p, scheduledAt: e.target.value }))} min={new Date().toISOString().slice(0, 16)} style={{ ...inputStyle, colorScheme: "light" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Meeting Link (optional)</label>
                <div style={{ position: "relative" }}>
                  <Link2 size={13} color="var(--muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input type="url" value={scheduleForm.meetingLink} onChange={e => setScheduleForm(p => ({ ...p, meetingLink: e.target.value }))} placeholder="https://meet.google.com/…" style={{ ...inputStyle, paddingLeft: "32px" }} />
                </div>
              </div>
            </div>

            <div style={{ padding: "11px 13px", borderRadius: "9px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.15)", margin: "16px 0", fontSize: "12px", color: "#4f46e5", display: "flex", gap: "7px" }}>
              <Mail size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
              Candidate gets an email with slot + meeting link. 24h reminder sent automatically.
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setScheduleModal({ open: false, candidate: null })} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmSchedule} disabled={scheduling || !scheduleForm.scheduledAt}
                style={{ flex: 2, padding: "10px", borderRadius: "9px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: !scheduleForm.scheduledAt ? 0.5 : 1 }}>
                {scheduling ? <><Loader size={13} className="spin" />Scheduling…</> : <><Calendar size={13} />Confirm & Notify Candidate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Candidate Card Component ──
function CandidateCard({ candidate: c, activeTab, screeningId, sendingOffer, isInterviewTime, onScreen, onProceed, onStartInterview, onSendOffer }: any) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = (s: number) => s >= 70 ? "#16a34a" : s >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "13px", boxShadow: "var(--shadow)", overflow: "hidden" }}>
      {/* Main row */}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Avatar */}
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "#4f46e5", flexShrink: 0 }}>
          {c.name?.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-strong)" }}>{c.name}</span>
            {c.pipelineStage === "HIRED" && <Badge label="Hired" color="#16a34a" bg="rgba(22,163,74,0.1)" />}
            {c.pipelineStage === "REJECTED" && <Badge label="Rejected" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
            {c.offerStatus === "PENDING" && <Badge label="Offer Pending" color="#0891b2" bg="rgba(8,145,178,0.1)" />}
            {c.offerStatus === "ACCEPTED" && <Badge label="Accepted ✓" color="#16a34a" bg="rgba(22,163,74,0.1)" />}
            {c.offerStatus === "DECLINED" && <Badge label="Declined" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{c.email}{c.phone ? ` · ${c.phone}` : ""}</div>
          {/* AI score bar */}
          {c.aiScore && (
            <div style={{ marginTop: "7px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "10px", color: "var(--muted)", whiteSpace: "nowrap" }}>AI Match</span>
              <div style={{ flex: 1, maxWidth: "160px" }}>
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ width: `${c.aiScore}%`, height: "100%", background: scoreColor(Number(c.aiScore)) }} />
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: scoreColor(Number(c.aiScore)) }}>{c.aiScore}%</span>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>{c.aiRecommendation}</span>
            </div>
          )}
          {/* Scheduled time */}
          {c.scheduledInterviewAt && (
            <div style={{ marginTop: "5px", fontSize: "11px", color: isInterviewTime(c) ? "#16a34a" : "#4f46e5", display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={10} />
              {isInterviewTime(c) ? "Ready to start · " : "Scheduled · "}
              {new Date(c.scheduledInterviewAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {/* No resume warning */}
          {!c.resumeUrl && activeTab === "waiting" && (
            <div style={{ marginTop: "5px", fontSize: "10px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={10} />No resume uploaded — candidate applied without PDF
            </div>
          )}
          {/* Screening in progress */}
          {screeningId === c.id && (
            <div style={{ marginTop: "5px", fontSize: "10px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
              <Loader size={10} className="spin" />Gemini is screening the resume…
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "7px", alignItems: "center", flexShrink: 0 }}>
          {/* Waiting tab: manual screen retry */}
          {activeTab === "waiting" && c.resumeUrl && !c.aiScore && (
            <button onClick={onScreen} disabled={screeningId === c.id}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              {screeningId === c.id ? <Loader size={11} className="spin" /> : <Brain size={11} />}Retry Screen
            </button>
          )}

          {/* Shortlisted: Proceed with Candidature */}
          {activeTab === "shortlisted" && !c.scheduledInterviewAt && (
            <button onClick={onProceed}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={11} />Proceed
            </button>
          )}

          {/* Interview tab */}
          {activeTab === "interview" && isInterviewTime(c) && !c.interviewReport && (
            <button onClick={onStartInterview}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              <Mic size={11} />Start Interview
            </button>
          )}
          {activeTab === "interview" && !isInterviewTime(c) && (
            <span style={{ fontSize: "11px", color: "#4f46e5", background: "rgba(79,70,229,0.08)", padding: "5px 10px", borderRadius: "7px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={10} />Upcoming
            </span>
          )}
          {activeTab === "interview" && c.interviewReport && !c.offerStatus && (
            <button onClick={onSendOffer} disabled={sendingOffer === c.id}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              {sendingOffer === c.id ? <Loader size={11} className="spin" /> : <Send size={11} />}Send Offer
            </button>
          )}

          {/* Expand toggle */}
          {(c.aiSummary || c.interviewReport) && (
            <button onClick={() => setExpanded(p => !p)}
              style={{ padding: "7px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ChevronDown size={13} color="var(--muted)" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--border)", paddingTop: "14px" }} className="fade-in">
          {c.aiSummary && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Screening Summary</div>
              <p style={{ fontSize: "12px", color: "var(--text-strong)", lineHeight: "1.7", margin: 0 }}>{c.aiSummary}</p>
            </div>
          )}
          {c.interviewReport && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interview Evaluation</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                {[["Communication", c.interviewCommScore, "#3b82f6"], ["Technical", c.interviewTechScore, "#f59e0b"], ["Problem Solving", c.interviewProblemScore, "#8b5cf6"]].map(([l, v, col]: any) => (
                  <div key={l} style={{ padding: "10px", borderRadius: "8px", background: "var(--surface2)", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: col }}>{v}/10</div>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "8px", padding: "8px 12px", borderRadius: "8px", background: c.interviewRecommendation === "HIRE" ? "rgba(22,163,74,0.07)" : "rgba(245,158,11,0.07)", textAlign: "center", fontSize: "12px", fontWeight: "700", color: c.interviewRecommendation === "HIRE" ? "#16a34a" : "#f59e0b" }}>
                Recommendation: {c.interviewRecommendation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
