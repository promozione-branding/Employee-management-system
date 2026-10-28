// app/api/meeting/cc-recipients/route.js

import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";
import Employee from "@/models/employee/Employee";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({
      role: { $in: ["admin", "manager"] },
    })
      .select("username email role")
      .lean();

    const userList = users
      .filter((u) => u?.email)
      .map((u) => ({
        _id: String(u._id),
        name: u.username || "Unnamed",
        email: u.email.toLowerCase().trim(),
        role: u.role || "",
        source: "User",
      }));

    const employees = await Employee.find({
      "basicDetails.resignedEmployee": { $ne: true },
    })
      .select(
        "basicDetails.name basicDetails.email basicDetails.authRole basicDetails.designation",
      )
      .lean();

    const employeeList = employees
      .filter((e) => e?.basicDetails?.email)
      .map((e) => ({
        _id: String(e._id),
        name: e.basicDetails.name || "Unnamed",
        email: e.basicDetails.email.toLowerCase().trim(),
        role:
          e.basicDetails.authRole || e.basicDetails.designation || "employee",
        source: "Employee",
      }));

    const byEmail = new Map();
    [...userList, ...employeeList].forEach((u) => {
      if (!byEmail.has(u.email)) byEmail.set(u.email, u);
    });

    const merged = Array.from(byEmail.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return NextResponse.json({ success: true, data: merged }, { status: 200 });
  } catch (error) {
    console.error("cc-recipients error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load recipients" },
      { status: 500 },
    );
  }
}
