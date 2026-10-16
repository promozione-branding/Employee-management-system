
import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    tanNo: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    GSTIN: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (value) {
          if (value == null || value.trim() === "") {
            return true;
          }

          return /^[0-9A-Z]{15}$/.test(value);
        },
        message:
          "GSTIN must contain exactly 15 valid alphanumeric characters",
      },
    },

    phone: {
      type: Number,
      required: true,
    },

    website: {
      type: String,
      trim: true,
    },

    Address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    meetingDate: {
      type: String,
    },

    salesPersonEmail: {
      type: String,
    },

    SalesPersonName: {
      type: String,
    },

    salesExecutive: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    notes: [
      {
        type: String,
      },
    ],

    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],

    proposals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
      },
    ],

    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    projectCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCycle",
    },

    meetingUpdate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },

    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuditHistory",
      },
    ],

    workDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeWorkDetail",
      },
    ],

    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index(
  {
    name: "text",
    company: "text",
    email: "text",
    GSTIN: "text",
  },
  {
    weights: {
      name: 5,
      company: 4,
      email: 3,
      GSTIN: 2,
    },
  }
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ GSTIN: 1 });
CustomerSchema.index({ salesExecutive: 1 });
CustomerSchema.index({ city: 1 });

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
