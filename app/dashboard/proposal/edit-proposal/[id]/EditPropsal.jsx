"use client";
import CommonForm from "@/components/layout/Form";
import { editFormControls } from "@/config/data";
import {
  editProposalService,
  getProposalByIdService,
} from "@/service/proposal";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const EditPropsal = ({ id }) => {
  const [formData, setFormData] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const router = useRouter();

  async function fetchProposalDataForEdit(id) {
    try {
      const response = await getProposalByIdService(id);

      if (response.success) {
        toast.success("Proposal data loaded for editing");
        const proposalData = response.data;

        if (proposalData.dateOfProposal) {
          proposalData.dateOfProposal = new Date(proposalData.dateOfProposal)
            .toISOString()
            .split("T")[0];
        }
        if (proposalData.validTill) {
          proposalData.validTill = new Date(proposalData.validTill)
            .toISOString()
            .split("T")[0];
        }
        setInitialFormData(proposalData);
        setFormData(proposalData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error fetching proposal data");
    }
  }

  async function handleEditPropsal(e) {
    e.preventDefault();

    const changedFields = {};

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        if (formData[key] !== initialFormData[key]) {
          changedFields[key] = formData[key];
        }
      }
    }

    try {
      // Check if both discount fields have values greater than 0
      if (
        Number(formData.discount) > 0 &&
        Number(formData.discountPercentage) > 0
      ) {
        toast.error(
          "Please provide a value for either Discount or Discount Percentage, not both."
        );
        return;
      }

      const response = await editProposalService(id, changedFields);
      if (response.success) {
        toast.success("Proposal updated successfully!");
        router.push("/proposal/all-proposal");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.message || "there is an error while editing the proposal"
      );
    }
  }

  useEffect(() => {
    fetchProposalDataForEdit(id);
  }, [id]);

  if (formData === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p className="font-bold text-2xl text-center">Edit Propsals</p>

      <div className="grid grid-cols-2">
        <CommonForm
          onSubmit={handleEditPropsal}
          formData={formData}
          setFormData={setFormData}
          formControls={editFormControls}
        />
      </div>
    </div>
  );
};

export default EditPropsal;
