
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import AuthBrandPanel from "../components/AuthBrandPanel";
import { sendOtpService, verifyOTP } from "@/service/auth";

export default function LoginOtpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSendOTP = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await sendOtpService({
        email: normalizedEmail,
      });

      if (res?.success) {
        setEmail(normalizedEmail);
        setOtp("");
        setStep(2);
        toast.success(res?.message || "OTP sent successfully!");
      } else {
        toast.error(res?.message || "Unable to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyOTP({
        email: email.trim(),
        otp,
      });

      if (res?.success) {
        if (res?.token) {
          localStorage.setItem("token", res.token);
        }

        toast.success(res?.message || "Login successful!");

        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res?.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResending(true);

      const res = await sendOtpService({
        email: email.trim(),
      });

      if (res?.success) {
        setOtp("");
        toast.success(res?.message || "A new OTP has been sent.");
      } else {
        toast.error(res?.message || "Unable to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    setStep(1);
    setOtp("");
  };

  return (
    <main className="h-dvh overflow-hidden bg-white">
      <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[46%_54%]">
        {/* Shared branding panel */}
        <AuthBrandPanel />

        {/* OTP form */}
        <section className="flex min-h-0 items-center justify-center overflow-y-auto bg-white px-5 py-5 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile-only heading */}
            <div className="mb-5 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Secure access
              </p>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#10346b]">
                <ShieldCheck size={24} />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {step === 1 ? "Login with OTP" : "Verify your email"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step === 1
                  ? "Enter your registered email address. We'll send you a one-time verification code."
                  : "Enter the 6-digit code sent to your email address to securely sign in."}
              </p>
            </div>

            {/* Login method tabs */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <Link
                href="/login"
                className="flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:text-[#10346b]"
              >
                Password
              </Link>

              <div
                aria-current="page"
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-[#10346b] shadow-sm"
              >
                <ShieldCheck size={16} />
                One-time code
              </div>
            </div>

            {step === 1 ? (
              /* Step 1: Email entry */
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label
                    htmlFor="otp-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="otp-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#10346b] focus:ring-4 focus:ring-blue-900/5 disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10346b] px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#0b2855] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: OTP verification */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#10346b] shadow-sm">
                      <Mail size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500">
                        Verification code sent to
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {email}
                      </p>

                      <button
                        type="button"
                        onClick={handleChangeEmail}
                        disabled={loading || resending}
                        className="mt-2 text-xs font-semibold text-[#10346b] hover:text-orange-500 disabled:opacity-50"
                      >
                        Change email
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Enter 6-digit OTP
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    required
                    disabled={loading}
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-2xl font-bold tracking-[0.5em] text-[#10346b] outline-none transition placeholder:text-slate-300 placeholder:tracking-[0.5em] focus:border-[#10346b] focus:ring-4 focus:ring-blue-900/5 disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Enter the code exactly as received in your email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10346b] px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#0b2855] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign in
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 pt-1 text-sm">
                  <span className="text-slate-500">
                    Didn&apos;t receive the code?
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || resending}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#10346b] transition hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={resending ? "animate-spin" : ""}
                    />
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading || resending}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 transition hover:text-[#10346b] disabled:opacity-50"
                >
                  <ArrowLeft size={15} />
                  Back to email entry
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Secure sign-in to your account
            </div>

            <p className="mt-5 text-center text-[11px] text-slate-400 lg:hidden">
              © {new Date().getFullYear()} Inquiry Bazaar. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
