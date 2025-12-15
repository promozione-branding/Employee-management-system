"use client";
import { getInvoiceById } from "@/service/invoice"; // Assuming this path is correct for your actual API call
import React, { useEffect, useState } from "react";

const ViewInvoice = ({ id }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchInvoiceById() {
    setLoading(true);
    const response = await getInvoiceById(id);
    console.log(response.data);
    if (response.success) {
      setInvoiceData(response.data);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoiceById();
  }, []); // Re-fetch if ID changes

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading invoice...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        No invoice data found for ID: {id}.
      </div>
    );
  }

  // Calculate subtotal before discount and tax
  const subtotal = invoiceData.services.reduce(
    (sum, service) => sum + service.amount,
    0
  );
  const discountAmount = invoiceData.discountPercentage
    ? (subtotal * invoiceData.discountPercentage) / 100
    : invoiceData.discount || 0;
  const taxableAmount = subtotal - discountAmount;
  // Assuming a fixed tax rate for SGST/CGST for demonstration, e.g., 18% (9% SGST + 9% CGST)
  // This should ideally come from invoiceData or a configuration
  const taxRate = 0.18; // 18% for SGST/CGST combined
  const taxAmount = taxableAmount * taxRate;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatIndianCurrency = (num) => {
    if (typeof num !== "number") return num;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #eee",
        boxShadow: "0 0 10px rgba(0,0,0,.15)",
        fontSize: "16px",
        lineHeight: "24px",
        color: "#555",
      }}
    >
      <div style={{ marginBottom: "30px", overflow: "auto" }}>
        <div style={{ float: "left", width: "50%" }}>
          <h1 style={{ margin: "0 0 10px 0", color: "#333" }}>INVOICE</h1>
          <p style={{ margin: "0" }}>
            <strong>Invoice No:</strong> {invoiceData.invoiceNo} <br />
            <strong>Invoice Date:</strong> {formatDate(invoiceData.invoiceDate)}
          </p>
        </div>
      </div>

      <hr style={{ borderTop: "1px solid #eee", margin: "20px 0" }} />

      <div style={{ marginBottom: "30px", overflow: "auto" }}>
        <div style={{ float: "left", width: "50%" }}>
          <p style={{ margin: "0" }}>
            <strong>Bill To:</strong> <br />
            {invoiceData.clientName} <br />
            {invoiceData.clientCompany} <br />
            {invoiceData.clientAddress} <br />
            {invoiceData.GSTIN && `GSTIN: ${invoiceData.GSTIN}`} <br />
            {invoiceData.tanNo && `TAN No: ${invoiceData.tanNo}`}
          </p>
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
        }}
      >
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Service ID
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                textAlign: "right",
              }}
            >
              Quantity
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                textAlign: "right",
              }}
            >
              Rate
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                textAlign: "right",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.services.map((service, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                {service.id}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                {service.description || "N/A"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                {service.quantity || 1}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                {service.rate
                  ? `₹${formatIndianCurrency(service.rate)}`
                  : "N/A"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                {service.amount
                  ? `₹${formatIndianCurrency(service.amount)}`
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ float: "right", width: "50%", textAlign: "right" }}>
        <p style={{ margin: "0" }}>
          <strong>Subtotal:</strong> ₹{formatIndianCurrency(subtotal)} <br />
          {discountAmount > 0 && (
            <>
              <strong>Discount:</strong>{" "}
              {invoiceData.discountPercentage
                ? `${invoiceData.discountPercentage}%`
                : ""}{" "}
              - ₹{formatIndianCurrency(discountAmount)} <br />
            </>
          )}
          <strong>Tax ({invoiceData.taxType}):</strong> ₹
          {formatIndianCurrency(taxAmount)} <br />
          <strong style={{ fontSize: "20px", color: "#333" }}>
            Total Amount:
          </strong>{" "}
          <span style={{ fontSize: "20px", color: "#333" }}>
            ₹{formatIndianCurrency(invoiceData.totalAmount)}
          </span>
        </p>
      </div>
      <div style={{ clear: "both" }}></div>
    </div>
  );
};

export default ViewInvoice;
