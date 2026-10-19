"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import PdfNew from "@/components/proposalNew/PdfNew";

export default function AcceptProposalNew({ token }) {
  const [step, setStep] = useState("verify"); // verify | terms | done
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
      // 1. Resolve token to ID
      const resolveRes = await axios.post("/api/proposalNew/resolve-token", { token });
      if (!resolveRes.data?.success) return toast.error("Invalid link");
      const id = resolveRes.data.data._id;
      setProposalId(id);

      // 2. Verify identity
      const res = await axios.post(`/api/proposalNew/${id}/verify`, { email, phoneLast7, token });
      if (res.data?.success) { 
        // Fetch full proposal to show the PDF preview
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

  const handleAccept = async () => {
    if (!agreed) return toast.error("Please tick the box to agree");
    try {
      setLoading(true);
      const res = await axios.post(`/api/proposalNew/${proposalId}/accept`, { token });
      if (res.data?.success) { toast.success("Accepted!"); setStep("done"); }
      else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error("Failed to accept");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Bazaar Pvt Ltd</h1>
          <p className="text-sm text-gray-600 mt-1">Proposal Acceptance Portal</p>
        </div>

        {/* STEP 1: VERIFY */}
        {step === "verify" && (
          <div className="bg-white rounded-2xl shadow-lg max-w-lg mx-auto p-6">
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <p className="text-sm text-gray-700">Enter your registered email and the last 7 digits of your phone number to verify.</p>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
              <input type="text" placeholder="Last 7 digits of phone" value={phoneLast7} onChange={(e) => setPhoneLast7(e.target.value.replace(/\D/g, "").slice(0, 7))} maxLength={7} className="w-full border rounded-md px-3 py-2" required />
              <button type="submit" disabled={loading} className="bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 disabled:opacity-50">{loading ? "Verifying…" : "Verify"}</button>
            </form>
          </div>
        )}

        {/* STEP 2: PREVIEW PDF & T&C */}
        {step === "terms" && proposalData && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
              <h2 className="text-xl font-bold mb-4 px-2">Proposal Preview</h2>
              {/* Render the PDF visually on the page */}
              <div className="flex justify-center">
                <div className="scale-90 origin-top transform">
                   <PdfNew proposal={proposalData} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg mb-3">Terms & Conditions</h3>
              <div className="max-h-48 overflow-y-auto border rounded-md p-4 text-sm text-gray-700 space-y-2 mb-4 bg-gray-50">
                <p>By accepting this proposal, you agree to the marketing services described and the total amount payable as shown in the proposal document above.</p>
                <p>All online content including text & pictures are to be provided by the client. Inquiry Bazaar shall not be liable for any claims arising out of content posted.</p>
                <p>Work on services shall commence only after clearance of cheque/pay order.</p>
              </div>
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer mb-4">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 accent-blue-700" />
                <span>I have reviewed the proposal PDF and I agree to the Terms & Conditions.</span>
              </label>
              <button type="button" onClick={handleAccept} disabled={!agreed || loading} className="w-full bg-blue-900 text-white rounded-md py-3 text-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
                {loading ? "Accepting…" : "Accept Proposal"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === "done" && (
          <div className="bg-white rounded-2xl shadow-lg max-w-lg mx-auto p-10 text-center flex flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
            <p className="text-gray-600">Your proposal has been accepted. A confirmation email with the attached PDF has been sent to your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
}
