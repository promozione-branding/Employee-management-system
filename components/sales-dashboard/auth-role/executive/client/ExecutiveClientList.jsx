
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import CommonForm from "@/components/layout/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { initalCustomerFormData } from "@/config/initialFormDate";
import { salesClientFC } from "@/config/sales/data";
import { initialClientData } from "@/config/sales/initialFormData";

import {
  editCustomerServices,
  deleteCustomerServices,
  getCustomerServices,
} from "@/service/customer";

import {
  createClientService,
  getClientService,
} from "@/service/sales-dashboard/client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

import {
  Plus,
  Eye,
  SquarePen,
  Trash2,
  Search,
  X,
  Users,
  Phone,
  Building2,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

const LIMIT = 20;

const avatarColors = [
  "bg-[#17845A]",
  "bg-[#6A4FD6]",
  "bg-[#2B5086]",
  "bg-[#C46A2D]",
  "bg-[#087E8B]",
];

const ExecutiveClientList = () => {
  const [customers, setCustomers] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialClientData);
  const [editingId, setEditingId] = useState(null);

  const { employee } = useSalesEmployeeStore();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch clients assigned to the logged-in executive.
  const fetchCustomers = useCallback(async () => {
    if (!employee?._id) {
      setCustomers([]);
      setClientLoading(false);
      return;
    }

    try {
      setClientLoading(true);

      const res = await getClientService(
        employee._id,
        page,
        LIMIT,
        debouncedSearch,
        isPaid
      );

      if (res?.success) {
        setCustomers(Array.isArray(res.data) ? res.data : []);
        setTotalPages(
          Math.max(1, res.pagination?.totalPages || 1)
        );
      } else {
        setCustomers([]);
        setTotalPages(1);
        toast.error(res?.message || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("Fetch clients error:", error);

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setClientLoading(false);
    }
  }, [employee?._id, page, debouncedSearch, isPaid]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset the create/edit form.
  const resetForm = () => {
    setFormData(initialClientData || initalCustomerFormData);
    setEditingId(null);
    setOpen(false);
  };

  // Open the form for a new client.
  const handleCreate = () => {
    setFormData(initialClientData);
    setEditingId(null);
    setOpen(true);
  };

  // Create or update a client.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Please enter client name");
      return;
    }

    if (!String(formData.phone ?? "").trim()) {
      toast.error("Please enter client phone number");
      return;
    }

    try {
      let res;

      if (editingId) {
        // Preserve the existing assignment during edits.
        res = await editCustomerServices(editingId, formData);
      } else {
        if (!employee?._id) {
          toast.error(
            "Unable to identify the logged-in sales executive"
          );
          return;
        }

        // Assign the new client to the current executive.
        const payload = {
          ...formData,
          salesExecutive: [employee._id],
        };

        res = await createClientService(payload);
      }

      if (res?.success) {
        toast.success(res.message || "Saved successfully");
        resetForm();
        await fetchCustomers();
      } else {
        toast.error(res?.message || "Failed to save client");
      }
    } catch (error) {
      console.error("Save client error:", error);

      if (error.response?.data?.errors?.length) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(
          error.response?.data?.message || "Something went wrong"
        );
      }
    }
  };

  // Load client details before editing.
  const handleEdit = async (id) => {
    try {
      const res = await getCustomerServices(id);

      if (res?.success) {
        setFormData({
          ...initialClientData,
          ...res.data,
        });

        setEditingId(id);
        setOpen(true);
      } else {
        toast.error(res?.message || "Failed to load client");
      }
    } catch (error) {
      console.error("Load client error:", error);
      toast.error("Failed to load client");
    }
  };

  // Delete a client.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) return;

    try {
      const res = await deleteCustomerServices(id);

      if (res?.success) {
        toast.success(res.message || "Client deleted successfully");

        if (customers.length === 1 && page > 1) {
          setPage((currentPage) => currentPage - 1);
        } else {
          await fetchCustomers();
        }
      } else {
        toast.error(res?.message || "Failed to delete client");
      }
    } catch (error) {
      console.error("Delete client error:", error);

      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  // Avatar based on the client's name.
  const ClientAvatar = ({ name, index }) => (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${
        avatarColors[index % avatarColors.length]
      }`}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );

  // Shared action buttons.
  const ClientActions = ({ customer }) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/sales-dashboard/clients/${customer._id}/${employee?._id}`}
        title="View client"
        aria-label={`View ${customer.name || "client"}`}
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#E9EFF9] hover:text-[#0A2E66]"
      >
        <Eye size={19} />
      </Link>

      <button
        type="button"
        onClick={() => handleEdit(customer._id)}
        title="Edit client"
        aria-label={`Edit ${customer.name || "client"}`}
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#FFF1E4] hover:text-[#F27B1E]"
      >
        <SquarePen size={19} />
      </button>

      <button
        type="button"
        onClick={() => handleDelete(customer._id)}
        title="Delete client"
        aria-label={`Delete ${customer.name || "client"}`}
        className="rounded-lg p-2 text-[#68738A] transition hover:bg-[#FCEAE8] hover:text-[#CC3B32]"
      >
        <Trash2 size={19} />
      </button>
    </div>
  );

  // Reusable payment badge.
  const PaymentBadge = ({ paid }) => (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${
        paid
          ? "bg-[#E5F5EC] text-[#17845A]"
          : "bg-[#FFF4D9] text-[#B86A00]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          paid ? "bg-[#17845A]" : "bg-[#B86A00]"
        }`}
      />
      {paid ? "Paid" : "Pending"}
    </span>
  );

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0F1B33] sm:text-3xl">
            My Clients
          </h2>

          <p className="mt-2 text-sm text-[#68738A] sm:text-base">
            Manage your assigned clients and keep their details up to date.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="h-12 w-full gap-2 rounded-xl bg-[#F27B1E] px-5 font-semibold text-white shadow-sm transition hover:bg-[#DF6B12] sm:w-fit"
        >
          <Plus size={20} />
          Add client
        </Button>
      </header>

      {/* Search and filters */}
      <section className="rounded-[20px] border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_16px_rgba(15,27,51,0.04)] sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[480px]">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A92A6]"
            />

            <Input
              type="text"
              placeholder="Search by client name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 rounded-xl border-[#E0E5EF] bg-white pl-11 pr-10 text-sm text-[#0F1B33] placeholder:text-[#8A92A6] focus-visible:ring-[#F27B1E]"
            />

            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8A92A6] transition hover:bg-[#F2F4F9] hover:text-[#0F1B33]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#E0E5EF] bg-[#F7F8FC] px-4 transition hover:border-[#C8D3E5]">
            <Checkbox
              id="paid-filter"
              checked={isPaid}
              onCheckedChange={(value) => {
                setIsPaid(value === true);
                setPage(1);
              }}
              className="border-[#C8D0DF] data-[state=checked]:border-[#0A2E66] data-[state=checked]:bg-[#0A2E66]"
            />

            <Wallet size={17} className="text-[#68738A]" />

            <span className="text-sm font-semibold text-[#0F1B33]">
              Paid clients only
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E3E7F0] pt-4">
          <p className="text-sm text-[#68738A]">
            {clientLoading
              ? "Loading clients..."
              : `${customers.length} client${customers.length === 1 ? "" : "s"} on this page`}
          </p>

          {isPaid && (
            <span className="rounded-full bg-[#E5F5EC] px-3 py-1.5 text-xs font-semibold text-[#17845A]">
              Paid filter active
            </span>
          )}
        </div>
      </section>

      {/* Desktop table */}
      <section className="hidden overflow-hidden rounded-[22px] border border-[#E3E7F0] bg-white shadow-[0_4px_18px_rgba(15,27,51,0.04)] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E3E7F0] bg-[#F7F8FC] text-sm font-bold text-[#5B6478]">
                <th className="px-5 py-4">Client</th>
                <th className="px-4 py-4">Phone</th>
                <th className="px-4 py-4">Company</th>
                <th className="px-4 py-4">GSTIN</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3E7F0]">
              {clientLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className="px-4 py-5">
                        <div className="h-5 animate-pulse rounded-md bg-[#F2F4F9]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer, index) => (
                  <tr
                    key={customer._id}
                    className="transition-colors hover:bg-[#F9FAFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-[190px] items-center gap-3">
                        <ClientAvatar
                          name={customer.name}
                          index={index}
                        />

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0F1B33]">
                            {customer.name || "Unnamed client"}
                          </p>

                          <p className="mt-1 text-xs text-[#8A92A6]">
                            Client
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {customer.phone ? (
                        <a
                          href={`tel:${customer.phone}`}
                          className="whitespace-nowrap text-sm font-semibold text-[#0F1B33] transition hover:text-[#F27B1E]"
                        >
                          {customer.phone}
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-[#CC3B32]">
                          <TriangleAlert size={14} />
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex max-w-[200px] items-center gap-2 text-sm text-[#5B6478]">
                        <Building2
                          size={16}
                          className="shrink-0 text-[#8A92A6]"
                        />
                        <span className="truncate">
                          {customer.company || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex max-w-[170px] items-center gap-2 text-sm text-[#5B6478]">
                        <FileText
                          size={15}
                          className="shrink-0 text-[#8A92A6]"
                        />
                        <span className="break-words">
                          {customer.GSTIN || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <PaymentBadge paid={customer.isPaid} />
                    </td>

                    <td className="px-5 py-4">
                      <ClientActions customer={customer} />
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
                      Try a different search or change the payment filter.
                    </p>

                    {(searchInput || isPaid) && (
                      <button
                        type="button"
                        onClick={() => {
                          clearSearch();
                          setIsPaid(false);
                          setPage(1);
                        }}
                        className="mt-3 text-sm font-semibold text-[#0A2E66] transition hover:text-[#F27B1E]"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          loading={clientLoading}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
        />
      </section>

      {/* Mobile cards */}
      <section className="space-y-3 md:hidden">
        {clientLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-2xl border border-[#E3E7F0] bg-white p-4"
            >
              <div className="h-12 animate-pulse rounded-lg bg-[#F2F4F9]" />
              <div className="h-4 animate-pulse rounded bg-[#F2F4F9]" />
              <div className="h-4 animate-pulse rounded bg-[#F2F4F9]" />
            </div>
          ))
        ) : customers.length > 0 ? (
          customers.map((customer, index) => (
            <article
              key={customer._id}
              className="rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_3px_12px_rgba(15,27,51,0.035)] transition hover:border-[#C8D3E5]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ClientAvatar
                    name={customer.name}
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

                <PaymentBadge paid={customer.isPaid} />
              </div>

              <div className="mt-4 space-y-3 border-t border-[#E3E7F0] pt-4">
                <div className="flex items-start gap-2 text-sm">
                  <Phone
                    size={16}
                    className="mt-0.5 shrink-0 text-[#8A92A6]"
                  />
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="break-all font-medium text-[#0F1B33] hover:text-[#F27B1E]"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-[#CC3B32]">
                      Phone not provided
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <FileText
                    size={16}
                    className="mt-0.5 shrink-0 text-[#8A92A6]"
                  />
                  <span className="break-all text-[#5B6478]">
                    GSTIN: {customer.GSTIN || "—"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E3E7F0] pt-3">
                <span className="text-xs font-medium text-[#8A92A6]">
                  Client actions
                </span>
                <ClientActions customer={customer} />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-[#E3E7F0] bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9EFF9] text-[#0A2E66]">
              <Users size={25} />
            </div>

            <p className="mt-4 font-semibold text-[#0F1B33]">
              No clients found
            </p>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Try another search or update your filters.
            </p>
          </div>
        )}

        {/* Mobile pagination */}
        <div className="rounded-2xl border border-[#E3E7F0] bg-white">
          <Pagination
            page={page}
            totalPages={totalPages}
            loading={clientLoading}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </div>
      </section>

      {/* Create / edit drawer */}
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
              {editingId ? (
                <SquarePen size={23} />
              ) : (
                <Plus size={24} />
              )}
            </div>

            <h2 className="text-2xl font-bold text-[#0F1B33]">
              {editingId ? "Edit client" : "Add a client"}
            </h2>

            <p className="mt-1 text-sm text-[#68738A]">
              {editingId
                ? "Update the client's details below."
                : "Enter the details to add a client to your list."}
            </p>
          </div>

          <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={salesClientFC}
            buttonText={editingId ? "Save changes" : "Add client"}
            onSubmit={handleSubmit}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Shared pagination component.
const Pagination = ({
  page,
  totalPages,
  loading,
  onPrevious,
  onNext,
}) => (
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
        onClick={onPrevious}
        className="h-10 flex-1 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] hover:bg-[#F7F8FC] disabled:opacity-40 sm:flex-none"
      >
        <ChevronLeft size={16} />
        Previous
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={page >= totalPages || loading}
        onClick={onNext}
        className="h-10 flex-1 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] hover:bg-[#F7F8FC] disabled:opacity-40 sm:flex-none"
      >
        Next
        <ChevronRight size={16} />
      </Button>
    </div>
  </footer>
);

export default ExecutiveClientList;
