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
} from "@/config/employee";
import { addCheckListService } from "@/service/employee-dashboard/work-details";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WorkDetails = ({ workDetailId }) => {
  const [workDetailsData, setWorkDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function handleSubmit(checklistData) {
    try {
      const filledData = checklistData.filter((item) => item.completed);

      const res = await addCheckListService(workDetailId, filledData);

      if (res.success) {
        toast.success(res.message || "Checklist updated successfully");
        setWorkDetailsData(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data?.message || "Error while add check list");
    }
  }

  useEffect(() => {
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

    fetchWorkDetails();
  }, [workDetailId]);

  if (loading) return <Loading />;

  if (!workDetailsData) {
    return <p className="text-sm text-gray-500">No work details found.</p>;
  }

  const { department, checklist, status, progressPercentage } = workDetailsData;

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
      <div className="flex justify-between">
        {/* Header */}

        <div>
          <div>
            <h2 className="text-xl font-semibold">{department} Work Details</h2>
            <p className="text-sm text-gray-500">
              Status: {status} • Progress: {progressPercentage}%
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            {checklist?.length === 0 && (
              <p className="text-sm text-gray-500">No checklist items.</p>
            )}

            {checklist?.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 border rounded-xl p-4"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
                <span
                  className={`text-sm ${
                    item.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Dialog>
            <DialogTrigger>
              <Plus />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <SEOChecklistForm onSubmit={handleSubmit} template={selectedTemplate} />
      </div>
    </div>
  );
};

export default WorkDetails;
