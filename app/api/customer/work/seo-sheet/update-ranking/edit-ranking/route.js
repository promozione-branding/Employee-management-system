// app/api/customer/work/seo-sheet/update-ranking/edit-ranking/route.js

import { connectDB } from '@/lib/db';
import Keyword from '@/models/employee/seoEmployee/Keyword';
import SeoSheet from '@/models/employee/seoEmployee/SeoSheet';
import { NextResponse } from 'next/server';
import { recordEmployeeWork } from '@/lib/employeeWorkTracker';

export async function PUT(req) {
    try {
        await connectDB();
        const { keywordId, rankingId, position, page } = await req.json();

        const updated = await Keyword.findOneAndUpdate(
            {
                _id: keywordId,
                'rankings._id': rankingId,
            },
            {
                $set: {
                    'rankings.$.position': position,
                    'rankings.$.page': page,
                },
            },
            { new: true }
        );

        const sheet = await SeoSheet.findOne({ keywords: keywordId }).select('clientId').lean();
        await recordEmployeeWork({
            req,
            clientId: sheet?.clientId,
            action: 'SEO_RANKING_EDITED',
            summary: `Edited SEO ranking for ${updated?.keyword || 'keyword'}`,
            details: { keyword: updated?.keyword || '', position, page: page || '' },
            entityType: 'Keyword',
            entityId: keywordId,
        });

        return NextResponse.json({
            success: true,
            message: 'Ranking updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
