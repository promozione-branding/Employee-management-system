import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
  {
    meetingUpdate: [
      new mongoose.Schema(
        {
          salesPersonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          salesPerson: [{ type: String }],

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

        { timestamps: true, strictPopulate: false }
      ),
    ],
  },
  { timestamps: true }
);

const Meeting =
  mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);

export default Meeting;
