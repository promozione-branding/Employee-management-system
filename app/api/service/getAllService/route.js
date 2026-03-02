import { connectDB } from "@/lib/db";
import Service from "@/models/admin/proposal/Service";

export async function GET() {
  try {
    await connectDB();

    const items = await Service.find().sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        data: items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("GET service API Error:", error);
    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
