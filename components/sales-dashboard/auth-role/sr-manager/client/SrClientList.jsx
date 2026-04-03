"use client";

import { Button } from "@/components/ui/button";
import { Plus, Eye, Network, SquarePen, Trash, Search, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CommonForm from "@/components/layout/Form";
import Loading from "@/components/layout/Loading";
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
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { searchClientService } from "@/service/customer/search";
import { Checkbox } from "@/components/ui/checkbox";

const SrClientList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initalCustomerFormData);
  const [editingId, setEditingId] = useState(null);
  const [fetchSales, setFetchSales] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const [isPaid, setIsPaid] = useState(false);


  const filteredCustomers = isPaid
    ? customers.filter((item) => item?.isPaid === true)
    : customers;

  /* ---------------- Fetch Sales ---------------- */
  async function fetchSalesPerson() {
    try {
      const res = await getAllSalesService();
      if (res.success) setFetchSales(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  /* ---------------- Fetch Customers ---------------- */
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

  /* ---------------- Sales Person Select ---------------- */
  const salesPerson = {
    label: "salesExecutive",
    name: "salesExecutive",
    componentType: "select",
    options: fetchSales.map(({ basicDetails, _id }) => ({
      id: _id,
      label: basicDetails?.name,
    })),
  };

  const customerFormControls = [...addCustomerFormControl, salesPerson];

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const c of customerFormControls) {
      if (
        ![
          "tanNo",
          "notes",
          "website",
          "meetingDate",
          "email",
          "isPaid",
        ].includes(c.name) &&
        !formData[c.name]
      ) {
        return toast.error(`Please fill ${c.label}`);
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
        const customerData = res.data;
        setFormData({
          ...customerData,
          isPaid: customerData.isPaid ? "Paid" : "Unpaid",
        });
        setEditingId(id);
        setOpen(true);
      }
    } catch (error) {
      console.log(error, "error while edit client");
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
    } catch {
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData(initalCustomerFormData);
    setEditingId(null);
    setOpen(false);
  };

  /* ---------------- search ---------------- */
  async function searchHandler(e) {
    e.preventDefault();
    try {
      const res = await searchClientService(searchInput);
      if (res.success) {
        setCustomers(res?.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }

  useEffect(() => {
    fetchCustomers();
    fetchSalesPerson();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-4 p-1 md:p-3">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex justify-between items-center gap-2">
          <h1 className="text-lg  md:text-2xl font-semibold">Clients</h1>
          <form onSubmit={searchHandler} className="flex gap-2">
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
                    fetchCustomers();
                  }}
                />
              )}
            </div>

            <Button type="submit">
              <Search />
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <Checkbox
              id="paid-filter"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
            <label
              htmlFor="paid-filter"
              className="text-sm font-medium leading-none cursor-pointer select-none"
            >
              Paid
            </label>
          </div>

          {/* <Button variant="outline">
            <FunnelPlus size={18} /> Filter
          </Button> */}

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
          <p className="text-center">Sales Executive</p>
          <p className="text-center">Action</p>
        </div>

        <div className="lg:h-[59vh] lg:overflow-x-auto">
          {filteredCustomers.map(
            ({ company, name, phone, salesExecutive, _id, isPaid }, idx) => (
              <div
                key={_id}
                className={`grid grid-cols-6 md:grid-cols-5  px-4 py-3 items-center border-b ${isPaid && "bg-green-100"} ${
                  idx % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <p>{name}</p>
                <p>{company}</p>
                <p className="text-center">{phone}</p>

                <div className="flex flex-wrap gap-1 justify-center">
                  {salesExecutive?.map((item) => (
                    <span
                      key={item._id}
                      className="bg-orange-200 text-xs px-2 py-1 rounded"
                    >
                      {item?.basicDetails?.name}
                    </span>
                  ))}
                </div>

                <div className="flex justify-center gap-3 lg:gap-5">
                  <Link href={`/sales-dashboard/clients/client-assign/${_id}`}>
                    <Network
                      size={18}
                      className="cursor-pointer lg:h-6 lg:w-6"
                    />
                  </Link>

                  <Link href={`/sales-dashboard/clients/${_id}`}>
                    <Eye size={18} className="cursor-pointer lg:h-6 lg:w-6 " />
                  </Link>

                  <SquarePen
                    size={18}
                    onClick={() => handleEdit(_id)}
                    className="cursor-pointer lg:h-6 lg:w-6"
                  />
                  <Trash
                    size={18}
                    onClick={() => handleDelete(_id)}
                    className="cursor-pointer lg:h-6 lg:w-6"
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* MOBILE CARD VIEW */}

      <div className="md:hidden flex flex-col gap-3">
        {filteredCustomers.map(
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

              <div className="flex justify-end gap-4 pt-2">
                <Link href={`/dashboard/customer/work/${_id}`}>
                  <Network size={18} />
                </Link>
                <Link href={`/dashboard/customer/${_id}`}>
                  <Eye size={18} />
                </Link>
                <SquarePen size={18} onClick={() => handleEdit(_id)} />
                <Trash
                  size={18}
                  className="text-red-500"
                  onClick={() => handleDelete(_id)}
                />
              </div>
            </div>
          ),
        )}
      </div>

      {/* SHEET FORM */}
      <Sheet open={open} onOpenChange={resetForm}>
        <SheetContent className="p-5 overflow-y-auto">
          <p className="font-semibold text-center text-xl pb-4">
            {editingId ? "Edit Customer" : "Create Customer"}
          </p>

          <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={customerFormControls}
            buttonText={editingId ? "Update" : "Add Client"}
            onSubmit={handleSubmit}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SrClientList;
