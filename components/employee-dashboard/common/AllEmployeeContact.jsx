// components/employee-dashboard/common/AllEmployeeContact.jsx

"use client";

import { useEffect, useState } from "react";
import { allEmployeeContactService } from "@/service/employee-dashboard/dashboard";
import {
  Mail,
  Phone,
  UsersRound,
  ArrowUpRight,
  ContactRound,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AllEmployeeContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchContacts() {
      try {
        const res = await allEmployeeContactService();

        if (!cancelled && res?.success) {
          setContacts(res?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch employee contacts:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchContacts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)] lg:h-[68vh]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <UsersRound size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
              Employee Contacts
            </h2>
            <p className="mt-0.5 text-xs text-[#8A92A6]">
              Connect with your team
            </p>
          </div>
        </div>

        {!loading && (
          <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
            {contacts.length} {contacts.length === 1 ? "Member" : "Members"}
          </span>
        )}
      </div>

      {/* Contacts */}
      <div className="max-h-[556px] min-h-0 flex-1 overflow-y-auto p-4 sm:px-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#E9EDF4] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <Skeleton height={16} width="65%" />
                    <Skeleton height={12} width="42%" className="mt-2" />
                    <Skeleton height={12} width="85%" className="mt-3" />
                    <Skeleton height={12} width="60%" className="mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
              <ContactRound size={22} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No contacts found
            </h3>

            <p className="mt-1 max-w-52 text-xs leading-5 text-[#929BAD]">
              Employee contact information will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((employee) => {
              const details = employee?.basicDetails || {};
              const name = details.name || "Unnamed employee";
              const email = details.email;
              const phone = details.phone;

              return (
                <article
                  key={employee._id}
                  className="group rounded-xl border border-[#E9EDF4] bg-white p-3.5 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-[#FAFBFD] hover:shadow-[0_4px_14px_rgba(15,27,51,0.04)] sm:p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Employee details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#26344D] transition-colors group-hover:text-[#0A2E66]">
                            {name}
                          </h3>

                          <p className="mt-0.5 truncate text-xs text-[#929BAD]">
                            {details.designation || "Team member"}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-[#B0B8C7] transition-colors group-hover:text-[#F27B1E]"
                        />
                      </div>

                      <div className="mt-3 space-y-2">
                        {email ? (
                          <a
                            href={`mailto:${email}`}
                            title={email}
                            className="flex min-w-0 items-center gap-2 text-xs text-[#526078] transition-colors hover:text-[#0A2E66]"
                          >
                            <Mail
                              size={14}
                              className="shrink-0 text-[#F27B1E]"
                            />
                            <span className="truncate">{email}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-[#A0A8B8]">
                            <Mail size={14} className="shrink-0" />
                            <span>Email not available</span>
                          </div>
                        )}

                        {phone ? (
                          <a
                            href={`tel:${phone}`}
                            title={String(phone)}
                            className="flex items-center gap-2 text-xs text-[#526078] transition-colors hover:text-[#0A2E66]"
                          >
                            <Phone
                              size={14}
                              className="shrink-0 text-[#0A2E66]"
                            />
                            <span className="truncate">{phone}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-[#A0A8B8]">
                            <Phone size={14} className="shrink-0" />
                            <span>Phone not available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-[#EDF0F5] px-4 py-3 text-[11px] text-[#929BAD] sm:px-5">
        <UsersRound size={13} />
        <span>Team directory</span>
        <span className="ml-auto font-medium text-[#0A2E66]">
          {loading ? "Loading..." : "Contact details"}
        </span>
      </div>
    </div>
  );
};

export default AllEmployeeContact;
