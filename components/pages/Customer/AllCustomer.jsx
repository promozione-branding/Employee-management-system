"use client";

import CreateCustomer from "@/components/subComponents/customer/CreateCustomer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  deleteCustomerServices,
  getAllCustomerServices,
  getCustomerServices,
} from "@/service/customer";
import { Eye, FilePlusCorner, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AllCustomer = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerSiderbar, setCustomerSiderbar] = useState(false);
  const [customerCreated, setCustomerCreated] = useState("");
  const [customerDeleted, setCustomerDeleted] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);

  async function handleDeleteCustomer(id) {
    try {
      const response = await deleteCustomerServices(id);
      if (response.success) {
        toast.success(response.message);
        setCustomerDeleted(id);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }

  const fetchAllCustomer = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomerServices();

      if (response.success) {
        toast.success("Customer list fetched");
        setCustomerList(response.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message);
    }
  };

  async function getCustomerDetailsById(id) {
    try {
      const response = await getCustomerServices(id);
      if (response.success) {
        // toast.success("Customer details fetched");
        setCustomerDetails(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchAllCustomer();
  }, [customerCreated, customerDeleted]);

  return (
    <div>
      <p className="text-center font-bold text-2xl">All Customer</p>

      <Sheet
        open={customerSiderbar}
        onOpenChange={() => {
          setCustomerSiderbar(!customerSiderbar);
        }}
      >
        <div
          onClick={() => setCustomerSiderbar(!customerSiderbar)}
          className="fixed bottom-10 right-10 h-20 w-20 bg-blue-300 flex items-center justify-center rounded-full"
        >
          <FilePlusCorner size={30} />
        </div>
        <SheetContent className={"p-5"}>
          <SheetHeader className={"sr-only"}>
            <SheetTitle>handleDeleteCustomer</SheetTitle>
            <SheetDescription>dec</SheetDescription>
          </SheetHeader>
          <CreateCustomer
            customerDetails={customerDetails}
            setCustomerSiderbar={setCustomerSiderbar}
            setCustomerCreated={setCustomerCreated}
          />
        </SheetContent>
      </Sheet>

      {loading ? (
        <div className="text-center mt-10 text-lg font-semibold text-gray-500">
          Loading...
        </div>
      ) : customerList?.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg text-gray-500">
          <p className="text-xl font-semibold">No Customers Found</p>
          <p className="mt-2">
            Click on the plus icon in the bottom right to add your first
            customer.
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <div className="grid grid-cols-6 gap-3 bg-zinc-200 py-3 px-3 rounded font-semibold">
            <div>Company</div>
            <div>Name</div>
            <div>Phone</div>
            <div>GST</div>
            <div>Address</div>
            <div>Actions</div>
          </div>
          {customerList.map((item, idx) => {
            return (
              <div
                key={item?._id}
                className={`grid grid-cols-6 gap-3 py-3 px-3 hover:bg-white duration-300 border-b`}
              >
                <div>{item?.company}</div>
                <div>{item?.name}</div>
                <div>{item?.phone}</div>
                <div>{item?.GSTIN}</div>
                <div>{item?.Address?.slice(0, 20)}...</div>
                <div className="flex items-center gap-8">
                  <Link href={`/dashboard/customer/${item?._id}`}>
                    <Eye />
                  </Link>
                  <div
                    onClick={() => {
                      getCustomerDetailsById(item?._id);
                      setCustomerSiderbar(!customerSiderbar);
                    }}
                  >
                    <SquarePen />
                  </div>
                  <div onClick={() => handleDeleteCustomer(item?._id)}>
                    <Trash />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllCustomer;
