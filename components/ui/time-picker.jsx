// components/ui/time-picker.jsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Time picker with hour (01-12), minute (00-59) and AM/PM.
 * External value: "HH:mm" 24-hour string (same shape your forms already use).
 * Empty string => picker shows placeholder.
 */
export default function TimePicker({ value = "", onChange, className = "" }) {
  const [hour12, setHour12] = useState("");
  const [minute, setMinute] = useState("");
  const [meridiem, setMeridiem] = useState("AM");

  // Sync from parent 24h value -> 12h display
  useEffect(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) {
      setHour12("");
      setMinute("");
      setMeridiem("AM");
      return;
    }
    const [hStr, mStr] = value.split(":");
    const h24 = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h24) || Number.isNaN(m)) return;

    const suffix = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    setHour12(String(h12).padStart(2, "0"));
    setMinute(String(m).padStart(2, "0"));
    setMeridiem(suffix);
  }, [value]);

  function commit(nextHour12, nextMinute, nextMeridiem) {
    // If either hour or minute missing, emit "" (same "not set" the old input had)
    if (!nextHour12 || nextMinute === "") {
      onChange?.("");
      return;
    }
    const h12 = parseInt(nextHour12, 10);
    const m = parseInt(nextMinute, 10);
    if (Number.isNaN(h12) || Number.isNaN(m)) {
      onChange?.("");
      return;
    }
    let h24 = h12 % 12;
    if (nextMeridiem === "PM") h24 += 12;
    const hh = String(h24).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    onChange?.(`${hh}:${mm}`);
  }

  function onHourChange(e) {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (raw !== "") {
      const n = parseInt(raw, 10);
      if (n > 12) raw = "12";
      if (n === 0) raw = "12";
    }
    setHour12(raw);
    commit(raw, minute, meridiem);
  }

  function onHourBlur() {
    if (hour12 && hour12.length === 1) {
      const padded = hour12.padStart(2, "0");
      setHour12(padded);
      commit(padded, minute, meridiem);
    }
  }

  function onMinuteChange(e) {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (raw !== "") {
      const n = parseInt(raw, 10);
      if (n > 59) raw = "59";
    }
    setMinute(raw);
    commit(hour12, raw, meridiem);
  }

  function onMinuteBlur() {
    if (minute === "") return;
    const padded = minute.padStart(2, "0");
    setMinute(padded);
    commit(hour12, padded, meridiem);
  }

  function toggleMeridiem(next) {
    setMeridiem(next);
    commit(hour12, minute, next);
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="HH"
        value={hour12}
        onChange={onHourChange}
        onBlur={onHourBlur}
        className="w-14 text-center"
        maxLength={2}
        aria-label="Hour"
      />
      <span className="text-sm text-muted-foreground">:</span>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={minute}
        onChange={onMinuteChange}
        onBlur={onMinuteBlur}
        className="w-14 text-center"
        maxLength={2}
        aria-label="Minute"
      />
      <div className="ml-1 flex overflow-hidden rounded-md border">
        <button
          type="button"
          onClick={() => toggleMeridiem("AM")}
          className={`px-2 py-1.5 text-xs font-medium transition ${
            meridiem === "AM"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => toggleMeridiem("PM")}
          className={`px-2 py-1.5 text-xs font-medium transition ${
            meridiem === "PM"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
}
