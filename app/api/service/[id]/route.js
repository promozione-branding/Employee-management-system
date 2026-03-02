import { connectDB } from "@/lib/db";
import Service from "@/models/admin/proposal/Service";

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const proposalServices = await Service.findById(id);

    if (!proposalServices) {
      return Response.json(
        {
          message: "Service does not exist",
          success: false,
        },
        {
          status: 404,
        },
      );
    }
    return Response.json({
      success: true,
      message: "Service details fetched successfully",
      data: proposalServices,
    });
  } catch (error) {
    console.log("Error while get service by id", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deleteProposal = await Service.findByIdAndDelete(id);

    if (!deleteProposal) {
      return Response.json(
        {
          message: "Service does not exist",
          success: false,
        },
        {
          status: 404,
        },
      );
    }
    return Response.json({
      success: true,
      message: "Service Deleted successfully",
      data: deleteProposal,
    });
  } catch (error) {
    console.log("Error while get service by id", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const updatedService = await Service.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedService) {
      return Response.json(
        {
          message: "Service does not exist",
          success: false,
        },
        {
          status: 404,
        },
      );
    }
    return Response.json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.log("Error while updating service by id", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
