// components/sales-dashboard/client/CallPanel.jsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Clock, Play, Mic } from "lucide-react";
import toast from "react-hot-toast";
import { initiateCallService } from "@/service/calling";

const CallPanel = ({
  customerId,
  customerName = "Customer",
  customerPhone = "—",
  virtualNumber = "—",
  lastCall = null,
  onCallStarted, // callback: parent refreshes history
}) => {
  const [calling, setCalling] = useState(false);

  const handleCall = async () => {
    if (calling) return;
    if (!customerId) {
      toast.error("Customer id missing");
      return;
    }
    try {
      setCalling(true);
      const res = await initiateCallService(customerId);
      if (res.success) {
        toast.success("Call initiated — pick up your phone");
        if (onCallStarted) onCallStarted(res.data);
      } else {
        toast.error(res.message || "Unable to initiate call");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.message || "Unable to initiate call");
    } finally {
      setCalling(false);
    }
  };

  const handleWhatsApp = () => {
    toast.success("WhatsApp coming soon");
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold text-gray-900 leading-tight">
              {customerName}
            </p>
            <p className="text-xs text-gray-500">{customerPhone}</p>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Mic className="h-3.5 w-3.5" />
            Shared line:
          </span>{" "}
          <span className="font-medium text-gray-700">{virtualNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCall}
            disabled={calling}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            {calling ? "Calling..." : "Call Now"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleWhatsApp}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

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