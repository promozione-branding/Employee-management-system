import mongoose from "mongoose";

const AdminBasicDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    profileImage: {
      type: String,
    },
    department: String,
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const AdminBasicDetail =
  mongoose.models.AdminBasicDetail ||
  mongoose.model("AdminBasicDetail", AdminBasicDetailSchema);
export default AdminBasicDetail;
