"use client";
import { customerLedgerService } from "@/service/customer";
import { Wallet } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LedgerDetails = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ entries: [], openingBalance: 0 }); // Initialize with a default object

  const { entries, openingBalance } = data; // This line is now safe as data is always an object

  async function fetchLeaderDetail() {
    try {
      const res = await customerLedgerService(customerId);
      if (res.success) {
        setLoading(false);

        setData(res?.data?.ledger || { entries: [], openingBalance: 0 }); // Ensure data is always an object
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
          <div className="flex border-t-2 border-l-2 border-r-2 border-black font-medium ">
            <div className="w-[10vw] border-r-2 border-black pl-2">Date</div>
            <div className="w-[50vw] text-center border-r-2 border-black ">
              Particulars
            </div>
            <div className="w-[10vw] text-center border-r-2 border-black ">
              Voucher
            </div>
            <div className="w-[15vw] text-center border-r-2 border-black ">
              Debit
            </div>
            <div className="w-[15vw] text-center">Credit</div>
          </div>

          {/* opening balance */}
          <div className="flex border-2 border-black px-3 py-2">
            <div className="w-[10vw] border-">1-Apr-25</div>
            <div className="w-[50vw] text-center  ">_</div>
            <div className="w-[10vw] pl-3">Opening Balance</div>
            <div className="w-[15vw] text-right">
              {openingBalance.toLocaleString("en-IN")}
            </div>
            <div className="w-[15vw] text-right">
              {openingBalance.toLocaleString("en-IN")}
            </div>
          </div>

          {/* main enteries  */}
          <div>
            {entries.map(
              ({ date, credit, debit, particular, voucher, _id }) => (
                <div key={_id} className="flex  border-b border-black ">
                  <div className="w-[10vw]  border-r-2 border-l-2 border-black p-3">
                    {date.split("T")[0]}
                  </div>
                  <div className="w-[50vw] text-left flex flex-col gap-3  border-r-2 border-black p-3">
                    <div>{particular?.description}</div>
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
                  <div className="w-[15vw] text-right font-medium  border-r-2 border-black p-3">
                    {debit.toLocaleString("en-IN")}
                  </div>
                  <div className="w-[15vw] text-right font-medium  border-r-2 border-black p-3">
                    {credit.toLocaleString("en-IN")}
                  </div>
                </div>
              )
            )}
          </div>

          {/* create ledger btn  */}

          <Link
            href={"/dashboard/ledger/edit"}
            className="bg-amber-300 p-4 absolute bottom-10 right-10 rounded-full"
          >
            <Wallet />
          </Link>
        </div>
      )}
    </div>
  );
};

export default LedgerDetails;
