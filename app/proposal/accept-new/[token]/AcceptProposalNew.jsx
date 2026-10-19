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
  <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="border-b-4 border-amber-400 bg-[#17365d] px-5 py-7 text-center sm:px-8 sm:py-9">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Inquiry Bazaar
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-300">
          Private Limited
        </p>

        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Proposal Acceptance
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {/* Verification Step */}
        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Verify your identity
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Please verify your identity using your registered email
                address and the last 7 digits of your phone number to
                continue with proposal acceptance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="client-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Registered email address
                </label>

                <input
                  id="client-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="client-phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Last 7 digits of your phone number
                </label>

                <input
                  id="client-phone"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 7 digits"
                  value={phoneLast7}
                  onChange={(e) =>
                    setPhoneLast7(
                      e.target.value.replace(/\D/g, "").slice(0, 7)
                    )
                  }
                  maxLength={7}
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm tracking-widest text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#17365d] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue →"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Your details will be verified before you can accept the proposal.
            </p>
          </form>
        )}

        {/* Terms and Conditions Step */}
        {step === "terms" && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-800">
                  📄
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Terms & Conditions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Please review all terms before accepting.
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable terms */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <span className="text-sm font-semibold text-slate-800">
                  Terms of Service
                </span>

                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  12 clauses
                </span>
              </div>

              <div className="max-h-[55vh] space-y-4 overflow-y-auto overscroll-contain p-4 sm:max-h-[480px] sm:space-y-5 sm:p-5">
                {[
                  {
                    title: "Warranty and Accuracy",
                    text: "Inquiry Bazaar Private Limited excludes any warranty, express or implied, as to the quality, accuracy, timeliness, completeness, performance, or fitness for a particular purpose of any of its contents hosted on its servers, unless otherwise specified in writing.",
                  },
                  {
                    title: "Limitation of Liability",
                    text: "Inquiry Bazaar Private Limited will not be liable for any damages, including without limitation damages for loss of business projects or loss of profits, arising in contract, tort, or otherwise from the use of or inability to use any site or any of its contents.",
                  },
                  {
                    title: "Indemnification",
                    text: 'You indemnify Inquiry Bazaar Private Limited against claims, conflicts, or legal proceedings arising out of information, data, text, software, music, sound, photographs, graphics, videos, messages, or any other material ("content") posted on the website or privately transmitted.',
                  },
                  {
                    title: "Legal Compliance",
                    text: "You are responsible for ensuring that material on your site complies with applicable national and international laws.",
                  },
                  {
                    title: "Changes to Terms",
                    text: "Inquiry Bazaar Private Limited reserves the right to add or change these terms and conditions as and when required without giving notice. Changes will be deemed accepted if you continue to use the services.",
                  },
                  {
                    title: "Corporate Profile and Promotional Use",
                    text: "Corporate profiles prepared by third-party agencies will be a compilation of information about your organization. Inquiry Bazaar Private Limited will be authorized to use this information for promotional purposes.",
                  },
                  {
                    title: "Refund Policy",
                    text: "Refund of any amount is at the sole discretion of the company.",
                  },
                  {
                    title: "Annual Service Plans",
                    text: "Inquiry Bazaar Private Limited may have the option to convert your service to an annual service plan. If you are unable to pay the outstanding amount, you may need to discontinue the service plan.",
                  },
                  {
                    title: "Service Features",
                    text: "Inquiry Bazaar Private Limited reserves the right to add, modify, or discontinue features offered with a service.",
                  },
                  {
                    title: "Call Monitoring",
                    text: "To ensure excellent customer service, your calls may be monitored or recorded.",
                  },
                  {
                    title: "Discounts and Early Discontinuation",
                    text: "Any discounts offered are subject to continuation of service for the subscribed period. Early discontinuation will lead to charges as per applicable rates.",
                  },
                  {
                    title: "Acceptance and Online Terms",
                    text: "By accepting this document, you agree to these terms and to the Terms & Conditions of Use available on the official Inquiry Bazaar website.",
                  },
                ].map((term, index) => (
                  <div
                    key={term.title}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#17365d] ring-1 ring-blue-100">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-5 text-slate-900">
                        {term.title}
                      </h3>

                      <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
                        {term.text}
                      </p>

                      {index === 11 && (
                        <a
                          href="https://www.inquirybazaar.com/terms-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
                        >
                          Read full Terms & Conditions
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <p className="text-xs leading-5 text-slate-500">
                  Please scroll through and review all 12 clauses before
                  confirming your acceptance.
                </p>
              </div>
            </div>

            {/* Acceptance checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/30">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-800"
              />

              <span className="text-sm leading-6 text-slate-700">
                I have read and understood the above Terms & Conditions,
                including the{" "}
                <a
                  href="https://www.inquirybazaar.com/terms-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  online Terms & Conditions
                </a>
                , and agree to them and accept this proposal.
              </span>
            </label>

            {/* Accept button */}
            <button
              type="button"
              onClick={handleAccept}
              disabled={!agreed || loading}
              className="w-full rounded-xl bg-[#17365d] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Accepting Proposal..." : "Accept Proposal →"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Please ensure you have reviewed the terms before proceeding.
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === "done" && (
          <div className="py-6 text-center sm:py-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-10 w-10 text-emerald-600"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              Thank you!
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              Your proposal acceptance has been received successfully.
              A confirmation email has been sent to your inbox, and our
              team will reach out shortly.
            </p>

            <div className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                ✓ Proposal acceptance completed
              </p>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Thank you for choosing Inquiry Bazaar Private Limited.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 text-center sm:px-8">
        <p className="text-sm font-semibold text-slate-700">
          Inquiry Bazaar Private Limited
        </p>

        <a
          href="https://www.inquirybazaar.com/terms-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-blue-700"
        >
          Terms & Conditions
        </a>

        <p className="mt-3 text-xs text-slate-400">
          © {new Date().getFullYear()} Inquiry Bazaar. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);

}
