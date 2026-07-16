import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProjectCycle from "@/models/admin/ProjectCycle";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Employee from "@/models/employee/Employee";

export async function DELETE(req) {
    try {
        await connectDB();
        const { projectCycleId, projectDurationId, employeeId } = await req.json();

        // 1. Remove employee from ProjectCycle
        const projectCycle = await ProjectCycle.findOneAndUpdate(
            {
                _id: projectCycleId,
                "projectDuration._id": projectDurationId,
            },
            {
                $pull: {
                    "projectDuration.$.employeeId": employeeId,
                },
            },
            { new: true }
        );

        if (!projectCycle) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found",
                },
                { status: 404 }
            );
        }

        // 2. Find the EmployeeWorkDetail
        const workDetail = await EmployeeWorkDetail.findOne({
            projectId: projectDurationId,
            employeeId: employeeId,
        });

        if (workDetail) {
            // Remove employee from work detail
            await EmployeeWorkDetail.findByIdAndUpdate(workDetail._id, {
                $pull: {
                    employeeId: employeeId,
                },
            });

            // Remove workDetail reference from Employee
            await Employee.findByIdAndUpdate(employeeId, {
                $pull: {
                    workDetails: workDetail._id,
                },
            });

            // Delete work detail if no employees remain
            const updatedWorkDetail = await EmployeeWorkDetail.findById(
                workDetail._id
            );

            if (
                updatedWorkDetail &&
                updatedWorkDetail.employeeId.length === 0
            ) {
                await EmployeeWorkDetail.findByIdAndDelete(workDetail._id);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Employee removed successfully",
                data: projectCycle,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}