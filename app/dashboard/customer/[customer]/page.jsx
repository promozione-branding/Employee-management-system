import CustomerDashboard from "./CustomerDashboard";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const page = async ({ params }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let salesPersonId = "";

  if (token) {
    try {
      const user = decodeJwt(token);
      salesPersonId = user.id; // Assuming your token payload has an 'id' field
    } catch (e) {
      console.error("Token decode error", e);
    }
  }
  const { customer: customerId } = await params;

  return (
    <CustomerDashboard customerId={customerId} salesPersonId={salesPersonId} />
  );
};

export default page;
