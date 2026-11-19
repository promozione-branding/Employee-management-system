// components/invoiceNew/InvoicePreviewNew.jsx
// Preview modal: renders the same InvoicePdfNew document used for download,
// so what you see is exactly what prints.

'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import InvoicePdfNew, { downloadInvoicePdf } from './InvoicePdfNew';

const InvoicePreviewNew = ({ invoice, onClose }) => {
    const printRef = useRef(null);

    if (!invoice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-lg">
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="font-semibold">{invoice.invoiceNumber || 'Invoice'}</h3>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => downloadInvoicePdf(invoice, printRef.current)} size="sm">
                            Print / Save PDF
                        </Button>

                        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800" type="button" aria-label="Close invoice preview">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-auto bg-[#F2F4F9] p-4">
                    <InvoicePdfNew ref={printRef} invoice={invoice} />
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewNew;
