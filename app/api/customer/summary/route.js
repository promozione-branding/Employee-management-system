import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceMonday = (weekStart.getDay() + 6) % 7;
        weekStart.setDate(weekStart.getDate() - daysSinceMonday);
        const nextWeekStart = new Date(weekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const [all, paid, addedThisMonth, addedThisWeek] = await Promise.all([
            Customer.countDocuments({}),
            Customer.countDocuments({ isPaid: true }),
            Customer.countDocuments({ createdAt: { $gte: monthStart, $lt: nextMonthStart } }),
            Customer.countDocuments({ createdAt: { $gte: weekStart, $lt: nextWeekStart } }),
        ]);

        return NextResponse.json({
            success: true,
            data: { all, paid, addedThisMonth, addedThisWeek },
        });
    } catch (error) {
        console.error('Failed to fetch customer summary:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch customer summary' }, { status: 500 });
    }
}
