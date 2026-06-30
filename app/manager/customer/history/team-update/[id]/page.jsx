import TeamUpdate from "./TeamUpdate";

const page = async ({ params }) => {
  const { id } = await params;
  return <TeamUpdate clientId={id} />
};

export default page;
