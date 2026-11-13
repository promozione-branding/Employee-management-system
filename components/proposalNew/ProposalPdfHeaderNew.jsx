"use client";

import React from "react";
import { PDF_LOGO_PATH, COMPANY_DETAILS } from "@/config/new/proposalPdfNew";

const ProposalPdfHeaderNew = () => (
  <>
    <img
      src={PDF_LOGO_PATH}
      alt="Inquiry Bazaar"
      style={{ height: 110, width: "auto" }}
    />

    <div
      style={{
        textAlign: "right",
        fontSize: "10.5px",
        lineHeight: 1.35,
        color: "#374151",
      }}
    >
      <div>
        <b style={{ color: "#111827", fontSize: "11.5px" }}>
          {COMPANY_DETAILS.name}
        </b>
      </div>

      <div>{COMPANY_DETAILS.address}</div>

      <div>
        Call us :{" "}
        <a href={`tel:${COMPANY_DETAILS.phone.replace(/\\s+/g, "")}`}>
          {COMPANY_DETAILS.phone}
        </a>
      </div>

      <div>
        Email:{" "}
        <a href={`mailto:${COMPANY_DETAILS.email}`}>
          {COMPANY_DETAILS.email}
        </a>
      </div>

      <div>
        Website:{" "}
        <a href={COMPANY_DETAILS.website} target="_blank" rel="noreferrer">
          {COMPANY_DETAILS.website}
        </a>
      </div>
    </div>
  </>
);

export default ProposalPdfHeaderNew;
