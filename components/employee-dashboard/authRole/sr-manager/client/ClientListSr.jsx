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
import { FunnelPlus } from "lucide-react";
import Loading from "@/components/layout/Loading";
import { getAllCustomerServices } from "@/service/customer";
import { Eye, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { getEmployeeAssignedClientService } from "@/service/employee-dashboard/employee";

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assinedClientList, setAssinedClientList] = useState([]);

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
            res?.data?.workDetails.map((item) => item?.clientId),
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



  // customers.map((item)=> assinedClientList.map())

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-2 md:gap-5 lg:gap-1">
      {/* client List header  */}
      <div className="md:flex md:justify-between md:items-center md:px-10 md:py-2">
        <div className="text-2xl font-medium">Clients</div>

        <div className="md:flex gap-5 lg:gap-10 hidden">
          <div className="flex gap-2 items-center">
            <p className="font-semibold">Showing</p>
            <Select>
              <SelectTrigger className="w-[90px] bg-white">
                <SelectValue placeholder="Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button className={"bg-white text-black hover:bg-gray-200"}>
            <FunnelPlus /> Filter
          </Button>
        </div>
      </div>

      {/* client list  */}
      <div className=" bg-white h-[78vh] rounded-2xl lg:h-[70vh] shadow-lg border ">
        {/* heading  */}
        <div className="grid grid-cols-6 gap-4 text-gray-500 border-b-2 py-3 font-semibold">
          <p className="pl-5">Name</p>
          <p>Company</p>
          <p className="text-left">GSTIN</p>
          <p className="text-center">Phone</p>
          <p className="text-center">Sales Executive</p>
          {/* <p className="text-center">Address</p> */}
          <p className="text-center">Action</p>
        </div>

        {/* list  */}
        <div>
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
                className={`grid grid-cols-6 gap-4  border-b py-3 ${idx % 2 === 0 && "bg-gray-50"}`}
              >
                <p className="pl-5">{name}</p>
                <p>{company}</p>
                <p className="">{GSTIN}</p>
                <p className="text-center">{phone}</p>
                <div className="text-center capitalize flex gap-2">
                  {salesExecutive.map((item) => (
                    <p
                      key={item?._id}
                      className="bg-orange-200 px-2 py-1 rounded-lg"
                    >
                      {item?.basicDetails?.name}
                    </p>
                  ))}
                </div>

                <div className="flex gap-5 justify-center">
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
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
