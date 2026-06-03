"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { offerApi } from "@/lib/api";
import { CheckCircle, XCircle, Briefcase, Loader, AlertCircle } from "lucide-react";

function OfferPage() {
  const params = useSearchParams();
  const token  = params.get("token");
  const action = params.get("action"); // "accept" | "decline" — from email link

  const [offer, setOffer] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "accepted" | "declined" | "error">("loading");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("error"); return; }

    offerApi.getDetails(token)
      .then(res => {
        setOffer(res.data.data);
        // If candidate came via direct email link, auto-respond
        if (action === "accept" || action === "decline") {
          respond(action === "accept");
        } else {
          setStatus("ready");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const respond = async (accepted: boolean) => {
    if (!token) return;
    setResponding(true);
    try {
      await offerApi.respond(token, accepted);
      setStatus(accepted ? "accepted" : "declined");
    } catch {
      setStatus("error");
    }
    setResponding(false);
  };

  if (status === "loading" || responding) {
    return (
      <div style={centeredStyle}>
        <div className="spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(79,70,229,0.2)", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 14px" }} />
        <p style={{ color: "#4f46e5", fontWeight: "600" }}>{responding ? "Processing your response…" : "Loading offer details…"}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={centeredStyle}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Invalid or Expired Link</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>This offer link is no longer valid. Please contact HR for assistance.</p>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div style={centeredStyle}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle size={36} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Welcome Aboard! 🎉</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "360px", textAlign: "center" }}>
          You've accepted the offer for <strong style={{ color: "#111827" }}>{offer?.jobPosting?.title}</strong>.
          Your employee account has been created — check your inbox for login credentials.
        </p>
        <div style={{ marginTop: "24px", padding: "16px 24px", borderRadius: "12px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", margin: 0 }}>The hiring team has been notified. See you on day one! 🚀</p>
        </div>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div style={centeredStyle}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(107,114,128,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <XCircle size={36} color="#6b7280" />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Response Recorded</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "360px", textAlign: "center" }}>
          We've noted that you've declined the offer. Thank you for going through the process — we wish you all the best.
        </p>
      </div>
    );
  }

  // status === "ready" — show offer details with accept/decline
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)", borderRadius: "16px 16px 0 0", padding: "28px 32px" }}>
          <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase" }}>HRMS Platform</p>
          <h1 style={{ margin: 0, color: "#ffffff", fontSize: "22px", fontWeight: "800" }}>🎊 You've received an offer!</h1>
        </div>

        {/* Body */}
        <div style={{ background: "#ffffff", borderRadius: "0 0 16px 16px", padding: "28px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: "15px", color: "#374151", marginBottom: "6px" }}>
            Hi <strong>{offer?.name}</strong>,
          </p>
          <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", marginBottom: "20px" }}>
            After a thorough evaluation, we're delighted to offer you the position below. Please review and respond at your earliest convenience.
          </p>

          {/* Offer card */}
          <div style={{ padding: "20px", borderRadius: "12px", background: "#f8faff", border: "1px solid #e0e7ff", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={18} color="#4f46e5" />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase" }}>Position</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e1b4b" }}>{offer?.jobPosting?.title}</div>
              </div>
            </div>
            {offer?.jobPosting?.department?.name && (
              <div style={{ fontSize: "13px", color: "#6b7280" }}>Department: <strong style={{ color: "#374151" }}>{offer.jobPosting.department.name}</strong></div>
            )}
          </div>

          {/* Buttons */}
          {offer?.offerStatus === "PENDING" ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => respond(true)} disabled={responding}
                style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {responding ? <Loader size={14} className="spin" /> : <CheckCircle size={14} />}
                Accept Offer
              </button>
              <button onClick={() => respond(false)} disabled={responding}
                style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <XCircle size={14} />Decline
              </button>
            </div>
          ) : (
            <div style={{ padding: "14px", borderRadius: "10px", background: offer?.offerStatus === "ACCEPTED" ? "rgba(22,163,74,0.08)" : "rgba(107,114,128,0.08)", textAlign: "center", fontSize: "14px", fontWeight: "700", color: offer?.offerStatus === "ACCEPTED" ? "#16a34a" : "#6b7280" }}>
              {offer?.offerStatus === "ACCEPTED" ? "✅ You have accepted this offer" : "You have declined this offer"}
            </div>
          )}

          <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", marginTop: "16px" }}>
            This offer is valid for 5 business days from the date it was sent.
          </p>
        </div>
      </div>
    </div>
  );
}

const centeredStyle: any = {
  minHeight: "100vh", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", textAlign: "center",
  padding: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f1f5f9",
};

export default function OfferPageWrapper() {
  return (
    <Suspense fallback={<div style={centeredStyle}><Loader size={24} className="spin" /></div>}>
      <OfferPage />
    </Suspense>
  );
}
