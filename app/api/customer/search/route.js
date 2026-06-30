import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

function normalize(text = "") {
  return String(text).toLowerCase().replace(/[\s.\-_]/g, "");
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const isPaid = searchParams.get("isPaid");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    // Paid filter
    if (isPaid === "true") {
      filter.isPaid = true;
    }

    let customers = await Customer.find(filter)
      .select(`name company phone Address GSTIN salesExecutive isPaid createdAt`)
      .populate({ path: "salesExecutive", select: "basicDetails.name", }).lean();

    // Elastic search
    if (q.trim()) {
      const search = normalize(q);
      customers = customers.filter((customer) => {
        const fields = [
          customer?.name,
          customer?.company,
          customer?.phone,
          customer?.GSTIN,
          customer?.Address,
        ];

        return fields.some((field) =>
          normalize(field).includes(search)
        );
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
    console.log("Search API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
        error: error.message,
      },
      { status: 500, }
    );
  }
}