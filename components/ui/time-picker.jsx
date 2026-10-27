// components/ui/time-picker.jsx

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Circular alarm-style time picker.
 * External value: "HH:mm" (24h) or "" (unset)
 * onChange emits "HH:mm" (24h) or "".
 */
export default function TimePicker({ value = "", onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour"); // "hour" | "minute"
  const [hour12, setHour12] = useState(12);
  const [minute, setMinute] = useState(0);
  const [meridiem, setMeridiem] = useState("AM");
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // ---- sync external value -> internal state ----
  useEffect(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) {
      setHour12(12);
      setMinute(0);
      setMeridiem("AM");
      return;
    }
    const [hStr, mStr] = value.split(":");
    const h24 = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h24) || Number.isNaN(m)) return;
    const mer = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    setHour12(h12);
    setMinute(m);
    setMeridiem(mer);
  }, [value]);

  // ---- emit 24h value up ----
  const emit = (h12, m, mer) => {
    let h24 = h12 % 12;
    if (mer === "PM") h24 += 12;
    onChange?.(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  // ---------- geometry ----------
  const SIZE = 260;
  const CENTER = SIZE / 2;
  const OUTER_RADIUS = 100;
  const INNER_RADIUS = 62;

  const hours = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], []);
  const minutes = useMemo(
    () => [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    [],
  );

  const currentNumbers = mode === "hour" ? hours : minutes;
  const currentValue = mode === "hour" ? hour12 : minute;

  const angleFor = (num, list) => {
    const idx = list.indexOf(num);
    return (idx / list.length) * 360;
  };
  const currentAngle = angleFor(currentValue, currentNumbers);

  const handTip = (() => {
    const rad = ((currentAngle - 90) * Math.PI) / 180;
    return {
      x: CENTER + INNER_RADIUS * Math.cos(rad),
      y: CENTER + INNER_RADIUS * Math.sin(rad),
    };
  })();

  const handleClockClick = (e) => {
    const svg = e.currentTarget.querySelector("svg");
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    const list = mode === "hour" ? hours : minutes;
    const idx = Math.round((deg / 360) * list.length) % list.length;
    const picked = list[idx];

    if (mode === "hour") {
      setHour12(picked);
      emit(picked, minute, meridiem);
      setMode("minute");
    } else {
      setMinute(picked);
      emit(hour12, picked, meridiem);
    }
  };

  const display = useMemo(
    () =>
      `${String(hour12).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )} ${meridiem}`,
    [hour12, minute, meridiem],
  );

  // ---------- close on outside click / Esc ----------
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (
        !panelRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ---------- smart positioning (stays on screen) ----------
  const POP_W = 300;
  const POP_H = 420; // approx panel height (header + clock + footer)
  const MARGIN = 8;

  const [pos, setPos] = useState({ top: 0, left: 0, placement: "bottom" });

  const computePosition = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - r.bottom - MARGIN;
    const spaceAbove = r.top - MARGIN;

    // Prefer below; flip above only if below doesn't fit AND above has more room
    let placement = "bottom";
    if (spaceBelow < POP_H && spaceAbove > spaceBelow) placement = "top";

    let top;
    if (placement === "bottom") {
      top = r.bottom + MARGIN;
    } else {
      top = r.top - POP_H - MARGIN;
    }

    // Final clamp so it never goes off-screen vertically
    if (top < MARGIN) top = MARGIN;
    if (top + POP_H > vh - MARGIN) top = vh - POP_H - MARGIN;

    // Horizontal clamp
    let left = r.left;
    if (left + POP_W > vw - MARGIN) left = vw - POP_W - MARGIN;
    if (left < MARGIN) left = MARGIN;

    setPos({ top, left, placement });
  };

  useEffect(() => {
    if (!open) return;
    computePosition();
    const onScrollOrResize = () => computePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setMode("hour");
        }}
        className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? display : "Select time"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              width: POP_W,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-baseline gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("hour")}
                  className={`rounded-lg px-2.5 py-1 text-[28px] font-semibold leading-none transition ${
                    mode === "hour"
                      ? "bg-slate-900 text-white"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {String(hour12).padStart(2, "0")}
                </button>
                <span className="text-[28px] font-semibold leading-none text-slate-300">
                  :
                </span>
                <button
                  type="button"
                  onClick={() => setMode("minute")}
                  className={`rounded-lg px-2.5 py-1 text-[28px] font-semibold leading-none transition ${
                    mode === "minute"
                      ? "bg-slate-900 text-white"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {String(minute).padStart(2, "0")}
                </button>
              </div>

              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {["AM", "PM"].map((mer) => (
                  <button
                    key={mer}
                    type="button"
                    onClick={() => {
                      setMeridiem(mer);
                      emit(hour12, minute, mer);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      meridiem === mer
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mer}
                  </button>
                ))}
              </div>
            </div>

            {/* clock face */}
            <div className="px-5 pt-5 pb-3">
              <div
                className="mx-auto select-none"
                style={{ width: SIZE, height: SIZE }}
                onClick={handleClockClick}
              >
                <svg width={SIZE} height={SIZE} className="cursor-pointer">
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={OUTER_RADIUS + 22}
                    fill="#f8fafc"
                  />
                  <line
                    x1={CENTER}
                    y1={CENTER}
                    x2={handTip.x}
                    y2={handTip.y}
                    stroke="#0f172a"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <circle cx={CENTER} cy={CENTER} r={4} fill="#0f172a" />

                  {currentNumbers.map((n) => {
                    const a =
                      (angleFor(n, currentNumbers) - 90) * (Math.PI / 180);
                    const x = CENTER + OUTER_RADIUS * Math.cos(a);
                    const y = CENTER + OUTER_RADIUS * Math.sin(a);
                    const selected = currentValue === n;
                    return (
                      <g key={n}>
                        <circle
                          cx={x}
                          cy={y}
                          r={16}
                          fill={selected ? "#0f172a" : "transparent"}
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="14"
                          fontWeight="600"
                          fill={selected ? "#ffffff" : "#475569"}
                          style={{ userSelect: "none", pointerEvents: "none" }}
                        >
                          {mode === "hour" ? n : String(n).padStart(2, "0")}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                }}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}