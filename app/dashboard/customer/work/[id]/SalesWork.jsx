"use client";

import {
  clientSalesExecutiveService,
  editSalesExecutiveService,
  getSalesPersonService,
} from "@/service/admin-dashboard/employee/sales-work";
import { useEffect, useState } from "react";
import { UserRound, Users, SearchX, BookCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const SalesWork = ({ customerId }) => {
  const [salesPerson, setSalesPerson] = useState([]);
  const [assignSalesPerson, setAssignSalesPerson] = useState([]);
  const [selectSalesEmployee, setSelectSalesEmployee] = useState([]);

  const router = useRouter();

  async function fetchSalesPerson() {
    try {
      const res = await getSalesPersonService();
      if (res.success) {
        setSalesPerson(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchClientSales() {
    try {
      const res = await clientSalesExecutiveService(customerId);
      if (res.success) {
        setAssignSalesPerson(res.data.salesExecutive);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchSalesPerson();
    if (!customerId) return;
    fetchClientSales();
  }, [customerId]);

  const handleSelectSalesExecutive = (employeeId) => {
    setSelectSalesEmployee((prevSelected) => {
      const isSelected = prevSelected.some((_id) => _id === employeeId);

      if (isSelected) {
        return prevSelected.filter((_id) => _id !== employeeId);
      } else {
        return [...prevSelected, employeeId];
      }
    });
  };

  async function editAssigedClient() {
    try {
      const res = await editSalesExecutiveService(customerId, {
        salesExecutive: selectSalesEmployee,
      });
      if (res.success) {
        toast.success(res.message || "Sales executive updated successfully");
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.log(error);
      toast.error(res.data.response.message || "Error resignment");
    }
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 rounded-2xl border border-gray-100 flex flex-col gap-5">
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-semibold text-gray-900">
                All Sales Person
              </p>
            </div>
          </div>
          <div className="self-start md:self-auto rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
            {salesPerson.length} Members
          </div>
        </div>

        {salesPerson.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {salesPerson.map(({ basicDetails, _id }) => (
              <button
                onClick={() => handleSelectSalesExecutive(_id)}
                key={_id}
                className={`group text-left rounded-xl border  bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md  ${selectSalesEmployee.some((id) => id === _id) ? "border-blue-600" : "border-gray-200"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 line-clamp-1">
                      {basicDetails?.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-500">Sales Executive</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 flex flex-col items-center justify-center text-center">
            <SearchX className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-base font-medium text-gray-800">
              No sales person found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Add team members to view them here.
            </p>
          </div>
        )}
      </div>
      <Button onClick={editAssigedClient}>Submit</Button>
    </div>
  );
};

export default SalesWork;
