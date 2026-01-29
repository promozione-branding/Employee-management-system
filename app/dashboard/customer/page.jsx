"use client";

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import CommonForm from "@/components/layout/Form";
import Loading from "@/components/layout/Loading";
import {
  addCustomerFormControl,
} from "@/config/data";
import {
  initalCustomerFormData,
} from "@/config/initialFormDate";
import {
  createCustomerServices,
  editCustomerServices,
  deleteCustomerServices,
  getAllCustomerServices,
  getCustomerServices,
} from "@/service/customer";
import {
  Eye,
  FilePlusCorner,
  Network,
  SquarePen,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initalCustomerFormData);
  const [editingId, setEditingId] = useState(null);

  /* ---------------- Fetch ---------------- */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getAllCustomerServices();
      if (res.success) setCustomers(res.data);
    } catch {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ---------------- Create / Edit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const c of addCustomerFormControl) {
      if (
        !["tanNo", "notes", "website", "meetingDate"].includes(c.name) &&
        !formData[c.name]
      ) {
        return toast.error(`Please fill ${c.label}`);
      }
    }

    try {
      const res = editingId
        ? await editCustomerServices(editingId, formData)
        : await createCustomerServices(formData);

      if (res.success) {
        toast.success(res.message || "Saved successfully");
        resetForm();
        fetchCustomers();
      }
    } catch {
      toast.error("Something went wrong");
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
    } catch {
      toast.error("Failed to load customer");
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const res = await deleteCustomerServices(id);
      if (res.success) {
        toast.success(res.message);
        fetchCustomers();
      }
    } catch {
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
  if (loading) return <Loading />;

  return (
    <div>
      <p className="text-center font-bold text-2xl">All Customers</p>

      {/* Floating Add Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-10 right-10 h-20 w-20 bg-blue-300 rounded-full flex items-center justify-center"
      >
        <FilePlusCorner size={30} />
      </button>

      {/* Sheet */}
      <Sheet open={open} onOpenChange={resetForm}>
        <SheetContent className="p-5 overflow-y-auto">
          <p className="font-semibold text-center text-2xl pb-5">
            {editingId ? "Edit Customer" : "Create Customer"}
          </p>

          <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={addCustomerFormControl}
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
        <div className="mt-10">
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

              <div className="flex gap-4">
                <Link href={`/dashboard/customer/work/${c._id}`}>
                  <Network />
                </Link>
                <Link href={`/dashboard/customer/${c._id}`}>
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

export default CustomerManager;
