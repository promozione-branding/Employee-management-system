// app/dashboard/invoice/AllInvoices.jsx

'use client';
import { getAllinvoicesCustomer } from '@/service/customer';
import { getInvoiceAllInvoice } from '@/service/invoice';
import { BanknoteArrowUp, Download, Eye, Mail, Pencil } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const AllInvoice = ({ customerId }) => {
    const [invoicesList, setInvoicesList] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchingInvoices() {
        try {
            const res = await getInvoiceAllInvoice();
            if (res.success) {
                setInvoicesList(res.data);
                setLoading(false);
            }
        } catch (error) {
            console.log(error.message || 'error while fetching all invoices');
        }
    }

    useEffect(() => {
        fetchingInvoices();
    }, []);

    if (loading) {
        return (
            <div className="py-10 text-center">
                <p className="text-lg font-semibold">Loading Invoices...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 text-center text-3xl font-bold">All Invoices</h1>

            <Link
                href={`/dashboard/invoice/${customerId}`}
                className="fixed right-10 bottom-10 flex h-20 w-20 items-center justify-center rounded-full bg-blue-300"
            >
                <BanknoteArrowUp size={30} />
            </Link>

            {invoicesList.length === 0 ? (
                <div className="rounded-lg bg-gray-50 py-10 text-center">
                    <p className="text-gray-500">No invoices found for this customer.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Invoice #
                                </th>

                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Client Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    GSTIN
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {invoicesList.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{invoice.invoiceNo}</td>

                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{invoice.clientName}</td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{invoice?.GSTIN}</td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                        {new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                        }).format(invoice.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <Link href={`/invoice/pdf-download/${invoice._id}`}>
                                                <Download />
                                            </Link>
                                            <Link href={`/invoice/view-invoice/${invoice._id}`}>
                                                <Eye />
                                            </Link>
                                            <Link href={`/invoice/edit-invoice/${invoice._id}`}>
                                                <Pencil />
                                            </Link>
                                            <div>
                                                <Mail />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllInvoice;
