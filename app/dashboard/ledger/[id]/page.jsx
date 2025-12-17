import CreateLedger from "./CreateLedger";

const page = async ({ params }) => {
  const { id } = await params;

  return <CreateLedger customer={id} />;
};

export default page;
