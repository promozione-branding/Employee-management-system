import { connectDB } from "@/lib/db";
import Ledger from "@/models/Ledger";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.json();
    const findCustomer = await Customer.findById(data?.customerId);

    if (!findCustomer) {
      return NextResponse.json({
        success: false,
        message: "Customer with provided customer id not found",
      });
    }
    const newLedger = await Ledger.create(data);

    if (!newLedger) {
      throw new Error("Error while creating the ledger");
    }
    findCustomer.ledger = newLedger?._id;
    await findCustomer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Ledger creating successfully",
        data: newLedger,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error while creating ledger", error);
    return NextResponse.json(
      {
        success: false,
        message: "server Error",
      },
      {
        status: 500,
      }
    );
  }
}
