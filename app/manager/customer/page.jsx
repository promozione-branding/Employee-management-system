// app/manager/customer/page.jsx

'use client';

import { Button } from '@/components/ui/button';
import { Plus, Eye, Network, SquarePen, Trash, Search, X } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CustomerForm from '@/components/subComponents/customer/CustomerForm';
import {
    createCustomerServices,
    editCustomerServices,
    deleteCustomerServices,
    getAllCustomerServices,
    getCustomerServices,
    getAllSalesService,
} from '@/service/customer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { searchClientService } from '@/service/customer/search';
import { Checkbox } from '@/components/ui/checkbox';

const CustomerManager = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [fetchSales, setFetchSales] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPaid, setIsPaid] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const LIMIT = 20;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    /* ---------------- Fetch Sales ---------------- */
    async function fetchSalesPerson() {
        try {
            const res = await getAllSalesService();
            if (res.success) setFetchSales(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    /* ---------------- Fetch Customers ---------------- */
    useEffect(() => {
        fetchData();
    }, [page, debouncedSearch, isPaid]);

    async function fetchData() {
        try {
            setLoading(true);
            let res;

            if (debouncedSearch.trim()) {
                res = await searchClientService(debouncedSearch, page, isPaid);
            } else {
                res = await getAllCustomerServices(page, LIMIT, isPaid);
            }

            if (res.success) {
                setCustomers(res.data);
                setTotalPages(res.pagination?.pages || res.pagination?.totalPages || 1);
            }
        } catch {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }


    /* ---------------- Submit ---------------- */
    const handleSubmit = async (payload) => {
        try {

            const res = editingId ? await editCustomerServices(editingId, payload) : await createCustomerServices(payload);

            if (res.success) {
                toast.success(res.message || 'Saved successfully');
                resetForm();
                fetchData();
            }
        } catch (error) {
            if (error.response?.data?.errors?.length) {
                error?.response?.data.errors?.forEach((err) => toast.error(err.message));
            } else {
                toast.error(error?.response?.data?.message || 'Something went wrong');
            }
        }
    };

    /* ---------------- Edit ---------------- */
    const handleEdit = async (id) => {
        try {
            const res = await getCustomerServices(id);
            if (res.success) {
                setEditingCustomer(res.data);
                setEditingId(id);
                setOpen(true);
            }
        } catch (error) {
            console.log(error, 'error while edit client');
            toast.error('Failed to load customer');
        }
    };

    /* ---------------- Delete ---------------- */
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            const res = await deleteCustomerServices(id);
            if (res.success) {
                toast.success(res.message);
                fetchData();
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setEditingCustomer(null);
        setEditingId(null);
        setOpen(false);
    };

    useEffect(() => {
        // fetchCustomers();
        fetchSalesPerson();
    }, []);

    return (
        <div className="flex flex-col gap-4 p-1 md:p-3">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-lg font-semibold md:text-2xl">Clients</h1>
                    {/* <form className="flex gap-2"> */}
                    <div className="relative w-full max-w-md">
                        <Input
                            type="text"
                            placeholder="Client search..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            required
                            className="pr-8"
                        />
                        {searchInput && (
                            <X
                                size={15}
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                                onClick={() => {
                                    setSearchInput('');
                                    setDebouncedSearch('');
                                    setPage(1);
                                }}
                            />
                        )}
                    </div>

                    {/* <Button type="submit">
            <Search />
          </Button> */}
                    {/* </form> */}
                </div>

                <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50">
                        <Checkbox
                            id="paid-filter"
                            checked={isPaid}
                            onCheckedChange={(v) => {
                                setIsPaid(v);
                                setPage(1);
                            }}
                        />
                        <label htmlFor="paid-filter" className="cursor-pointer text-sm leading-none font-medium select-none">
                            Paid
                        </label>
                    </div>

                    {/* <Button variant="outline">
            <FunnelPlus size={18} /> Filter
          </Button> */}

                    {/* for mobile  */}
                    <Button
                        variant="outline"
                        onClick={() => setOpen(true)}
                        className="bg-orange-500 text-white hover:bg-orange-600 lg:hidden"
                        title={'add Client'}
                    >
                        <Plus size={18} />
                    </Button>

                    <Button onClick={() => setOpen(true)} className="hidden bg-orange-500 text-white hover:bg-orange-600 lg:flex">
                        <Plus size={18} /> Add Client
                    </Button>
                </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto rounded-xl border bg-white shadow md:block">
                <div className="grid border-b px-4 py-2 font-semibold text-gray-500 md:grid-cols-5">
                    <p>Name</p>
                    <p>Company</p>
                    {/* <p className="md:hidden lg:block">GSTIN</p> */}
                    <p className="text-center">Phone</p>
                    <p className="text-center">Sales Executive</p>
                    <p className="text-center">Action</p>
                </div>

                <div className="lg:h-[60vh] lg:overflow-x-auto">
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="grid animate-pulse grid-cols-5 gap-4">
                                    <div className="h-8 rounded bg-gray-200" />
                                    <div className="h-8 rounded bg-gray-200" />
                                    <div className="h-8 rounded bg-gray-200" />
                                    <div className="h-8 rounded bg-gray-200" />
                                    <div className="h-8 rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    ) : customers.length ? (
                        customers.map(({ company, name, phone, salesExecutive, _id, isPaid }, idx) => (
                            <div
                                key={_id}
                                className={`grid grid-cols-6 items-center border-b px-4 py-3 md:grid-cols-5 ${isPaid && 'bg-green-100'} ${
                                    idx % 2 === 0 ? 'bg-gray-50' : ''
                                }`}
                            >
                                <p>{name}</p>
                                <p>{company}</p>
                                <p className="text-center">{phone}</p>

                                <div className="flex flex-wrap justify-center gap-1">
                                    {salesExecutive?.map((item) => (
                                        <span key={item._id} className="rounded bg-orange-200 px-2 py-1 text-xs">
                                            {item?.basicDetails?.name}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-center gap-3 lg:gap-5">
                                    <Link href={`/manager/customer/work/${_id}`}>
                                        <Network size={18} className="cursor-pointer lg:h-6 lg:w-6" />
                                    </Link>
                                    <Link href={`/manager/customer/${_id}`}>
                                        <Eye size={18} className="cursor-pointer lg:h-6 lg:w-6" />
                                    </Link>
                                    <SquarePen size={18} onClick={() => handleEdit(_id)} className="cursor-pointer lg:h-6 lg:w-6" />
                                    <Trash size={18} onClick={() => handleDelete(_id)} className="cursor-pointer lg:h-6 lg:w-6" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-gray-500">No customers found</div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-300 px-2 py-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                        className={`rounded-lg border border-gray-300 px-4 py-2 ${page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`h-10 w-10 rounded-lg ${page === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                        className={`rounded-lg border border-gray-300 px-4 py-2 ${page === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="flex flex-col gap-3 md:hidden">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border bg-white p-4 shadow">
                            <div className="mb-3 flex justify-between">
                                <div className="h-5 w-28 rounded bg-gray-200" />
                                <div className="h-4 w-20 rounded bg-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <div className="h-4 w-full rounded bg-gray-200" />
                                <div className="h-4 w-2/3 rounded bg-gray-200" />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <div className="h-7 w-20 rounded bg-gray-200" />
                                <div className="h-7 w-20 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))
                ) : customers.length ? (
                    customers.map(({ company, name, phone, GSTIN, salesExecutive, _id, isPaid }) => (
                        <div
                            key={_id}
                            className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow transition ${isPaid ? 'border-green-400 bg-green-50' : ''} `}
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-semibold">{name}</p>

                                    <p className="text-sm text-gray-500">{company}</p>
                                </div>

                                {isPaid && <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">Paid</span>}
                            </div>

                            {GSTIN && <p className="text-sm">GSTIN: {GSTIN}</p>}

                            <p className="text-sm">📞 {phone}</p>

                            <div className="flex flex-wrap gap-2">
                                {salesExecutive?.map((item) => (
                                    <span key={item._id} className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                                        {item?.basicDetails?.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-end gap-4 pt-2">
                                <Link href={`/manager/customer/work/${_id}`}>
                                    <Network size={18} />
                                </Link>

                                <Link href={`/manager/customer/${_id}`}>
                                    <Eye size={18} />
                                </Link>

                                <SquarePen size={18} onClick={() => handleEdit(_id)} />

                                <Trash size={18} className="text-red-500" onClick={() => handleDelete(_id)} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-500">No customers found</div>
                )}
            </div>

            {/* SHEET FORM */}
            <Sheet open={open} onOpenChange={resetForm}>
                <SheetContent className="overflow-y-auto p-5">
                    <p className="pb-4 text-center text-xl font-semibold">{editingId ? 'Edit Customer' : 'Create Customer'}</p>

                    <CustomerForm
                        key={editingId || 'new-customer'}
                        customer={editingCustomer}
                        salesExecutives={fetchSales}
                        buttonText={editingId ? 'Update' : 'Add Client'}
                        onSubmit={handleSubmit}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default CustomerManager;
