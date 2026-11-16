// app/proposal/view-new/[token]/ViewProposalNew.jsx

'use client';
import React, { useState, useEffect, useRef } from 'react';
import PdfNew from '@/components/proposalNew/PdfNew';

export default function ViewProposalNew({ token }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [proposalData, setProposalData] = useState(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState('auto');

    const containerRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const resolveRes = await fetch('/api/proposalNew/resolve-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                if (!resolveRes.ok) throw new Error('Invalid link');
                const resolveData = await resolveRes.json();
                if (!resolveData?.success) throw new Error(resolveData?.message || 'Invalid link');

                const id = resolveData.data._id;
                const fullPropRes = await fetch(`/api/proposalNew/${id}`);
                if (!fullPropRes.ok) throw new Error('Failed to load proposal');
                const fullPropData = await fullPropRes.json();
                if (!fullPropData?.success) throw new Error(fullPropData?.message || 'Failed to load proposal');

                if (mounted) setProposalData(fullPropData.data);
            } catch (err) {
                if (mounted) setError(err.message || 'Failed to load proposal');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, [token]);

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const pdfWidth = 794;
            const containerWidth = containerRef.current.clientWidth;
            const newScale = containerWidth / pdfWidth;
            setScale(newScale);
            const pdfHeight = 1123;
            const scaledHeight = pdfHeight * newScale;
            setContainerHeight(`${scaledHeight}px`);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [proposalData]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    <p className="text-sm text-gray-500">Loading proposal…</p>
                </div>
            </div>
        );
    }

    if (error || !proposalData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
                        ✕
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900">Unable to open proposal</h1>
                    <p className="text-sm text-gray-600">{error || 'The link is invalid or has expired.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 px-2 py-6 md:px-4 md:py-10">
            <div className="w-full max-w-4xl">
                <div className="mb-6 text-center md:mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Inquiry Bazaar Pvt Ltd</h1>
                    <p className="mt-1 text-xs text-gray-600 md:text-sm">
                        Proposal {proposalData.proposalNumber || ''} · View Only
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-2 shadow-lg md:p-4">
                    <div
                        ref={containerRef}
                        className="relative w-full overflow-x-hidden overflow-y-auto rounded-lg border bg-gray-200"
                        style={{
                            height: window.innerWidth < 768 ? '65vh' : 'auto',
                            maxHeight: window.innerWidth < 768 ? '65vh' : 'none',
                        }}
                    >
                        <div
                            style={{
                                width: '210mm',
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                height: containerHeight,
                            }}
                        >
                            <PdfNew proposal={proposalData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}