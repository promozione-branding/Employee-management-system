"use client";

import dynamic from "next/dynamic";

const ProposalPdf = dynamic(
    () => import("./ProposalPdf"),
    {
        ssr: false,
        loading: () => <p>Loading PDF...</p>,
    }
);

export default function ProposalPdfClient({ id }) {
    return <ProposalPdf id={id} />;
}