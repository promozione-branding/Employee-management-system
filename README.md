export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let findCustomer = await Customer.findById(id);
    if (!findCustomer) {
      return NextResponse.json(
        { message: "customer does not exist", success: false },
        { status: 404 }
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = findCustomer.toObject();

    // 🔄 Update fields
    Object.keys(body).forEach((key) => {
      if (key in findCustomer) {
        findCustomer[key] = body[key] ?? findCustomer[key];
      }
    });

    const editedCustomer = await findCustomer.save();

    // 📝 HISTORY
    const createAuditLogId = await createAuditLog({
      clientId: id,
      entityType: "Customer",
      entityId: editedCustomer._id,
      action: "UPDATE",
      oldData,
      newData: editedCustomer.toObject(),
      userId: authUser._id,
    });

    console.log(createAuditLogId?._id, "createAuditLogId");

    let customerHistory = await Customer.findById(id);
    if (!customerHistory) {
      return NextResponse.json(
        { message: "customer does not exist", success: false },
        { status: 404 }
      );
    }

    await findCustomer.history.push(createAuditLogId?._id);

    return NextResponse.json({
      success: true,
      message: "customer edit successfully",
      data: editedCustomer,
    });
  } catch (error) {
    console.log("Edit by id api:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
