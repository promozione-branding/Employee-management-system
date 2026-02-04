import mongoose from "mongoose";

const TodoItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const EmployeeTodoSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    todos: {
      type: [TodoItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const EmployeeTodo =
  mongoose.models.EmployeeTodo ||
  mongoose.model("EmployeeTodo", EmployeeTodoSchema);
export default EmployeeTodo;
