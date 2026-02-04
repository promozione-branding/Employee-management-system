import { connectDB } from "@/lib/db";
import EmployeeTodo from "@/models/employee/EmployeeTodo";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const updated = await EmployeeTodo.findOneAndUpdate(
      { "todos._id": id },
      {
        $set: {
          "todos.$.description": body.description,
          "todos.$.status": body.status,
          "todos.$.completedAt":
            body.status === "COMPLETED" ? new Date() : null,
        },
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Todo updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const updated = await EmployeeTodo.findOneAndUpdate(
      { "todos._id": id },
      {
        $pull: {
          todos: { _id: id },
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

