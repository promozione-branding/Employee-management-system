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
const EmployeeReminder =
  mongoose.models.EmployeeReminder ||
  mongoose.model("EmployeeReminder", EmployeeReminderSchema);
export default EmployeeReminder;
