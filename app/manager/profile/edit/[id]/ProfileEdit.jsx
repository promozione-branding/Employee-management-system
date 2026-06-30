"use client";

import CommonForm from "@/components/layout/Form";
import { profileFormControl } from "@/config/employee";
import { initialProfileData } from "@/config/employee/initialData";
import { initialEmployeesBasicDetails } from "@/config/initialFormDate";
import {
  createEmployeeProfile,
  editEmployeeBasicDetails,
  updateEmployeeImage,
} from "@/service/employee-dashboard/employee";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Profile = ({ employeeId }) => {
  const [formData, setFormData] = useState(initialProfileData);
  const [image, setImage] = useState("https://github.com/shadcn.png");
  const router = useRouter();

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        setImage(URL.createObjectURL(file));
        const imageForm = new FormData();
        imageForm.append("file", file);

        const { url } = await updateEmployeeImage(imageForm);
        if (url) {
          toast.success("Profile picture uploaded successfully");
          setImage(url);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message || "Error while uploading profile picture",
      );
    }
  };

  async function handleEmployeeBasicDetailSubmit(e) {
    e.preventDefault();

    try {
      const formDataValue = {
        ...formData,
        profileImage: image,
      };
      const filteredData = Object.fromEntries(
        Object.entries(formDataValue).filter(
          ([_, value]) => value !== "" && value !== null,
        ),
      );

      const res = await editEmployeeBasicDetails(employeeId, filteredData);
      if (res.success) {
        toast.success("successfully details updated");
        setFormData(initialProfileData);
        router.push("/employee-dashboard/profile");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "error while create employee profile",
      );
    }
  }

  // useEffect(() => {
  //   const employeeData = JSON.parse(sessionStorage.getItem("employeeData"));
  //   console.log(employeeData, "employeeData");
  //   if (employeeData?.basicDetails) {
  //     setFormData(employeeData.basicDetails);
  //     if (employeeData.basicDetails.profileImage) {
  //       setImage(employeeData.basicDetails.profileImage);
  //     }
  //   }
  // }, []);
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <label
              htmlFor="profile-upload"
              className="cursor-pointer block relative"
            >
              <Image
                src={image}
                width={1000}
                height={1000}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm transition-opacity group-hover:opacity-75"
                alt="Profile Picture"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Edit
                </span>
              </div>
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">My Profile</h1>
          <p className="text-gray-500 text-sm">
            Manage your personal information
          </p>
        </div>

        <div className="mt-6">
          <CommonForm
            formControls={profileFormControl}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEmployeeBasicDetailSubmit}
            buttonText="Update Profile"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
