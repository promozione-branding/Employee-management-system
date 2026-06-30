"use client";

import CommonForm from "@/components/layout/Form";
import { announcementFormControls } from "@/config/employee";
import { initialAnnouncementFormData } from "@/config/initialFormDate";
import { useState } from "react";
import { createAnnouncementService } from "@/service/employee-dashboard/dashboard";
import toast from "react-hot-toast";

const Announcement = () => {
  const [formData, setFormData] = useState(initialAnnouncementFormData);
  const [loading, setLoading] = useState(false);

  async function createAnnouncement(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createAnnouncementService(formData);
      if (res.success) {
        toast.success(res.message);
        setFormData(initialAnnouncementFormData);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="lg:w-1/3 mt-5">
        <CommonForm
          formControls={announcementFormControls}
          formData={formData}
          setFormData={setFormData}
          onSubmit={createAnnouncement}
          isBtnDisabled={loading}
          buttonText={loading ? "Submit..." : "Submit"}
        />
      </div>
    </div>
  );
};

export default Announcement;
