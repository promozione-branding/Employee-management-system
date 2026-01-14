"use client";

import CommonForm from "@/components/layout/Form";
import Loading from "@/components/layout/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ledgerFormControl } from "@/config/data";
import { ledgerFormInitialFormData } from "@/config/initialFormDate";
import { customerLedgerService } from "@/service/customer";
import {
  createLedgerService,
  fetchingProposalsInfo,
  ledgerEntriesService,
} from "@/service/ledger";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddEntries = ({ ledgerId, customerId, setOpen }) => {
  const [ledgerFormData, setLedgerFormData] = useState(
    ledgerFormInitialFormData
  );

  const [globalEntries, setGlobalEntries] = useState([]);

  const [loadingForLedgerDetails, setLoadingForLedgerDetails] = useState(true);
  const [ledgerData, setLedgerData] = useState(null);

  // ------------ entries form -------
  const [entriesFormData, setEntriesFormData] = useState({
    date: "",
    description: "",
  });

  const lastPaymentEntry = ledgerData?.ledger?.entries
    ?.filter((item) =>
      ["upi", "card", "net banking", "cheque"].includes(item?.voucher)
    )
    .at(-1);

  console.log(lastPaymentEntry, "lastPaymentEntry");

  //   state for sub heading and amount
  const [particularItemList, setParticularItemList] = useState([]);
  const [itemsHeading, setItemsHeading] = useState({
    subDescription: "",
    price: "",
  });

  async function fetchLedgerDetails(id) {
    try {
      const res = await customerLedgerService(id);
      if (res.success) {
        setLoadingForLedgerDetails(false);
        setLedgerData(res.data);
      }
    } catch (error) {
      console.log(error);
      setLoadingForLedgerDetails(false);
      toast.error(error.message);
    }
  }

  function handleEntriesFormSubmit(e) {
    e.preventDefault();

    if (particularItemList.length <= 0) {
      toast.error("Please add SubHeading and amount");
      return;
    }

    const data = {
      date: entriesFormData?.date,
      description: entriesFormData.description,
      item: particularItemList,
    };
    setGlobalEntries((prev) => [...prev, data]);
    setEntriesFormData({
      date: "",
      description: "",
    });
    setParticularItemList([]);
  }

  function handleItemsSubmit(e) {
    e.preventDefault();
    if (isNaN(itemsHeading?.price) || itemsHeading?.price.trim() === "") {
      toast.error("Please enter a valid number for the amount.");
      return;
    }

    setParticularItemList((prev) => [...prev, itemsHeading]);
    setItemsHeading({
      subDescription: "",
      price: "",
    });
  }

  // ---------- handle First form --------
  async function handleLedgerFormSubmit(e) {
    e.preventDefault();

    if (
      !ledgerFormData?.voucher &&
      !ledgerFormData?.debit &&
      !ledgerFormData?.credit
    ) {
      toast.error(
        "Please fill at least one field: Opening Balance, Voucher, Debit, or Credit."
      );
      return;
    }

    if (isNaN(ledgerFormData?.debit)) {
      toast.error("Please enter a valid number for the amount.");
      return;
    }

    if (isNaN(ledgerFormData?.credit)) {
      toast.error("Please enter a valid number for the amount.");
      return;
    }

    if (ledgerFormData?.debit && ledgerFormData?.credit) {
      toast.error("Please provide either a debit or a credit, not both.");
      return;
    }

    if (
      globalEntries.length <= 0 &&
      (ledgerFormData?.debit || ledgerFormData?.credit)
    ) {
      toast.error("Please add items to the entry first.");
      return;
    }

    if (
      lastPaymentEntry?.debit === ledgerFormData?.credit ||
      lastPaymentEntry?.debit === ledgerFormData?.debit
    ) {
      toast.error(
        `The amount should be ${Number(lastPaymentEntry?.credit || 0)}`
      );
      return;
    }

    try {
      const data = globalEntries.map(({ date, description, item }) => ({
        date,
        balance: lastPaymentEntry?.balance,
        particular: {
          description,
          items: item,
        },
        voucher: ledgerFormData?.voucher,
        debit: Number(ledgerFormData?.debit),
        credit: Number(ledgerFormData?.credit),
      }));

      const ledgerFormDataApi = data?.[0];

      if (ledgerId === "") {
        toast.error("ledger id not found");
        return;
      }

      const res = await ledgerEntriesService(ledgerId, {
        entriesData: ledgerFormDataApi,
      });

      if (res.success) {
        toast.success(res.message || "Ledger  successfully");
        setLedgerFormData(ledgerFormInitialFormData);
        if (setOpen) setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "error while creating the ledger");
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchLedgerDetails(customerId);
    }
  }, [customerId]);

  return (
    <>
      {loadingForLedgerDetails ? (
        <Loading />
      ) : (
        <div className="flex gap-5">
          <div className="w-1/2">
            <p className="text-lg text-center mb-5 font-medium">
              Create Ledger
            </p>
            <CommonForm
              formControls={ledgerFormControl}
              formData={ledgerFormData}
              setFormData={setLedgerFormData}
              onSubmit={handleLedgerFormSubmit}
            />
          </div>
          <div className="w-1/2">
            <p className="text-lg text-center mb-5 font-medium">
              Ledger Entries
            </p>
            <form
              onSubmit={handleEntriesFormSubmit}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-2">
                <Label>Date</Label>
                <Input
                  required
                  value={entriesFormData.date}
                  onChange={(e) =>
                    setEntriesFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  type={"date"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Input
                  required
                  placeholder="Enter the description"
                  value={entriesFormData.description}
                  onChange={(e) =>
                    setEntriesFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <Button type={"submit"}>Add Entries</Button>
            </form>

            {/* form items  */}
            <form
              onSubmit={handleItemsSubmit}
              className="flex gap-3 items-center py-5"
            >
              <Input
                placeholder="Enter the subheading"
                value={itemsHeading?.subDescription}
                onChange={(e) =>
                  setItemsHeading((prev) => ({
                    ...prev,
                    subDescription: e.target.value,
                  }))
                }
                required
              />
              <Input
                required
                placeholder="Enter the Amount"
                value={itemsHeading?.price}
                onChange={(e) =>
                  setItemsHeading((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
              />
              <Button type="submit">Add</Button>
            </form>

            <div>
              {particularItemList.length === 0 ? (
                <div className="border-dashed border p-3 rounded-lg text-gray-300 text-center font-semibold">
                  There is no Sub Heading Item
                </div>
              ) : (
                <div className="flex gap-2 flex-col">
                  {particularItemList.map((item) => (
                    <div
                      key={item.subDescription}
                      className="flex items-center justify-between bg-gray-200 px-3 py-3 rounded-2xl"
                    >
                      <div>{item?.subDescription}</div>
                      <div className="font-bold ">
                        ₹{Number(item?.price)?.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEntries;
