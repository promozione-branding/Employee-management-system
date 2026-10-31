"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Eye,
  Network,
  SquarePen,
  Trash2,
  Search,
  X,
  Download,
  Users,
  Wallet,
  Clock3,
  TriangleAlert,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CommonForm from "@/components/layout/Form";
import { addCustomerFormControl } from "@/config/data";
import { initalCustomerFormData } from "@/config/initialFormDate";

import {
  createCustomerServices,
  editCustomerServices,
  deleteCustomerServices,
  getAllCustomerServices,
  getCustomerServices,
  getAllSalesService,
} from "@/service/customer";

import { searchClientService } from "@/service/customer/search";

const LIMIT = 20;

const avatarColors = [
  "bg-[#17845A]",
  "bg-[#6A4FD6]",
  "bg-[#2B5086]",
  "bg-[#C46A2D]",
  "bg-[#087E8B]",
];

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initalCustomerFormData);
  const [editingId, setEditingId] = useState(null);
  const [fetchSales, setFetchSales] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [executiveFilter, setExecutiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch sales executives
  const fetchSalesPerson = useCallback(async () => {
    try {
      const res = await getAllSalesService();

      if (res.success) {
        setFetchSales(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch sales executives:", error);
    }
  }, []);

  // Fetch customers
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = debouncedSearch
        ? await searchClientService(debouncedSearch, page, isPaid)
        : await getAllCustomerServices(page, LIMIT, isPaid);

      if (res.success) {
        setCustomers(Array.isArray(res.data) ? res.data : []);
        setTotalPages(
          res.pagination?.pages || res.pagination?.totalPages || 1
        );
        setSelectedCustomers([]);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch clients.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, isPaid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSalesPerson();
  }, [fetchSalesPerson]);

  // Sales executive form control
  const salesPersonControl = {
    label: "salesExecutive",
    name: "salesExecutive",
    componentType: "select",
    options: fetchSales.map(({ basicDetails, _id }) => ({
      id: _id,
      label: basicDetails?.name,
    })),
  };

  const customerFormControls = [
    ...addCustomerFormControl,
    salesPersonControl,
  ];

  // Filter currently loaded customers by sales executive
  const visibleCustomers = useMemo(() => {
    if (executiveFilter === "all") {
      return customers;
    }

    return customers.filter((customer) =>
      customer.salesExecutive?.some(
        (executive) => executive._id === executiveFilter
      )
    );
  }, [customers, executiveFilter]);

  // Summary cards reflect the currently loaded API page
  const stats = useMemo(() => {
    const paid = customers.filter((customer) => customer.isPaid).length;

    const missingPhone = customers.filter(
      (customer) => !String(customer.phone || "").trim()
    ).length;

    return {
      all: customers.length,
      paid,
      pending: customers.length - paid,
      missingPhone,
    };
  }, [customers]);

  // Create or update customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const control of customerFormControls) {
      if (
        ![
          "tanNo",
          "notes",
          "website",
          "meetingDate",
          "email",
          "isPaid",
        ].includes(control.name) &&
        !formData[control.name]
      ) {
        toast.error(`Please fill ${control.label}`);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        isPaid: formData.isPaid === "Paid",
      };

      const res = editingId
        ? await editCustomerServices(editingId, payload)
        : await createCustomerServices(payload);

      if (res.success) {
        toast.success(res.message || "Saved successfully.");
        resetForm();
        await fetchData();
      }
    } catch (error) {
      if (error.response?.data?.errors?.length) {
        error.response.data.errors.forEach((item) =>
          toast.error(item.message)
        );
      } else {
        toast.error(
          error.response?.data?.message || "Something went wrong."
        );
      }
    }
  };

  // Edit customer
  const handleEdit = async (id) => {
    try {
      const res = await getCustomerServices(id);

      if (res.success) {
        const customerData = res.data;

        setFormData({
          ...customerData,
          isPaid: customerData.isPaid ? "Paid" : "Unpaid",
        });

        setEditingId(id);
        setOpen(true);
      }
    } catch (error) {
      console.error("Failed to load customer:", error);
      toast.error("Failed to load client.");
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      const res = await deleteCustomerServices(id);

      if (res.success) {
        toast.success(res.message || "Client deleted.");
        await fetchData();
      }
    } catch {
      toast.error("Failed to delete client.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initalCustomerFormData);
    setEditingId(null);
    setOpen(false);
  };

  // Open create form
  const openCreateForm = () => {
    setFormData(initalCustomerFormData);
    setEditingId(null);
    setOpen(true);
  };

  // Select individual customer
  const toggleCustomer = (id, checked) => {
    setSelectedCustomers((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((item) => item !== id)
    );
  };

  // Select all visible customers
  const toggleAllCustomers = (checked) => {
    setSelectedCustomers(
      checked ? visibleCustomers.map((customer) => customer._id) : []
    );
  };

  // Export currently visible customers
  const exportCSV = () => {
    if (!visibleCustomers.length) {
      toast.error("There are no clients to export.");
      return;
    }

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "Name",
      "Company",
      "Phone",
      "Email",
      "Sales Executive",
      "Payment",
    ];

    const rows = visibleCustomers.map((customer) => [
      customer.name,
      customer.company,
      customer.phone,
      customer.email,
      customer.salesExecutive
        ?.map((executive) => executive.basicDetails?.name)
        .filter(Boolean)
        .join(", "),
      customer.isPaid ? "Paid" : "Pending",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "clients.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  // Summary cards
  const statCards = [
    {
      label: "All clients",
      value: stats.all,
      icon: Users,
      iconBg: "bg-[#E9EFF9]",
      iconColor: "text-[#386DB5]",
      active: true,
    },
    {
      label: "Paid",
      value: stats.paid,
      icon: Wallet,
      iconBg: "bg-[#E5F5EC]",
      iconColor: "text-[#17845A]",
    },
    {
      label: "Payment pending",
      value: stats.pending,
      icon: Clock3,
      iconBg: "bg-[#FFF4D9]",
      iconColor: "text-[#C57900]",
    },
    {
      label: "Numbers to fix",
      value: stats.missingPhone,
      icon: TriangleAlert,
      iconBg: "bg-[#FCEAE8]",
      iconColor: "text-[#CC3B32]",
    },
  ];

  // Client avatar
  const CustomerAvatar = ({ customer, index }) => (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${
        avatarColors[index % avatarColors.length]
      }`}
    >
      {(customer.name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );

  // Client action buttons
  const ActionButtons = ({ customer }) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/dashboard/customer/work/${customer._id}`}
        title="Client work"
        aria-label="Client work"
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#E9EFF9] hover:text-[#0A2E66]"
      >
        <Network size={19} />
      </Link>

      <Link
        href={`/dashboard/customer/${customer._id}`}
        title="View client"
        aria-label="View client"
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#E9EFF9] hover:text-[#0A2E66]"
      >
        <Eye size={19} />
      </Link>

      <button
        type="button"
        onClick={() => handleEdit(customer._id)}
        title="Edit client"
        aria-label="Edit client"
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#FFF1E4] hover:text-[#F27B1E]"
      >
        <SquarePen size={19} />
      </button>

      <button
        type="button"
        onClick={() => handleDelete(customer._id)}
        title="Delete client"
        aria-label="Delete client"
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#FCEAE8] hover:text-[#CC3B32]"
      >
        <Trash2 size={19} />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen space-y-6 bg-[#3f71e7] p-3 sm:p-5 lg:p-7">
      {/* Page header: title and actions on separate rows */}
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1B33] sm:text-4xl">
            Clients
          </h1>

          <p className="mt-2 text-sm text-[#000000] sm:text-base">
            Manage your clients, sales executives, and payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={exportCSV}
            className="h-12 gap-2 rounded-xl border-[#E0E5EF] bg-white px-4 font-semibold text-[#0F1B33] hover:bg-[#F7F8FC]"
          >
            <Download size={18} />
            Export CSV
          </Button>

          <Button
            type="button"
            onClick={openCreateForm}
            className="h-12 gap-2 rounded-xl bg-[#F27B1E] px-5 font-semibold text-white shadow-sm hover:bg-[#DF6B12]"
          >
            <Plus size={20} />
            Add client
          </Button>
        </div>
      </header>

      {/* Summary cards: single row on desktop */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={`flex min-h-[112px] items-center gap-4 rounded-[20px] border bg-white p-5 shadow-[0_4px_12px_rgba(15,27,51,0.04)] transition sm:p-6 ${
                stat.active
                  ? "border-[#F27B1E] ring-2 ring-[#F27B1E]/15"
                  : "border-[#E3E7F0]"
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor}`}
              >
                <Icon size={25} strokeWidth={1.9} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#68738A] sm:text-base">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-extrabold leading-none tracking-tight text-[#0F1B33]">
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Client management section */}
      <section className="overflow-hidden rounded-[22px] border border-[#E3E7F0] bg-white shadow-[0_4px_18px_rgba(15,27,51,0.04)]">
        {/* Search and filters */}
        <div className="flex flex-col gap-3 border-b border-[#E3E7F0] p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:max-w-[480px]">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A92A6]"
              />

              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, company or phone"
                className="h-12 rounded-xl border-[#E0E5EF] bg-white pl-11 pr-10 text-sm text-[#0F1B33] placeholder:text-[#8A92A6] focus-visible:ring-[#F27B1E]"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#8A92A6] hover:text-[#0F1B33]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={executiveFilter}
              onChange={(event) => setExecutiveFilter(event.target.value)}
              aria-label="Filter by sales executive"
              className="h-12 w-full rounded-xl border border-[#E0E5EF] bg-white px-4 text-sm text-[#0F1B33] outline-none transition focus:border-[#F27B1E] sm:max-w-[235px]"
            >
              <option value="all">All executives</option>

              {fetchSales.map((executive) => (
                <option key={executive._id} value={executive._id}>
                  {executive.basicDetails?.name || "Unnamed executive"}
                </option>
              ))}
            </select>

            <label className="flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#E0E5EF] px-3 text-sm font-medium text-[#5B6478]">
              <Checkbox
                checked={isPaid}
                onCheckedChange={(checked) => {
                  setIsPaid(checked === true);
                  setPage(1);
                }}
                className="border-[#C8D0DF] data-[state=checked]:border-[#0A2E66] data-[state=checked]:bg-[#0A2E66]"
              />
              Paid only
            </label>
          </div>

          {/* List / grid toggle */}
          <div className="flex h-12 w-fit shrink-0 items-center gap-1 self-end rounded-xl border border-[#E0E5EF] bg-[#F7F8FC] p-1 lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              title="List view"
              className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                viewMode === "list"
                  ? "bg-white text-[#0A2E66] shadow-sm ring-1 ring-[#E3E7F0]"
                  : "text-[#68738A] hover:text-[#0A2E66]"
              }`}
            >
              <List size={20} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              title="Grid view"
              className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white text-[#0A2E66] shadow-sm ring-1 ring-[#E3E7F0]"
                  : "text-[#68738A] hover:text-[#0A2E66]"
              }`}
            >
              <LayoutGrid size={19} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <p className="text-sm text-[#68738A]">
            Showing{" "}
            <span className="font-semibold text-[#0F1B33]">
              {visibleCustomers.length}
            </span>{" "}
            clients on this page
          </p>

          {selectedCustomers.length > 0 && (
            <span className="rounded-lg bg-[#E9EFF9] px-3 py-1.5 text-xs font-semibold text-[#0A2E66]">
              {selectedCustomers.length} selected
            </span>
          )}
        </div>

        {/* List view */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-y border-[#E3E7F0] bg-[#F7F8FC] text-xs font-bold text-[#5B6478] sm:text-sm">
                  <th className="w-14 px-5 py-4">
                    <Checkbox
                      checked={
                        visibleCustomers.length > 0 &&
                        visibleCustomers.every((customer) =>
                          selectedCustomers.includes(customer._id)
                        )
                      }
                      onCheckedChange={toggleAllCustomers}
                      aria-label="Select all clients on this page"
                    />
                  </th>

                  <th className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      Client
                      <ArrowUpDown
                        size={13}
                        className="text-[#F27B1E]"
                      />
                    </span>
                  </th>

                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Sales executive</th>
                  <th className="px-4 py-4">Payment</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E3E7F0]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-4 py-5">
                          <div className="h-5 animate-pulse rounded-md bg-[#F2F4F9]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : visibleCustomers.length > 0 ? (
                  visibleCustomers.map((customer, index) => (
                    <tr
                      key={customer._id}
                      className="group transition-colors hover:bg-[#F9FAFD]"
                    >
                      <td className="px-5 py-4">
                        <Checkbox
                          checked={selectedCustomers.includes(customer._id)}
                          onCheckedChange={(checked) =>
                            toggleCustomer(customer._id, checked === true)
                          }
                          aria-label={`Select ${customer.name || "client"}`}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex min-w-[190px] items-center gap-3">
                          <CustomerAvatar
                            customer={customer}
                            index={index}
                          />

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#0F1B33]">
                              {customer.name || "Unnamed client"}
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-sm text-[#68738A]">
                              {customer.company || "No company added"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone}`}
                            className="whitespace-nowrap text-sm font-semibold text-[#0F1B33] hover:text-[#F27B1E]"
                          >
                            {customer.phone}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCEAE8] px-2.5 py-1 text-xs font-semibold text-[#CC3B32]">
                            <TriangleAlert size={13} />
                            Missing
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex max-w-[230px] flex-wrap gap-1.5">
                          {customer.salesExecutive?.length ? (
                            customer.salesExecutive.map((executive) => (
                              <span
                                key={executive._id}
                                className="inline-flex items-center gap-2 rounded-full bg-[#FFF1E4] py-1 pl-1 pr-3 text-xs font-semibold text-[#0F1B33]"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#087E8B] text-[10px] font-bold text-white">
                                  {(
                                    executive.basicDetails?.name || "SE"
                                  )
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </span>

                                {executive.basicDetails?.name || "Executive"}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-[#8A92A6]">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${
                            customer.isPaid
                              ? "bg-[#E5F5EC] text-[#17845A]"
                              : "bg-[#FFF4D9] text-[#B86A00]"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              customer.isPaid
                                ? "bg-[#17845A]"
                                : "bg-[#B86A00]"
                            }`}
                          />

                          {customer.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <ActionButtons customer={customer} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#0A2E66]">
                        <Users size={25} />
                      </div>

                      <p className="mt-4 font-semibold text-[#0F1B33]">
                        No clients found
                      </p>

                      <p className="mt-1 text-sm text-[#8A92A6]">
                        Try a different search or change your filters.
                      </p>

                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => setSearchInput("")}
                          className="mt-3 text-sm font-semibold text-[#0A2E66] hover:text-[#F27B1E]"
                        >
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-2xl bg-[#F2F4F9]"
                  />
                ))}
              </div>
            ) : visibleCustomers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCustomers.map((customer, index) => (
                  <article
                    key={customer._id}
                    className="rounded-2xl border border-[#E3E7F0] bg-white p-5 transition hover:border-[#B8C9E5] hover:shadow-[0_5px_16px_rgba(10,46,102,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar
                          customer={customer}
                          index={index}
                        />

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-[#0F1B33]">
                            {customer.name || "Unnamed client"}
                          </h3>

                          <p className="mt-1 truncate text-sm text-[#68738A]">
                            {customer.company || "No company added"}
                          </p>
                        </div>
                      </div>

                      <Checkbox
                        checked={selectedCustomers.includes(customer._id)}
                        onCheckedChange={(checked) =>
                          toggleCustomer(customer._id, checked === true)
                        }
                        aria-label={`Select ${customer.name || "client"}`}
                      />
                    </div>

                    <div className="mt-5 space-y-3 border-t border-[#E3E7F0] pt-4">
                      <div className="flex items-center gap-2 text-sm text-[#5B6478]">
                        <Phone size={15} />
                        {customer.phone || "Phone not provided"}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#5B6478]">
                        <Building2 size={15} />

                        <span className="truncate">
                          {customer.salesExecutive
                            ?.map((executive) => executive.basicDetails?.name)
                            .filter(Boolean)
                            .join(", ") || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            customer.isPaid
                              ? "bg-[#E5F5EC] text-[#17845A]"
                              : "bg-[#FFF4D9] text-[#B86A00]"
                          }`}
                        >
                          {customer.isPaid ? "Paid" : "Payment pending"}
                        </span>

                        <ActionButtons customer={customer} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-[#8A92A6]">
                No clients found.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <footer className="flex flex-col gap-3 border-t border-[#E3E7F0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-[#68738A]">
            Page{" "}
            <span className="font-semibold text-[#0F1B33]">{page}</span> of{" "}
            <span className="font-semibold text-[#0F1B33]">
              {totalPages}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((previous) => Math.max(1, previous - 1))
              }
              className="h-10 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              className="h-10 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </footer>
      </section>

      {/* Create / edit client drawer */}
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            resetForm();
          } else {
            setOpen(true);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto border-l border-[#E3E7F0] bg-white p-5 sm:max-w-xl sm:p-7">
          <div className="mb-6 border-b border-[#E3E7F0] pb-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1E4] text-[#F27B1E]">
              {editingId ? <SquarePen size={23} /> : <Plus size={24} />}
            </div>

            <h2 className="text-2xl font-bold text-[#0F1B33]">
              {editingId ? "Edit client" : "Add a client"}
            </h2>

            <p className="mt-1 text-sm text-[#68738A]">
              {editingId
                ? "Update the client's details below."
                : "Enter the details to create a new client record."}
            </p>
          </div>

          <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={customerFormControls}
            buttonText={editingId ? "Save changes" : "Add client"}
            onSubmit={handleSubmit}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default CustomerManager;