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
      enum: ["admin", "sales", "employee"],
      default: "employee",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // NEW OTP FIELDS
    loginOTP: String,
    loginOTPExpiry: Date,

    // PASSWORD RESET OTP
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,
  },
  { timestamps: true, strictPopulate: false },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
