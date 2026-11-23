// app/manager/customer/page.jsx

'use client';

import { Button } from '@/components/ui/button';
import { Plus, Eye, Network, SquarePen, Trash } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CustomerForm from '@/components/subComponents/customer/CustomerForm';
import {
    createCustomerServices,
    editCustomerServices,
    deleteCustomerServices,
    getAllCustomerServices,
    getCustomerServices,
    getAllSalesService,
    getCustomerCategoriesService,
} from '@/service/customer';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { searchClientService } from '@/service/customer/search';
import CustomerDirectoryFilters, { getAddedDateRange } from '@/components/customer-directory/CustomerDirectoryFilters';
import CustomerContact from '@/components/customer-directory/CustomerContact';
import CustomerTable from '@/components/customer-directory/CustomerTable';

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
    const [categoryInput, setCategoryInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [executiveFilter, setExecutiveFilter] = useState('all');
    const [addedDateFilter, setAddedDateFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const LIMIT = 20;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCategoryFilter(categoryInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [categoryInput]);

    useEffect(() => {
        getCustomerCategoriesService().then((res) => {
            if (res.success) setCategoryOptions(Array.isArray(res.data) ? res.data : []);
        }).catch(() => {});
    }, []);

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
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            let res;
            const { dateFrom, dateTo } = getAddedDateRange(addedDateFilter, customDateFrom, customDateTo);

            if (debouncedSearch.trim()) {
                res = await searchClientService(debouncedSearch, page, isPaid, categoryFilter, dateFrom, dateTo);
            } else {
                res = await getAllCustomerServices(page, LIMIT, isPaid, categoryFilter, dateFrom, dateTo);
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
    }, [addedDateFilter, categoryFilter, customDateFrom, customDateTo, debouncedSearch, isPaid, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="w-full flex-1">
                    <h1 className="mb-3 text-lg font-semibold md:text-2xl">Clients</h1>
                    <CustomerDirectoryFilters
                        idPrefix="manager-clients"
                        searchValue={searchInput}
                        onSearchChange={(value) => { setSearchInput(value); setPage(1); }}
                        categoryValue={categoryInput}
                        onCategoryChange={(value) => { setCategoryInput(value); setPage(1); }}
                        categoryOptions={categoryOptions}
                        paidOnly={isPaid}
                        onPaidChange={(value) => { setIsPaid(value); setPage(1); }}
                        executiveValue={executiveFilter}
                        onExecutiveChange={(value) => { setExecutiveFilter(value); setPage(1); }}
                        executives={fetchSales}
                        dateFilter={addedDateFilter}
                        onDateFilterChange={(value) => { setAddedDateFilter(value); setPage(1); }}
                        dateFrom={customDateFrom}
                        onDateFromChange={(value) => { setCustomDateFrom(value); setPage(1); }}
                        dateTo={customDateTo}
                        onDateToChange={(value) => { setCustomDateTo(value); setPage(1); }}
                    />
                </div>
                <Button onClick={() => setOpen(true)} className="shrink-0 bg-orange-500 text-white hover:bg-orange-600">
                    <Plus size={18} /> Add Client
                </Button>
            </div>

            <div className="hidden md:block">
                <CustomerTable
                    headers={[
                        { key: 'client', label: 'Client' },
                        { key: 'contact', label: 'Phone' },
                        { key: 'executive', label: 'Sales executive' },
                        { key: 'payment', label: 'Payment' },
                        { key: 'category', label: 'Category' },
                        { key: 'actions', label: 'Actions', className: 'px-5 py-4 text-right' },
                    ]}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    rows={customers.filter((customer) => executiveFilter === 'all' || customer.salesExecutive?.some((item) => item._id === executiveFilter)).map((customer) => (
                        <tr key={customer._id} className="transition-colors hover:bg-[#F9FAFD]">
                            <td className="px-4 py-4"><div className="font-semibold text-[#0F1B33]">{customer.name || 'Unnamed client'}</div><div className="mt-1 text-sm text-[#68738A]">{customer.company || 'No company added'}</div></td>
                            <td className="px-4 py-4"><CustomerContact customer={customer} /></td>
                            <td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{customer.salesExecutive?.map((item) => <span key={item._id} className="rounded-full bg-[#FFF1E4] px-2.5 py-1 text-xs font-semibold text-[#0F1B33]">{item.basicDetails?.name || 'Executive'}</span>)}</div></td>
                            <td className="px-4 py-4"><span className={customer.isPaid ? 'rounded-full bg-[#E5F5EC] px-3 py-1.5 text-xs font-bold text-[#17845A]' : 'rounded-full bg-[#FFF4D9] px-3 py-1.5 text-xs font-bold text-[#B86A00]'}>{customer.isPaid ? 'Paid' : 'Pending'}</span></td>
                            <td className="px-4 py-4">{customer.category ? <span className="rounded-full bg-[#E9EFF9] px-3 py-1.5 text-xs font-semibold text-[#0A2E66]">{customer.category}</span> : '—'}</td>
                            <td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={'/manager/customer/work/' + customer._id}><Network size={18} /></Link><Link href={'/manager/customer/' + customer._id}><Eye size={18} /></Link><SquarePen size={18} onClick={() => handleEdit(customer._id)} className="cursor-pointer" /><Trash size={18} onClick={() => handleDelete(customer._id)} className="cursor-pointer text-red-500" /></div></td>
                        </tr>
                    ))}
                />
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
                    ) : customers.filter((customer) => executiveFilter === 'all' || customer.salesExecutive?.some((item) => item._id === executiveFilter)).length ? (
                    customers.filter((customer) => executiveFilter === 'all' || customer.salesExecutive?.some((item) => item._id === executiveFilter)).map(({ company, name, GSTIN, salesExecutive, _id, isPaid, category, phone, email }) => (
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

                            <CustomerContact customer={{ phone, email }} />

                            {category && <span className="w-fit rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{category}</span>}

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
