import ProposalPdf from './ProposalPdf'

const page = async({params}) => {
  const {id} = await params;
  return (
    <ProposalPdf id={id}/>
  )
}

export default page