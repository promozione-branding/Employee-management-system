import mongoose from 'mongoose';

const AdPerformanceDailySchema = new mongoose.Schema(
    {
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportClient' },
        clientName: { type: String, required: true },
        platform: { type: String, enum: ['google', 'meta'], required: true },
        accountId: { type: String, required: true },
        date: { type: String, required: true },
        level: { type: String, required: true },
        entityId: { type: String, default: '' },
        campaign: { type: String, default: '' },
        adGroup: { type: String, default: '' },
        entity: { type: String, default: '' },
        keyword: { type: String, default: '' },
        productId: { type: String, default: '' },
        productBrand: { type: String, default: '' },
        productType: { type: String, default: '' },
        status: { type: String, default: '' },
        currency: { type: String, default: '' },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        spend: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        reach: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
    },
    { timestamps: true }
);

AdPerformanceDailySchema.index({ clientId: 1, platform: 1, accountId: 1, date: 1, level: 1, entityId: 1 }, { unique: true });
AdPerformanceDailySchema.index({ date: -1, clientName: 1 });

export default mongoose.models.AdPerformanceDaily || mongoose.model('AdPerformanceDaily', AdPerformanceDailySchema);
