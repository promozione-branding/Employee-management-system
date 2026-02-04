import mongoose from "mongoose";
const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetDepartment: {
      type: String,
      enum: [
        "ALL",
        "SEO",
        "WEB_DEVELOPER",
        "SOCIAL_MEDIA",
        "ADS_MANAGER",
        "SALES",
        "OTHER",
      ],
      default: "ALL",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true },
);
const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
