import mongoose from "mongoose";

const SeoSheetSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    keywords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Keyword",
      },
    ],
  },
  { timestamps: true },
);

const SeoSheet =
  mongoose.models.SeoSheet || mongoose.model("SeoSheet", SeoSheetSchema);

export default SeoSheet;
