import mongoose from "mongoose";

const SalesEmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    client: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    proposals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
      },
    ],

    SaleWork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesWork",
    },
  },
  { timestamps: true },
);

const SalesEmployee =
  mongoose.models.SalesEmployee ||
  mongoose.model("SalesEmployee", SalesEmployeeSchema);

export default SalesEmployee;
