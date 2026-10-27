"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/layout/Loading";

const ProposalPdf = dynamic(() => import("./ProposalPdf"), {
    ssr: false,
    loading: () => <Loading />,
});

export default function ProposalPdfClient({ id }) {
    return <ProposalPdf id={id} />;
}