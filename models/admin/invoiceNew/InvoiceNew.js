// models/admin/invoiceNew/InvoiceNew.js
// Invoice generated from a ProposalNew. Items/totals are a snapshot taken at
// generation time, so later proposal edits never change an issued invoice.

import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema(
    {
        category: { type: String, default: '' },
        categoryLabel: { type: String, default: '' },
        packageKey: { type: String, default: '' },
        label: { type: String, required: true },
        duration: { type: String, default: '' },
        durationLabel: { type: String, default: '' },
        amount: { type: Number, required: true },
        serviceDiscount: { type: Number, default: 0 },
        custom: { type: Boolean, default: false },
        customOfferings: { type: [String], default: [] },
        cityName: { type: String, default: '' },
        cityCount: { type: String, default: '' },
        keywordName: { type: String, default: '' },
        keywordCount: { type: String, default: '' },
    },
    { _id: true }
);

const InvoiceNewSchema = new mongoose.Schema(
    {
        invoiceNumber: { type: String, unique: true, index: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProposalNew', required: true },
        proposalNumber: { type: String, default: '' },

        items: [InvoiceItemSchema],
        categoryNotes: [{ category: { type: String, required: true }, note: { type: String, default: '' } }],
        cityPages: [{ city: { type: String, required: true }, keyword: { type: String, required: true } }],
        partialPayments: [{ paymentDuration: { type: String, required: true }, paymentAmount: { type: Number, required: true, min: 0 } }],

        subtotal: { type: Number, default: 0 },
        serviceDiscountAmount: { type: Number, default: 0 },
        gstRate: { type: Number, default: 0.18 },
        gstAmount: { type: Number, default: 0 },
        tdsApplicable: { type: Boolean, default: false },
        tdsRate: { type: Number, default: 0.02 },
        tdsAmount: { type: Number, default: 0 },
        discountType: { type: String, enum: ['amount', 'percentage'], default: 'amount' },
        discountInput: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },

        paymentMethod: { type: String, default: '' },
        notes: { type: String, default: '' },
        invoiceDate: { type: Date },
        dueDate: { type: Date },
        status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
        sentAt: { type: Date },
        sentToEmail: { type: String, default: '' },

        // Audit trail — same shape as ProposalNew.
        createdByName: { type: String, default: '' },
        editHistory: [
            {
                editedByName: { type: String, required: true },
                editedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

InvoiceNewSchema.index({ clientId: 1, createdAt: -1 });
InvoiceNewSchema.index({ proposalId: 1 });

InvoiceNewSchema.pre('save', async function (next) {
    if (this.invoiceNumber) return next();
    const year = new Date().getFullYear();
    const last = await mongoose
        .model('InvoiceNew')
        .findOne({ invoiceNumber: new RegExp(`^INV-${year}-`) })
        .sort({ createdAt: -1 });
    let nextSeq = 1;
    if (last?.invoiceNumber) {
        const lastSeq = parseInt(last.invoiceNumber.split('-')[2], 10);
        if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }
    this.invoiceNumber = `INV-${year}-${String(nextSeq).padStart(4, '0')}`;
    next();
});

export default mongoose.models.InvoiceNew || mongoose.model('InvoiceNew', InvoiceNewSchema);
