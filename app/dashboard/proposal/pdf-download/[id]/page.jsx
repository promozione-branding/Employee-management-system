// app/dashboard/proposal/pdf-download/[id]/page.jsx

import ProposalPdf from './ProposalPdf'

const page = async({params}) => {
  const {id} = await params;
  return (
    <ProposalPdf id={id}/>
  )
}

export default page