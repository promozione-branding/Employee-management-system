// app/proposal/accept-new/[token]/AcceptProposalNew.jsx

'use client';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import PdfNew from '@/components/proposalNew/PdfNew';

const PAYMENT_URL = 'https://pay.inquirybazaar.com/';

export default function AcceptProposalNew({ token }) {
    const [step, setStep] = useState('verify');
    const [email, setEmail] = useState('');
    const [phoneLast7, setPhoneLast7] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [proposalId, setProposalId] = useState('');
    const [proposalData, setProposalData] = useState(null);

    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState('auto');

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
    }, [step]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (phoneLast7.replace(/\D/g, '').length !== 7) return toast.error('Enter exactly 7 digits');
        try {
            setLoading(true);

            const resolveRes = await fetch('/api/proposalNew/resolve-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            if (!resolveRes.ok) throw new Error('Invalid link');
            const resolveData = await resolveRes.json();
            if (!resolveData?.success) return toast.error(resolveData?.message || 'Invalid link');

            const id = resolveData.data._id;
            setProposalId(id);

            const verifyRes = await fetch(`/api/proposalNew/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phoneLast7, token }),
            });
            if (!verifyRes.ok) throw new Error('Verification failed');
            const verifyData = await verifyRes.json();

            if (verifyData?.success) {
                const fullPropRes = await fetch(`/api/proposalNew/${id}`);
                if (!fullPropRes.ok) throw new Error('Failed to load proposal data');
                const fullPropData = await fullPropRes.json();

                if (fullPropData?.success) {
                    setProposalData(fullPropData.data);
                    toast.success('Verified');
                    setStep('terms');
                }
            } else {
                toast.error(verifyData?.message || 'Verification failed');
            }
        } catch (err) {
            toast.error(err.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        if (!agreed) return toast.error('Please tick the box to agree');
        setLoading(true);

        setTimeout(async () => {
            try {
                const res = await fetch(`/api/proposalNew/${proposalId}/accept`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                if (!res.ok) throw new Error('Failed to accept');
                const data = await res.json();

                if (data?.success) {
                    toast.success('Accepted!');
                    setStep('done');
                } else {
                    toast.error(data?.message || 'Failed to accept');
                }
            } catch (err) {
                toast.error(err.message || 'Failed to accept');
            } finally {
                setLoading(false);
            }
        }, 100);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center bg-gray-100 px-2 py-6 md:px-4 md:py-10">
            <div className="w-full max-w-4xl">
                <div className="mb-6 text-center md:mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Inquiry Bazaar Pvt Ltd</h1>
                    <p className="mt-1 text-xs text-gray-600 md:text-sm">Proposal Acceptance Portal</p>
                </div>

                {step === 'verify' && (
                    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg">
                        <form onSubmit={handleVerify} className="flex flex-col gap-4">
                            <p className="text-sm text-gray-700">Enter your registered email and the last 7 digits of your phone number to verify.</p>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last 7 digits of phone"
                                value={phoneLast7}
                                onChange={(e) => setPhoneLast7(e.target.value.replace(/\D/g, '').slice(0, 7))}
                                maxLength={7}
                                className="w-full rounded-md border px-3 py-2"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-blue-900 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                            >
                                {loading ? 'Verifying…' : 'Verify'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'terms' && proposalData && (
                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl bg-white p-2 shadow-lg md:p-4">
                            <h2 className="mb-2 px-2 text-lg font-bold md:mb-4 md:text-xl">Proposal Preview</h2>
                            <div
                                ref={containerRef}
                                className="relative w-full overflow-x-hidden overflow-y-auto rounded-lg border bg-gray-200"
                                style={{ height: window.innerWidth < 768 ? '65vh' : 'auto', maxHeight: window.innerWidth < 768 ? '65vh' : 'none' }}
                            >
                                <div style={{ width: '210mm', transform: `scale(${scale})`, transformOrigin: 'top left', height: containerHeight }}>
                                    <PdfNew proposal={proposalData} />
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg md:p-6">
                            <h3 className="mb-3 text-lg font-semibold">Terms & Conditions</h3>
                            <div className="mb-4 max-h-40 space-y-2 overflow-y-auto rounded-md border bg-gray-50 p-3 text-xs text-gray-700 md:p-4 md:text-sm">
                                <p>By accepting this proposal, you agree to the marketing services described and the total amount payable.</p>
                                <p>All online content is to be provided by the client.</p>
                            </div>
                            <label className="mb-4 flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-0.5 h-5 w-5 shrink-0 accent-blue-700"
                                />
                                <span>I have reviewed the proposal PDF and I agree to the Terms & Conditions.</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleAccept}
                                disabled={!agreed}
                                className="w-full rounded-md bg-blue-900 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                            >
                                Accept Proposal
                            </button>
                        </div>
                    </div>
                )}

                {step === 'done' && (
                    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-lg">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">✓</div>
                        <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
                        <p className="text-gray-600">Your proposal has been accepted. A confirmation email has been sent to your inbox.</p>
                        <p className="text-gray-600">
                            Please proceed with the payment using the link below:
                        </p>
                        <a
                            href={PAYMENT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-blue-800"
                        >
                            Proceed to Payment →
                        </a>
                        <p className="mt-1 text-xs text-gray-500 break-all">
                            Or open: <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{PAYMENT_URL}</a>
                        </p>
                    </div>
                )}
            </div>

            {loading && step === 'terms' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-xl bg-white p-8 text-center shadow-2xl">
                        <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">Accepting Proposal</h3>
                        <p className="text-sm text-gray-500">Please wait while we finalise your acceptance.</p>
                    </div>
                </div>
            )}
        </div>
    );
}