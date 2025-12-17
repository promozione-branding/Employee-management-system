"use client";

import { getAllProposalCustomer } from "@/service/customer";
import {
  deleteProposalService,
  sendProposalPdfEmailService,
} from "@/service/proposal";
import { Album, Download, Eye, Mail, NotebookPen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CustomerProposal = ({ customerId }) => {
  const [listPropoasls, setListPropoasls] = useState([]);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);

  async function sendEmailHandler(proposalId) {
    if (sendingInvoiceId) return; // Prevent multiple clicks
    setSendingInvoiceId(proposalId);
    const toastId = toast.loading("Sending email...");
    try {
      const res = await sendProposalPdfEmailService({ proposalId });
      if (res.success) {
        toast.success("Email sent successfully!", { id: toastId });
      } else {
        throw new Error(res.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("sendEmailHandler error:", error);
      toast.error(error.message || "An error occurred.", { id: toastId });
    } finally {
      setSendingInvoiceId(null);
    }
  }

  async function getAllCustomerPropsals() {
    try {
      const allPropsals = await getAllProposalCustomer(customerId);
      if (allPropsals?.success) {
        toast.success("Proposal fetched");
        setListPropoasls(allPropsals.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch proposals");
    }
  }

  async function handleDeleteProposal(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this proposal?"
    );
    if (confirmed) {
      try {
        const response = await deleteProposalService(id);
        if (response.success) {
          toast.success(response.message);
          getAllCustomerPropsals();
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  }

  useEffect(() => {
    getAllCustomerPropsals();
  }, []);

  return (
    <div>
      <p className="font-bold text-2xl text-center mb-5">All Proposals</p>
      {listPropoasls.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listPropoasls.map((item) => (
            <div
              key={item?._id}
              className="border rounded-lg p-4 shadow-md bg-white flex flex-col justify-between"
            >
              <div>
                <p className="bg-blue-300 flex py-1 px-3 rounded-full w-35 font-medium my-2">
                  {item?.proposalNo}
                </p>
                <h3 className="font-bold text-lg mb-2 truncate">
                  {item?.clientCompany}
                </h3>
                <p className=" text-gray-800 text-lg">
                  <strong>Client:</strong> {item?.clientName}
                </p>
                <p className=" text-gray-800 text-lg">
                  <strong>Client Address:</strong> {item?.clientAddress}
                </p>
                <p className=" text-gray-800 text-lg">
                  <strong>Client GSTIN:</strong> {item?.GSTIN}
                </p>

                <p className=" text-gray-800 text-lg">
                  <strong>Date:</strong>{" "}
                  {new Date(item?.dateOfProposal).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xl font-semibold mt-4 text-right text-blue-600">
                ₹{item?.totalAmount?.toLocaleString("en-IN") || "Na"}
              </p>

              <div className="mt-5 flex gap-4">
                <Link
                  href={`/dashboard/proposal/pdf-download/${item?._id}`}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full"
                >
                  <Download />
                </Link>
                <button disabled={sendingInvoiceId === item?._id}
                  onClick={() => sendEmailHandler(item?._id)}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail />
                </button>
                <Link
                  href={`/dashboard/proposal/edit-proposal/${item?._id}`}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full"
                >
                  <Pencil />
                </Link>
                <div
                  onClick={() => handleDeleteProposal(item?._id)}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full"
                >
                  <Trash2 />
                </div>
                <Link
                  href={`/dashboard/ledger/${item?._id}`}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full"
                >
                  <NotebookPen />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No proposals found for this customer.</p>
        </div>
      )}

      <Link
        href={`/dashboard/proposal/${customerId}`}
        className="fixed bottom-10 right-10 h-20 w-20 bg-blue-300 flex items-center justify-center rounded-full"
      >
        <Album size={30} />
      </Link>
    </div>
  );
};

export default CustomerProposal;
