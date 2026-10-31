
"use client";

import { teamMemberService } from "@/service/admin-dashboard/dashboard-api";

import {
  UsersRound,
  UserRound,
  ArrowUpRight,
  Users,
  Search,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ========================================
// DEPARTMENT CONFIGURATION
// ========================================

const DEPARTMENTS = {
  sales: {
    label: "Sales",
    bg: "#FFF1E5",
    color: "#F27B1E",
  },
  web: {
    label: "Web developer",
    bg: "#E9EFF9",
    color: "#376BB5",
  },
  seo: {
    label: "SEO",
    bg: "#E5F5EC",
    color: "#16865D",
  },
  ads: {
    label: "Ad",
    bg: "#EDE9FC",
    color: "#7050E8",
  },
  other: {
    label: "Employee",
    bg: "#F2F4F9",
    color: "#56647D",
  },
};

// ========================================
// AVATAR COLORS
// ========================================

const AVATAR_COLORS = [
  "#C93608",
  "#F47B20",
  "#087C99",
  "#BD4F00",
  "#0A2E66",
  "#2C528B",
  "#16865D",
  "#7050A8",
];

// ========================================
// HELPERS
// ========================================

const getDepartment = (designation = "") => {
  const value = designation.toLowerCase();

  if (value.includes("sales")) return "sales";

  if (
    value.includes("web") ||
    value.includes("developer")
  ) {
    return "web";
  }

  if (value.includes("seo")) return "seo";

  if (
    value.includes("ads") ||
    value.includes("advertising")
  ) {
    return "ads";
  }

  return "other";
};

const getInitials = (name = "Employee") => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

// ========================================
// MAIN COMPONENT
// ========================================

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeDepartment, setActiveDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ========================================
  // FETCH EMPLOYEES
  // ========================================

  async function fetchEmployee() {
    try {
      const res = await teamMemberService();

      if (res?.success) {
        const formattedEmployees = (res?.data || []).map(
          (employee, index) => ({
            _id: employee?._id,

            name:
              employee?.basicDetails?.name || "Employee",

            designation:
              employee?.basicDetails?.designation || "Employee",

            profileImage:
              employee?.basicDetails?.profileImage || null,

            // Use online status only if the API provides it.
            isOnline:
              employee?.isOnline ??
              employee?.basicDetails?.isOnline ??
              false,

            avatarColor:
              AVATAR_COLORS[index % AVATAR_COLORS.length],
          })
        );

        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  // ========================================
  // DEPARTMENT COUNTS
  // ========================================

  const departmentCounts = useMemo(() => {
    const counts = {
      all: employees.length,
      sales: 0,
      web: 0,
      seo: 0,
      ads: 0,
    };

    employees.forEach((employee) => {
      const department = getDepartment(employee.designation);

      if (counts[department] !== undefined) {
        counts[department]++;
      }
    });

    return counts;
  }, [employees]);

  // ========================================
  // ONLINE COUNT
  // ========================================

  const onlineCount = useMemo(() => {
    return employees.filter((employee) => employee.isOnline).length;
  }, [employees]);

  // ========================================
  // FILTER EMPLOYEES
  // ========================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const department = getDepartment(employee.designation);

      const matchesDepartment =
        activeDepartment === "all" ||
        department === activeDepartment;

      const matchesSearch =
        employee.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        employee.designation
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesDepartment && matchesSearch;
    });
  }, [employees, activeDepartment, searchQuery]);

  // ========================================
  // FILTER CONFIGURATION
  // ========================================

  const filters = [
    {
      id: "all",
      label: "All",
      count: departmentCounts.all,
    },
    {
      id: "sales",
      label: "Sales",
      count: departmentCounts.sales,
    },
    {
      id: "web",
      label: "Web developers",
      count: departmentCounts.web,
    },
    {
      id: "seo",
      label: "SEO",
      count: departmentCounts.seo,
    },
    {
      id: "ads",
      label: "Ads",
      count: departmentCounts.ads,
    },
  ];

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <section className="
        h-full min-w-0
        overflow-hidden
        rounded-[22px]
        border border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.04)]
        sm:p-6
      ">

        <div className="mb-6 flex items-center gap-3">

          <Skeleton
            height={40}
            width={40}
            borderRadius={12}
          />

          <div>
            <Skeleton height={21} width={150} />
            <Skeleton height={14} width={190} />
          </div>

        </div>

        <div className="mb-5 flex gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton
              key={item}
              height={33}
              width={75}
              borderRadius={30}
            />
          ))}
        </div>

        <div className="
          grid grid-cols-2
          gap-2.5
          sm:grid-cols-3
          lg:grid-cols-4
          2xl:grid-cols-6
        ">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="
                flex min-w-0
                flex-col items-center
                rounded-[17px]
                border border-[#E1E7F0]
                p-3
              "
            >
              <Skeleton circle height={52} width={52} />

              <Skeleton
                height={13}
                width={85}
                className="mt-3"
              />

              <Skeleton
                height={21}
                width={65}
                borderRadius={20}
                className="mt-2"
              />
            </div>
          ))}
        </div>

      </section>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <section className="
      h-full min-w-0
      overflow-hidden
      rounded-[22px]
      border border-[#E1E7F0]
      bg-white
      p-5
      shadow-[0_3px_12px_rgba(10,46,102,0.04)]
      transition-shadow duration-300
      hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
      sm:p-[22px]
    ">

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="
        mb-5
        flex items-center
        justify-between gap-3
      ">

        <div className="flex min-w-0 items-center gap-3">

          {/* Header icon */}
          <div className="
            flex h-10 w-10
            shrink-0 items-center
            justify-center
            rounded-xl
            bg-[#FFF1E5]
            text-[#F27B1E]
          ">
            <UsersRound
              size={20}
              strokeWidth={1.9}
            />
          </div>

          {/* Heading */}
          <div className="min-w-0">

            <h2 className="
              font-serif
              text-[21px]
              font-bold
              leading-tight
              tracking-tight
              text-[#0A2E66]
            ">
              Team members
            </h2>

            <p className="
              mt-1
              text-[13px]
              leading-5
              text-[#56647D]
            ">
              {onlineCount} online now, {employees.length} in the organization
            </p>

          </div>

        </div>

        {/* View all */}
        <Link
          href="/dashboard/employee"
          className="
            inline-flex h-[34px]
            shrink-0 items-center
            gap-1
            rounded-[11px]
            border border-[#E1E7F0]
            bg-[#F7F8FC]
            px-3
            text-[13px]
            font-bold
            text-[#0A2E66]
            transition-all duration-200
            hover:border-[#C8D6EA]
            hover:bg-[#E9EFF9]
          "
        >
          View all
        </Link>

      </div>

      {/* ================================== */}
      {/* FILTERS + SEARCH */}
      {/* ================================== */}

      <div className="
        mb-[17px]
        flex flex-col
        gap-3
        xl:flex-row
        xl:items-center
        xl:justify-between
      ">

        {/* Department filters */}
        <div className="
          flex min-w-0
          flex-wrap items-center
          gap-1.5
        ">

          {filters.map((filter) => {

            const isActive =
              activeDepartment === filter.id;

            return (

              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setActiveDepartment(filter.id)
                }
                aria-pressed={isActive}
                className={`
                  inline-flex h-[33px]
                  shrink-0 items-center
                  gap-1.5
                  rounded-full
                  border
                  px-3
                  text-[12px]
                  font-medium
                  transition-all duration-200
                  active:scale-95

                  ${
                    isActive
                      ? "border-[#0A2E66] bg-[#0A2E66] text-white"
                      : "border-[#E1E7F0] bg-white text-[#56647D] hover:border-[#C8D6EA] hover:bg-[#F7F8FC]"
                  }
                `}
              >
                <span>{filter.label}</span>

                <span className={`
                  text-[11px]
                  ${
                    isActive
                      ? "text-[#D5E1F4]"
                      : "text-[#8491A8]"
                  }
                `}>
                  {filter.count}
                </span>

              </button>

            );
          })}

        </div>

        {/* Search */}
        <div className="
          relative
          w-full
          xl:w-[220px]
          xl:shrink-0
        ">

          <Search
            size={16}
            className="
              pointer-events-none
              absolute left-3
              top-1/2
              -translate-y-1/2
              text-[#A0AABD]
            "
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Find a teammate"
            aria-label="Find a teammate"
            className="
              h-[36px]
              w-full
              rounded-[11px]
              border border-[#E1E7F0]
              bg-white
              pl-9 pr-3
              text-[13px]
              text-[#0F1B33]
              outline-none
              placeholder:text-[#8491A8]
              transition-all duration-200
              focus:border-[#376BB5]
              focus:ring-2
              focus:ring-[#376BB5]/10
            "
          />

        </div>

      </div>

      {/* ================================== */}
      {/* EMPLOYEE GRID */}
      {/* ================================== */}

      {filteredEmployees.length > 0 ? (

        <div className="
          grid
          grid-cols-2
          gap-2.5
          sm:grid-cols-3
          lg:grid-cols-4
          2xl:grid-cols-6
        ">

          {filteredEmployees.map((employee) => {

            const department = getDepartment(
              employee.designation
            );

            const badge = DEPARTMENTS[department];

            const employeeHref =
              employee.designation === "SALES"
                ? `/dashboard/employee/employee-details/sales/${employee._id}`
                : `/dashboard/employee/employee-details/${employee._id}`;

            return (

              <Link
                href={employeeHref}
                key={employee._id}
                className="
                  group relative
                  flex min-w-0
                  min-h-[137px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[17px]
                  border border-[#E1E7F0]
                  bg-white
                  px-2
                  py-3
                  text-center
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-[#D5DFEE]
                  hover:shadow-[0_7px_16px_rgba(10,46,102,0.10)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#F27B1E]
                  focus-visible:ring-offset-2
                "
              >

                {/* Online status */}
                <span
                  className={`
                    absolute right-[13px]
                    top-[13px]
                    h-[10px] w-[10px]
                    rounded-full
                    border border-white
                    ${
                      employee.isOnline
                        ? "bg-[#16865D]"
                        : "bg-[#C9CED9]"
                    }
                  `}
                  title={
                    employee.isOnline
                      ? "Online"
                      : "Offline"
                  }
                />

                {/* Avatar */}
                <div
                  className="
                    relative
                    mb-2.5
                    flex h-[52px]
                    w-[52px]
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    text-white
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                  style={{
                    backgroundColor: employee.avatarColor,
                  }}
                >

                  {employee.profileImage ? (

                    <Image
                      src={employee.profileImage}
                      alt={employee.name}
                      fill
                      sizes="52px"
                      className="
                        object-cover
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                    />

                  ) : (

                    <span className="
                      text-[17px]
                      font-bold
                      tracking-tight
                      text-white
                    ">
                      {getInitials(employee.name)}
                    </span>

                  )}

                </div>

                {/* Employee name */}
                <h3 className="
                  w-full
                  truncate
                  px-1
                  text-[13px]
                  font-semibold
                  leading-5
                  text-[#0F1B33]
                  transition-colors
                  group-hover:text-[#0A2E66]
                ">
                  {employee.name}
                </h3>

                {/* Department badge */}
                <span
                  className="
                    mt-1.5
                    max-w-full
                    truncate
                    rounded-full
                    px-2.5
                    py-[4px]
                    text-[10px]
                    font-bold
                    leading-[14px]
                  "
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>

              </Link>

            );
          })}

        </div>

      ) : (

        /* ================================== */
        /* EMPTY STATE */
        /* ================================== */

        <div className="
          flex min-h-[190px]
          flex-col
          items-center
          justify-center
          rounded-[17px]
          border border-dashed
          border-[#E1E7F0]
          bg-[#F7F8FC]
          px-4 py-8
          text-center
        ">

          <div className="
            mb-3
            flex h-12 w-12
            items-center justify-center
            rounded-2xl
            bg-[#FFF1E5]
            text-[#F27B1E]
          ">
            <UsersRound size={23} />
          </div>

          <h3 className="
            text-sm font-semibold
            text-[#0A2E66]
          ">
            {searchQuery || activeDepartment !== "all"
              ? "No matching teammates"
              : "No team members found"}
          </h3>

          <p className="
            mt-1
            max-w-xs
            text-xs
            leading-5
            text-[#8491A8]
          ">
            {searchQuery || activeDepartment !== "all"
              ? "Try another search or select a different department."
              : "Employee profiles will appear here once team members are available."}
          </p>

          {(searchQuery || activeDepartment !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveDepartment("all");
              }}
              className="
                mt-3
                rounded-lg
                bg-[#0A2E66]
                px-4 py-2
                text-xs
                font-semibold
                text-white
                transition-colors
                hover:bg-[#12397A]
              "
            >
              Clear filters
            </button>
          )}

          {!searchQuery && activeDepartment === "all" && (
            <Link
              href="/dashboard/employee"
              className="
                mt-4
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-[#0A2E66]
                px-4 py-2.5
                text-xs
                font-semibold
                text-white
                transition-colors
                hover:bg-[#082451]
              "
            >
              View employees
              <ArrowUpRight size={14} />
            </Link>
          )}

        </div>

      )}

    </section>
  );
};

export default Employees;
