"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function AcceptProposalNew({ token }) {
  const [step, setStep] = useState("verify");
  const [email, setEmail] = useState("");
  const [phoneLast7, setPhoneLast7] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposalId, setProposalId] = useState("");

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
      if (res.data?.success) { toast.success("Verified"); setStep("terms"); }
      else toast.error(res.data?.message || "Verification failed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  const handleAccept = async () => {
    if (!agreed) return toast.error("Please accept terms");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Bazaar Pvt Ltd</h1>
          <p className="text-sm text-gray-500 mt-1">Proposal Acceptance</p>
        </div>
        {step === "verify" && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">Enter your registered email and the last 7 digits of your phone number to verify.</p>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
            <input type="text" placeholder="Last 7 digits of phone" value={phoneLast7} onChange={(e) => setPhoneLast7(e.target.value.replace(/\D/g, "").slice(0, 7))} maxLength={7} className="w-full border rounded-md px-3 py-2" required />
            <button type="submit" disabled={loading} className="bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 disabled:opacity-50">{loading ? "Verifying…" : "Verify"}</button>
          </form>
        )}
        {step === "terms" && (
          <div className="flex flex-col gap-4">
            <div className="max-h-72 overflow-y-auto border rounded-md p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Terms & Conditions</p>
              <p>By accepting this proposal, you agree to the marketing services described and the total amount payable as shown in the proposal document.</p>
              <p>All online content including text & pictures are to be provided by the client. Inquiry Bazaar shall not be liable for any claims arising out of content posted.</p>
              <p>Work on services shall commence only after clearance of cheque/pay order.</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-700" />
              <span>I agree to the Terms & Conditions and accept this proposal.</span>
            </label>
            <button type="button" onClick={handleAccept} disabled={!agreed || loading} className="bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 disabled:opacity-50">{loading ? "Accepting…" : "Accept Proposal"}</button>
          </div>
        )}
        {step === "done" && (
          <div className="text-center flex flex-col gap-3">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-xl font-bold text-gray-900">Thank you!</h2>
            <p className="text-sm text-gray-600">A confirmation email has been sent to your inbox. Our team will reach out shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
