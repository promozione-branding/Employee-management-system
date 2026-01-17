import { connectDB } from "@/lib/db";
import Service from "@/models/admin/Service";

export async function POST(req) {
  try {
    await connectDB();

    const {
      serviceTitle,
      amount,
      duration,
      description,
      discountAmount,
      discountPercentage,
    } = await req.json();

    if (!serviceTitle || !amount || !duration) {
      return Response.json({
        message: "please fill service title price amount",
        success: false,
      });
    }

    const newService = await Service.create({
      serviceTitle,
      amount,
      duration,
      description,
      discountAmount,
      discountPercentage,
    });

    return Response.json(
      {
        success: true,
        message: "services add successfully",
        data: newService,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create services error", error);
    return Response.json(
      {
        success: false,
        message: "server error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
