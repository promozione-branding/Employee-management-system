// components/customer-directory/CustomerTable.jsx

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

export default function CustomerTable({
    headers,
    loading,
    rows,
    emptyMessage = 'No clients found.',
    page,
    totalPages,
    onPageChange,
    minWidth = 'min-w-[850px]',
    showPagination = true,
}) {
    return (
        <section className="overflow-hidden rounded-[22px] border border-[#E3E7F0] bg-white shadow-[0_4px_18px_rgba(15,27,51,0.04)]">
            <div className="overflow-x-auto">
                <table className={'w-full border-collapse text-left ' + minWidth}>
                    <thead>
                        <tr className="border-b border-[#E3E7F0] bg-[#F7F8FC] text-sm font-bold text-[#5B6478]">
                            {headers.map((header) => (
                                <th key={header.key} className={header.className || 'px-4 py-4'}>{header.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7F0]">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, rowIndex) => (
                                <tr key={'loading-' + rowIndex}>
                                    {headers.map((header) => (
                                        <td key={header.key} className="px-4 py-5"><div className="h-5 animate-pulse rounded-md bg-[#F2F4F9]" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length ? rows : (
                            <tr>
                                <td colSpan={headers.length} className="px-5 py-16 text-center">
                                    <Users size={25} className="mx-auto text-[#8A92A6]" />
                                    <p className="mt-3 text-sm text-[#68738A]">{emptyMessage}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showPagination && <footer className="flex flex-col gap-3 border-t border-[#E3E7F0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-[#68738A]">
                    Page <span className="font-semibold text-[#0F1B33]">{page}</span> of <span className="font-semibold text-[#0F1B33]">{Math.max(1, totalPages)}</span>
                </p>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => onPageChange(Math.max(1, page - 1))} className="h-10 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] disabled:opacity-40">
                        <ChevronLeft size={16} /> Previous
                    </Button>
                    <Button type="button" variant="outline" disabled={page >= totalPages || loading} onClick={() => onPageChange(Math.min(totalPages, page + 1))} className="h-10 gap-1.5 rounded-lg border-[#E0E5EF] text-[#0F1B33] disabled:opacity-40">
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </footer>}
        </section>
    );
}
