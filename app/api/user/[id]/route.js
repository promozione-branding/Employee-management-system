import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const currentUser = await User.findById(id);

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "User does not exists",
          success: false,
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json({
      success: true,
      message: "User detail fetched successfully",
      data: currentUser,
    });
  } catch (error) {
    console.log("Error while get service by", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const currentUser = await User.findByIdAndDelete(id);

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "User does not exists",
          success: false,
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json({
      success: true,
      message: `${currentUser?.username} delete successfully`,
    });
  } catch (error) {
    console.log("Error while get service by", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    // Only allow specific fields to be updated
    const { username, role, email } = await req.json();
    const updateData = { username, role };

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          message: "User does not exists",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    // Do not return the password hash
    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    return NextResponse.json({
      success: true,
      message: `${updatedUser?.username} updated successfully`,
      data: userResponse,
    });
  } catch (error) {
    console.error("Error while updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
