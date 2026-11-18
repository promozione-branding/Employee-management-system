// app/api/customer/meeting/meeting-history/[id]/route.js

// import { connectDB } from '@/lib/db';
// import { NextResponse } from 'next/server';
// import Customer from '@/models/admin/Customer';
// import Meeting from '@/models/admin/meeting/Meeting';
// import User from '@/models/admin/User';

// export async function GET(req, { params }) {
//     try {
//         await connectDB();

//         const { id } = await params;
//         const meetingHistory = await Customer.findById(id)
//             .select('meetingUpdate')
//             .populate({
//                 path: 'meetingUpdate',
//                 populate: {
//                     path: 'meetingUpdate.salesPersonId',
//                     select: 'username email',
//                 },
//             })
//             .lean();

//         if (!meetingHistory) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: 'meet history not found',
//                 },
//                 {
//                     status: 404,
//                 }
//             );
//         }

//         // Reverse the meeting update array to show newest first
//         if (meetingHistory.meetingUpdate?.meetingUpdate) {
//             meetingHistory.meetingUpdate.meetingUpdate.reverse();
//         }

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: 'customer meeting history fetched',
//                 data: meetingHistory,
//             },
//             {
//                 status: 200,
//             }
//         );
//     } catch (error) {
//         console.log(error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: 'Error while fetch customer meeting history',
//             },
//             {
//                 status: 500,
//             }
//         );
//     }
// }
// app/api/customer/meeting/meeting-history/[id]/route.js

import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import Meeting from '@/models/admin/meeting/Meeting';

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // Find the Meeting document that holds this client's update feed.
        // Query by clientId so it doesn't matter who created the update
        // (sales / admin / manager / any department).
        const meetingDoc = await Meeting.findOne({ 'meetingUpdate.clientId': id })
            .select('meetingUpdate')
            .populate({
                path: 'meetingUpdate.salesPersonId',
                model: 'User',
                select: 'username email role userType',
            })
            .lean();

        if (!meetingDoc) {
            return NextResponse.json(
                { success: false, message: 'meeting history not found' },
                { status: 404 }
            );
        }

        const updates = Array.isArray(meetingDoc.meetingUpdate)
            ? meetingDoc.meetingUpdate
            : [];

        // Client sorts by meetingAt / createdAt — no .reverse() needed.
        return NextResponse.json(
            {
                success: true,
                message: 'customer meeting history fetched',
                data: {
                    meetingUpdate: {
                        meetingUpdate: updates,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: 'Error while fetching customer meeting history' },
            { status: 500 }
        );
    }
}