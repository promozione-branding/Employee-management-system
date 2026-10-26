// app/api/reports/search-customers/route.js
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { requireReportAdmin } from "@/lib/reportingAuth";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  let filter = {};
  if (query) {
    const regex = new RegExp(query, "i"); // Case-insensitive regex
    filter = {
      $or: [
        { name: regex },
        { company: regex },
        { email: regex },
      ],
    };
  }

  // Fetch matching customers (limit 50 for performance)
  const customers = await Customer.find(filter)
    .select("name company email website")
    .limit(50)
    .lean(); 

  return Response.json({ customers });
}
