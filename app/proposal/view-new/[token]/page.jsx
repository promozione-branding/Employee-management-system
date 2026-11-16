// app/proposal/view-new/[token]/page.jsx

import ViewProposalNew from './ViewProposalNew';

export default async function Page({ params }) {
    const { token } = await params;
    return <ViewProposalNew token={token} />;
}