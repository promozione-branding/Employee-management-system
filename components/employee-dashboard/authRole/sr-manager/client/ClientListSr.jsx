// components/employee-dashboard/authRole/sr-manager/client/ClientListSr.jsx

'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FunnelPlus, Search, X } from 'lucide-react';
import Loading from '@/components/layout/Loading';
import { getAllCustomerServices } from '@/service/customer';
import { Eye, Network } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '@/lib/store/EmployeeStore';
import { getEmployeeAssignedClientService } from '@/service/employee-dashboard/employee';
import { searchClientService } from '@/service/customer/search';
import { Input } from '@/components/ui/input';

const CustomerManager = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assinedClientList, setAssinedClientList] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    const { employee } = useEmployeeStore();
    /* ---------------- Fetch ---------------- */
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getAllCustomerServices();
            if (res.success) setCustomers(res.data);
        } catch {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    async function getEmployeeClientList() {
        try {
            if (employee?._id) {
                const res = await getEmployeeAssignedClientService(employee?._id);

                if (res.success) {
                    setAssinedClientList(res?.data?.map((item) => item?.clientId));
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Error while getting the client list');
        }
    }

    useEffect(() => {
        fetchCustomers();
        getEmployeeClientList();
    }, []);

    async function searchHandler(e) {
        e.preventDefault();
        try {
            const res = await searchClientService(searchInput);
            if (res.success) {
                setCustomers(res?.data);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message);
        }
    }

    if (loading) return <Loading />;

    return (
        <div className="flex flex-col gap-2 md:gap-5 lg:gap-1">
            {/* client List header  */}
            <div className="md:flex md:items-center md:justify-between md:px-10 md:py-2">
                <div className="text-2xl font-medium">Clients</div>
                <form onSubmit={searchHandler} className="flex gap-2">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Client search"
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
                                    fetchCustomers();
                                }}
                            />
                        )}
                    </div>

                    <Button type="submit">
                        <Search />
                    </Button>
                </form>
            </div>

            {/* client list  */}
            <div className="h-[78vh] overflow-y-auto rounded-2xl border bg-white shadow-lg lg:h-[70vh]">
                {/* heading  */}
                <div className="sticky top-0 z-10 hidden grid-cols-6 gap-4 border-b-2 bg-white py-3 font-semibold text-gray-500 md:grid">
                    <p className="pl-5">Name</p>
                    <p>Company</p>
                    <p className="text-left">GSTIN</p>
                    <p className="text-center">Phone</p>
                    <p className="text-center">Sales Executive</p>
                    {/* <p className="text-center">Address</p> */}
                    <p className="text-center">Action</p>
                </div>

                {/* list  */}
                <div className="">
                    {customers.map(({ company, name, phone, GSTIN, Address, salesExecutive, _id, SalesPersonName }, idx) => (
                        <div key={_id} className={`grid grid-cols-1 gap-2 border-b p-4 md:grid-cols-6 md:gap-4 md:py-3 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                            <div className="flex justify-between md:block">
                                <span className="font-medium text-gray-500 md:hidden">Name</span>
                                <p className="font-semibold md:pl-5 md:font-normal">{name}</p>
                            </div>
                            <div className="flex justify-between md:block">
                                <span className="font-medium text-gray-500 md:hidden">Company</span>
                                <p>{company}</p>
                            </div>
                            <div className="flex justify-between md:block">
                                <span className="font-medium text-gray-500 md:hidden">GSTIN</span>
                                <p className="">{GSTIN}</p>
                            </div>
                            <div className="flex justify-between md:block">
                                <span className="font-medium text-gray-500 md:hidden">Phone</span>
                                <p className="md:text-center">{phone}</p>
                            </div>

                            <div className="flex items-center justify-between md:block">
                                <span className="font-medium text-gray-500 md:hidden">Sales Executive</span>
                                <div className="flex flex-wrap justify-end gap-2 capitalize md:justify-center md:text-center">
                                    {salesExecutive.map((item) => (
                                        <p key={item?._id} className="rounded-lg bg-orange-200 px-2 py-1 text-xs md:text-sm">
                                            {item?.basicDetails?.name}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between md:mt-0 md:block">
                                <span className="font-medium text-gray-500 md:hidden">Action</span>
                                <div className="flex justify-end gap-5 md:justify-center">
                                    <Link href={`/employee-dashboard/clients/client-assignment/${_id}`}>
                                        <Network />
                                    </Link>
                                    <Link href={`/employee-dashboard/clients/client-details/${_id}`}>
                                        <Eye />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerManager;
