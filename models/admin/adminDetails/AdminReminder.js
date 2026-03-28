import mongoose, { Schema } from "mongoose";

const AdminReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reminder: [
      {
        description: {
          type: String,
          required: true,
        },
        reminderAt: {
          type: Date,
          required: true,
        },
        reminderSend: {
          type: Boolean,
          default: false,
        },
        cc_email: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  { timestamps: true },
);
const AdminReminder =
  mongoose.models.AdminReminder ||
  mongoose.model("AdminReminder", AdminReminderSchema);
export default AdminReminder;
