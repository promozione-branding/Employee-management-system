import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      index: true,
    },

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
        enum: ["SEO", "WEB_DEVELOPER", "SOCIAL_MEDIA", "ADS_MANAGER"],
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      email: [
        {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
      ],

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
    },
  },
  { timestamps: true }
);

/**
 * 🔢 Auto-generate Employee ID (EMP0001)
 */
EmployeeSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastEmployee = await this.constructor
    .findOne({}, { employeeId: 1 })
    .sort({ createdAt: -1 });

  let nextId = 1;

  if (lastEmployee?.employeeId) {
    const lastNumber = parseInt(
      lastEmployee.employeeId.replace("EMP", ""),
      10
    );
    if (!isNaN(lastNumber)) {
      nextId = lastNumber + 1;
    }
  }

  this.employeeId = `EMP${String(nextId).padStart(4, "0")}`;
  next();
});

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
