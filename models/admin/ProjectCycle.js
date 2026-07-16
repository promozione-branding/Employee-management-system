import mongoose from "mongoose";

const ProjectCycleSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  projectDuration: [
    {
      employeeId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      ],
      projectName: {
        type: String,
        required: true,
      },
      service: {
        type: String,
        required: true,
      },
      serviceType: {
        type: String,
      },
      startDate: { type: Date, default: Date.now, required: true },
      endDate: { type: Date },
    },
  ],
});

const ProjectCycle =
  mongoose.models.ProjectCycle ||
  mongoose.model("ProjectCycle", ProjectCycleSchema);

export default ProjectCycle;
