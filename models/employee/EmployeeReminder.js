import mongoose from "mongoose";

const EmployeeReminderSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
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
      },
    ],
  },
  { timestamps: true },
);
const EmployeeReminder =
  mongoose.model.EmployeeReminder ||
  mongoose.model("EmployeeReminder", EmployeeReminderSchema);
export default EmployeeReminder;
