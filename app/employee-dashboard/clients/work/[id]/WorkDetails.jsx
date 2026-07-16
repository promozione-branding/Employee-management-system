"use client";

import Loading from "@/components/layout/Loading";
import { getProjectsByEmployeeIdService, getWorkDetailByIdService } from "@/service/employee-dashboard/employee";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SEOChecklistForm from "../CheckList";
import {
  seoChecklistTemplate,
  paidAdsChecklistTemplate,
  socialMediaChecklistTemplate,
  webDevelopmentChecklistTemplate,
  checkFormControl,
  b2bWebsiteChecklistTemplate,
  d2cWebsiteChecklistTemplate,
} from "@/config/employee";
import { addCheckListService } from "@/service/employee-dashboard/work-details";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GridForm from "@/components/layout/GridForm";
import { initialCheckListData } from "@/config/employee/initialData";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const WorkDetails = ({ workDetailId }) => {
  const { employee } = useEmployeeStore();
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const [workDetailsData, setWorkDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkListPopFormData, setCheckListPopFormData] = useState(initialCheckListData);
  const [checkListOpen, setCheckListOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  async function fetchWorkDetails() {
    try {
      if (!workDetailId || !employee?._id) return;
      //   getWorkDetailByIdService(workDetailId),

      const workRes = await getProjectsByEmployeeIdService(workDetailId, employee._id);
      setProjects(workRes?.data);
      if (workRes.data.length > 0) {
        setSelectedProject(workRes.data[0]); // first project selected
      }
      // setWorkDetailsData(workRes);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
        "Error while fetching work details"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(checklistData) {

    try {
      setIsBtnDisabled(true);

      const res = await addCheckListService(selectedProject.workDetailId, {
        checkList: checklistData.filter((i) => i.completed),
        totalField: checklistData.length,
      });

      if (res.success) {
        toast.success(res.message);
        await fetchWorkDetails();

        // const updated = res.data;

        // setSelectedProject(updated);
      }
    } finally {
      setIsBtnDisabled(false);
    }
  }

  async function handlePopCheckList(e) {
    e.preventDefault();
    // console.log({ ...checkListPopFormData, completedBy: employee?._id }, employee?._id)
    try {
      const res = await addCheckListService(selectedProject.workDetailId, {
        checkList: { ...checkListPopFormData, completedBy: employee?._id },
        totalField: selectedProject?.progressPercentage?.totalField + 1,
      });
      if (res.success) {
        toast.success(res.message || "Checklist updated successfully");
        setCheckListOpen(false);
        fetchWorkDetails();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message || "Error while add check list");
    }
  }

  useEffect(() => {
    fetchWorkDetails();
  }, [workDetailId, employee?._id]);

  if (loading) return <Loading />;

  // if (!workDetailsData) {
  //   return <p className="text-sm text-gray-500">No work details found.</p>;
  // }

  // const { department, checklist, status } = workDetailsData;
  const department = selectedProject?.department;
  const checklist = selectedProject?.checklist || [];

  let selectedTemplate;
  switch (department) {
    case "SEO":
      selectedTemplate = seoChecklistTemplate;
      break;

    case "WEB_DEVELOPER":
      selectedTemplate = selectedProject?.project?.serviceType === "B2b"
        ? b2bWebsiteChecklistTemplate :
        selectedProject?.project?.serviceType === "D2C" ?
          d2cWebsiteChecklistTemplate
          : webDevelopmentChecklistTemplate;
      break;

    case "SOCIAL_MEDIA":
      selectedTemplate = socialMediaChecklistTemplate;
      break;

    default:
      selectedTemplate = paidAdsChecklistTemplate;
  }

  console.log(selectedProject?.project?.serviceType)

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        {/* Header */}
        <div>
          <div>
            <h2 className="text-xl font-semibold">{department} Work Details</h2>
            <p className="text-sm text-gray-500"></p>
          </div>

          {/* Checklist */}
          {/* <div className="w-[80vw] mt-2">
            {checklist?.length === 0 && (
              <p className="text-sm text-gray-500">No checklist items.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {checklist?.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 border rounded-xl p-2"
                >
                  {item?.proofUrl ? (
                    <a
                      href={
                        item.proofUrl.startsWith("http")
                          ? item.proofUrl
                          : `https://${item.proofUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm text-blue-500 hover:underline ${item.completed ? "line-through" : ""
                        }`}
                    >
                      {item?.label}
                    </a>
                  ) : (
                    <span
                      className={`text-sm ${item.completed ? "line-through text-gray-500" : ""
                        }`}
                    >
                      {item?.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* <div className="mr-10">
          <Dialog open={checkListOpen} onOpenChange={setCheckListOpen}>
            <DialogTrigger className=" border-2 p-2 rounded-full border-emerald-500 absolute top-10 right-10">
              <Plus />
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
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project, idx) => (
          <div key={idx} onClick={() => setSelectedProject(project)}
            className={`bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition
${selectedProject?.workDetailId === project.workDetailId
                ? "border-black ring-2 ring-black"
                : "border-gray-200"
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg flex flex-col">
                {project.project.projectName}
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(project.project.startDate).toLocaleDateString()}
                {" → "}
                {project.project.endDate ? new Date(project.project.endDate).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
            {project?.project?.serviceType &&
              <p className="text-sm font-medium">
                {project?.project?.serviceType} - Website
              </p>}

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Assigned Employees
              </p>

              <div className="flex flex-wrap gap-2">
                {project.employees?.map((employee) => (
                  <div
                    key={employee._id}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm"
                  >
                    {employee.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-300 p-3 rounded-md">
        <div className="relative">
          <div className="w-full">
            {checklist?.length === 0 && (
              <p className="text-sm text-gray-500">No checklist items.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {checklist?.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 border rounded-xl p-2"
                >
                  {item?.proofUrl ? (
                    <a
                      href={
                        item.proofUrl.startsWith("http")
                          ? item.proofUrl
                          : `https://${item.proofUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm text-blue-500 hover:underline ${item.completed ? "line-through" : ""
                        }`}
                    >
                      {item?.label}
                    </a>
                  ) : (
                    <span
                      className={`text-sm ${item.completed ? "line-through text-gray-500" : ""
                        }`}
                    >
                      {item?.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mr-10">
            <Dialog open={checkListOpen} onOpenChange={setCheckListOpen}>
              <DialogTrigger className=" border-2 p-2 rounded-full border-emerald-500 absolute top-0 right-10">
                <Plus />
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

        {selectedProject && (
          <SEOChecklistForm
            key={selectedProject.workDetailId}
            project={selectedProject}
            onSubmit={handleSubmit}
            template={selectedTemplate}
            completed={selectedProject.checklist}
            buttonDisabled={isBtnDisabled}
          />
        )}
      </div>
    </div>
  );
};

export default WorkDetails;
