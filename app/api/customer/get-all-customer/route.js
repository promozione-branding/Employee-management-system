import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import Employee from "@/models/employee/Employee";

export async function GET(req) {
  try {
    await connectDB();

    const allCustomer = await Customer.find()
      .select("name company phone GSTIN Address salesExecutive")
      .populate({ path: "salesExecutive", select: "basicDetails.name" })
      .sort({ createdAt: -1 });
    if (!allCustomer) {
      return Response.json({
        success: false,
        message: "cant find customer",
      });
    }

    return Response.json(
      {
        success: true,
        message: "Get all Customer",
        data: allCustomer,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("get all api error");
    return Response.json(
      {
        success: false,
        message: "server error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
