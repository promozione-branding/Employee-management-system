"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { sendOtpService, verifyOTP } from "@/service/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email) {
      toast.error("Please enter email.");
      setLoading(false);
      return;
    }

    // if (form.email.split("@")[1] !== "promozionebranding.com") {
    //   toast.error("Only official company email is supported.");
    //   setLoading(false);
    //   return;
    // }

    try {
      const res = await sendOtpService(form);
      if (res.success) {
        toast.success(res.message || "OTP send successfully");
        setStep(2);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await verifyOTP({ email: form?.email, otp });
      if (res.success) {
        toast.success(res.message);
        localStorage.setItem("token", res.token);
        router.push("/dashboard");
      } else {
        toast.error(res.message || "OTP verification failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("OTP verification failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* STEP 1 → EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              placeholder="Enter official email"
              className="w-full p-3 border rounded-lg mb-4"
              value={form.email}
              onChange={(e) => setForm({ email: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 → OTP INPUT */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 border rounded-lg mb-4 text-center text-xl tracking-widest"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p
              className="text-center mt-3 text-sm underline cursor-pointer"
              onClick={() => setStep(1)}
            >
              Change Email
            </p>
          </form>
        )}

        <Link
          href={"/login"}
          className="flex items-center justify-center mt-4 text-blue-600 font-medium text-sm"
        >
          Login using Password
        </Link>
      </div>
    </div>
  );
}
