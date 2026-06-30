"use client";

import { getClientService } from "@/service/sales-dashboard/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const AssignedClient = ({ employeeId }) => {
  const [customers, setCustomers] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await getClientService(employeeId);
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
  }, []);

  if (clientLoading) {
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
      {/* Table */}
      {!customers.length ? (
        <div className="mt-20 text-center text-gray-500">
          No customers found
        </div>
      ) : (
        <div className="">
          <div className="grid grid-cols-5 gap-6 bg-zinc-200 p-3 font-semibold rounded">
            <div>Company</div>
            <div>Name</div>
            <div>Phone</div>
            <div>GST</div>
            <div>Address</div>
          </div>

          {customers.map((c) => (
            <Link
              href={`/dashboard/customer/${c?._id}`}
              key={c._id}
              className="grid grid-cols-5 gap-3 p-3 border-b hover:bg-white"
            >
              <div>{c.company}</div>
              <div>{c.name}</div>
              <div>{c.phone}</div>
              <div>{c.GSTIN}</div>
              <div>{c.Address}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedClient;
