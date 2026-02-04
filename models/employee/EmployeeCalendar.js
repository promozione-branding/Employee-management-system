import mongoose from "mongoose";
const EmployeeCalendarSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Employee",
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
const EmployeeCalendar =
  mongoose.models.EmployeeCalendar ||
  mongoose.model("EmployeeCalendar", EmployeeCalendarSchema);
export default EmployeeCalendar;
