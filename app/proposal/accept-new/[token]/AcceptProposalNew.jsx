"use client";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import PdfNew from "@/components/proposalNew/PdfNew";

export default function AcceptProposalNew({ token }) {
  const [step, setStep] = useState("verify");
  const [email, setEmail] = useState("");
  const [phoneLast7, setPhoneLast7] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [proposalData, setProposalData] = useState(null);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [containerHeight, setContainerHeight] = useState("auto");

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const pdfWidth = 794;
      const containerWidth = containerRef.current.clientWidth;
      const newScale = containerWidth / pdfWidth;
      setScale(newScale);
      const pdfHeight = 1123;
      const scaledHeight = pdfHeight * newScale;
      setContainerHeight(`${scaledHeight}px`);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [step]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (phoneLast7.replace(/\D/g, "").length !== 7) return toast.error("Enter exactly 7 digits");
    try {
      setLoading(true);
      
      const resolveRes = await fetch("/api/proposalNew/resolve-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!resolveRes.ok) throw new Error("Invalid link");
      const resolveData = await resolveRes.json();
      if (!resolveData?.success) return toast.error(resolveData?.message || "Invalid link");
      
      const id = resolveData.data._id;
      setProposalId(id);

      const verifyRes = await fetch(`/api/proposalNew/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneLast7, token }),
      });
      if (!verifyRes.ok) throw new Error("Verification failed");
      const verifyData = await verifyRes.json();

      if (verifyData?.success) {
        const fullPropRes = await fetch(`/api/proposalNew/${id}`);
        if (!fullPropRes.ok) throw new Error("Failed to load proposal data");
        const fullPropData = await fullPropRes.json();
        
        if (fullPropData?.success) {
          setProposalData(fullPropData.data);
          toast.success("Verified");
          setStep("terms");
        }
      } else {
        toast.error(verifyData?.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!agreed) return toast.error("Please tick the box to agree");
    setLoading(true);

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/proposalNew/${proposalId}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error("Failed to accept");
        const data = await res.json();
        
        if (data?.success) {
          toast.success("Accepted!");
          setStep("done");
        } else {
          toast.error(data?.message || "Failed to accept");
        }
      } catch (err) {
        toast.error(err.message || "Failed to accept");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 md:py-10 px-2 md:px-4 relative">
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
              <div ref={containerRef} className="w-full bg-gray-200 rounded-lg overflow-y-auto overflow-x-hidden border relative" style={{ height: window.innerWidth < 768 ? "65vh" : "auto", maxHeight: window.innerWidth < 768 ? "65vh" : "none" }}>
                <div style={{ width: "210mm", transform: `scale(${scale})`, transformOrigin: "top left", height: containerHeight }}>
                  <PdfNew proposal={proposalData} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg mb-3">Terms & Conditions</h3>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 md:p-4 text-xs md:text-sm text-gray-700 space-y-2 mb-4 bg-gray-50">
                <p>By accepting this proposal, you agree to the marketing services described and the total amount payable.</p>
                <p>All online content is to be provided by the client.</p>
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

      {loading && step === "terms" && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Accepting Proposal</h3>
            <p className="text-sm text-gray-500">Please wait while we generate your official PDF receipt.</p>
          </div>
        </div>
      )}
    </div>
  );
}
