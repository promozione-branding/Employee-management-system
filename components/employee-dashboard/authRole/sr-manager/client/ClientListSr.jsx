"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FunnelPlus, Search, X } from "lucide-react";
import Loading from "@/components/layout/Loading";
import { getAllCustomerServices } from "@/service/customer";
import { Eye, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { getEmployeeAssignedClientService } from "@/service/employee-dashboard/employee";
import { searchClientService } from "@/service/customer/search";
import { Input } from "@/components/ui/input";

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assinedClientList, setAssinedClientList] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const { employee } = useEmployeeStore();
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

  async function getEmployeeClientList() {
    try {
      if (employee?._id) {
        const res = await getEmployeeAssignedClientService(employee?._id);

        if (res.success) {
          setAssinedClientList(
            res?.data?.map((item) => item?.clientId),
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error while getting the client list",
      );
    }
  }

  useEffect(() => {
    fetchCustomers();
    getEmployeeClientList();
  }, []);

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

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-2 md:gap-5 lg:gap-1">
      {/* client List header  */}
      <div className="md:flex md:justify-between md:items-center md:px-10 md:py-2">
        <div className="text-2xl font-medium">Clients</div>
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

      {/* client list  */}
      <div className=" bg-white h-[78vh] rounded-2xl lg:h-[70vh] shadow-lg border overflow-y-auto">
        {/* heading  */}
        <div className="hidden md:grid grid-cols-6 gap-4 text-gray-500 border-b-2 py-3 font-semibold sticky top-0 bg-white z-10">
          <p className="pl-5">Name</p>
          <p>Company</p>
          <p className="text-left">GSTIN</p>
          <p className="text-center">Phone</p>
          <p className="text-center">Sales Executive</p>
          {/* <p className="text-center">Address</p> */}
          <p className="text-center">Action</p>
        </div>

        {/* list  */}
        <div className="">
          {customers.map(
            (
              {
                company,
                name,
                phone,
                GSTIN,
                Address,
                salesExecutive,
                _id,
                SalesPersonName,
              },
              idx,
            ) => (
              <div
                key={_id}
                className={`grid grid-cols-1  md:grid-cols-6 gap-2 md:gap-4 border-b p-4 md:py-3 ${idx % 2 === 0 ? "bg-gray-50" : ""}`}
              >
                <div className="flex justify-between md:block">
                  <span className="md:hidden font-medium text-gray-500">
                    Name
                  </span>
                  <p className="md:pl-5 font-semibold md:font-normal">{name}</p>
                </div>
                <div className="flex justify-between md:block">
                  <span className="md:hidden font-medium text-gray-500">
                    Company
                  </span>
                  <p>{company}</p>
                </div>
                <div className="flex justify-between md:block">
                  <span className="md:hidden font-medium text-gray-500">
                    GSTIN
                  </span>
                  <p className="">{GSTIN}</p>
                </div>
                <div className="flex justify-between md:block">
                  <span className="md:hidden font-medium text-gray-500">
                    Phone
                  </span>
                  <p className="md:text-center">{phone}</p>
                </div>

                <div className="flex justify-between md:block items-center">
                  <span className="md:hidden font-medium text-gray-500">
                    Sales Executive
                  </span>
                  <div className="md:text-center capitalize flex gap-2 flex-wrap justify-end md:justify-center">
                    {salesExecutive.map((item) => (
                      <p
                        key={item?._id}
                        className="bg-orange-200 px-2 py-1 rounded-lg text-xs md:text-sm"
                      >
                        {item?.basicDetails?.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between md:block items-center mt-2 md:mt-0">
                  <span className="md:hidden font-medium text-gray-500">
                    Action
                  </span>
                  <div className="flex gap-5 justify-end md:justify-center">
                    <Link
                      href={`/employee-dashboard/clients/client-assignment/${_id}`}
                    >
                      <Network />
                    </Link>
                    <Link
                      href={`/employee-dashboard/clients/client-details/${_id}`}
                    >
                      <Eye />
                    </Link>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
