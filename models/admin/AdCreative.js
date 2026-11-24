// models/admin/AdCreative.js
//
// Latest known copy / creative for each ad (Google responsive search & call ads,
// Meta ad creatives). Upserted by lib/adsSnapshot.js on every sync, so the
// dashboard can show "what is running" with dates.

import mongoose from 'mongoose';

const AdCreativeSchema = new mongoose.Schema(
    {
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportClient', default: null, index: true },
        clientName: { type: String, default: '' },
        platform: { type: String, enum: ['google', 'meta'], required: true },
        accountId: { type: String, required: true },
        adId: { type: String, required: true },
        campaignId: { type: String, default: '' },
        campaign: { type: String, default: '' },
        adGroup: { type: String, default: '' },
        name: { type: String, default: '' },
        adType: { type: String, default: '' },
        status: { type: String, default: '' },
        headlines: { type: [String], default: [] },
        descriptions: { type: [String], default: [] },
        body: { type: String, default: '' },
        title: { type: String, default: '' },
        callToAction: { type: String, default: '' },
        finalUrl: { type: String, default: '' },
        displayPath: { type: String, default: '' },
        phone: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        thumbnailUrl: { type: String, default: '' },
        format: { type: String, default: '' }, // image | video | carousel | text
        createdTime: { type: String, default: '' },
        firstSeenAt: { type: Date, default: Date.now },
        lastSeenAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

AdCreativeSchema.index({ platform: 1, accountId: 1, adId: 1 }, { unique: true });
AdCreativeSchema.index({ accountId: 1, lastSeenAt: -1 });

export default mongoose.models.AdCreative || mongoose.model('AdCreative', AdCreativeSchema);
