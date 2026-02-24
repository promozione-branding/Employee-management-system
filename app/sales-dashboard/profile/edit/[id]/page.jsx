import ProfileEdit from "./ProfileEdit";

const page = async ({ params }) => {
  const { id } = await params;

  return <ProfileEdit employeeId={id} />;
};

export default page;
