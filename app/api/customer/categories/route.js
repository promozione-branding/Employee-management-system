// app/api/customer/categories/route.js
// Distinct non-empty client categories — populates the category filter
// dropdown on the client lists, while the filter itself also accepts
// free-typed text. Old clients without a category contribute nothing.

import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const categories = await Customer.distinct('category', { category: { $type: 'string', $ne: '' } });

        const data = [...new Set(categories.map((c) => String(c).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('Get customer categories error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
