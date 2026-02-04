import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeTodo from "@/models/employee/EmployeeTodo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { employeeId, todos } = await req.json();

    if (!employeeId || !todos) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID and Todo data are required",
        },
        {
          status: 400,
        },
      );
    }

    const todoItem = Array.isArray(todos) ? todos : [todos];

    if (!todoItem.length) {
      return NextResponse.json(
        {
          success: false,
          message: "todo data required",
        },
        {
          status: 400,
        },
      );
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        {
          status: 404,
        },
      );
    }

    let todoData = await EmployeeTodo.findOne({ employeeId });

    if (todoData) {
      todoData.todos.push(...todoItem);
      await todoData.save();
    } else {
      todoData = await EmployeeTodo.create({
        employeeId,
        todos: todoItem,
      });
    }

    if (!todoData) {
      return NextResponse.json(
        {
          success: false,
          message: "Error while create the todo",
        },
        {
          status: 500,
        },
      );
    }

    if (employee.employeeTodoId?.toString() !== todoData._id.toString()) {
      employee.employeeTodoId = todoData._id;
      await employee.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Todo created successfully",
        data: todoData,
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
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
