import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";
import Meeting from "@/models/admin/meeting/Meeting";
import User from "@/models/admin/User";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // Get salesPersonId from query
        const { searchParams } = new URL(req.url);
        const salesPersonId = searchParams.get("salesPersonId");

        if (!salesPersonId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "salesPersonId is required",
                },
                { status: 400 }
            );
        }

        // Find customer
        const customer = await Customer.findById(id).select("meetingUpdate")
            .populate({ path: "meetingUpdate", select: "meetingUpdate", })
            .lean();

        if (!customer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer not found",
                },
                { status: 404 }
            );
        }

        if (!customer.meetingUpdate) {
            return NextResponse.json(
                {
                    success: true,
                    message: "No meeting history found",
                    data: {
                        meetingUpdate: [],
                    },
                },
                { status: 200 }
            );
        }

        // Filter only this sales person's meetings
        const filteredMeetings = customer.meetingUpdate.meetingUpdate?.filter((meeting) =>
            meeting.salesPersonId?.toString() === salesPersonId.toString()) || [];

        console.log(customer.meetingUpdate.meetingUpdate, filteredMeetings)

        // Newest first
        filteredMeetings.reverse();

        // Populate sales person details
        const populatedMeetings = await Promise.all(filteredMeetings.map(async (meeting) => {
            const salesPerson = await User.findById(meeting.salesPersonId)
                .select("username email name")
                .lean();

            return {
                ...meeting,
                salesPersonId: salesPerson || meeting.salesPersonId,
            };
        })
        );

        return NextResponse.json(
            {
                success: true,
                message: "Sales person meeting history fetched",
                data: {
                    ...customer,
                    meetingUpdate: {
                        ...customer.meetingUpdate,
                        meetingUpdate: populatedMeetings,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Meeting history error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Error while fetching customer meeting history",
                error: error.message,
            },
            { status: 500 }
        );
    }
}