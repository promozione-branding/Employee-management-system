"use client";

import React, { useEffect, useState } from "react";
import {
  Camera,
  Phone,
  Briefcase,
  User,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createAdminBasicDetailService,
  getAdminBasicDetailService,
  uploadProfileIageServices,
} from "@/service/admin-dashboard/admin-basic";
import { useAdminStore } from "@/lib/store/AdminStore";

const Profile = () => {
  const { adminDetail } = useAdminStore();
  const [profileDetail, setProfileDetail] = useState({});

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: "",
    department: "",
    phone: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show immediate local preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // 2. Prepare FormData and call upload service
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setUploading(true);
      const response = await uploadProfileIageServices(uploadData);
      if (response.success) {
        setFormData((prev) => ({ ...prev, profileImage: response.url }));
        toast.success("Image uploaded successfully");
      }

      // Mocking successful response for your logic:
      setFormData((prev) => ({ ...prev, profileImage: response.url }));
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profileImage)
      return toast.error("Please upload a profile image first.");
    try {
      setLoading(true);
      const result = await createAdminBasicDetailService({
        ...formData,
        userId: adminDetail?._id,
      });
      if (result.success) {
        toast.success("Profile details saved successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error saving details. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  async function fetchAdminBasicDetail() {
    try {
      const res = await getAdminBasicDetailService(adminDetail?._id);
      if (res.success) {
        setProfileDetail({ ...res?.data, adminDetail: res?.adminDetail });
      }
    } catch (error) {
      console.log(error);
    }
  }



  useEffect(() => {
    if (!adminDetail?._id) return;
    fetchAdminBasicDetail();
  }, [adminDetail?._id]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {profileDetail?.adminDetail ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Admin Profile
              </h1>
              <p className="text-sm text-slate-500">
                View and manage your account details.
              </p>
            </div>
            <button
              onClick={() =>
                setProfileDetail((prev) => ({ ...prev, adminDetail: false }))
              }
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all active:scale-95"
            >
              Edit Information
            </button>
          </div>

          <div className="p-8 space-y-10">
            <div className="flex flex-col items-center sm:flex-row gap-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm flex items-center justify-center">
                {profileDetail?.profileImage ? (
                  <img
                    src={profileDetail?.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">
                  {profileDetail.department} Team
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-slate-500">
                  <span className="flex items-center gap-2 text-sm italic font-medium">
                    <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                    {profileDetail.department}
                  </span>
                  <span className="flex items-center gap-2 text-sm italic font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />{" "}
                    {profileDetail.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Profile verified and active
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                    Account details were last synchronized on{" "}
                    {new Date(profileDetail.updatedAt).toLocaleDateString(
                      "en-US",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
            <h1 className="text-xl font-bold text-slate-800">
              Basic Information
            </h1>
            <p className="text-sm text-slate-500">
              Update your profile photo and basic details here.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-inner">
                  {imagePreview || formData.profileImage ? (
                    <img
                      src={imagePreview || formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="image-upload"
                  className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 rounded-xl text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="font-semibold text-slate-700">Profile Photo</h3>
                <p className="text-sm text-slate-500">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
                {formData.profileImage && !uploading && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mt-2">
                    <CheckCircle className="w-3 h-3" /> Uploaded
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Department Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 italic">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                  className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select Department</option>
                  <option value="sales">Sales</option>
                </select>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 italic">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 886XXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading || uploading}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Processing..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
