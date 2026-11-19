// app/api/customer/get-all-customer/route.js

import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import { escapeRegExp } from '@/lib/customerForm';

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const isPaid = searchParams.get('isPaid');
        const category = (searchParams.get('category') || '').trim();
        const filter = {};

        if (isPaid !== null && isPaid !== undefined) {
            filter.isPaid = isPaid === 'true';
        }

        // Optional category filter: manual text, partial + case-insensitive.
        if (category) {
            filter.category = { $regex: escapeRegExp(category), $options: 'i' };
        }

        const total = await Customer.countDocuments(filter);
        const customers = await Customer.find(filter)
            .select(`name company phone GSTIN category salesExecutive isPaid `)
            .populate({ path: 'salesExecutive', select: 'basicDetails.name' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return Response.json({
            success: true,
            data: customers,
            pagination: { totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.log(error);

        return Response.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
