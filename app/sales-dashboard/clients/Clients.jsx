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
import { Eye, FilePlusCorner, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { salesClientFC } from "@/config/sales/data";
import { initialClientData } from "@/config/sales/initialFormData";
import {
  createClientService,
  getClientService,
} from "@/service/sales-dashboard/client";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const Client = () => {
  const [customers, setCustomers] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialClientData);
  const [editingId, setEditingId] = useState(null);
  const { employee, loading } = useSalesEmployeeStore();

  /* ---------------- Fetch ---------------- */
  const fetchCustomers = async () => {
    try {
      setClientLoading(true);
      if (!employee?._id) {
        toast.error("error while fetching the customer");
        setClientLoading(true);
        return;
      }
      const res = await getClientService(employee?._id);

      if (res.success) setCustomers(res.data);
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
    fetchCustomers();
  }, [employee?._id]);

  /* ---------------- Create / Edit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const c of salesClientFC) {
      if (
        !["tanNo", "notes", "website", "meetingDate"].includes(c.name) &&
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
  if (loading || clientLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-6 gap-6 bg-zinc-200 p-3 font-semibold rounded">
          <div>Company</div>
          <div>Name</div>
          <div>Phone</div>
          <div>GST</div>
          <div>Address</div>
          <div>Actions</div>
        </div>
        <div className="space-y-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-3 p-3 border-b">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[50%]" />
              <Skeleton className="h-4 w-[90%]" />
              <div className="flex gap-8">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Floating Add Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-10 right-10 h-20 w-20 bg-blue-500 text-white rounded-full flex items-center justify-center"
      >
        <FilePlusCorner size={30} />
      </button>

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

      {/* Table */}
      {!customers.length ? (
        <div className="mt-20 text-center text-gray-500">
          No customers found
        </div>
      ) : (
        <div className="">
          <div className="grid grid-cols-6 gap-6 bg-zinc-200 p-3 font-semibold rounded">
            <div>Company</div>
            <div>Name</div>
            <div>Phone</div>
            <div>GST</div>
            <div>Address</div>
            <div>Actions</div>
          </div>

          {customers.map((c) => (
            <div
              key={c._id}
              className="grid grid-cols-6 gap-3 p-3 border-b hover:bg-white"
            >
              <div>{c.company}</div>
              <div>{c.name}</div>
              <div>{c.phone}</div>
              <div>{c.GSTIN}</div>
              <div>{c.Address?.slice(0, 20)}...</div>

              <div className="flex gap-8">
                <Link
                  href={`/sales-dashboard/clients/${c._id}/${employee?._id}`}
                >
                  <Eye />
                </Link>
                <SquarePen onClick={() => handleEdit(c._id)} />
                <Trash onClick={() => handleDelete(c._id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Client;
