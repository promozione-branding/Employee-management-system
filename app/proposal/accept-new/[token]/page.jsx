// app/proposal/accept-new/[token]/page.jsx

import AcceptProposalNew from "./AcceptProposalNew";
export default async function Page({ params }) {
  const { token } = await params;
  return <AcceptProposalNew token={token} />;
}
