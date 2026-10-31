
"use client";

import { myClientService } from "@/service/admin-dashboard/dashboard-api";

import {
  Building2,
  Code2,
  Package,
  Users,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// ========================================
// CLIENT ICONS
// ========================================

const clientIcons = [Building2, Code2, Package];

// ========================================
// MAIN COMPONENT
// ========================================

export const MyClient = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // ========================================
  // FETCH CLIENTS
  // ========================================

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

  // ========================================
  // CLIENT STATUS
  // ========================================

  const getClientStatus = (client) => {
    const proposals = Array.isArray(client?.proposals)
      ? client.proposals
      : [];

    return proposals.length > 0 ? "active" : "pending";
  };

  // ========================================
  // FILTER COUNTS
  // ========================================

  const filterCounts = useMemo(() => {
    const counts = {
      all: clients.length,
      pending: 0,
      active: 0,
      closed: 0,
    };

    clients.forEach((client) => {
      const status = getClientStatus(client);
      counts[status]++;
    });

    return counts;
  }, [clients]);

  // ========================================
  // FILTERED CLIENTS
  // ========================================

  const filteredClients = useMemo(() => {
    if (activeFilter === "all") return clients;

    return clients.filter(
      (client) => getClientStatus(client) === activeFilter
    );
  }, [clients, activeFilter]);

  // ========================================
  // FILTER OPTIONS
  // ========================================

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "closed", label: "Closed" },
  ];

  return (
    <section
      className="
        flex
        h-[410px]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
        transition-shadow
        duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:p-[22px]
      "
    >

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-5 flex shrink-0 items-center gap-3">

        {/* Header icon */}

        <div
          className="
            flex
            h-10 w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#E9EFF9]
            text-[#376BB5]
          "
        >
          <Building2 size={20} strokeWidth={1.9} />
        </div>

        {/* Heading */}

        <div className="min-w-0">

          <h2
            className="
              font-serif
              text-[21px]
              font-bold
              leading-tight
              tracking-tight
              text-[#0A2E66]
            "
          >
            My clients
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-[#56647D]">
            {filterCounts.pending} waiting on you
          </p>

        </div>

      </div>

      {/* ================================== */}
      {/* STATUS FILTERS */}
      {/* ================================== */}

      <div
        className="
          mb-[14px]
          flex
          shrink-0
          flex-wrap
          items-center
          gap-1.5
        "
      >

        {filters.map((filter) => {

          const isActive = activeFilter === filter.id;

          return (

            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
              className={`
                inline-flex
                h-[32px]
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                text-[12px]
                font-semibold
                transition-all
                duration-200
                active:scale-95

                ${
                  isActive
                    ? "border-[#0A2E66] bg-[#0A2E66] text-white"
                    : "border-[#E1E7F0] bg-white text-[#64748B] hover:border-[#C8D6EA] hover:bg-[#F7F8FC]"
                }
              `}
            >

              <span>{filter.label}</span>

              <span
                className={`
                  text-[11px]
                  font-medium
                  ${
                    isActive
                      ? "text-[#D5E1F4]"
                      : "text-[#8491A8]"
                  }
                `}
              >
                {filterCounts[filter.id]}
              </span>

            </button>

          );
        })}

      </div>

      {/* ================================== */}
      {/* CLIENT LIST */}
      {/* ================================== */}

      <div
        className="
          min-h-0
          flex-1
          space-y-2.5
          overflow-x-hidden
          overflow-y-auto
          pr-1

          [&::-webkit-scrollbar]:w-[5px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#DDE4EF]
          hover:[&::-webkit-scrollbar-thumb]:bg-[#AEBBD0]

          [scrollbar-width:thin]
          [scrollbar-color:#DDE4EF_transparent]
        "
      >

        {/* ================================== */}
        {/* LOADING STATE */}
        {/* ================================== */}

        {loading ? (

          <div className="space-y-2.5" aria-label="Loading clients">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="
                  flex
                  h-[75px]
                  animate-pulse
                  items-center
                  gap-3
                  rounded-[16px]
                  border
                  border-[#E1E7F0]
                  px-3.5
                "
              >

                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#E9EFF9]" />

                <div className="min-w-0 flex-1 space-y-2">

                  <div className="h-3.5 w-24 rounded bg-[#F2F4F9]" />

                  <div className="h-3 w-32 rounded bg-[#F2F4F9]" />

                </div>

                <div className="h-7 w-16 rounded-full bg-[#FFF3D9]" />

              </div>

            ))}

          </div>

        ) : filteredClients.length > 0 ? (

          /* ================================== */
          /* CLIENT CARDS */
          /* ================================== */

          filteredClients.map((client) => {

            const originalIndex = clients.findIndex(
              (item) => item._id === client._id
            );

            const ClientIcon =
              clientIcons[
                Math.max(originalIndex, 0) % clientIcons.length
              ];

            const status = getClientStatus(client);

            const isClientActive = status === "active";

            return (

              <Link
                key={client._id}
                href={`/dashboard/customer/${client._id}`}
                className="
                  group
                  flex
                  h-[75px]
                  min-w-0
                  items-center
                  gap-3
                  rounded-[16px]
                  border
                  border-[#E1E7F0]
                  bg-white
                  px-3.5
                  transition-all
                  duration-200
                  hover:border-[#C8D6EA]
                  hover:bg-[#F9FAFD]
                  hover:shadow-[0_4px_12px_rgba(10,46,102,0.05)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#F27B1E]
                  sm:px-3.5
                "
              >

                {/* CLIENT ICON */}

                <div
                  className="
                    flex
                    h-10 w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E9EFF9]
                    text-[#376BB5]
                    transition-colors
                    duration-200
                    group-hover:bg-[#DCE7F7]
                  "
                >
                  <ClientIcon
                    size={19}
                    strokeWidth={1.9}
                  />
                </div>

                {/* CLIENT DETAILS */}

                <div className="min-w-0 flex-1">

                  <h3
                    className="
                      truncate
                      text-[14px]
                      font-semibold
                      leading-5
                      text-[#0F1B33]
                      transition-colors
                      group-hover:text-[#0A2E66]
                    "
                  >
                    {client?.name || "Unnamed Client"}
                  </h3>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[12px]
                      leading-4
                      text-[#56647D]
                    "
                  >
                    {client?.company || "No company"}
                  </p>

                </div>

                {/* STATUS BADGE */}

                <span
                  className={`
                    inline-flex
                    h-[29px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    px-3
                    text-[11px]
                    font-bold
                    transition-colors

                    ${
                      isClientActive
                        ? "bg-[#E5F5EC] text-[#16865D]"
                        : "bg-[#FFF3D9] text-[#B86A00]"
                    }
                  `}
                >
                  {isClientActive ? "Active" : "Pending"}
                </span>

              </Link>

            );
          })

        ) : (

          /* ================================== */
          /* EMPTY STATE */
          /* ================================== */

          <div
            className="
              flex
              min-h-[180px]
              flex-col
              items-center
              justify-center
              rounded-[16px]
              border
              border-dashed
              border-[#E1E7F0]
              bg-[#F7F8FC]
              px-4
              py-8
              text-center
            "
          >

            <div
              className="
                mb-3
                flex
                h-11 w-11
                items-center
                justify-center
                rounded-xl
                bg-[#E9EFF9]
                text-[#376BB5]
              "
            >
              <Users size={22} />
            </div>

            <h3 className="text-[14px] font-semibold text-[#0A2E66]">

              {activeFilter === "all"
                ? "No clients yet"
                : `No ${activeFilter} clients`}

            </h3>

            <p
              className="
                mt-1
                max-w-[230px]
                text-[12px]
                leading-5
                text-[#8491A8]
              "
            >
              {activeFilter === "all"
                ? "Your clients will appear here once they are available in your account."
                : "There are no clients available in this category."}
            </p>

            {activeFilter !== "all" && (

              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="
                  mt-3
                  rounded-lg
                  bg-[#0A2E66]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-[#12397A]
                "
              >
                View all clients
              </button>

            )}

            {activeFilter === "all" && (

              <Link
                href="/dashboard/customer"
                className="
                  mt-3
                  text-xs
                  font-semibold
                  text-[#0A2E66]
                  transition-colors
                  hover:text-[#F27B1E]
                "
              >
                View all clients
              </Link>

            )}

          </div>

        )}

      </div>

    </section>
  );
};

export default MyClient;
