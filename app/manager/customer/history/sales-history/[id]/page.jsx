// app/manager/customer/history/sales-history/[id]/page.jsx
import React from 'react';

import MeetingHistory from '@/components/sales-dashboard/client/MeetingHistory';

const page = async ({ params }) => {
    const { id } = await params;
    return <MeetingHistory customerId={id} />;
};

export default page;