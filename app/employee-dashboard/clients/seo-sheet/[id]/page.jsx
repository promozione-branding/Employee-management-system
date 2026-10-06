// app/employee-dashboard/clients/seo-sheet/[id]/page.jsx

import SeoSheet from "./SeoSheet";

const page = async ({ params }) => {
  const { id } = await params;
  return <SeoSheet clientId={id} />;
};

export default page;
