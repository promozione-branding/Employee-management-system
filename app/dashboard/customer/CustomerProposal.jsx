"use client";

// downloading pdf
import { pdf } from "@react-pdf/renderer";
import ProposalPdfTemplate from "@/components/pdf/ProposalPdfTemplate";
import { pdfDownloadService } from "@/service/proposal";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  customerLedgerService,
  getAllProposalCustomer,
} from "@/service/customer";
import { createLedgerService, ledgerEntriesService } from "@/service/ledger";
import {
  deleteProposalService,
  proposalLedgerEntryValidation,
  sendProposalPdfEmailService,
} from "@/service/proposal";
import {
  Album,
  Check,
  Download,
  Eye,
  Mail,
  NotebookPen,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CustomerProposal = ({ customerId }) => {
  const [listPropoasls, setListPropoasls] = useState([]);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
  const [proposalLedgerEntryDate, setProposalLedgerEntryDate] = useState("");
  const [firstEntryOfLedger, setFirstEntryOfLedger] = useState(true);
  const [ledgerData, setLedgerData] = useState(null);

  // for cc mail to send proposal
  const [ccMail, setCcMail] = useState("");

  const router = useRouter();

  async function sendEmailHandler(e, proposalId) {
    e.preventDefault();
    if (sendingInvoiceId) return;
    setSendingInvoiceId(proposalId);
    const toastId = toast.loading("Sending email...");
    try {
      const res = await sendProposalPdfEmailService({
        proposalId,
        email: ccMail,
      });
      if (res.success) {
        toast.success("Email sent successfully!", { id: toastId });
      } else {
        throw new Error(res.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("sendEmailHandler error:", error);
      toast.error(error.response.data.message || "An error occurred.", {
        id: toastId,
      });
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
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch proposals");
    }
  }

  async function handleDeleteProposal(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this proposal?",
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

  // first proposal form entry
  async function handleProposalLedgerEntry(e, id) {
    e.preventDefault();

    const proposalDetails = listPropoasls.find((item) => item._id === id);

    if (!proposalDetails) {
      toast.error("Proposal details not found");
      return;
    }

    if (!proposalLedgerEntryDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      const totalAmount = proposalDetails?.totalAmount || 0;
      const gstAmount = totalAmount * 0.18;
      const tdsAmount = proposalDetails?.tanNo ? totalAmount * 0.02 : 0;
      const grandTotal = totalAmount + gstAmount - tdsAmount;

      const formData = {
        customerId: customerId,
        proposalIds: [...(ledgerData?.ledger?.proposalIds || []), id],
        entries: [
          {
            proposalId: id,
            date: proposalLedgerEntryDate,
            voucher: "Proposal",
            debit: 0,
            credit: 0,
            balance: grandTotal,
            particular: {
              description: `Proposal #${proposalDetails?.proposalNo}`,
              items: [
                {
                  subDescription: "18% GST",
                  price: gstAmount,
                },
                {
                  subDescription: "Service Amount",
                  price: totalAmount,
                },
                ...(proposalDetails?.tanNo
                  ? [
                      {
                        subDescription: "2% TDS",
                        price: tdsAmount,
                      },
                    ]
                  : []),
                {
                  subDescription: "Total Amount",
                  price: grandTotal,
                },
              ],
            },
          },
        ],
      };

      const res = await createLedgerService(formData);
      if (res.success) {
        router.push("/dashboard/customer");
        toast.success("Ledger Entry created Successfully");
        await proposalLedgerEntryValidation(id, {
          ledgerEntry: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Error while add proposal in the ledger",
      );
    }
  }

  async function anotherProposalLedgerEntry(e, id) {
    e.preventDefault();

    const proposalDetails = listPropoasls.find((item) => item._id === id);

    if (!proposalDetails) {
      toast.error("Proposal details not found");
      return;
    }

    if (!proposalLedgerEntryDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      const totalAmount = proposalDetails?.totalAmount || 0;
      const gstAmount = totalAmount * 0.18;
      const tdsAmount = proposalDetails?.tanNo ? totalAmount * 0.02 : 0;
      const grandTotal = totalAmount + gstAmount - tdsAmount;

      const formData = {
        proposalId: id,
        date: proposalLedgerEntryDate,
        voucher: "Proposal",
        debit: 0,
        credit: 0,
        balance: ledgerData?.ledger?.entries.at(-1)?.balance + grandTotal,
        particular: {
          description: `Proposal #${proposalDetails?.proposalNo}`,
          items: [
            {
              subDescription: "18% GST",
              price: gstAmount,
            },
            {
              subDescription: "Service Amount",
              price: totalAmount,
            },
            ...(proposalDetails?.tanNo
              ? [
                  {
                    subDescription: "2% TDS",
                    price: tdsAmount,
                  },
                ]
              : []),
            {
              subDescription: "Total Amount",
              price: grandTotal,
            },
          ],
        },
      };

      const res = await ledgerEntriesService(ledgerData?.ledger?._id, {
        entriesData: formData,
        proposalId: id,
      });
      if (res.success) {
        router.push("/dashboard/customer");
        toast.success("Ledger Entry created Successfully");
        await proposalLedgerEntryValidation(id, {
          ledgerEntry: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  async function fetchLedgerDetails() {
    try {
      if (customerId) {
        const res = await customerLedgerService(customerId);
        if (res.success) {
          setLedgerData(res.data);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const downloadProposalPdf = async (proposalId) => {
    try {
      const toastId = toast.loading("Generating PDF...");

      // ✅ Fetch proposal data
      const res = await pdfDownloadService(proposalId);

      if (!res?.success) {
        throw new Error("Failed to fetch proposal data");
      }

      const pdfData = res.data;

      // ✅ Generate PDF Blob
      const blob = await pdf(<ProposalPdfTemplate data={pdfData} />).toBlob();

      // ✅ Create download link
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdfData?.clientName}-Proposal.pdf`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Download failed");
    }
  };

  useEffect(() => {
    fetchLedgerDetails();
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
              className={`border rounded-lg p-4 shadow-md ${
                item?.ledgerEntry ? " border-blue-400 border" : "bg-white"
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between">
                  <p className="bg-blue-300 flex py-1 px-3 rounded-full w-35 font-medium my-2">
                    {item?.proposalNo}
                  </p>
                  <div
                    className={` ${
                      item?.ledgerEntry
                        ? "border flex items-center justify-center w-10 h-10 rounded-full shadow-2xl"
                        : "hidden"
                    }`}
                  >
                    <Check />
                  </div>
                </div>
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
                  <Eye />
                </Link>

                <div
                  onClick={() => downloadProposalPdf(item?._id)}
                  className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full"
                >
                  <Download />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                      <Mail />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Email</DialogTitle>
                      <DialogDescription>
                        That is the CC Email option
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      className="flex gap-3"
                      onSubmit={(e) => sendEmailHandler(e, item?._id)}
                    >
                      <Input
                        type={"email"}
                        value={ccMail}
                        onChange={(e) => setCcMail(e.target.value)}
                      />
                      <Button type="submit">Send</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Link
                  href={`/dashboard/proposal/edit-proposal/${item?._id}`}
                  className={`bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full ${
                    item?.ledgerEntry && "hidden"
                  }`}
                >
                  <Pencil />
                </Link>

                <div
                  onClick={() => handleDeleteProposal(item?._id)}
                  className={`bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full ${
                    item?.ledgerEntry && "hidden"
                  }`}
                >
                  <Trash2 />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <div
                      className={`bg-gray-200 border-black h-10 w-10 flex items-center justify-center rounded-full ${
                        item?.ledgerEntry && "hidden"
                      }`}
                    >
                      <NotebookPen />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className={"hidden"}>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="">
                      <p className="font-medium text-lg">
                        Proposal Entry to Ledger
                      </p>
                      <form
                        onSubmit={(e) =>
                          !ledgerData?.ledger?.entries?.length > 0
                            ? handleProposalLedgerEntry(e, item?._id)
                            : anotherProposalLedgerEntry(e, item?._id)
                        }
                        className="flex gap-2"
                      >
                        <Input
                          type={"date"}
                          value={proposalLedgerEntryDate}
                          onChange={(e) =>
                            setProposalLedgerEntryDate(e.target.value)
                          }
                        />
                        <Button type="submit">Add</Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
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
