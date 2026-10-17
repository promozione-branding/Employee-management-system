// app/api/employee-dashboard/employee-work-details/add-check-list/[id]/route.js

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

    // 🗺️ Map existing items by key for O(1) upsert
    const existingByKey = new Map(
      workDetail.checklist.map((item) => [item.key, item]),
    );

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of checklistItems) {
      if (!item.key || !item.label) continue;

      const existing = existingByKey.get(item.key);

      if (existing) {
        // ✅ UPDATE: only overwrite fields that were actually sent.
        //    This keeps old data intact when partial payloads arrive.
        if (typeof item.completed === "boolean") {
          existing.completed = item.completed;

          // Only reset completedAt when explicitly completing from pending.
          // Don't clobber an existing completedAt with null unless user
          // explicitly un-completed it (completed === false).
          if (item.completed === false) {
            existing.completedAt = null;
          } else if (item.completedAt) {
            existing.completedAt = new Date(item.completedAt);
          } else if (!existing.completedAt) {
            existing.completedAt = new Date();
          }
        }

        if (item.completedBy !== undefined && item.completedBy !== null) {
          existing.completedBy = item.completedBy;
        }

        if (item.remarks !== undefined) existing.remarks = item.remarks;
        if (item.proofUrl !== undefined) existing.proofUrl = item.proofUrl;

        // Keep label in sync if the template was renamed
        if (item.label && existing.label !== item.label) {
          existing.label = item.label;
        }

        updatedCount++;
      } else {
        // ➕ CREATE: new custom (or template) item
        workDetail.checklist.push({
          key: item.key,
          label: item.label,
          completed: item.completed ?? false,
          completedBy: item.completedBy ?? undefined,
          completedAt: item.completed
            ? item.completedAt
              ? new Date(item.completedAt)
              : new Date()
            : null,
          remarks: item.remarks ?? "",
          proofUrl: item.proofUrl ?? "",
        });

        existingByKey.set(item.key, item); // keep map accurate
        addedCount++;
      }
    }

    if (!addedCount && !updatedCount) {
      return NextResponse.json(
        { success: false, message: "No checklist changes to save" },
        { status: 200 }, // ⬅️ 200 not 409 — no-op is not an error
      );
    }

    // 📊 Progress: count all completed items, use max(totalField, actual)
    //    so totalField never goes below the real array length.
    const completeField = workDetail.checklist.filter((i) => i.completed).length;
    const safeTotal =
      Math.max(Number(totalField) || 0, workDetail.checklist.length) ||
      workDetail.checklist.length;

    workDetail.progressPercentage = {
      departmentType:
        workDetail.department === "SALES"
          ? workDetail.progressPercentage?.departmentType ?? "OTHER"
          : workDetail.department,
      totalField: safeTotal,
      completeField,
    };

    await workDetail.save();

    return NextResponse.json(
      {
        success: true,
        message: `Checklist saved (${addedCount} added, ${updatedCount} updated)`,
        addedCount,
        updatedCount,
        data: workDetail.checklist,
        progressPercentage: workDetail.progressPercentage,
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