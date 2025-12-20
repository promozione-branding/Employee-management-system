"use client";
import AddEntriesForm from "@/components/subComponents/ledger/AddEntries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { customerLedgerService } from "@/service/customer";
import { Wallet } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LedgerDetails = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    entries: [],
    openingBalance: 0,
    proposalId: "",
  });

  const { entries, openingBalance, proposalId } = data;
  console.log(proposalId, "proposalId");

  async function fetchLeaderDetail() {
    try {
      const res = await customerLedgerService(customerId);
      if (res.success) {
        setLoading(false);

        setData(res?.data?.ledger || { entries: [], openingBalance: 0 });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while fetching the ledger");
    }
  }

  useEffect(() => {
    fetchLeaderDetail();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading....</div>
      ) : (
        <div className="w-[90vw] overflow-hidden ">
          {/* heading  */}
          <div className="flex border-t-2 border-l-2 border-r-2 border-black font-medium border-b-2">
            <div className="w-[5vw] border-r-2 border-black pl-2">No.</div>
            <div className="w-[10vw] border-r-2 border-black pl-2">Date</div>
            <div className="w-[35vw] text-center border-r-2 border-black ">
              Particulars
            </div>
            <div className="w-[10vw] text-center border-r-2 border-black ">
              Voucher
            </div>
            <div className="w-[10vw] text-center border-r-2 border-black ">
              Debit
            </div>
            <div className="w-[10vw] text-center">Credit</div>
            <div className="w-[10vw] text-center border-l-2 border-black">
              Balance
            </div>
          </div>

          {/* opening balance */}
          {openingBalance !== 0 ? (
            <div className="flex border-2  px-3 py-2">
              <div className="w-[10vw] ">1-Apr-25</div>
              <div className="w-[50vw] text-center  ">_</div>
              <div className="w-[10vw] pl-3">Opening Balance</div>
              <div className="w-[15vw] text-right">
                {openingBalance.toLocaleString("en-IN")}
              </div>
              <div className="w-[15vw] text-right">
                {openingBalance.toLocaleString("en-IN")}
              </div>
            </div>
          ) : null}
          {/* main enteries  */}

          <div>
            {entries.map(
              ({ date, credit, debit, particular, voucher,balance, _id }, idx) => (
                <div key={_id} className="flex  border-b border-black">
                  <div className="w-[5vw] border-l-2 border-black pl-2 pt-2">
                    {idx + 1}.
                  </div>
                  <div className="w-[10vw]  border-r-2 border-l-2 border-black p-3">
                    {date.split("T")[0]}
                  </div>
                  <div className="w-[35vw] text-left flex flex-col gap-3  border-r-2 border-black p-3">
                    <Link
                      className="text-blue-950 font-semibold hover:underline"
                      href={
                        `/dashboard/proposal/pdf-download/${proposalId} ` || "#"
                      }
                    >
                      {particular?.description}
                    </Link>
                    <div>
                      {particular?.items?.map(
                        ({ price, subDescription, _id }) => (
                          <div
                            key={_id}
                            className="ml-5 flex w-[60%]  justify-between border-b border-black"
                          >
                            <div>{subDescription}</div>
                            <div className="font-medium">
                              ₹ {price?.toLocaleString("en-IN")}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="w-[10vw] capitalize border-r-2 border-black p-3">
                    {voucher}
                  </div>
                  <div className="w-[10vw] text-right font-medium  border-r-2 border-black p-3">
                    {debit.toLocaleString("en-IN")}
                  </div>
                  <div className="w-[10vw] text-right font-medium  border-r-2 border-black p-3">
                    {credit.toLocaleString("en-IN")}
                  </div>
                  <div className="w-[10vw] text-right font-medium  border-r-2 border-black p-3">
                    {balance.toLocaleString("en-IN")}
                  </div>
                </div>
              )
            )}
          </div>

          {/* create ledger btn  */}

          <Dialog >
            <DialogTrigger asChild>
              <button className="bg-amber-300 p-4 absolute bottom-10 right-10 rounded-full">
                <Wallet />
              </button>
            </DialogTrigger>
            <DialogContent className="min-w-4xl">
              <DialogHeader className={"hidden"}>
                <DialogTitle>Add Entry</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <AddEntriesForm />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default LedgerDetails;
