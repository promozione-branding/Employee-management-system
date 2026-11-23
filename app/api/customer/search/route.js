// app/api/customer/search/route.js

import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import { matchesCategory } from '@/lib/customerForm';
import { NextResponse } from 'next/server';

function normalize(text = '') {
    return String(text)
        .toLowerCase()
        .replace(/[\s.\-_]/g, '');
}

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const category = (searchParams.get('category') || '').trim();
        const isPaid = searchParams.get('isPaid');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;
        const filter = {};

        // Paid filter
        if (isPaid === 'true') {
            filter.isPaid = true;
        }
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(`${dateFrom}T00:00:00`);
            if (dateTo) {
                const endDate = new Date(`${dateTo}T00:00:00`);
                endDate.setDate(endDate.getDate() + 1);
                filter.createdAt.$lt = endDate;
            }
        }

        let customers = await Customer.find(filter)
            .select(`name company phone Address GSTIN category salesExecutive isPaid createdAt`)
            .populate({ path: 'salesExecutive', select: 'basicDetails.name' })
            .lean();

        // Optional category filter: manual text, partial + case-insensitive.
        if (category) {
            customers = customers.filter((customer) => matchesCategory(customer?.category, category));
        }

        // Elastic search
        if (q.trim()) {
            const search = normalize(q);
            customers = customers.filter((customer) => {
                const fields = [customer?.name, customer?.company, customer?.phone, customer?.GSTIN, customer?.Address];

                return fields.some((field) => normalize(field).includes(search));
            });
        }

        // newest first
        customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const total = customers.length;
        const paginated = customers.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            data: paginated,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.log('Search API Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Search failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
