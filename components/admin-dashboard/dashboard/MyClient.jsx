
"use client";

import { myClientService } from "@/service/admin-dashboard/dashboard-api";
import {
  Building2,
  Code2,
  Globe,
  Palette,
  Rocket,
  Users,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const clientIcons = [Building2, Code2, Globe, Palette, Rocket];

export const MyClient = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchClients() {
    try {
      const res = await myClientService();

      if (res.success) {
        setClients(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error(
        error?.response?.data?.message || "Unable to load clients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <section className="h-full rounded-[20px] border border-[#E3E7F0] bg-white p-5 shadow-[0_4px_18px_rgba(15,27,51,0.04)] sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66]">
            <Users size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#0F1B33]">
              My Clients
            </h2>
            <p className="mt-0.5 text-sm text-[#8A92A6]">
              Your client portfolio
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#FFF1E4] px-3 py-1.5 text-sm font-semibold text-[#F27B1E]">
          {clients.length}
        </span>
      </div>

      <div className="mb-5 h-px bg-[#E3E7F0]" />

      {/* Client list */}
      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3" aria-label="Loading clients">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#E3E7F0] p-4"
              >
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#F2F4F9]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 rounded bg-[#F2F4F9]" />
                    <div className="h-3 w-1/2 rounded bg-[#F2F4F9]" />
                    <div className="h-3 w-3/4 rounded bg-[#F2F4F9]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : clients.length > 0 ? (
          clients.map((client, index) => {
            const ClientIcon = clientIcons[index % clientIcons.length];
            const proposals = Array.isArray(client?.proposals)
              ? client.proposals
              : [];
            const isActive = proposals.length > 0;

            const services = proposals.flatMap((proposal) =>
              Array.isArray(proposal?.services) ? proposal.services : []
            );

            return (
              <Link
                key={client._id}
                href={`/dashboard/customer/${client._id}`}
                className="group block rounded-2xl border border-[#E3E7F0] bg-white p-4 transition-all duration-200 hover:border-[#B8C9E5] hover:bg-[#F9FAFD] hover:shadow-[0_5px_16px_rgba(10,46,102,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27B1E]"
              >
                <div className="flex items-start gap-3">
                  {/* Client icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9EFF9] text-[#0A2E66] transition-colors group-hover:bg-[#0A2E66] group-hover:text-white">
                    <ClientIcon size={20} strokeWidth={1.8} />
                  </div>

                  {/* Client details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-bold text-[#0F1B33]">
                        {client?.name || "Unnamed Client"}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isActive
                            ? "bg-[#E5F5EC] text-[#17845A]"
                            : "bg-[#FFF4D9] text-[#B86A00]"
                        }`}
                      >
                        {isActive ? "Active" : "Pending"}
                      </span>
                    </div>

                    {client?.company && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#5B6478]">
                        <BriefcaseBusiness
                          size={12}
                          className="shrink-0 text-[#8A92A6]"
                        />
                        <span className="truncate">{client.company}</span>
                      </p>
                    )}

                    {client?.email && (
                      <p className="mt-1 truncate text-xs text-[#8A92A6]">
                        {client.email}
                      </p>
                    )}

                    {/* Services */}
                    {services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {services.slice(0, 3).map((service, serviceIndex) => (
                          <span
                            key={service?._id || `${service?.serviceTitle}-${serviceIndex}`}
                            className="rounded-md border border-[#E3E7F0] bg-[#F7F8FC] px-2 py-1 text-[11px] font-medium text-[#5B6478]"
                          >
                            {service?.serviceTitle || "Service"}
                          </span>
                        ))}

                        {services.length > 3 && (
                          <span className="rounded-md bg-[#E9EFF9] px-2 py-1 text-[11px] font-semibold text-[#0A2E66]">
                            +{services.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="mt-1 shrink-0 text-[#8A92A6] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F27B1E]"
                  />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D7DDE9] bg-[#F7F8FC] px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E9EFF9] text-[#0A2E66]">
              <Users size={22} />
            </div>

            <h3 className="text-sm font-semibold text-[#0F1B33]">
              No clients yet
            </h3>
            <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#8A92A6]">
              Your clients will appear here once they are available in your
              account.
            </p>

            <Link
              href="/dashboard/customer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A2E66] transition-colors hover:text-[#F27B1E]"
            >
              View all clients
              <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && clients.length > 0 && (
        <Link
          href="/dashboard/customer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#E3E7F0] px-4 py-3 text-sm font-semibold text-[#0A2E66] transition-colors hover:border-[#0A2E66] hover:bg-[#E9EFF9]"
        >
          View all clients
          <ArrowUpRight size={16} />
        </Link>
      )}
    </section>
  );
};
