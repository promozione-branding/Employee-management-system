"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CommonForm from "@/components/layout/Form";
import { initalCustomerFormData } from "@/config/initialFormDate";
import {
  editCustomerServices,
  deleteCustomerServices,
  getCustomerServices,
} from "@/service/customer";
import {
  Eye,
  FilePlusCorner,
  Network,
  Plus,
  Search,
  SquarePen,
  Trash,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { searchClientService } from "@/service/customer/search";

const ExecutiveClientList = () => {
  const [customers, setCustomers] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialClientData);
  const [editingId, setEditingId] = useState(null);
  const { employee, loading } = useSalesEmployeeStore();
  const [searchInput, setSearchInput] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const LIMIT = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ---------------- Fetch ---------------- */
  const fetchCustomers = async () => {
    try {
      setClientLoading(true);
      if (!employee?._id) {
        toast.error("error while fetching the customer");
        setClientLoading(true);
        return;
      }
      const res = await getClientService(employee._id, page, LIMIT, debouncedSearch, isPaid);

      if (res.success) {
        setCustomers(res.data);
        setTotalPages(res.pagination.totalPages);
      }

    } catch (error) {
      console.log(error);
      if (error.response?.data?.errors?.length) {
        error.response.data.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setClientLoading(false);
    }
  };

  useEffect(() => {
    if (!employee?._id) return;

    fetchCustomers();
  }, [employee?._id, page, debouncedSearch, isPaid]);

  /* ---------------- Create / Edit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const c of salesClientFC) {
      if (
        !["tanNo", "notes", "website", "meetingDate", "email"].includes(
          c.name,
        ) &&
        !formData[c.name]
      ) {
        return toast.error(`Please fill ${c.label}`);
      }
    }

    const formDataTemplate = {
      salesExecutive: employee?._id,
      ...formData,
    };

    try {
      const res = editingId
        ? await editCustomerServices(editingId, formData)
        : await createClientService(formDataTemplate);

      if (res.success) {
        toast.success(res.message || "Saved successfully");
        resetForm();
        fetchCustomers();
        setPage(1);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.errors?.length) {
        error.response.data.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };

  /* ---------------- Edit ---------------- */
  const handleEdit = async (id) => {
    try {
      const res = await getCustomerServices(id);
      if (res.success) {
        setFormData(res.data);
        setEditingId(id);
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load customer");
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      const res = await deleteCustomerServices(id);
      if (res.success) {
        toast.success(res.message);
        fetchCustomers();
        setPage(1);
      }
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  /* ---------------- Helpers ---------------- */
  const resetForm = () => {
    setFormData(initalCustomerFormData);
    setEditingId(null);
    setOpen(false);
  };

  /* ---------------- UI ---------------- */
  // if (loading || clientLoading) {
  //   return (
  //     <div className="w-full space-y-4">
  //       <div className="hidden md:grid grid-cols-6 gap-6 bg-gray-100 p-3 font-semibold rounded-t-xl">
  //         <p>Company</p>
  //         <p>Name</p>
  //         <p>Phone</p>
  //         <p>GST</p>
  //         <p>Address</p>
  //         <p>Actions</p>
  //       </div>
  //       <div className="space-y-3">
  //         {[...Array(5)].map((_, i) => (
  //           <div
  //             key={i}
  //             className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 md:p-3 border rounded-xl md:rounded-none md:border-0 md:border-b"
  //           >
  //             <Skeleton className="h-4 w-[80%]" />
  //             <Skeleton className="h-4 w-[60%] hidden md:block" />
  //             <Skeleton className="h-4 w-[70%] hidden md:block" />
  //             <Skeleton className="h-4 w-[50%]" />
  //             <Skeleton className="h-4 w-[90%]" />
  //             <div className="flex gap-8">
  //               <Skeleton className="h-5 w-5" />
  //               <Skeleton className="h-5 w-5" />
  //               <Skeleton className="h-5 w-5" />
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col gap-4 p-1 md:p-3">
      {/* header  */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex justify-between items-center gap-2">
          <h1 className="text-lg  md:text-2xl font-semibold">Clients</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Client search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              required
              className="pr-8"
            />
            {searchInput && (
              <X
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <Checkbox
              id="paid-filter"
              checked={isPaid}
              onCheckedChange={(value) => {
                setIsPaid(value);
                setPage(1);
              }}
            />
            <label
              htmlFor="paid-filter"
              className="text-sm font-medium leading-none cursor-pointer select-none"
            >
              Paid
            </label>
          </div>

          {/* for mobile  */}
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white lg:hidden"
            title={"add Client"}
          >
            <Plus size={18} />
          </Button>

          <Button
            onClick={() => setOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white hidden lg:flex"
          >
            <Plus size={18} /> Add Client
          </Button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow border overflow-x-auto">
        <div className="grid md:grid-cols-5 text-gray-500 border-b py-1 font-semibold px-4">
          <p>Name</p>
          <p>Company</p>
          <p className="text-center">Phone</p>
          <p className="text-center">GSTIN</p>
          <p className="text-center">Action</p>
        </div>

        <div className="lg:h-[60vh] lg:overflow-x-auto">
          {clientLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse grid grid-cols-6 gap-4">
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : customers.length ? (customers.map(
            ({ company, name, phone, GSTIN, _id, isPaid }, idx) => (
              <div
                key={_id}
                className={`grid grid-cols-6 md:grid-cols-5  px-4 py-3 items-center border-b ${isPaid && "bg-green-100"} ${idx % 2 === 0 ? "bg-gray-50" : ""
                  }`}
              >
                <p>{name}</p>
                <p>{company}</p>
                <p className="text-center">{phone}</p>

                <div className="flex flex-wrap gap-1 justify-center">
                  {GSTIN}
                </div>

                <div className="flex gap-8 justify-end">
                  <Link
                    href={`/sales-dashboard/clients/${_id}/${employee?._id}`}
                  >
                    <Eye />
                  </Link>
                  <SquarePen onClick={() => handleEdit(_id)} />
                  <Trash onClick={() => handleDelete(_id)} />
                </div>
              </div>
            )))
            : (<div className="text-center py-6 text-gray-500">
              No customers found
            </div>)}
        </div>

        <div className="flex items-center justify-end gap-2 py-2 px-2 border-t border-gray-300">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg border border-gray-300
      ${page === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
              }`}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg
          ${page === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg border border-gray-300
      ${page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden flex flex-col gap-3">
        {customers.map(
          ({ company, name, phone, GSTIN, salesExecutive, _id }) => (
            <div
              key={_id}
              className="bg-white rounded-xl shadow border p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-gray-500">{company}</p>
              </div>

              <p className="text-sm ">GSTIN: {GSTIN}</p>
              <p className="text-sm">Phone: {phone}</p>

              <div className="flex flex-wrap gap-2">
                {salesExecutive?.map((item) => (
                  <span
                    key={item._id}
                    className="bg-orange-200 text-xs px-2 py-1 rounded"
                  >
                    {item?.basicDetails?.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-8">
                <Link
                  href={`/sales-dashboard/clients/${_id}/${employee?._id}`}
                >
                  <Eye />
                </Link>
                <SquarePen onClick={() => handleEdit(_id)} />
                <Trash onClick={() => handleDelete(_id)} />
              </div>
            </div>
          ),
        )}
      </div>

      {/* Sheet */}
      <Sheet open={open} onOpenChange={resetForm}>
        <SheetContent className="p-5 overflow-y-auto">
          <p className="font-semibold text-center text-lg">
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
