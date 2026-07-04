"use client";

import Loading from "@/components/layout/Loading";
import { Input } from "@/components/ui/input";
import { GetClientWorkDetailHistory } from "@/service/customer/history";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GridForm from "@/components/layout/GridForm";
import { checkFormControl, paidAdsChecklistTemplate, seoChecklistTemplate, socialMediaChecklistTemplate, webDevelopmentChecklistTemplate } from "@/config/employee";
import { addCheckListService } from "@/service/employee-dashboard/work-details";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import MyDateRangePicker from "@/components/ui/DateRangePicker";

const WorkDetail = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [clientWorkData, setClientWorkData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("WEB_DEVELOPER");
  const [selectedRange, setSelectedRange] = useState({});
  const [selectedProject, setSelectedProject] = useState({});
  const [checkListOpen, setCheckListOpen] = useState(false);
  const [checkListPopFormData, setCheckListPopFormData] = useState({
    key: "",
    label: "",
    remarks: "",
    proofUrl: "",
    completed: false,
    completedAt: "",
  });

  const [open, setOpen] = useState(false);
  const range = selectedRange[selectedProject._id] || {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  };

  async function fetchClientWorkDetail(selectedProjectId = null) {
    try {
      const res = await GetClientWorkDetailHistory(customerId);
      if (res.success) {
        const workDetails = res?.data?.workDetails || [];

        setClientWorkData(workDetails);

        if (selectedProjectId) {
          const updatedProject = workDetails.find(
            (item) => item._id === selectedProjectId
          );

          if (updatedProject) {
            setSelectedProject(updatedProject);
          }
        }

        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message ||
        "Error while fetching the client work details",
      );
    }
  }

  async function handlePopCheckList(e) {
    e.preventDefault();
    try {
      const res = await addCheckListService(selectedProject._id, {
        checkList: checkListPopFormData,
        totalField: selectedProject?.progressPercentage?.totalField + 1,
      });
      if (res.success) {
        toast.success(res.message || "Checklist updated successfully");
        setCheckListOpen(false);

        setCheckListPopFormData({
          key: "",
          label: "",
          remarks: "",
          proofUrl: "",
          completed: false,
          completedAt: "",
        });

        await fetchClientWorkDetail(selectedProject._id);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message || "Error while add check list");
    }
  }

  useEffect(() => {
    fetchClientWorkDetail();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const departments = [
    { label: "Web Dev", value: "WEB_DEVELOPER" },
    { label: "SEO", value: "SEO" },
    { label: "Social Media", value: "SOCIAL_MEDIA" },
    { label: "Sales", value: "SALES" },
    { label: "Ads Management", value: "ADS_MANAGER" },
  ];

  const filteredProjects = clientWorkData.filter((work) => {
    if (selectedDepartment === "ALL") return true;

    return work.department === selectedDepartment;
  });

  // const range = selectedRange[selectedProject._id];
  const department = selectedProject?.department;
  let selectedTemplate;
  switch (department) {
    case "SEO":
      selectedTemplate = seoChecklistTemplate;
      break;

    case "WEB_DEVELOPER":
      selectedTemplate = webDevelopmentChecklistTemplate;
      break;

    case "SOCIAL_MEDIA":
      selectedTemplate = socialMediaChecklistTemplate;
      break;

    default:
      selectedTemplate = paidAdsChecklistTemplate;
  }

  const checklistMap = new Map(    (selectedProject?.checklist || []).map(item => [item.key, item])  );
  const mergedChecklist = selectedTemplate.map(templateItem => {
    return checklistMap.get(templateItem.key) || templateItem;
  });

  const customChecklist = (selectedProject?.checklist || []).filter(
    item => !selectedTemplate.some(template => template.key === item.key)
  );

  const finalChecklist = [...mergedChecklist, ...customChecklist];
  const filteredChecklist = finalChecklist.filter(item => {
    if (!range?.startDate || !range?.endDate) return true;

    // Always show pending tasks
    if (!item.completed || !item.completedAt) return true;

    const completedDate = new Date(item.completedAt);
    completedDate.setHours(0, 0, 0, 0);

    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);

    return completedDate >= start && completedDate <= end;
  });

  // console.log(selectedProject)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Work History Details
      </h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden px-5 py-4 flex gap-4 flex-wrap">
        {departments.map((dept) => (
          <button
            key={dept.value}
            onClick={() => { setSelectedDepartment(dept.value); setSelectedProject({}) }}
            className={`px-4 py-2 rounded-md transition ${selectedDepartment === dept.value
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
              }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {!selectedProject._id ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects?.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No work history available for this client.
            </div>
          ) : (filteredProjects.map((work, id) => (
            <div onClick={() => setSelectedProject(work)} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden py-2 px-4" key={id}>
              <h3 className="text-lg font-semibold text-gray-900">
                {work.project.projectName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Started: {new Date(work.startedAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${work.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : work.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {work.status.replace("_", " ")}
                </span>
              </div>
              {work.progressPercentage && (
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {work.progressPercentage.totalField > 0
                        ? Math.round(
                          (work.progressPercentage.completeField /
                            work.progressPercentage.totalField) *
                          100,
                        )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${work.progressPercentage.totalField > 0
                          ? (work.progressPercentage.completeField /
                            work.progressPercentage.totalField) *
                          100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {work.progressPercentage.completeField} /{" "}
                    {work.progressPercentage.totalField} Completed
                  </div>
                </div>
              )}
            </div>
          )))}
        </div>) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Header Section */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4 w-full">
              <button
                className="p-2 rounded-md bg-gray-200 text-gray-800 hover:text-white hover:bg-blue-600 transition"
                onClick={() => setSelectedProject({})}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProject.project.projectName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Started: {new Date(selectedProject.startedAt).toLocaleString()}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${selectedProject.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : selectedProject.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {selectedProject.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-start md:items-end w-full">
              {selectedProject.progressPercentage && (
                <div className="w-full md:w-64">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {selectedProject.progressPercentage.totalField > 0
                        ? Math.round(
                          (selectedProject.progressPercentage.completeField /
                            selectedProject.progressPercentage.totalField) *
                          100,
                        )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${selectedProject.progressPercentage.totalField > 0
                          ? (selectedProject.progressPercentage.completeField /
                            selectedProject.progressPercentage.totalField) *
                          100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {selectedProject.progressPercentage.completeField} /{" "}
                    {selectedProject.progressPercentage.totalField} Completed
                  </div>
                </div>
              )}

              <div className="flex flex-row gap-2 items-start md:items-center">
                {/* <select
                  className="border p-2 rounded-md text-sm"
                  value={dayFilter}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedDay((prev) => ({
                      ...prev,
                      [selectedProject._id]: value,
                    }));

                    if (value !== "ALL") {
                      setSelectedDate((prev) => ({
                        ...prev,
                        [selectedProject._id]: "",
                      }));
                    }
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                  <option value="LAST_7_DAYS">Last 7 Days</option>
                  <option value="LAST_30_DAYS">Last 30 Days</option>
                </select> */}

                {/* <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedDate((prev) => ({
                      ...prev,
                      [selectedProject._id]: value,
                    }));

                    setSelectedDay((prev) => ({
                      ...prev,
                      [selectedProject._id]: "ALL",
                    }));
                  }}
                /> */}
                <MyDateRangePicker
                  value={range}
                  open={open}
                  setOpen={setOpen}
                  onChange={(range) => {
                    setSelectedRange((prev) => ({
                      ...prev,
                      [selectedProject._id]: {
                        ...range,
                        key: "selection",
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {/* Employees Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Team Members
              </h4>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-3">
                  {selectedProject.employeeId.map((emp) => (
                    <div
                      key={emp._id}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {emp.basicDetails.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {emp.basicDetails.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.basicDetails.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {/* <button className="flex items-center gap-1 p-2 text-xs font-medium rounded-md bg-gray-200 text-gray-800 hover:text-white hover:bg-blue-600 transition">
                    <Plus className="h-3.5 w-3.5" />
                    Add Checklist
                  </button> */}
                  <Dialog open={checkListOpen} onOpenChange={setCheckListOpen}>
                    <DialogTrigger className="flex items-center gap-1 p-2 text-xs font-medium rounded-md bg-gray-200 text-gray-800 hover:text-white hover:bg-blue-600 transition">
                      <Plus className="h-3.5 w-3.5" />
                      Add Checklist
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader className={"hidden"}>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete
                          your account and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <p className="text-center text-lg mb-2 font-medium">
                          Check List
                        </p>
                        <GridForm
                          formControls={checkFormControl}
                          formData={checkListPopFormData}
                          setFormData={setCheckListPopFormData}
                          onSubmit={handlePopCheckList}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CompletedBy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proof
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...filteredChecklist].sort((a, b) => {
                    if (a.completed === b.completed) return 0;
                    return a.completed ? -1 : 1;
                  }).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {item.label}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.completed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.completedAt ? new Date(item.completedAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {item.remarks.length > 10 ? item.remarks.slice(0, 10) + "..." : item.remarks || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium max-w-xs truncate capitalize text-black">
                        {item?.completedBy?.basicDetails?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {item.proofUrl ? (
                          <a
                            href={
                              item.proofUrl.startsWith("http")
                                ? item.proofUrl
                                : `https://${item.proofUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Proof
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}
    </div>
  );
};

export default WorkDetail;
