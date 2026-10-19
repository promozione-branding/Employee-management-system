"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import PdfNew from "@/components/proposalNew/PdfNew";

export default function AcceptProposalNew({ token }) {
  const [step, setStep] = useState("verify"); 
  const [email, setEmail] = useState("");
  const [phoneLast7, setPhoneLast7] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [proposalData, setProposalData] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (phoneLast7.replace(/\D/g, "").length !== 7) return toast.error("Enter exactly 7 digits");
    try {
      setLoading(true);
      const resolveRes = await axios.post("/api/proposalNew/resolve-token", { token });
      if (!resolveRes.data?.success) return toast.error("Invalid link");
      const id = resolveRes.data.data._id;
      setProposalId(id);

      const res = await axios.post(`/api/proposalNew/${id}/verify`, { email, phoneLast7, token });
      if (res.data?.success) { 
        const fullPropRes = await axios.get(`/api/proposalNew/${id}`);
        if (fullPropRes.data?.success) {
          setProposalData(fullPropRes.data.data);
          toast.success("Verified"); 
          setStep("terms"); 
        }
      } else {
        toast.error(res.data?.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  const handleAccept = () => {
    if (!agreed) return toast.error("Please tick the box to agree");
    
    setLoading(true);
    
    // ✅ Force a tiny delay so the browser can paint the loading overlay before the heavy API request blocks the thread
    setTimeout(async () => {
      try {
        const res = await axios.post(`/api/proposalNew/${proposalId}/accept`, { token });
        if (res.data?.success) { 
          toast.success("Accepted!"); 
          setStep("done"); 
        } else {
          toast.error(res.data?.message || "Failed");
        }
      } catch (err) {
        toast.error("Failed to accept");
      } finally { 
        setLoading(false); 
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 md:py-10 px-2 md:px-4 relative">
      {/* ✅ FIXED: PDF Scaling and Container Height */}
      <style>{`
        .pdf-viewer-wrapper {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          background: #e5e7eb;
          border-radius: 8px;
          position: relative;
        }
        @media (max-width: 768px) {
          .pdf-viewer-wrapper {
            /* 297mm (A4 height) * 0.45 scale = ~133mm. Converted to vh/vw for mobile */
            height: 75vw; 
            overflow-y: auto;
            align-items: flex-start;
          }
          .pdf-scale-inner {
            transform: scale(0.45);
            transform-origin: top center;
            width: 210mm;
          }
        }
        @media (min-width: 769px) {
          .pdf-viewer-wrapper {
            padding: 20px 0;
            height: auto;
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inquiry Bazaar Pvt Ltd</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Proposal Acceptance Portal</p>
        </div>

        {step === "verify" && (
          <div className="bg-white rounded-2xl shadow-lg max-w-lg mx-auto p-6">
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <p className="text-sm text-gray-700">Enter your registered email and the last 7 digits of your phone number to verify.</p>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
              <input type="text" placeholder="Last 7 digits of phone" value={phoneLast7} onChange={(e) => setPhoneLast7(e.target.value.replace(/\D/g, "").slice(0, 7))} maxLength={7} className="w-full border rounded-md px-3 py-2" required />
              <button type="submit" disabled={loading} className="bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 disabled:opacity-50">
                {loading ? "Verifying…" : "Verify"}
              </button>
            </form>
          </div>
        )}

        {step === "terms" && proposalData && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-2 md:p-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 px-2">Proposal Preview</h2>
              <div className="pdf-viewer-wrapper border">
                <div className="pdf-scale-inner origin-top transform">
                  <PdfNew proposal={proposalData} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg mb-3">Terms & Conditions</h3>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 md:p-4 text-xs md:text-sm text-gray-700 space-y-2 mb-4 bg-gray-50">
                <p>By accepting this proposal, you agree to the marketing services described and the total amount payable as shown in the proposal document above.</p>
                <p>All online content including text & pictures are to be provided by the client. Inquiry Bazaar shall not be liable for any claims arising out of content posted.</p>
                <p>Work on services shall commence only after clearance of cheque/pay order.</p>
              </div>
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer mb-4">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 accent-blue-700 shrink-0" />
                <span>I have reviewed the proposal PDF and I agree to the Terms & Conditions.</span>
              </label>
              <button type="button" onClick={handleAccept} disabled={!agreed} className="w-full bg-blue-900 text-white rounded-md py-3 text-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
                Accept Proposal
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="bg-white rounded-2xl shadow-lg max-w-lg mx-auto p-10 text-center flex flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
            <p className="text-gray-600">Your proposal has been accepted. A confirmation email with the attached PDF has been sent to your inbox.</p>
          </div>
        )}
      </div>

      {/* ✅ FIXED: Full-Screen Loading Overlay */}
      {loading && step === "terms" && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Accepting Proposal</h3>
            <p className="text-sm text-gray-500">Please wait while we generate your official PDF receipt and send the confirmation email.</p>
            <p className="text-xs text-gray-400 mt-4">This may take a few seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
}
