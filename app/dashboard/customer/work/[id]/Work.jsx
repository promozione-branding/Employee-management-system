"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployeesByDomain } from "@/service/customer/work";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ClientWork = ({ customerId }) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loadingEmployeeList, setLoadingEmployeeList] = useState(true);
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    async function fetchEmployeeByDomain() {
      try {
        if (selectedDomain !== "") {
          const res = await getEmployeesByDomain(selectedDomain);
          if (res?.success) {
            setLoadingEmployeeList(false);
            toast.success("Employee Details fetched" || "");
            setEmployeeList(res.data);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Error while fetching employee",
        );
      }
    }

    fetchEmployeeByDomain();
  }, [selectedDomain]);

  return (
    <div>
      <div className=" flex flex-col gap-5">
        <div>
          <p className="text-lg font-medium mb-2">Domains of Work</p>
          <Select onValueChange={(value) => setSelectedDomain(value)}>
            <SelectTrigger className="w-[25vw]">
              <SelectValue placeholder="Select Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEO">Seo</SelectItem>
              <SelectItem value="WEB_DEVELOPER">Website Development</SelectItem>
              <SelectItem value="ADS_MANAGER">Ads Management</SelectItem>
              <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          {loadingEmployeeList ? (
            <div className="w-[25vw] border-2 p-10 border-dashed rounded-xl flex items-center justify-center">
              <p className=" text-gray-400">Select one Domain</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {employeeList.length > 0 ? (
                employeeList.map((employee) => (
                  <div
                    key={employee?._id}
                    className="border p-4 rounded-lg shadow-sm bg-white w-[25vw]"
                  >
                    <p className="font-semibold text-lg">
                      {employee?.basicDetails?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {employee?.employeeId}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No employees found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientWork;
