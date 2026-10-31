
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AuthBrandPanel() {
  const [logoError, setLogoError] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <section className="relative flex h-[150px] flex-col overflow-hidden bg-[#10346b] px-6 py-5 text-white sm:px-8 lg:h-full lg:min-h-0 lg:px-12 lg:py-10">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full border border-white/10 lg:top-28"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-28 h-44 w-44 rounded-full border border-white/10 lg:top-36"
      />

      {/* Branding content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md sm:h-12 sm:w-12">
            {!logoError ? (
              <Image
                src="/iblogo.png"
                alt="Inquiry Bazaar logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <span className="text-xl font-black tracking-tight">
                <span className="text-[#10346b]">I</span>
                <span className="text-orange-500">B</span>
              </span>
            )}
          </div>

          <div className="ml-3">
            <p className="text-base font-bold tracking-wide sm:text-lg">
              Inquiry Bazaar
            </p>
            <p className="text-[10px] tracking-[0.2em] text-blue-200 sm:text-xs">
              GROW YOUR BUSINESS
            </p>
          </div>
        </div>

        {/* Main headline */}
        <div className="my-auto py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 sm:text-sm">
            {greeting}!
          </p>

          <h1 className="max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl lg:leading-[1.15]">
            Inquiry se{" "}
            <span className="text-orange-400">INCOME</span> tak!
          </h1>

          <p className="mt-3 hidden max-w-md text-sm leading-6 text-blue-100/80 lg:block lg:text-base">
            Your next business opportunity starts here. Connect with the
            right people, discover new possibilities, and grow with
            Inquiry Bazaar.
          </p>

          {/* Desktop-only growth illustration */}
          <div className="mt-8 hidden items-end gap-2 lg:flex">
            {[36, 54, 43, 72, 60, 88, 75, 100].map((height, index) => (
              <div
                key={index}
                className={`w-5 rounded-t-md ${
                  index % 3 === 0
                    ? "bg-orange-400"
                    : "bg-white/25"
                }`}
                style={{ height: `${height}px` }}
              />
            ))}

            <div className="ml-3 pb-1 text-xs font-medium text-blue-100/80">
              Let's grow together
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="hidden border-t border-white/15 pt-4 text-xs text-blue-100/70 lg:block">
          © {new Date().getFullYear()} Inquiry Bazaar. All rights reserved.
        </div>
      </div>
    </section>
  );
}
