
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { sendOtpService, verifyOTP } from "@/service/auth";

export default function LoginOtpPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [greeting, setGreeting] = useState("Good afternoon");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    };

    updateGreeting();
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    const email = form.email.trim();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await sendOtpService({ email });

      if (res?.success) {
        toast.success(res.message || "OTP sent successfully.");
        setForm({ email });
        setOtp("");
        setStep(2);
      } else {
        toast.error(res?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyOTP({
        email: form.email,
        otp,
      });

      if (res?.success) {
        toast.success(res.message || "Login successful.");

        if (res.token) {
          localStorage.setItem("token", res.token);
        }

        router.push("/dashboard");
      } else {
        toast.error(res?.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);

      toast.error(
        error?.response?.data?.message || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtp("");
    setStep(1);
  };

  return (
    <main className="login-page flex h-dvh w-full flex-col overflow-hidden bg-white text-slate-900 lg:grid lg:grid-cols-[46%_54%]">

      {/* LEFT BRANDING PANEL — SAME AS PASSWORD LOGIN */}
      <section className="login-brand relative flex min-h-0 h-[150px] shrink-0 flex-col overflow-hidden px-5 pb-3 pt-0 text-white sm:h-[170px] sm:px-8 lg:h-dvh lg:px-[9%] lg:pb-8">

        {/* Decorative storefront awning */}
        <div className="awning" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className={
                index % 3 === 0
                  ? "awning-orange"
                  : index % 3 === 1
                    ? "awning-cream"
                    : "awning-blue"
              }
            />
          ))}
        </div>

        {/* Background pattern */}
        <div className="brand-pattern" aria-hidden="true" />

        {/* Logo with IB fallback */}
        <div className="relative z-10 mt-[54px] flex h-[52px] shrink-0 items-center sm:mt-[62px] sm:h-[58px] lg:mt-[100px] lg:h-[90px]">
          {!logoError ? (
            <Image
              src="/iblogo.png"
              alt="Inquiry Bazaar"
              width={250}
              height={100}
              priority
              onError={() => setLogoError(true)}
              className="block h-[48px] w-auto max-w-[190px] object-contain object-left sm:h-[55px] sm:max-w-[220px] lg:h-[90px] lg:max-w-[250px]"
            />
          ) : (
            <div
              role="img"
              aria-label="IB — Inquiry Bazaar"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white shadow-md sm:h-14 sm:w-14 lg:h-[72px] lg:w-[72px]"
            >
              <span className="font-serif text-2xl font-extrabold tracking-tight text-[#10346b] sm:text-3xl lg:text-4xl">
                I<span className="text-orange-500">B</span>
              </span>
            </div>
          )}
        </div>

        {/* Brand headline */}
        <div className="relative z-10 mt-2 lg:mt-[72px]">
          <h1 className="font-serif text-[25px] font-bold leading-tight tracking-tight sm:text-[30px] lg:text-[54px]">
            Inquiry se
            <span className="text-orange-400 lg:block">
              {" "}INCOME tak!
            </span>
          </h1>

          <p className="mt-3 hidden max-w-md text-base leading-7 text-blue-100 lg:block">
            Your leads, follow-ups, quotations and deals,
            all in one place.
          </p>
        </div>

        {/* Growth illustration — desktop only */}
        <div className="relative z-10 mt-auto hidden h-[210px] w-full max-w-[500px] shrink-0 lg:block">
          <div className="absolute inset-x-0 bottom-0 flex h-[165px] items-end justify-between gap-3">
            {[
              { label: "Inquiry", height: "32%", color: "bg-orange-400" },
              { label: "Follow-up", height: "47%", color: "bg-orange-500" },
              { label: "Quotation", height: "63%", color: "bg-orange-500" },
              { label: "Deal", height: "80%", color: "bg-blue-700" },
              { label: "Income", height: "100%", color: "bg-blue-600" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col justify-end"
              >
                <div
                  style={{ height: item.height }}
                  className={`${item.color} flex min-h-[48px] items-start justify-center rounded-t-xl px-1 pt-3 text-center text-[10px] font-bold text-white`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <svg
            viewBox="0 0 520 220"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M35 160 L135 130 L235 96 L335 65 L440 25"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {[
              [35, 160],
              [135, 130],
              [235, 96],
              [335, 65],
              [440, 25],
            ].map(([cx, cy], index) => (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r="5"
                fill={index === 4 ? "#fb923c" : "#173968"}
                stroke="white"
                strokeWidth="2.5"
              />
            ))}

            <path
              d="M430 17 L440 25 L431 33"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="relative z-10 mt-auto hidden shrink-0 pb-1 text-xs text-blue-200 lg:block">
          Leads into relationships. Relationships into revenue.
        </p>
      </section>

      {/* RIGHT OTP PANEL */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-3 sm:px-8 sm:py-4 lg:h-dvh lg:px-10 lg:py-5 xl:px-16">

        <div className="mx-auto flex min-h-0 w-full max-w-[405px] flex-1 flex-col justify-center">

          {/* Greeting */}
          <header className="mb-4 shrink-0 sm:mb-5">
            <h2 className="font-serif text-[29px] font-bold leading-tight tracking-tight text-[#10346b] sm:text-[34px] lg:text-[38px]">
              {greeting}
            </h2>

            <p className="mt-1 text-[13px] text-slate-500 sm:text-sm">
              Sign in to your Inquiry Bazaar workspace.
            </p>
          </header>

          {/* Login method selector */}
          <div className="mb-4 grid shrink-0 grid-cols-2 rounded-xl border border-[#d5dced] bg-[#f2f4f9] p-1">
            <Link
              href="/login"
              className="flex items-center justify-center rounded-[9px] px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#10346b]"
            >
              Password
            </Link>

            <button
              type="button"
              aria-current="page"
              className="rounded-[9px] border border-[#e0e5ef] bg-white px-3 py-2 text-sm font-semibold text-[#10346b] shadow-sm"
            >
              One-time code
            </button>
          </div>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <div className="shrink-0">
              <div className="mb-5">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#10346b]">
                  <Mail className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  Sign in with a one-time code
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Enter your work email address and we&apos;ll send
                  you a verification code.
                </p>
              </div>

              <form
                onSubmit={handleSendOTP}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    Work email
                  </label>

                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ email: e.target.value })
                      }
                      required
                      disabled={loading}
                      className="h-[46px] w-full rounded-xl border border-[#d4dceb] bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#315b96] focus:ring-2 focus:ring-blue-100 sm:h-[48px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-b-[3px] border-orange-500 bg-[#10346b] px-5 py-3 text-sm font-bold text-white shadow-[0_6px_14px_rgba(16,52,107,0.12)] transition hover:bg-[#17427f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send one-time code
                      <Mail className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <div className="shrink-0">
              <div className="mb-5">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#10346b]">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  Check your email
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  We sent a verification code to
                  {" "}
                  <span className="break-all font-semibold text-slate-700">
                    {form.email}
                  </span>
                  . Enter the six-digit code below to sign in.
                </p>
              </div>

              <form
                onSubmit={handleVerifyOTP}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    required
                    disabled={loading}
                    className="h-[52px] w-full rounded-xl border border-[#d4dceb] bg-white px-4 text-center text-xl font-bold tracking-[0.45em] text-[#10346b] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#315b96] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter the code received in your email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-b-[3px] border-orange-500 bg-[#10346b] px-5 py-3 text-sm font-bold text-white shadow-[0_6px_14px_rgba(16,52,107,0.12)] transition hover:bg-[#17427f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify and sign in
                      <ShieldCheck className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4dceb] bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#10346b] disabled:opacity-60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change email address
                </button>
              </form>
            </div>
          )}

          {/* Back to password login */}
          <p className="mt-5 shrink-0 text-center text-sm text-slate-500">
            Prefer using a password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#28538f] hover:text-orange-600"
            >
              Sign in with password
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="mx-auto mt-2 flex w-full max-w-[405px] shrink-0 flex-col gap-0.5 pb-1 text-[10px] leading-4 text-slate-500 sm:text-xs lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <p>Trouble signing in? Contact your team admin.</p>

          <p className="shrink-0">
            © {new Date().getFullYear()} Inquiry Bazaar
          </p>
        </footer>
      </section>

      {/* Styling shared with password login */}
      <style jsx>{`
        .login-brand {
          background: linear-gradient(145deg, #0a2856 0%, #12396f 100%);
        }

        .awning {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          width: 100%;
          height: 42px;
          overflow: hidden;
        }

        .awning span {
          flex: 1 0 22px;
          height: 42px;
          border-radius: 0 0 14px 14px;
          box-shadow: inset -1px 0 rgba(255, 255, 255, 0.12);
        }

        .awning-orange {
          background: #fb923c;
        }

        .awning-cream {
          background: #fff7ed;
        }

        .awning-blue {
          background: #2c507f;
        }

        .brand-pattern {
          position: absolute;
          inset: 42px 0 0;
          opacity: 0.12;
          background-image:
            radial-gradient(
              circle at center,
              #fb923c 0 2px,
              transparent 3px
            ),
            radial-gradient(
              ellipse at center,
              transparent 0 10px,
              #9db9e1 11px 12px,
              transparent 13px
            );
          background-size: 80px 80px;
          background-position: 0 14px;
          mask-image: linear-gradient(to bottom, black, transparent 95%);
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .awning {
            height: 48px;
          }

          .awning span {
            height: 48px;
          }

          .brand-pattern {
            top: 48px;
            inset-inline: 0;
          }
        }

        @media (min-width: 1024px) {
          .awning {
            height: 68px;
          }

          .awning span {
            height: 68px;
            border-radius: 0 0 22px 22px;
          }

          .brand-pattern {
            top: 68px;
          }
        }

        @media (max-height: 650px) {
          .login-brand > div:nth-of-type(3) {
            margin-top: 4px;
          }
        }
      `}</style>
    </main>
  );
}
