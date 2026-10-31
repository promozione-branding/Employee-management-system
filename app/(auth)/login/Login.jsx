
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import { loginService } from "@/service/auth";
import { loginFormData } from "@/config/initialFormDate";

export default function LoginPage() {
  const [form, setForm] = useState({ ...loginFormData });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.email || !form.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginService(form);

      if (res?.success) {
        toast.success(res.message || "User logged in successfully");
        setForm({ ...loginFormData });
        window.location.href = "/dashboard";
      } else {
        toast.error(res?.message || "Unable to sign in.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || "Error while login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page flex h-dvh w-full flex-col overflow-hidden bg-white text-slate-900 lg:grid lg:grid-cols-[46%_54%]">

      {/* Branding panel */}
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

        {/* Logo with automatic IB fallback */}
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

      {/* Login panel */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-3 sm:px-8 sm:py-4 lg:h-dvh lg:px-10 lg:py-5 xl:px-16">

        <div className="mx-auto flex min-h-0 w-full max-w-[405px] flex-1 flex-col justify-center">

          {/* Dynamic greeting */}
          <header className="mb-3 shrink-0 sm:mb-4">
            <h2 className="font-serif text-[29px] font-bold leading-tight tracking-tight text-[#10346b] sm:text-[34px] lg:text-[38px]">
              {greeting}
            </h2>

            <p className="mt-1 text-[13px] text-slate-500 sm:text-sm">
              Sign in to your Inquiry Bazaar workspace.
            </p>
          </header>

          {/* Login method selector */}
          <div className="mb-3 grid shrink-0 grid-cols-2 rounded-xl border border-[#d5dced] bg-[#f2f4f9] p-1 sm:mb-4">
            <button
              type="button"
              className="rounded-[9px] border border-[#e0e5ef] bg-white px-3 py-2 text-sm font-semibold text-[#10346b] shadow-sm"
              aria-current="page"
            >
              Password
            </button>

            <Link
              href="/login-otp"
              className="flex items-center justify-center rounded-[9px] px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#10346b]"
            >
              One-time code
            </Link>
          </div>

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 flex-col gap-3 sm:gap-4"
          >
            {/* Email */}
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
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                  className="h-[45px] w-full rounded-xl border border-[#d4dceb] bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#315b96] focus:ring-2 focus:ring-blue-100 sm:h-[48px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#28538f] hover:text-orange-600 sm:text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password || ""}
                  onChange={handleChange}
                  required
                  className="h-[45px] w-full rounded-xl border border-[#d4dceb] bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#315b96] focus:ring-2 focus:ring-blue-100 sm:h-[48px]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#10346b]"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex w-fit cursor-pointer items-center gap-2 text-[13px] text-slate-700 sm:text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-[#10346b]"
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-b-[3px] border-orange-500 bg-[#10346b] px-5 py-3 text-sm font-bold text-white shadow-[0_6px_14px_rgba(16,52,107,0.12)] transition hover:bg-[#17427f] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-3 shrink-0 text-[13px] text-slate-500 sm:mt-4 sm:text-sm">
            New team member?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#28538f] hover:text-orange-600"
            >
              Create your account
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

      {/* Page styling */}
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
