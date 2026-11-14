// app/dashboard/customer/components/CustomerInfoTab.jsx

"use client";

import React from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getWebsiteUrl = (website) => {
  if (!website) return null;
  const t = website.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

function InfoItem({ icon: Icon, label, value, href }) {
  const hasValue = value !== undefined && value !== null && value !== "";
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5FB] text-[#4779C5]">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#929DB0]">
          {label}
        </p>
        {href && hasValue ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={String(value)}
            className="mt-0.5 flex min-w-0 items-center gap-1 break-all text-sm font-medium text-[#315F9F] hover:underline"
          >
            <span className="truncate">{value}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p
            title={hasValue ? String(value) : undefined}
            className="mt-0.5 break-words text-sm font-medium text-[#263650]"
          >
            {hasValue ? value : "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CustomerInfoTab({ customer }) {
  if (!customer) return null;

  const {
    name,
    company,
    GSTIN,
    phone,
    website,
    Address,
    city,
    state,
    pincode,
    country,
    meetingDate,
    tanNo,
    email,
    SalesPersonName,
    salesExecutive,
  } = customer;

  const salesPerson =
    SalesPersonName || salesExecutive?.[0]?.basicDetails?.name;
  const address = [Address, city, state, pincode, country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E9EDF4] bg-gradient-to-r from-[#F5F8FD] to-white px-4 py-5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5EEFC] text-[#315F9F]">
            <Building2 size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-bold leading-snug text-[#18365F]">
              {name || "Unnamed Customer"}
            </h3>
            <p className="mt-1 break-words text-sm text-[#7B879A]">
              {company || "Company not provided"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-semibold text-[#27834E]">
              <CheckCircle2 size={11} />
              Customer Profile
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <InfoItem
          icon={Mail}
          label="Email Address"
          value={email}
          href={email ? `mailto:${email}` : undefined}
        />
        <InfoItem
          icon={Phone}
          label="Phone Number"
          value={phone}
          href={phone ? `tel:${phone}` : undefined}
        />
        <InfoItem
          icon={Globe}
          label="Website"
          value={website}
          href={getWebsiteUrl(website)}
        />

        <div className="border-t border-dashed border-[#E1E7F0]" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F7F9FC] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929DB0]">
              GSTIN
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-[#34445F]">
              {GSTIN || "Not provided"}
            </p>
          </div>
          <div className="rounded-lg bg-[#F7F9FC] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929DB0]">
              TAN Number
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-[#34445F]">
              {tanNo || "Not provided"}
            </p>
          </div>
        </div>

        <div className="border-t border-dashed border-[#E1E7F0]" />

        <InfoItem
          icon={MapPin}
          label="Business Address"
          value={address || null}
        />

        <div className="rounded-xl border border-[#E8EDF5] bg-[#F8FAFD] p-3.5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8190A6]">
            Account Information
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <UserRound
                size={15}
                className="mt-0.5 shrink-0 text-[#7C8DA7]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#8A96A9]">Sales Person</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[#34445F]">
                  {salesPerson || "Not assigned"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CalendarDays
                size={15}
                className="mt-0.5 shrink-0 text-[#7C8DA7]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#8A96A9]">Meeting Date</p>
                <p className="mt-0.5 text-sm font-semibold text-[#34445F]">
                  {formatDate(meetingDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
