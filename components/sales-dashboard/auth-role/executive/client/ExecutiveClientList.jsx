
"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import CommonForm from "@/components/layout/Form";
import { initalCustomerFormData } from "@/config/initialFormDate";
import {
  editCustomerServices,
  deleteCustomerServices,
  getCustomerServices,
} from "@/service/customer";
import { Eye, Plus, SquarePen, Trash, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { salesClientFC } from "@/config/sales/data";
import { initialClientData } from "@/config/sales/initialFormData";
import {
  createClientService,
  getClientService,
} from "@/service/sales-dashboard/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const LIMIT = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch clients
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
        setCustomers(res.data || []);
        setTotalPages(Math.max(1, res.pagination?.totalPages || 1));
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

  // Reset create/edit form
  const resetForm = () => {
    setFormData(initialClientData || initalCustomerFormData);
    setEditingId(null);
    setOpen(false);
  };

  // Create or update client
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
        // Do not overwrite an existing assignment during edit.
        res = await editCustomerServices(editingId, formData);
      } else {
        // Ensure the new client is assigned to the current executive.
        const formDataTemplate = {
          ...formData,
          salesExecutive: employee?._id ? [employee._id] : [],
        };

        if (!employee?._id) {
          toast.error("Unable to identify the logged-in sales executive");
          return;
        }

        res = await createClientService(formDataTemplate);
      }

      if (res?.success) {
        toast.success(res.message || "Saved successfully");
        resetForm();

        // Refresh the current list after saving.
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

  // Load client details for editing
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

  // Delete client
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      const res = await deleteCustomerServices(id);

      if (res?.success) {
        toast.success(res.message || "Client deleted successfully");

        // Avoid leaving the user on an empty page after deletion.
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

  return (
    <div className="flex flex-col gap-4 p-1 md:p-3">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold md:text-2xl">
            Clients
          </h1>

          <div className="relative">
            <Input
              type="text"
              placeholder="Client search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-8"
            />

            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50">
            <Checkbox
              id="paid-filter"
              checked={isPaid}
              onCheckedChange={(value) => {
                setIsPaid(value === true);
                setPage(1);
              }}
            />

            <label
              htmlFor="paid-filter"
              className="cursor-pointer select-none text-sm font-medium leading-none"
            >
              Paid
            </label>
          </div>

          {/* Mobile Add Client */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(initialClientData);
              setEditingId(null);
              setOpen(true);
            }}
            className="bg-orange-500 text-white hover:bg-orange-600 lg:hidden"
            title="Add client"
          >
            <Plus size={18} />
          </Button>

          {/* Desktop Add Client */}
          <Button
            type="button"
            onClick={() => {
              setFormData(initialClientData);
              setEditingId(null);
              setOpen(true);
            }}
            className="hidden bg-orange-500 text-white hover:bg-orange-600 lg:flex"
          >
            <Plus size={18} /> Add Client
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white shadow md:block">
        <div className="grid grid-cols-5 border-b px-4 py-2 font-semibold text-gray-500">
          <p>Name</p>
          <p>Company</p>
          <p className="text-center">Phone</p>
          <p className="text-center">GSTIN</p>
          <p className="text-center">Action</p>
        </div>

        <div className="lg:max-h-[60vh] lg:overflow-y-auto">
          {clientLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-4"
                >
                  {[...Array(5)].map((__, j) => (
                    <div
                      key={j}
                      className="h-8 animate-pulse rounded bg-gray-200"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : customers.length > 0 ? (
            customers.map(
              (
                { company, name, phone, GSTIN, _id, isPaid },
                idx
              ) => (
                <div
                  key={_id}
                  className={`grid grid-cols-5 items-center border-b px-4 py-3 ${
                    isPaid ? "bg-green-100" : ""
                  } ${idx % 2 === 0 ? "bg-gray-50" : ""}`}
                >
                  <p className="break-words">{name || "—"}</p>
                  <p className="break-words">{company || "—"}</p>
                  <p className="text-center">{phone || "—"}</p>
                  <p className="break-words text-center">
                    {GSTIN || "—"}
                  </p>

                  <div className="flex items-center justify-end gap-5">
                    <Link
                      href={`/sales-dashboard/clients/${_id}/${employee?._id}`}
                      aria-label="View client"
                    >
                      <Eye size={19} />
                    </Link>

                    <button
                      type="button"
                      aria-label="Edit client"
                      onClick={() => handleEdit(_id)}
                    >
                      <SquarePen size={19} />
                    </button>

                    <button
                      type="button"
                      aria-label="Delete client"
                      onClick={() => handleDelete(_id)}
                    >
                      <Trash size={19} />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="py-6 text-center text-gray-500">
              No customers found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-300 px-3 py-2">
          <button
            type="button"
            disabled={page <= 1 || clientLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || clientLoading}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-3 md:hidden">
        {clientLoading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border bg-white p-4"
            >
              <div className="h-5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 animate-pulse rounded bg-gray-200" />
            </div>
          ))
        ) : customers.length > 0 ? (
          customers.map(({ company, name, phone, GSTIN, _id, isPaid }) => (
            <div
              key={_id}
              className={`flex flex-col gap-3 rounded-xl border p-4 shadow ${
                isPaid ? "bg-green-50" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="break-words font-semibold">
                  {name || "—"}
                </p>
                <p className="break-words text-right text-sm text-gray-500">
                  {company || "No company"}
                </p>
              </div>

              <p className="break-words text-sm">
                <span className="font-medium">Phone:</span>{" "}
                {phone || "—"}
              </p>

              <p className="break-words text-sm">
                <span className="font-medium">GSTIN:</span>{" "}
                {GSTIN || "—"}
              </p>

              <div className="flex items-center gap-6">
                <Link
                  href={`/sales-dashboard/clients/${_id}/${employee?._id}`}
                  aria-label="View client"
                >
                  <Eye size={19} />
                </Link>

                <button
                  type="button"
                  aria-label="Edit client"
                  onClick={() => handleEdit(_id)}
                >
                  <SquarePen size={19} />
                </button>

                <button
                  type="button"
                  aria-label="Delete client"
                  onClick={() => handleDelete(_id)}
                >
                  <Trash size={19} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border bg-white py-6 text-center text-gray-500">
            No customers found
          </div>
        )}

        {/* Mobile Pagination */}
        {!clientLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit Sheet */}
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
        <SheetContent className="overflow-y-auto p-5">
          <p className="text-center text-lg font-semibold">
            {editingId ? "Edit Customer" : "Create Customer"}
          </p>

          <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={salesClientFC}
            buttonText={editingId ? "Update" : "Add Client"}
            onSubmit={handleSubmit}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExecutiveClientList;
