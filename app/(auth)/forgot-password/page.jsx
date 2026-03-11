"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPasswordService, resetPasswordService } from "@/service/auth";
import { useRouter } from "next/navigation";

const ForgotResetPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // STEP 1 → SEND OTP
  async function handleForgotPassword(e) {
    e.preventDefault();

    if (!formData.email) {
      return toast.error("Email is required");
    }

    try {
      setLoading(true);

      const res = await forgotPasswordService({
        email: formData.email,
      });

      if (res.success) {
        toast.success(res.message || "OTP sent to email");
        setStep(2);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // STEP 2 → RESET PASSWORD
  async function handleResetPassword(e) {
    e.preventDefault();

    if (!formData.otp) {
      return toast.error("OTP is required");
    }

    if (!formData.password) {
      return toast.error("Password is required");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await resetPasswordService({
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      });

      if (res.success) {
        toast.success(res.message || "Password reset successful");

        setFormData({
          email: "",
          otp: "",
          password: "",
          confirmPassword: "",
        });

        router.push("/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <Button disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <Label>OTP</Label>
              <Input
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
              />
            </div>

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotResetPassword;
