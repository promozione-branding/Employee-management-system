import ViewInvoice from "./ViewInvoice";

const page = async({params}) => {

  const {id} = await params
  return <ViewInvoice id={id}/>
};

export default page;
