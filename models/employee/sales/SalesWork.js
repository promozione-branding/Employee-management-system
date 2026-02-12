import mongoose from "mongoose";

const SalesWorkSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    meetingUpdate: [
      new mongoose.Schema(
        {
          salesPerson: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
          clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
          },
          updateType: {
            type: String,
            enum: ["call", "meeting", "general"],
          },
          status: String,
          note: String,
          reminderAt: {
            type: Date,
          },
          meetingAt: {
            type: Date,
          },
          reminderSent: {
            type: Boolean,
            default: false,
          },
        },
        { timestamps: true },
      ),
    ],
  },
  { timestamps: true },
);
const SalesWork =
  mongoose.models.SalesWork || mongoose.model("SalesWork", SalesWorkSchema);
export default SalesWork;
