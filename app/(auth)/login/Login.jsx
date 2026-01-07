"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommonForm from "@/components/layout/Form";
import { loginFormControl } from "@/config/data";
import { loginFormData } from "@/config/initialFormDate";
import toast from "react-hot-toast";
import { loginService } from "@/service/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(loginFormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.password) {
      toast.error("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (form?.email?.split("@")[1] !== "promozionebranding.com") {
      toast.error("Only official company email is supported.");
      setLoading(false);
      return;
    }

    if (form?.password?.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    try {
      const res = await loginService(form);
      if (res.success) {
        toast.success(res.message || "user logged in successfully");
        setForm(loginFormData);
        setLoading(false);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message ||  "Error while login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <CommonForm
          isBtnDisabled={loading}
          formControls={loginFormControl}
          formData={form}
          setFormData={setForm}
          onSubmit={handleSubmit}
        />

        {/* Register Link */}
        <p className="text-center mt-4 text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-black underline">
            Register
          </a>
        </p>
        <a href="/login-otp" className="flex justify-center mt-4 font-medium text-blue-600 text-sm">
          Login with OTP{" "}
        </a>
      </div>
    </div>
  );
}
