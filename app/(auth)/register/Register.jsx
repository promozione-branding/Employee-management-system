"use client";

import CommonForm from "@/components/layout/Form";
import { registerFormControl } from "@/config/data";
import { registerFormData } from "@/config/initialFormDate";
import { registerService } from "@/service/auth";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState(registerFormData);
  const [loading, setLoading] = useState(false);

  async function handleRegisterForm(e) {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password || !formData.username) {
      toast.error("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (formData?.email?.split("@")[1] !== "promozionebranding.com") {
      toast.error("Only official company email is supported.");
      setLoading(false);
      return;
    }

    if (formData?.password?.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await registerService(formData);
      if (data.success) {
        toast.success(data.message);
        setFormData(registerFormData);
        setLoading(false);
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8 border">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>

        {/* Form */}
        <CommonForm
          isBtnDisabled={loading}
          formControls={registerFormControl}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleRegisterForm}
        />

        {/* Login Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-black underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
