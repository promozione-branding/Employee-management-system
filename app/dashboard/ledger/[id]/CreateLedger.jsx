"use client";

import CommonForm from "@/components/layout/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ledgerFormControl } from "@/config/data";
import { useState } from "react";

const CreateLedger = () => {
  const [ledgerFormData, setLedgerFormData] = useState({});

  // ------------ entries form -------
  const [entriesFormData, setEntriesFormData] = useState({
    date: "",
    description: "",
  });

  //   state for sub heading and amount
  const [particularItemList, setParticularItemList] = useState([]);
  const [itemsHeading, setItemsHeading] = useState({
    subDescription: "",
    price: "",
  });

  function handleEntriesFormSubmit(e) {
    e.preventDefault();
    console.log(entriesFormData,"entriesFormData");
  }

  function handleItemsSubmit(e) {
    e.preventDefault();
    setParticularItemList((prev) => [...prev, itemsHeading]);
    setItemsHeading({
      subDescription: "",
      price: "",
    });
  }

  return (
    <div className="flex gap-5">
      <div className="w-1/2">
        <CommonForm
          formControls={ledgerFormControl}
          formData={ledgerFormData}
          setFormData={setLedgerFormData}
        />
      </div>
      <div className="w-1/2">
        <form
          onSubmit={handleEntriesFormSubmit}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <Input
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
  );
};

export default CreateLedger;
