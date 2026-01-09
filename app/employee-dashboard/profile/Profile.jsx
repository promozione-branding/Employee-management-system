"use client";

import CommonForm from "@/components/layout/Form";
import { employeeBasicDetailsFormControl } from "@/config/data";
import { initialEmployeesBasicDetails } from "@/config/initialFormDate";
import Image from "next/image";
import { useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState(initialEmployeesBasicDetails);
  const [image, setImage] = useState(
    "https://i.pinimg.com/736x/9e/c0/f8/9ec0f877571edc437f89c15c08081533.jpg"
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
    <div>
      <div className="relative inline-block">
        <label htmlFor="profile-upload" className="cursor-pointer block">
          <Image
            src={image}
            width={1000}
            height={1000}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
            alt="dp"
          />
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div>
        <CommonForm
          formControls={employeeBasicDetailsFormControl}
          formData={formData}
          onSubmit={handleEmployeeBasicDetailSubmit}
        />
      </div>
    </div>
  );
};

export default Profile;
