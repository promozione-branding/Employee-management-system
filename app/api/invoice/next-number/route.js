import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();

        const year = new Date().getFullYear();
        const prefix = `INQ${year}`;

        const lastInvoice = await Invoice.findOne({
            invoiceNo: {
                $regex: `^${prefix}`,
            },
        }).sort({
            invoiceNo: -1,
        });

        let nextNumber = 551;

        if (lastInvoice?.invoiceNo) {
            const lastNumber = parseInt(
                lastInvoice.invoiceNo.replace(prefix, ""),
                10
            );

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const invoiceNo = `${prefix}${String(nextNumber).padStart(6, "0")}`;

        return NextResponse.json({
            success: true,
            invoiceNo,
        });
    } catch (error) {
        console.error("NEXT INVOICE NUMBER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate invoice number",
            },
            { status: 500 }
        );
    }
}