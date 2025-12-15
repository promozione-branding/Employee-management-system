"use client";

import CommonForm from "@/components/layout/Form";
import { addCustomerFormControl } from "@/config/data";
import { initalCustomerFormData } from "@/config/initialFormDate";
import {
  createCustomerServices,
  editCustomerServices,
} from "@/service/customer";
import { useState } from "react";
import toast from "react-hot-toast";

const CreateCustomer = ({
  setCustomerSiderbar,
  setCustomerCreated,
  customerDetails,
}) => {
  const [formData, setFormData] = useState(
    customerDetails || initalCustomerFormData
  );


  const handleCustomer = async (e) => {
    e.preventDefault();

    for (const control of addCustomerFormControl) {
      if (
        control.name !== "tanNo" &&
        control.name !== "website" &&
        control.name !== "meetingDate" &&
        !formData[control.name]
      ) {
        toast.error(`Please fill in the ${control.label} field.`);
        return;
      }
    }


    console.log(formData,"formData");
    try {
      const createdCustomer = await createCustomerServices(formData);
      if (createdCustomer.success) {
        toast.success("New customer add successfully");
        setFormData(initalCustomerFormData);
        setCustomerSiderbar(false);
        setCustomerCreated("done");
      }
      console.log(formData);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const editedResponse = await editCustomerServices(
        customerDetails?._id,
        formData
      );
      console.log(editedResponse, "editedResponse");
      if (editedResponse.success) {
        toast.success(editedResponse?.message);
        setCustomerSiderbar(false);
        setCustomerCreated("done2");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <div className="overflow-y-scroll ">
      <p className="font-semibold text-center text-2xl pb-5 px-2">
        Create New Client
      </p>
      <CommonForm
        formData={formData}
        setFormData={setFormData}
        formControls={addCustomerFormControl}
        buttonText={customerDetails ? "Edit Details" : "Add Client"}
        onSubmit={customerDetails ? handleEditCustomer : handleCustomer}
      />
    </div>
  );
};

export default CreateCustomer;
