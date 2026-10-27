// app/dashboard/proposal/pdf-download/[id]/page.jsx

import ProposalPdfClient from "./ProposalPdfClient";

const Page = async ({ params }) => {
  const { id } = await params;

  return <ProposalPdfClient id={id} />;
};

export default Page;