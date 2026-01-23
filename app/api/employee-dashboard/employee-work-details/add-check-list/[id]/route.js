import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const { checkList, totalField } = body;

    // 🔁 Normalize to array
    const checklistItems = Array.isArray(checkList) ? checkList : [checkList];

    if (!checklistItems.length) {
      return NextResponse.json(
        { success: false, message: "Checklist data required" },
        { status: 400 },
      );
    }

    const workDetail = await EmployeeWorkDetail.findById(id);

    if (!workDetail) {
      return NextResponse.json(
        { success: false, message: "EmployeeWorkDetail not found" },
        { status: 404 },
      );
    }

    const existingKeys = new Set(workDetail.checklist.map((item) => item.key));

    const newItems = [];

    for (const item of checklistItems) {
      if (!item.key || !item.label) continue;

      if (!existingKeys.has(item.key)) {
        newItems.push({
          key: item.key,
          label: item.label,
          completed: item.completed ?? false,
          completedAt: item.completed ? new Date() : null,
          remarks: item.remarks ?? "",
          proofUrl: item.proofUrl ?? "",
        });
      }
    }

    if (!newItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No new checklist items to add",
        },
        { status: 409 },
      );
    }

    workDetail.checklist.push(...newItems);

    // Update progress
    workDetail.progressPercentage = {
      departmentType: workDetail.department,
      totalField: totalField,
      completeField: workDetail.checklist.filter((item) => item.completed)
        .length,
    };

    await workDetail.save();

    return NextResponse.json(
      {
        success: true,
        message: "Checklist items added successfully",
        addedCount: newItems.length,
        data: workDetail.checklist,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH Checklist Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
