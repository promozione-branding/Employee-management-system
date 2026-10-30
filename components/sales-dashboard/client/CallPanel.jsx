// components/sales-dashboard/client/CallPanel.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Clock, Play, Mic, Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { initiateCallService } from "@/service/calling";

// ── small helpers ──
const digits = (n) => String(n || "").replace(/\D/g, "");
const prettyPhone = (n) => {
  const d = digits(n);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return n || "—";
};
const isValidIndian = (d) => /^[6-9]\d{9}$/.test(d);

const CallPanel = ({
  customerId,
  customerName = "Customer",
  customerPhone = "—",
  virtualNumber = "—",
  lastCall = null,
  onCallStarted,
}) => {
  const [calling, setCalling] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState("");

  const [displayName, setDisplayName] = useState(customerName || "Customer");
  const [primaryPhone, setPrimaryPhone] = useState(
    digits(customerPhone) || "",
  );
  const [alternates, setAlternates] = useState([]);

  // ── load name + phones for this customer ──
  const loadPhones = async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`/api/customer/${customerId}/phones`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.name) setDisplayName(data.data.name);
        setPrimaryPhone(digits(data.data.primary) || digits(customerPhone));
        setAlternates(data.data.alternates || []);
      }
    } catch (e) {
      // silently ignore — fall back to props
    }
  };

  useEffect(() => {
    loadPhones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const allNumbers = useMemo(() => {
    const list = [];
    if (primaryPhone) list.push({ value: primaryPhone, label: "Primary" });
    alternates.forEach((p, i) =>
      list.push({ value: digits(p), label: `Alternate ${i + 1}` }),
    );
    return list;
  }, [primaryPhone, alternates]);

  const triggerCall = async (phone) => {
    if (!customerId) return toast.error("Customer id missing");
    try {
      setCalling(true);
      const res = await initiateCallService(customerId, phone || null);
      if (res.success) {
        toast.success("Call initiated — pick up your phone");
        if (onCallStarted) onCallStarted(res.data);
      } else {
        toast.error(res.message || "Unable to initiate call");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to initiate call");
    } finally {
      setCalling(false);
    }
  };

  const handleSaveAndCall = async () => {
    const clean = digits(newPhone);
    if (!isValidIndian(clean)) {
      return toast.error("Enter a valid 10-digit Indian mobile number");
    }
    try {
      setSaving(true);

      // STEP 1 — save the number
      const res = await fetch(`/api/customer/${customerId}/phones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed to add number");
        return;
      }

      // STEP 2 — update local state
      setAlternates(data.data.alternates || []);
      setAddMode(false);
      setNewPhone("");

      // STEP 3 — verify the number is present before calling
      const savedList = (data.data.alternates || []).map(digits);
      if (!savedList.includes(clean)) {
        await loadPhones();
        toast.error(
          "Number saved but not yet confirmed. Please refresh and try calling.",
        );
        return;
      }

      // STEP 4 — call it
      await triggerCall(clean);
    } catch (err) {
      toast.error("Failed to add number");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlternate = async (phone) => {
    if (!window.confirm("Remove this number?")) return;
    try {
      setRemoving(digits(phone));
      const res = await fetch(
        `/api/customer/${customerId}/phones?phone=${digits(phone)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setAlternates(data.data.alternates || []);
        toast.success("Number removed");
      } else {
        toast.error(data.message || "Failed to remove");
      }
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemoving("");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold text-gray-900 leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {primaryPhone ? prettyPhone(primaryPhone) : "—"}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Mic className="h-3.5 w-3.5" />
            Shared line:
          </span>{" "}
          <span className="font-medium text-gray-700">{virtualNumber}</span>
        </div>

        {/* WhatsApp hidden (inactive) — kept for future */}
        {/* <Button
          type="button"
          variant="outline"
          onClick={() => toast.success("WhatsApp coming soon")}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button> */}
      </div>

      {/* ── Numbers list + Add ── */}
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          Numbers — click to call
        </p>

        <div className="flex flex-col gap-1.5">
          {allNumbers.map((n) => {
            const isAlt = n.label.startsWith("Alternate");
            return (
              <div
                key={n.value}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-gray-200"
              >
                <button
                  onClick={() => triggerCall(n.value)}
                  disabled={calling}
                  className="flex items-center gap-2 text-sm text-left flex-1 disabled:opacity-50"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {prettyPhone(n.value)}
                  </span>
                  <span className="text-xs text-gray-500">({n.label})</span>
                </button>
                {isAlt && (
                  <button
                    onClick={() => handleDeleteAlternate(n.value)}
                    disabled={removing === n.value}
                    className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-40"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new number */}
        {!addMode ? (
          <button
            onClick={() => setAddMode(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            <Plus className="h-3.5 w-3.5" /> Add another number
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              value={newPhone}
              onChange={(e) =>
                setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10-digit mobile"
              className="flex-1 border rounded-md px-3 py-1.5 text-sm"
              autoFocus
            />
            <Button
              onClick={handleSaveAndCall}
              disabled={saving || calling}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : "Save & Call"}
            </Button>
            <button
              onClick={() => {
                setAddMode(false);
                setNewPhone("");
              }}
              className="text-gray-400 hover:text-gray-700 p-2"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Last call info ── */}
      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Last call:
        </span>
        {lastCall ? (
          <>
            <span>{lastCall.at}</span>
            <span>·</span>
            <span>{lastCall.duration}</span>
            <span>·</span>
            <span
              className={
                lastCall.status === "Answered"
                  ? "text-emerald-600 font-medium"
                  : "text-red-500 font-medium"
              }
            >
              {lastCall.status}
            </span>
            {lastCall.recordingUrl && (
              <>
                <span>·</span>
                <a
                  href={lastCall.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Play className="h-3.5 w-3.5" />
                  Recording
                </a>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-400">No calls yet</span>
        )}
      </div>
    </div>
  );
};

export default CallPanel;
