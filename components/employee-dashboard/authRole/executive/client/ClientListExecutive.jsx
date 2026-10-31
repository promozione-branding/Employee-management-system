
"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Loading from "@/components/layout/Loading";
import { getEmployeeAssignedClientService } from "@/service/employee-dashboard/employee";
import {
  Building2,
  CalendarDays,
  ChartNetwork,
  Clock,
  ExternalLink,
  Globe,
  BriefcaseBusiness,
  Users,
  Eye,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const ClientListExecutive = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { employee } = useEmployeeStore();

  useEffect(() => {
    let isMounted = true;

    async function getEmployeeClientList() {
      if (!employee?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await getEmployeeAssignedClientService(employee._id);

        if (!isMounted) return;

        if (res?.success) {
          setClients(Array.isArray(res.data) ? res.data : []);
        } else {
          setClients([]);
          toast.error(res?.message || "Unable to load clients.");
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Error fetching assigned clients:", error);
        setClients([]);
        toast.error(
          error?.response?.data?.message ||
            "Error while getting the client list"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getEmployeeClientList();

    return () => {
      isMounted = false;
    };
  }, [employee?._id]);

  const isSEO = employee?.basicDetails?.designation === "SEO";

  // Assigned-client responses may contain the client directly or under clientId.
  const getClient = (item) => item?.clientId || item;

  const getWebsiteUrl = (website) => {
    if (!website || typeof website !== "string") return null;

    const trimmedWebsite = website.trim();
    if (!trimmedWebsite) return null;

    const normalizedWebsite = /^https?:\/\//i.test(trimmedWebsite)
      ? trimmedWebsite
      : `https://${trimmedWebsite}`;

    try {
      const parsedUrl = new URL(normalizedWebsite);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) return null;

      return normalizedWebsite;
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredClients = clients.filter((item) => {
    const client = getClient(item);
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      client?.name,
      client?.company,
      client?.website,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#F2F4F9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5B6478]">
              <Users size={16} />
              <span>Employee Dashboard</span>
              <span className="text-[#A0A7B6]">/</span>
              <span className="text-[#0A2E66]">Clients</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              All Clients
            </h1>

            <p className="mt-1 text-sm text-[#5B6478]">
              View your assigned clients and access their workspaces.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#E3E7F0] bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66]">
              <Building2 size={20} />
            </div>

            <div>
              <p className="text-xs font-medium text-[#5B6478]">
                Assigned clients
              </p>
              <p className="text-xl font-bold leading-tight text-[#0A2E66]">
                {clients.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <section className="overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-sm">
          {/* Table toolbar */}
          <div className="flex flex-col gap-4 border-b border-[#E3E7F0] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F1B33]">
                Client directory
              </h2>
              <p className="mt-1 text-sm text-[#5B6478]">
                {filteredClients.length}{" "}
                {filteredClients.length === 1 ? "client" : "clients"} displayed
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A92A6]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, company, website..."
                aria-label="Search clients"
                className="h-11 w-full rounded-xl border border-[#E3E7F0] bg-[#F7F8FC] pl-10 pr-4 text-sm text-[#0F1B33] outline-none transition placeholder:text-[#8A92A6] focus:border-[#2B5086] focus:bg-white focus:ring-4 focus:ring-[#2B5086]/10"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F7F8FC]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5B6478]">
                    Client
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5B6478]">
                    Company
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5B6478]">
                    Website
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5B6478]">
                    Last updated
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#5B6478]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E9ECF3]">
                {filteredClients.length > 0 ? (
                  filteredClients.map((item) => {
                    const client = getClient(item);
                    const clientId = client?._id;
                    const websiteUrl = getWebsiteUrl(client?.website);

                    return (
                      <tr
                        key={item?._id || clientId}
                        className="group transition-colors hover:bg-[#F7F9FD]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66] transition-colors group-hover:bg-[#DDE8FA]">
                              <Building2 size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#0F1B33]">
                                {client?.name || "Unnamed client"}
                              </p>
                              <p className="mt-1 text-xs text-[#8A92A6]">
                                Client ID: {clientId || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#5B6478]">
                            <Building2
                              size={15}
                              className="shrink-0 text-[#8A92A6]"
                            />
                            <span className="max-w-[200px] truncate">
                              {client?.company || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {websiteUrl ? (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-[220px] items-center gap-1.5 text-sm font-medium text-[#2B5086] transition hover:text-[#F27B1E]"
                              title={client?.website}
                            >
                              <Globe size={15} className="shrink-0" />
                              <span className="truncate">
                                {client?.website}
                              </span>
                              <ExternalLink
                                size={13}
                                className="shrink-0 opacity-60"
                              />
                            </a>
                          ) : (
                            <span className="text-sm text-[#A0A7B6]">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#5B6478]">
                            <CalendarDays
                              size={15}
                              className="shrink-0 text-[#8A92A6]"
                            />
                            {formatDate(client?.updatedAt || item?.updatedAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              href={`/employee-dashboard/clients/client-details/${clientId}`}
                              title="View client details"
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE3EF] bg-white px-3 text-xs font-semibold text-[#0A2E66] transition hover:border-[#0A2E66] hover:bg-[#E9EFF9]"
                            >
                              <Eye size={14} />
                              View
                            </Link>

                            <Link
                              href={`/employee-dashboard/clients/work/${item?._id}`}
                              title="Open client work"
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0A2E66] px-3 text-xs font-semibold text-white transition hover:bg-[#12397A]"
                            >
                              <BriefcaseBusiness size={14} />
                              Work
                              <ArrowUpRight size={13} />
                            </Link>

                            {isSEO && (
                              <Link
                                href={`/employee-dashboard/clients/seo-sheet/${clientId}`}
                                title="View SEO rankings"
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F7D4B8] bg-[#FFF5EB] px-3 text-xs font-semibold text-[#B85A0B] transition hover:border-[#F27B1E] hover:bg-[#FDE8D5]"
                              >
                                <ChartNetwork size={14} />
                                Ranking
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <EmptyState hasSearch={Boolean(search.trim())} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 bg-[#F7F8FC] p-3 md:hidden">
            {filteredClients.length > 0 ? (
              filteredClients.map((item) => {
                const client = getClient(item);
                const clientId = client?._id;
                const websiteUrl = getWebsiteUrl(client?.website);

                return (
                  <article
                    key={item?._id || clientId}
                    className="rounded-xl border border-[#E3E7F0] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66]">
                        <Building2 size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold text-[#0F1B33]">
                          {client?.name || "Unnamed client"}
                        </h3>
                        <p className="mt-1 break-words text-sm text-[#5B6478]">
                          {client?.company || "Company not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-[#E9ECF3] pt-3">
                      <div className="flex items-start gap-2.5">
                        <Globe
                          size={16}
                          className="mt-0.5 shrink-0 text-[#8A92A6]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-[#8A92A6]">
                            Website
                          </p>
                          {websiteUrl ? (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-sm font-medium text-[#2B5086] hover:text-[#F27B1E]"
                            >
                              {client?.website}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-[#8A92A6]">—</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Clock
                          size={16}
                          className="shrink-0 text-[#8A92A6]"
                        />
                        <div>
                          <p className="text-xs font-medium text-[#8A92A6]">
                            Last updated
                          </p>
                          <p className="mt-1 text-sm text-[#5B6478]">
                            {formatDate(client?.updatedAt || item?.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/employee-dashboard/clients/client-details/${clientId}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DCE3EF] bg-white px-3 py-2 text-sm font-semibold text-[#0A2E66] transition hover:bg-[#E9EFF9]"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                      <Link
                        href={`/employee-dashboard/clients/work/${item?._id}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0A2E66] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#12397A]"
                      >
                        <BriefcaseBusiness size={16} />
                        Work
                      </Link>

                      {isSEO && (
                        <Link
                          href={`/employee-dashboard/clients/seo-sheet/${clientId}`}
                          className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#F7D4B8] bg-[#FFF5EB] px-3 py-2 text-sm font-semibold text-[#B85A0B] transition hover:bg-[#FDE8D5]"
                        >
                          <ChartNetwork size={16} />
                          View SEO Rankings
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-[#E3E7F0] bg-white px-4 py-12">
                <EmptyState hasSearch={Boolean(search.trim())} />
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredClients.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-[#E3E7F0] bg-white px-4 py-3 text-xs text-[#8A92A6] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing{" "}
                <span className="font-semibold text-[#0F1B33]">
                  {filteredClients.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#0F1B33]">
                  {clients.length}
                </span>{" "}
                assigned clients
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#17845A]" />
                Client directory
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#2B5086]">
        {hasSearch ? <Search size={22} /> : <Building2 size={22} />}
      </div>
      <p className="text-sm font-semibold text-[#0F1B33]">
        {hasSearch ? "No matching clients" : "No clients assigned yet"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-[#8A92A6]">
        {hasSearch
          ? "Try searching with a different name, company, or website."
          : "Assigned clients will appear here when they become available."}
      </p>
    </div>
  );
}

export default ClientListExecutive;
