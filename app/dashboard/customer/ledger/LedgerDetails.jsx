// app/dashboard/customer/ledger/LedgerDetails.jsx

'use client';
import Loading from '@/components/layout/Loading';
import AddEntriesForm from '@/components/subComponents/ledger/AddEntries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { customerLedgerService, deleteLedgerEntryService } from '@/service/customer';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const LedgerDetails = ({ customerId }) => {
    const [loading, setLoading] = useState(true);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

    const [data, setData] = useState({
        entries: [],
        openingBalance: 0,
        proposalId: '',
        _id: '',
    });

    const { entries, openingBalance, _id } = data;

    async function handleDeleteEntry(entryId) {
        try {
            const res = await deleteLedgerEntryService(_id, entryId);
            console.log(res);

            if (res.success) {
                fetchLeaderDetail();
                toast.success(res.message || 'Ledger Entry');
            }
        } catch (error) {
            toast.error(error.response.data.message || 'Ledger delete entry error');
            console.log(error);
        }
    }

    async function fetchLeaderDetail() {
        try {
            if (customerId !== '') {
                const res = await customerLedgerService(customerId);

                if (res.success) {
                    setLoading(false);

                    setData(res?.data?.ledger || { entries: [], openingBalance: 0 });
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while fetching the ledger');
        }
    }

    useEffect(() => {
        fetchLeaderDetail();
    }, [isManualEntryOpen]);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <div>
                    <div className="flex items-center justify-between px-5 py-4">
                        <p className="text-2xl font-bold">Ledger</p>
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/ledger/${customerId}`}
                                className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-green-600"
                            >
                                Add Funds
                            </Link>
                            <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className={`rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-emerald-600`}
                                    >
                                        Manual Entry
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="min-w-4xl">
                                    <DialogHeader className={'hidden'}>
                                        <DialogTitle>Add Entry</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddEntriesForm proposalId={'5'} ledgerId={_id} customerId={customerId} setOpen={setIsManualEntryOpen} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="h-[70vh] w-[90vw] overflow-x-hidden">
                        {/* heading  */}
                        <div className="flex border-t-2 border-r-2 border-b-2 border-l-2 border-black font-medium">
                            <div className="w-[5vw] border-r-2 border-black pl-2">No.</div>
                            <div className="w-[10vw] border-r-2 border-black pl-2">Date</div>
                            <div className="w-[35vw] border-r-2 border-black text-center">Particulars</div>
                            <div className="w-[10vw] border-r-2 border-black text-center">Voucher</div>
                            <div className="w-[10vw] border-r-2 border-black text-center">Debit</div>
                            <div className="w-[10vw] text-center">Credit</div>
                            <div className="w-[10vw] border-l-2 border-black text-center">Balance</div>
                        </div>

                        {/* opening balance */}
                        {openingBalance !== 0 ? (
                            <div className="flex border-2 px-3 py-2">
                                <div className="w-[10vw]">1-Apr-25</div>
                                <div className="w-[50vw] text-center">_</div>
                                <div className="w-[10vw] pl-3">Opening Balance</div>
                                <div className="w-[15vw] text-right">{openingBalance?.toLocaleString('en-IN')}</div>
                                <div className="w-[15vw] text-right">{openingBalance?.toLocaleString('en-IN')}</div>
                            </div>
                        ) : null}
                        {/* main enteries  */}

                        <div>
                            {entries.map(({ date, credit, debit, particular, voucher, balance, _id, proposalId }, idx) => (
                                <div key={_id} className="group flex border-b border-black">
                                    <div className="w-[5vw] border-l-2 border-black pt-2 pl-2">{idx + 1}.</div>
                                    <div className="w-[10vw] border-r-2 border-l-2 border-black p-3">
                                        {date?.split('T')?.[0]}

                                        <span className="hidden gap-4 duration-300 group-hover:flex">
                                            <Pencil size={20} className={`text-blue-500 ${entries?.length - 1 !== idx && 'hidden'}`} />
                                            <Trash2
                                                size={20}
                                                className={`text-red-500 ${entries?.length - 1 !== idx && 'hidden'}`}
                                                onClick={() => handleDeleteEntry(_id)}
                                            />
                                        </span>
                                    </div>
                                    <div className="flex w-[35vw] flex-col gap-3 border-r-2 border-black p-3 text-left">
                                        {proposalId !== undefined ? (
                                            <Link
                                                className="font-semibold text-blue-950 hover:underline"
                                                href={`/dashboard/proposal/pdf-download/${proposalId}`}
                                            >
                                                {particular?.description}
                                            </Link>
                                        ) : (
                                            <div className="font-semibold text-blue-950 hover:underline">{particular?.description}</div>
                                        )}
                                        <div>
                                            {particular?.items?.map(({ price, subDescription, _id }) => (
                                                <div key={_id} className="ml-5 flex w-[60%] justify-between border-b border-black">
                                                    <div>{subDescription}</div>
                                                    <div className="font-medium">₹ {price?.toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-[10vw] border-r-2 border-black p-3 capitalize">{voucher}</div>
                                    <div className="w-[10vw] border-r-2 border-black p-3 text-right font-medium">{debit?.toLocaleString('en-IN')}</div>
                                    <div className="w-[10vw] border-r-2 border-black p-3 text-right font-medium">{credit?.toLocaleString('en-IN')}</div>
                                    <div className="w-[10vw] border-r-2 border-black p-3 text-right font-medium">{balance?.toLocaleString('en-IN')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LedgerDetails;
