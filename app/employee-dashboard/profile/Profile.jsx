"use client";

import CommonForm from "@/components/layout/Form";
import { employeeBasicDetailsFormControl } from "@/config/data";
import { initialEmployeesBasicDetails } from "@/config/initialFormDate";
import Image from "next/image";
import { useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState(initialEmployeesBasicDetails);
  const [image, setImage] = useState(
    "https://github.com/shadcn.png"
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  async function handleEmployeeBasicDetailSubmit(e) {
    e.preventDefault();
  }

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
                width={150}
                height={150}
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
            formControls={employeeBasicDetailsFormControl}
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
