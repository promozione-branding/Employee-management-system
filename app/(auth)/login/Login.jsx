
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import AuthBrandPanel from "../components/AuthBrandPanel";
import { loginService } from "@/service/auth";
import { loginFormData } from "@/config/initialFormDate";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    ...loginFormData,
    email: loginFormData?.email ?? "",
    password: loginFormData?.password ?? "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email?.trim();

    if (!email || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginService({
        ...form,
        email,
      });

      if (res?.success) {
        toast.success(res?.message || "Login successful!");

        // Keep the authentication/session handling
        // implemented by your existing login service.
        window.location.href = "/dashboard";
        return;
      }

      toast.error(res?.message || "Unable to log in. Please try again.");
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-dvh overflow-hidden bg-white">
      <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[46%_54%]">
        {/* Shared branding panel */}
        <AuthBrandPanel />

        {/* Login form */}
        <section className="flex min-h-0 items-center justify-center overflow-y-auto bg-white px-5 py-5 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile-only heading */}
            <div className="mb-5 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Welcome back
              </p>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#10346b]">
                <LockKeyhole size={23} />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back!
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to your Inquiry Bazaar account and continue growing
                your business.
              </p>
            </div>

            {/* Login method tabs */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <div
                aria-current="page"
                className="flex items-center justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-[#10346b] shadow-sm"
              >
                Password
              </div>

              <Link
                href="/login-otp"
                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:text-[#10346b]"
              >
                <ShieldCheck size={16} />
                One-time code
              </Link>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
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
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email ?? ""}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#10346b] focus:ring-4 focus:ring-blue-900/5 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#10346b] transition hover:text-orange-500 sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password ?? ""}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#10346b] focus:ring-4 focus:ring-blue-900/5 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Registration link */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#10346b] transition hover:text-orange-500"
              >
                Create account
              </Link>
            </p>

            {/* Security note */}
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
