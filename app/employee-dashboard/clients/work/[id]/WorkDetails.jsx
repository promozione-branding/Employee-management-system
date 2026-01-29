"use client";

import Loading from "@/components/layout/Loading";
import { getWorkDetailByIdService } from "@/service/employee-dashboard/employee";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SEOChecklistForm from "../CheckList";
import {
  seoChecklistTemplate,
  paidAdsChecklistTemplate,
  socialMediaChecklistTemplate,
  webDevelopmentChecklistTemplate,
  checkFormControl,
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

const WorkDetails = ({ workDetailId }) => {
  const [workDetailsData, setWorkDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkListPopFormData, setCheckListPopFormData] =
    useState(initialCheckListData);
  const [checkListOpen, setCheckListOpen] = useState(false);

  async function fetchWorkDetails() {
    try {
      if (!workDetailId) return;
      const res = await getWorkDetailByIdService(workDetailId);

      if (res?.success) {
        setWorkDetailsData(res.data);
      } else {
        toast.error(res?.message || "Failed to fetch work details");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Error while fetching the work details",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(checklistData) {
    try {
      const filledData = checklistData.filter((item) => item.completed);

      const res = await addCheckListService(workDetailId, {
        checkList: filledData,
        totalField: Math.max(
          checklistData?.length || 0,
          workDetailsData?.progressPercentage?.totalField || 0,
        ),
      });

      if (res.success) {
        toast.success(res.message || "Checklist updated successfully");
        setWorkDetailsData(res.data);
        fetchWorkDetails();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message || "Error while add check list");
    }
  }

  async function handlePopCheckList(e) {
    e.preventDefault();

    try {
      const res = await addCheckListService(workDetailId, {
        checkList: checkListPopFormData,
        totalField: workDetailsData?.progressPercentage?.totalField + 1,
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
  }, [workDetailId]);

  if (loading) return <Loading />;

  if (!workDetailsData) {
    return <p className="text-sm text-gray-500">No work details found.</p>;
  }

  const { department, checklist, status } = workDetailsData;


  let selectedTemplate;
  if (department === "SEO") {
    selectedTemplate = seoChecklistTemplate;
  } else if (department === "WEB_DEVELOPER") {
    selectedTemplate = webDevelopmentChecklistTemplate;
  } else if (department === "SOCIAL_MEDIA") {
    selectedTemplate = socialMediaChecklistTemplate;
  } else {
    selectedTemplate = paidAdsChecklistTemplate;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        {/* Header */}

        <div>
          <div>
            <h2 className="text-xl font-semibold">{department} Work Details</h2>
            <p className="text-sm text-gray-500">
              {/* Status: {status} • Progress: {progressPercentage}% */}
            </p>
          </div>

          {/* Checklist */}
          <div className="w-[80vw] mt-2">
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
                      className={`text-sm text-blue-500 hover:underline ${
                        item.completed ? "line-through" : ""
                      }`}
                    >
                      {item?.label}
                    </a>
                  ) : (
                    <span
                      className={`text-sm ${
                        item.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {item?.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mr-10">
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
        </div>
      </div>

      {department === "OTHER" ? null : (
        <div>
          <SEOChecklistForm
            onSubmit={handleSubmit}
            template={selectedTemplate}
            completed={checklist}
          />
        </div>
      )}
    </div>
  );
};

export default WorkDetails;
