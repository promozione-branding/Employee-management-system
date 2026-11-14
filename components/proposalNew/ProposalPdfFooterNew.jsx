// components/proposalNew/ProposalPdfFooterNew.jsx

"use client";

import React from "react";
import { FOOTER_LEFT } from "@/config/new/proposalPdfNew";

const ProposalPdfFooterNew = ({ pageNumber, totalPages }) => (
  <>
    <span className="left">
      <a href={`mailto:${FOOTER_LEFT}`}>{FOOTER_LEFT}</a>
    </span>

    <span className="center">
      Page {pageNumber} of {totalPages}
    </span>

    <span className="right">
      <a href="tel:01142603232">011 - 42603232</a>
    </span>
  </>
);

export default ProposalPdfFooterNew;
