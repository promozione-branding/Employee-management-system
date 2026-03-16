import mongoose from "mongoose";

const { Schema } = mongoose;

/* ===============================
   TODO ITEM SCHEMA
================================= */

const TodoItemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ===============================
   CALENDAR SCHEMA
================================= */

const CalendarSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    backgroundColor: {
      type: String,
      default: "#ff6940",
    },
  },
  { timestamps: true }
);

/* ===============================
   REMINDER SCHEMA
================================= */

const ReminderSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    reminderAt: {
      type: Date,
      required: true,
      index: true, // useful for cron jobs
    },

    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   ADMIN DETAIL SCHEMA
================================= */

const AdminDetailSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    calendar: {
      type: [CalendarSchema],
      default: [],
    },

    todos: {
      type: [TodoItemSchema],
      default: [],
    },

    reminder: {
      type: [ReminderSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* ===============================
   MODEL EXPORT
================================= */

const AdminDetail =
  mongoose.models.AdminDetail ||
  mongoose.model("AdminDetail", AdminDetailSchema);

export default AdminDetail;