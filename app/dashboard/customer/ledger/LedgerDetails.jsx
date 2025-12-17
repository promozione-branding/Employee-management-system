import { Wallet } from "lucide-react";
import Link from "next/link";
import React from "react";

const LedgerDetails = () => {
  const ledgerData = [
    {
      date: "22-April-25",
      particular: {
        description: "Renewal-21142848 (Duo Date: 16-Feb-25)",
        item: [
          {
            desc: "TS 3 Years",
            price: 80000,
          },
          {
            desc: "GST @18%",
            price: 14400,
          },
        ],
      },
      voucher: "Renewal Advice",
      debit: 94400,
      credit: 0,
    },
    {
      date: "22-April-25",
      particular: {
        description: "Renewal-21142848 (Duo Date: 16-Feb-25)",
        item: [
          {
            desc: "TS 3 Years",
            price: 80000,
          },
          {
            desc: "GST @18%",
            price: 14400,
          },
          {
            desc: "GST @18%",
            price: 14400,
          },
        ],
      },
      voucher: "Renewal Advice",
      debit: 94400,
      credit: 0,
    },
  ];

  return (
    <div className="w-[90vw] overflow-hidden ">
      {/* heading  */}
      <div className="flex border-t-2 border-l-2 border-r-2 border-black font-medium ">
        <div className="w-[10vw] border-r-2 border-black pl-2">Date</div>
        <div className="w-[50vw] text-center border-r-2 border-black ">Particulars</div>
        <div className="w-[10vw] text-center border-r-2 border-black ">Voucher</div>
        <div className="w-[15vw] text-center border-r-2 border-black ">Debit</div>
        <div className="w-[15vw] text-center">Credit</div>
      </div>

      {/* opening balance */}
      <div className="flex border-2 border-black px-3 py-2">
        <div className="w-[10vw] border-">1-Apr-25</div>
        <div className="w-[50vw] text-center  ">_</div>
        <div className="w-[10vw] pl-3">Opening Balance</div>
        <div className="w-[15vw] text-right">100,000</div>
        <div className="w-[15vw] text-right">100,000</div>
      </div>

      {/* main enteries  */}
      <div>
        {ledgerData.map((item, idx) => (
          <div key={idx} className="flex  border-b border-black ">
            <div className="w-[10vw]  border-r-2 border-l-2 border-black p-3">{item?.date}</div>
            <div className="w-[50vw] text-left flex flex-col gap-3  border-r-2 border-black p-3">
              <div>{item?.particular?.description}</div>
              <div>
                {
                  item?.particular.item.map((item,idx)=>(
                    <div key={idx} className="ml-5 flex w-[60%]  justify-between border-b border-black">
                      <div>
                        {item.desc}
                      </div>
                      <div className="font-medium">
                        {item.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="w-[10vw]  border-r-2 border-black p-3">{item?.voucher}</div>
            <div className="w-[15vw] text-right font-medium  border-r-2 border-black p-3">{item?.debit === 0 ? "_": item?.debit.toLocaleString("en-IN")}</div>
            <div className="w-[15vw] text-right font-medium  border-r-2 border-black p-3">{item?.credit === 0 ? "_": item?.credit.toLocaleString("en-IN")}</div>
          </div>
        ))}
      </div>

      {/* create ledger btn  */}

      <Link href={"/dashboard/ledger"} className="bg-amber-300 p-4 absolute bottom-10 right-10 rounded-full">
        <Wallet />
      </Link>
    </div>
  );
};

export default LedgerDetails;
