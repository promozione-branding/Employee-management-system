import { string } from "joi";
import mongoose, { Schema } from "mongoose";

const rankingSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    position: {
      type: Number, // ranking position (e.g. 1, 5, 10)
      required: true,
    },
    page: {
      type: Number, // page number (e.g. 1, 2, 3)
      required: true,
    },
    employeeID: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
);

const keywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCycle",
      required: true,
    },
    type: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
    },
    rankings: [rankingSchema],
  },
  { timestamps: true },
);

const Keyword =
  mongoose.models.Keyword || mongoose.model("Keyword", keywordSchema);

export default Keyword;
