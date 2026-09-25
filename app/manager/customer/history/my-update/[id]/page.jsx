import MyUpdate from "./MyUpdate";

const page = async ({ params }) => {
  const { id } = await params;
  return <MyUpdate customerId={id} />
};

export default page;
