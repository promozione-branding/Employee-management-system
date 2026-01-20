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

const WorkDetails = ({ workDetailId }) => {
  const [workDetailsData, setWorkDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);
  

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(selectedTemplate,"selectedTemplate");
    
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
      <div className="w-[25vw]">
        {/* Header */}
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
              <input
                type="checkbox"
                checked={item.completed}
                readOnly
                className="h-4 w-4"
              />
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
        <SEOChecklistForm onSubmit={handleSubmit} template={selectedTemplate} />
      </div>
    </div>
  );
};

export default WorkDetails;
