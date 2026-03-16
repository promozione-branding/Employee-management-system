import mongoose from "mongoose";
import { isValidSubDesignation } from "@/config/employeeDesignation";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeWorkDetail",
      },
    ],

    basicDetails: {
      profileImage: {
        type: String,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        enum: [
          "SEO",
          "WEB_DEVELOPER",
          "SOCIAL_MEDIA",
          "ADS_MANAGER",
          "SALES",
          "OTHER",
        ],
        required: true,
      },
      subDesignation: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            const designation =
              this?.designation || this?.basicDetails?.designation;
            return isValidSubDesignation(designation, value);
          },
          message: "Invalid subDesignation for selected designation",
        },
      },
      authRole: {
        type: String,
        enum: [
          "INTERN",
          "EXECUTIVE",
          "SR_EXECUTIVE",
          "ASSISTANCE_MANAGER",
          "MANAGER",
          "SR_MANAGER",
        ],
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },

      dob: {
        type: Date,
      },

      gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
        required: true,
      },

      joiningDate: {
        type: Date,
        default: Date.now,
      },
      resignedDate: {
        type: Date,
        default: null,
      },
      resignedEmployee: {
        type: Boolean,
        default: false,
      },
    },

    EmployeeCalendarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeCalendar",
    },

    employeeTodoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeTodo",
    },

    employeeReminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeReminder",
    },
    salesDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesEmployee",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
