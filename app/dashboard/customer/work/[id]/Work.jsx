"use client";

import Loading from "@/components/layout/Loading";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createWorkDetailsService,
  getClientWorkService,
  getEmployeesByDomain,
} from "@/service/customer/work";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Calendar, Users, User } from "lucide-react";
import { getCustomerProjectCycleService } from "@/service/customer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ClientWork = ({ customerId }) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loadingEmployeeList, setLoadingEmployeeList] = useState(true);
  const [employeeList, setEmployeeList] = useState([]);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [workDetailLoading, setWorkDetailLoading] = useState(true);
  const [workDetailData, setWorkDetailData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectCycleData, setProjectCycleData] = useState(null);
  const [asignEmployee, setAsignEmployee] = useState(false);
  const router = useRouter();

  function handleSelectEmployee(employeeId) {
    setSelectedEmployee((prevSelected) => {
      const isSelected = prevSelected.includes(employeeId);
      if (isSelected) {
        return prevSelected.filter((id) => id !== employeeId);
      } else {
        return [...prevSelected, employeeId];
      }
    });
  }

  async function handleCreateWork() {
    setButtonDisable(true);
    try {
      if (selectedEmployee.length <= 0) {
        toast.error("Select at least one employee");
        return;
      }

      const formData = {
        employeeId: selectedEmployee,
        projectId: selectedProject,
        clientId: customerId,
        department: selectedDomain,
        startedAt: new Date().toISOString(),
        progressPercentage: {
          departmentType: selectedDomain,
          completeField: 0,
          totalField: 0,
        },
      };

      const res = await createWorkDetailsService(formData);
      if (res.success) {
        toast.success("Client assigned successfully");
        setSelectedEmployee([]);
        setSelectedDomain("");
        setEmployeeList([]);
        router.push(`/dashboard/customer`);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error while client Assignment",
      );
    } finally {
      setButtonDisable(false);
    }
  }

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
        setEmployeeList([]);
        toast.error(
          error?.response?.data?.message || "Error while fetching employee",
        );
      }
    }

    fetchEmployeeByDomain();
  }, [selectedDomain]);

  useEffect(() => {
    async function fetchClientWork() {
      try {
        if (customerId) {
          const res = await getClientWorkService(customerId);
          console.log(res, "res");
          if (res.success) {
            setWorkDetailLoading(false);
            setWorkDetailData(res.data);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response.data.message ||
          "Error while fetching client work details",
        );
      }
    }

    async function fetchCustomerProjectCycle() {
      try {
        const response = await getCustomerProjectCycleService(customerId);
        if (response.success) {
          setProjectCycleData(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    fetchCustomerProjectCycle()
    fetchClientWork();
  }, []);

  const handleClick = (e) => {
    const domainMap = {
      "seo": "SEO",
      "web-dev": "WEB_DEVELOPER",
      "social-media": "SOCIAL_MEDIA",
      "ads": "ADS_MANAGER",
    };

    setSelectedDomain(domainMap[e] || "OTHER");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <div className=" flex flex-col gap-5">
          {/* <div>
            <p className="text-lg font-medium mb-2">Domains of Work</p>
            <Select onValueChange={(value) => setSelectedDomain(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEO">Seo</SelectItem>
                <SelectItem value="WEB_DEVELOPER">
                  Website Development
                </SelectItem>
                <SelectItem value="ADS_MANAGER">Ads Management</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            {loadingEmployeeList ? (
              <div className="w-full border-2 p-10 border-dashed rounded-xl flex items-center justify-center">
                <p className=" text-gray-400">Select one Domain</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {employeeList.length > 0 ? (
                  employeeList.map((employee) => (
                    <button
                      onClick={() => handleSelectEmployee(employee?._id)}
                      key={employee?._id}
                      className={`${selectedEmployee.includes(employee?._id)
                        ? "bg-emerald-100 border-emerald-400"
                        : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                        } border p-4 rounded-lg shadow-sm bg-white w-full`}
                    >
                      <p className="font-semibold text-lg">
                        {employee?.basicDetails?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee?.employeeId}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No employees found</p>
                )}
              </div>
            )}
          </div> */}

          <div>
            <div className="flex flex-col gap-3">
              {projectCycleData?.projectCycle?.projectDuration?.length > 0 ? (
                projectCycleData?.projectCycle?.projectDuration?.map((project) =>
                  <div key={project._id} className={`border p-4 rounded-lg shadow-sm bg-white w-full`}>
                    <div className="flex justify-between">
                      <p className="font-semibold text-lg">
                        {project?.projectName}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button onClick={() => { handleClick(project?.service); setSelectedProject(project._id) }} className="bg-gray-100 hover:bg-gray-200 border text-black p-2 rounded-md">
                            <User size={18} />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Asign Employee</DialogTitle>
                          </DialogHeader>
                          {employeeList.length > 0 ? (
                            employeeList.map((employee) => (
                              <button onClick={() => handleSelectEmployee(employee?._id)} key={employee?._id}
                                className={`${selectedEmployee.includes(employee?._id)
                                  ? "bg-emerald-100 border-emerald-400"
                                  : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                                  } border p-4 rounded-lg shadow-sm bg-white w-full`}
                              >
                                <p className="font-semibold text-lg">
                                  {employee?.basicDetails?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {employee?.employeeId}
                                </p>
                              </button>
                            ))
                          ) : (
                            <p className="text-gray-500">No employees found</p>
                          )}
                          <Button disabled={buttonDisable} className={"mt-2 w-full"} onClick={handleCreateWork}>
                            Assign client
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-gray-500">
                      {project?.service}
                    </p>
                  </div>
                ))
                : (
                  <p className="text-center text-gray-500 mt-10">
                    No Project History Found
                  </p>
                )}
            </div>
          </div>
        </div>


      </div>

      <div className="w-full lg:w-2/3">
        {workDetailLoading ? (
          <Loading />
        ) : (
          <div className="">
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Work History</h3>
              <div className="flex flex-col gap-3">
                {workDetailData?.workDetails?.map((work, index) => {
                  const completedTasks =
                    work.checklist?.filter((t) => t.completed).length || 0;
                  const totalTasks = work.checklist?.length || 0;

                  return (
                    <div
                      key={index}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {work.department?.replace("_", " ")}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(work.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${work.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : work.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {work.status?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Progress Section */}
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-xs font-medium text-gray-600">
                              Progress
                            </span>
                            {/* <span className="text-xs font-medium text-gray-900">
                              {work.progressPercentage}%
                            </span> */}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-black h-full rounded-full transition-all duration-500"
                              style={{ width: `${work.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-500">
                              Recent Activity
                            </span>
                            <span className="text-xs text-gray-400">
                              {work?.progressPercentage?.completeField}/
                              {work?.progressPercentage?.totalField} Tasks
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {work.checklist
                              ?.filter((t) => t.completed)
                              // .slice(0, 2)
                              .map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <span
                                    className="text-xs text-gray-600 line-clamp-1"
                                    title={item.label}
                                  >
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            {completedTasks === 0 && (
                              <p className="text-xs text-gray-400 italic col-span-full">
                                No completed tasks yet
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}

                        <div className="flex flex-wrap gap-4">
                          {work.employeeId?.map((item) => (
                            <div
                              key={item?._id}
                              className="flex items-center gap-1.5 text-xs text-black pt-2"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span className="capitalize">
                                {item?.basicDetails?.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!workDetailData?.workDetails ||
                  workDetailData.workDetails.length === 0) && (
                    <p className="text-gray-500 text-sm">No work history found</p>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWork;
