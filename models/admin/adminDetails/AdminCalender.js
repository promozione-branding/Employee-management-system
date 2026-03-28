import mongoose from "mongoose";

const AdminCalendarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    calendar: [
      {
        title: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
          required: true,
        },
        backgroundColor: {
          type: String,
          default: "#ff6940",
        },
      },
    ],
  },
  { timestamps: true },
);
const AdminCalendar =
  mongoose.models.AdminCalendar ||
  mongoose.model("AdminCalendar", AdminCalendarSchema);
export default AdminCalendar;
