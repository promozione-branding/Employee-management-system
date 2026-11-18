// app/api/test/whoami/route.js
// Temporary debug route — DELETE when done.

import { getAuthUser } from '@/lib/getAuthUser';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(req) {
    try {
        await connectDB();

        const authUser = await getAuthUser(req);

        // Try User collection
        let userDoc = null;
        let userLookupError = null;
        if (authUser?._id) {
            try {
                const User = (await import('@/models/admin/User')).default;
                userDoc = await User.findById(authUser._id)
                    .select('username name email role basicDetails')
                    .lean();
            } catch (err) {
                userLookupError = err.message;
            }
        }

        // Try Employee collection
        let employeeDoc = null;
        let empLookupError = null;
        if (authUser?._id) {
            try {
                const Employee = (await import('@/models/employee/Employee')).default;
                employeeDoc = await Employee.findById(authUser._id)
                    .select('basicDetails email role')
                    .lean();
            } catch (err) {
                empLookupError = err.message;
            }
        }

        // What would resolveUserName return?
        let resolvedName = null;
        let resolveError = null;
        try {
            const { resolveUserName } = await import('@/lib/resolveUserName');
            resolvedName = await resolveUserName(authUser);
        } catch (err) {
            resolveError = err.message;
        }

        return NextResponse.json({
            success: true,
            authUser,
            userDoc,
            employeeDoc,
            userLookupError,
            empLookupError,
            resolvedName,
            resolveError,
            hint: {
                hasUsername: !!userDoc?.username,
                hasName: !!userDoc?.name,
                hasBasicDetailsName: !!userDoc?.basicDetails?.name,
                hasEmployeeBasicDetailsName: !!employeeDoc?.basicDetails?.name,
                authUserEmail: authUser?.email,
            },
            cookies: req.cookies.getAll().map((c) => ({
                name: c.name,
                valueLength: c.value?.length || 0,
                preview: c.name === 'token' ? `${c.value?.substring(0, 30)}...` : c.value,
            })),
        });
    } catch (error) {
        console.error('❌ [whoami] error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error', stack: error.stack },
            { status: 500 }
        );
    }
}
