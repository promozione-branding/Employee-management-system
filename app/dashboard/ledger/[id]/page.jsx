"use client";

import axiosInstance from "@/service/axiosInstance";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LedgerDetails = ({ params }) => {
  const [loading, setLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState({});
  const id  = "69413ce8d291982d68c9bd7c";

  async function fetchLedgerDetails() {
    setLoading(true);
    try {
      if (!id) {
        setLoading(false);
        return;
      }
      const { data } = await axiosInstance.get(`/api/ledger/${id}`);
      if (data.success) {
        toast.success(data.message);
        setLedgerData(data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch ledger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLedgerDetails();
  }, []);

  const totalDebit = ledgerData.entries?.reduce(
    (acc, entry) => acc + entry.debit,
    0
  );
  const totalCredit = ledgerData.entries?.reduce(
    (acc, entry) => acc + entry.credit,
    0
  );
  const closingBalance =
    ledgerData.openingBalance + totalDebit - totalCredit;

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : !ledgerData?._id ? (
        <div>No ledger data found.</div>
      ) : (
        <div className="border border-black rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 py-3 px-4 font-semibold text-center bg-black text-white">
            <div className="text-left">Date</div>
            <div className="text-left col-span-2">Particulars</div>
            <div className="text-right">Voucher</div>
            <div className="text-right">Debit (₹)</div>
            <div className="text-right">Credit (₹)</div>
            <div className="text-right">Balance (₹)</div>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Opening Balance */}
            <div className="grid grid-cols-6 py-3 px-4 text-center border-black">
              <div className="text-left"></div>
              <div className="text-left col-span-2 font-semibold">
                Opening Balance
              </div>
              <div className="text-right"></div>
              <div className="text-right"></div>
              <div className="text-right font-semibold ">
                {ledgerData.openingBalance?.toLocaleString("en-IN")}
              </div>
            </div>
            {/* Ledger Entries */}
            {ledgerData.entries?.map((entry) => (
              <div key={entry._id} className="grid grid-cols-7 py-3 px-4 text-center border-black">
                <div className="text-left">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="text-left col-span-2">{entry.description}</div>
                <div className="text-right text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString("en-IN") : "-"}</div>
                <div className="text-right text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString("en-IN") : "-"}</div>
                <div className="text-right text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString("en-IN") : "-"}</div>
                <div className="text-right">{entry.balance.toLocaleString("en-IN")}</div>
              </div>
            ))}
            {/* Totals and Closing Balance */}
            <div className="grid grid-cols-6 bg-gray-100 py-3 px-4 font-semibold text-center">
              <div className="text-left col-span-3">Closing Balance</div>
              <div className="text-right text-red-600">
                {totalDebit?.toLocaleString("en-IN")}
              </div>
              <div className="text-right text-green-600">
                {totalCredit?.toLocaleString("en-IN")}
              </div>
              <div className="text-right">
                {closingBalance?.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LedgerDetails;
