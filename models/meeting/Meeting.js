import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
  {
    salesPersonDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    meetingUpdate: [
      {
        callUpdate: {
          type: {
            type: String,
            enum: ["talk", "no-talk"],
          },
          note: String,
          reminder: { type: Date },
          meetingDate: { type: Date, default: Date.now },
        },
        generaleUpdate: {
          note: String,
          reminder: { type: Date },
          meetingDate: { type: Date, default: Date.now },
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", MeetingSchema);
