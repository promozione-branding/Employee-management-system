import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const customerProjects = await Customer.findById(id)
      .select("projectCycle")
      .populate({
        path: "projectCycle",
        populate: {
          path: "projectDuration.employeeId",
          model: "Employee",
        },
      });

    if (!customerProjects) {
      return NextResponse.json(
        {
          success: false,
          message: "customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "customer project cycle fetched successfully",
        data: customerProjects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const setOptions = {};
    Object.keys(body).forEach((key) => {
      if (key !== "_id") {
        setOptions[`projectDuration.$.${key}`] = body[key];
      }
    });

    const updateSubDocument = await ProjectCycle.findOneAndUpdate(
      { "projectDuration._id": id },
      { $set: setOptions },
      { new: true }
    );

    if (updateSubDocument) {
      return NextResponse.json(
        {
          success: true,
          message: "Project duration updated successfully",
          data: updateSubDocument,
        },
        { status: 200 }
      );
    }

    const updateProjectCycle = await ProjectCycle.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updateProjectCycle) {
      return NextResponse.json(
        {
          success: false,
          message: "Project Cycle not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project Cycle Updated",
        data: updateProjectCycle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const updateProjectCycle = await ProjectCycle.findOneAndUpdate(
      { "projectDuration._id": id },
      {
        $pull: {
          projectDuration: { _id: id },
        },
      },
      { new: true }
    );

    if (updateProjectCycle) {
      return NextResponse.json(
        {
          success: true,
          message: "Project duration deleted successfully",
          data: updateProjectCycle,
        },
        { status: 200 }
      );
    }

    const projectCycle = await ProjectCycle.findByIdAndDelete(id);

    if (!projectCycle) {
      return NextResponse.json(
        {
          success: false,
          message: "Project Cycle not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project Cycle deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
