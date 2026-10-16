// app/not-found.js


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">
      {/* Background Effects */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <SearchX size={38} className="text-blue-400" strokeWidth={1.5} />
        </div>

        {/* Error Code */}
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.4em] text-blue-400">
          Error 404
        </p>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Lost your way?
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
          Oops! The page you’re looking for doesn’t exist, may have been moved,
          or the link might be incorrect. Don’t worry, let’s get you back on
          track.
        </p>

        {/* Decorative Divider */}
        <div className="mx-auto my-8 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-slate-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="h-px w-12 bg-slate-700" />
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
          >
            <ArrowLeft size={18} />
            Go to Previous Page
          </button>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-slate-500">
          Lost in space? It happens. Let’s find your way back.
        </p>

        <p className="mt-2 text-xs font-medium tracking-widest text-slate-600">
          PAGE NOT FOUND
        </p>
      </div>
    </main>
  );
}
