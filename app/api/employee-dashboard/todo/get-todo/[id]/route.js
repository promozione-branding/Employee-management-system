import { connectDB } from "@/lib/db";
import EmployeeTodo from "@/models/employee/EmployeeTodo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const todo = await EmployeeTodo.find({ employeeId: id }).select("todos");

    if (!todo) {
      return NextResponse.json(
        {
          success: false,
          message: "there is not todo found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "todo list fetched",
        data: todo,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
