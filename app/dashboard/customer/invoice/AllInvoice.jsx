"use client";
import {
  customerLedgerService,
  getAllinvoicesCustomer,
} from "@/service/customer";
import { sendInvoicePdfService } from "@/service/invoice";
import { createLedgerService, ledgerEntriesService } from "@/service/ledger";
import {
  BanknoteArrowUp,
  BookMarked,
  Download,
  Eye,
  Mail,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/components/layout/Loading";

const AllInvoice = ({ customerId }) => {
  const [invoicesList, setInvoicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);

  const router = useRouter();

  async function fetchingInvoices() {
    if (!customerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getAllinvoicesCustomer(customerId);
      if (response.success) {
        setInvoicesList(response.data);
      } else {
        toast.error(response.message || "Failed to fetch invoices.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while fetching customer invoices."
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleInvoiceSend(invoiceId) {
    if (sendingInvoiceId) return; // Prevent multiple clicks
    setSendingInvoiceId(invoiceId);
    const toastId = toast.loading("Sending Invoice...");
    try {
      const res = await sendInvoicePdfService({ invoiceId });
      if (res.success) {
        toast.success("Email send Successfully", { id: toastId });
      } else {
        throw new Error(res.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("sendEmailHandler error:", error);
      toast.error(error.message || "An error while sending invoice", {
        id: toastId,
      });
    } finally {
      setSendingInvoiceId(null);
    }
  }

  async function invoiceLedgerEntry(invoice) {
    // console.log(invoice, "invoice");
    let currentLedger = null;
    try {
      const res = await customerLedgerService(customerId);
      if (res.success) {
        currentLedger = res.data?.ledger;
      }
    } catch (error) {
      console.log(error);
    }

    const totalAmount = invoice?.totalAmount || 0;
    const gstAmount = totalAmount * 0.18;
    const tdsAmount = invoice?.tanNo ? totalAmount * 0.02 : 0;



    const currentBalance =
      currentLedger?.entries?.length > 0
        ? currentLedger.entries[currentLedger.entries.length - 1].balance
        : 0;

    const data = {
      proposalId: invoice?._id,
      date: new Date().toISOString(),
      voucher: "Invoice",
      debit: 0,
      credit: 0,
      balance: currentBalance,
      particular: {
        description: `Invoice #${invoice?.invoiceNo}`,
        items: [
          {
            subDescription: "Total Amount",
            price: invoice?.totalAmount,
          },
        ],
      },
    };


    try {
      let res;
      if (currentLedger) {
        res = await ledgerEntriesService(currentLedger._id, {
          entriesData: data,
          proposalId: invoice._id,
        });
      }
      console.log(res,"res");
      if (res.success) {
        toast.success("Ledger Entry created Successfully");
        router.push("/dashboard/customer");
      } else {
        toast.error(res.message || "Failed to create ledger entry");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error creating ledger entry");
    }
  }

  useEffect(() => {
    fetchingInvoices();
  }, [customerId]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center font-bold text-3xl mb-8">All Invoices</h1>

      <Link
        href={`/dashboard/invoice/${customerId}`}
        className="fixed bottom-10 right-10 h-20 w-20 bg-blue-300 flex items-center justify-center rounded-full"
      >
        <BanknoteArrowUp size={30} />
      </Link>

      {invoicesList.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No invoices found for this customer.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Invoice #
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GSTIN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoicesList.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNo}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice?.GSTIN}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/dashboard/invoice/pdf-download/${invoice._id}`}
                      >
                        <Download />
                      </Link>
                      <Link
                        href={`/dashboard/invoice/view-invoice/${invoice._id}`}
                      >
                        <Eye />
                      </Link>
                      <Link
                        href={`/dashboard/invoice/edit-invoice/${invoice?._id}`}
                      >
                        <Pencil />
                      </Link>
                      <button
                        onClick={() => handleInvoiceSend(invoice?._id)}
                        disabled={sendingInvoiceId === invoice._id}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail />
                      </button>
                      <button
                        onClick={() => invoiceLedgerEntry(invoice)}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BookMarked />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllInvoice;
