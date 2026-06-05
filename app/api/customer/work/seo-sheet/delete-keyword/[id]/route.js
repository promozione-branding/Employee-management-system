import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Delete keyword
        const deletedKeyword = await Keyword.findByIdAndDelete(id);

        if (!deletedKeyword) {
            return NextResponse.json(
                { success: false, message: "Keyword not found", },
                { status: 404 }
            );
        }

        // Remove keyword id from SeoSheet
        await SeoSheet.updateMany(
            { keywords: id },
            { $pull: { keywords: id }, }
        );

        return NextResponse.json(
            { success: true, message: "Keyword deleted successfully", }, { status: 200 }
        );
    } catch (error) {
        console.log("Delete Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}