import mongoose from 'mongoose';

const AdSnapshotCoverageSchema = new mongoose.Schema(
    {
        platform: { type: String, enum: ['google', 'meta'], required: true },
        accountId: { type: String, required: true },
        date: { type: String, required: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportClient', default: null },
        syncedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

AdSnapshotCoverageSchema.index({ platform: 1, accountId: 1, date: 1 }, { unique: true });

export default mongoose.models.AdSnapshotCoverage || mongoose.model('AdSnapshotCoverage', AdSnapshotCoverageSchema);
