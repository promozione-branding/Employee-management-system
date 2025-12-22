"use client";
import { UserRoundPlus } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommonForm from "@/components/layout/Form";
import { employeeRegisterFormControl } from "@/config/data";
import { initialEmployeeRegisterFormData } from "@/config/initialFormDate";
import toast from "react-hot-toast";
import { registerService } from "@/service/auth";

const Employee = () => {
  const [formData, setFormData] = useState(initialEmployeeRegisterFormData);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.username || !formData?.role) {
      toast.error("Please enter both email and password. also role");
      return;
    }

    if (formData?.email?.split("@")[1] !== "promozionebranding.com") {
      toast.error("Only official company email is supported.");
      return;
    }

    if (formData?.password?.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const {data} = await registerService(formData);

      if(data.success){
        toast.success(data.message || "Employee add successfully")
        setFormData(initialEmployeeRegisterFormData)
        setOpenDialog(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while creating the Employee");
      setLoading(false);
    }
  }

  return (
    <div>
      <div>all Employess</div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div className="absolute bottom-20 right-20 border-2 border-black p-3 rounded-full flex items-center justify-center">
            <UserRoundPlus />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className={"hidden"}>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <p className="font-bold text-2xl text-center">Add Employee</p>
          <CommonForm
            formControls={employeeRegisterFormControl}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleRegister}
            buttonText={"Add"}
            isBtnDisabled={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employee;
