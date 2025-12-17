"use client";
import React, { useState } from "react";
import CommonForm from "../layout/Form";
import { addInvoiceFormControl } from "@/config/data";
import {
  initialInvoiceFormData,
  initialservicesforInvoiceFormData,
} from "@/config/initialFormDate";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CreateInvoice = () => {
  const [formData, setFormData] = useState(initialInvoiceFormData);
  const [serviceList, setServiceList] = useState([]);
  const [serviceData, setServiceData] = useState(
    initialservicesforInvoiceFormData
  );

  function handleService(e) {
    e.preventDefault();
    setServiceList([...serviceList, serviceData]);

    setServiceData({
      serviceName: "",
      HSN: "",
      price: "",
    });
  }

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();

    const { clientName, clientCompany, clientAddress, GSTIN, taxType } =
      formData;

    const invoiceData = {
      clientName,
      clientCompany,
      clientAddress,
      GSTIN,
      taxType,
      services: serviceList,
    };

  };

  function handleRemoveService(indexToRemove) {
    setServiceList(serviceList.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div>
      <CommonForm
        formControls={addInvoiceFormControl}
        formData={formData}
        setFormData={setFormData}
        buttonText={"Create Invoice"}
        onSubmit={handleInvoiceSubmit}
      />

      <div className="mt-10 border-t pt-6">
        <form onSubmit={handleService} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Add Services</h2>
          <div className="grid gap-2">
            <Label htmlFor="serviceTitle">Service Title</Label>
            <Input
              id="serviceTitle"
              required
              value={serviceData.serviceName}
              placeholder="Enter the title"
              onChange={(e) =>
                setServiceData({ ...serviceData, serviceName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serviceDesc">Add HSN No.</Label>
            <Input
              id="serviceDesc"
              required
              placeholder="Enter the HSN No."
              value={serviceData?.HSN}
              onChange={(e) =>
                setServiceData({ ...serviceData, HSN: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="servicePrice">Price</Label>
            <Input
              required
              id="servicePrice"
              placeholder="Enter the price"
              value={serviceData.price}
              onChange={(e) =>
                setServiceData({ ...serviceData, price: e.target.value })
              }
              type="number"
            />
          </div>
          <Button type="submit" className="w-fit">
            Add Service
          </Button>
        </form>
      </div>
      {/* Display Added Services List */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Added Services</h2>
        {serviceList.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {serviceList.map((service, index) => (
              <li
                key={index}
                className="border p-4 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{service.serviceName}</h3>
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm">
                        HSN NO: {service?.HSN}
                      </h4>
                    </div>
                    <p className="font-bold mt-3 text-md">
                      Price: ₹{service.price}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveService(index)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No services added yet.</p>
        )}
      </div>
    </div>
  );
};

export default CreateInvoice;
