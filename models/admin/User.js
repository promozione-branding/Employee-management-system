import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee", "client"],
      default: "employee",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // NEW OTP FIELDS
    loginOTP: String,
    loginOTPExpiry: Date,
  },
  { timestamps: true, strictPopulate: false }
);

// FIX: prevents OverwriteModelError during hot reloads in Next.js
export default mongoose.models.User || mongoose.model("User", UserSchema);
