"use client";
import Loading from "@/components/layout/Loading";
import { getCustomerServices } from "@/service/customer";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Customer = ({ customerId }) => {
  const [customerDetails, setCustomerDetails] = useState(null);

  const fetchCurrentCustomer = async () => {
    try {
      const response = await getCustomerServices(customerId);
      if (response.success) {
        toast.success("Customer details fetched");
        setCustomerDetails(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCurrentCustomer();
  }, []);

  if (!customerDetails) {
    return <Loading />;
  }

  const {
    name,
    company,
    GSTIN,
    phone,
    website,
    Address,
    city,
    state,
    pincode,
    country,
    meetingDate,
    tanNo,
    email,
    SalesPersonName
  } = customerDetails;



  return (
    <div className="border p-4 flex flex-col w-[30vw] rounded-lg">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className="my-2">
        <strong>Company:</strong> {company}
      </p>
      <p className="my-2">
        <strong>GSTIN:</strong> {GSTIN}
      </p>
      <p className="my-2">
        <strong>TAN No:</strong> {tanNo || "NA"}
      </p>
      <p className="my-2">
        <strong>Email:</strong> {email}
      </p>
      <p className="my-2">
        <strong>Phone:</strong> {phone}
      </p>
      <p className="my-2">
        <strong>Website:</strong> {website}
      </p>
      <p className="my-2">
        <strong>SalesPersonName:</strong> {SalesPersonName}
      </p>
      <p className="my-2">
        <strong>Address:</strong> {Address}, {city}, {state} - {pincode},{" "}
        {country}
      </p>
      <p className="my-2">
        <strong>Meeting Date:</strong>{" "}
        {new Date(meetingDate).toLocaleDateString()}
      </p>
    </div>
  );
};

export default Customer;
