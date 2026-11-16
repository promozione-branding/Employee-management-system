// app/manager/customer/work/[id]/SalesWork.jsx

'use client';

import { clientSalesExecutiveService, editSalesExecutiveService, getSalesPersonService } from '@/service/admin-dashboard/employee/sales-work';
import { useEffect, useState } from 'react';
import { UserRound, Users, SearchX, BookCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const SalesWork = ({ customerId }) => {
    const [salesPerson, setSalesPerson] = useState([]);
    const [assignSalesPerson, setAssignSalesPerson] = useState([]);
    const [selectSalesEmployee, setSelectSalesEmployee] = useState([]);

    const router = useRouter();

    async function fetchSalesPerson() {
        try {
            const res = await getSalesPersonService();
            if (res.success) {
                setSalesPerson(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchClientSales() {
        try {
            const res = await clientSalesExecutiveService(customerId);
            if (res.success) {
                setAssignSalesPerson(res.data.salesExecutive);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchSalesPerson();
        if (!customerId) return;
        fetchClientSales();
    }, [customerId]);

    const handleSelectSalesExecutive = (employeeId) => {
        setSelectSalesEmployee((prevSelected) => {
            const isSelected = prevSelected.some((_id) => _id === employeeId);

            if (isSelected) {
                return prevSelected.filter((_id) => _id !== employeeId);
            } else {
                return [...prevSelected, employeeId];
            }
        });
    };

    async function editAssigedClient() {
        try {
            const res = await editSalesExecutiveService(customerId, {
                salesExecutive: selectSalesEmployee,
            });
            if (res.success) {
                toast.success(res.message || 'Sales executive updated successfully');
                router.push('/manager/customer');
            }
        } catch (error) {
            console.log(error);
            toast.error(res.data.response.message || 'Error resignment');
        }
    }

    return (
        <div className="flex min-h-[70vh] flex-col gap-5 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
            <div>
                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900 md:text-2xl">All Sales Person</p>
                        </div>
                    </div>
                    <div className="self-start rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 md:self-auto">
                        {salesPerson.length} Members
                    </div>
                </div>

                {salesPerson.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {salesPerson.map(({ basicDetails, _id }) => (
                            <button
                                onClick={() => handleSelectSalesExecutive(_id)}
                                key={_id}
                                className={`group rounded-xl border bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selectSalesEmployee.some((id) => id === _id) ? 'border-blue-600' : 'border-gray-200'}`}
                            >
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-black group-hover:text-white">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="line-clamp-1 font-semibold text-gray-900">{basicDetails?.name || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-500">Sales Executive</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <SearchX className="mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-base font-medium text-gray-800">No sales person found</p>
                        <p className="mt-1 text-sm text-gray-500">Add team members to view them here.</p>
                    </div>
                )}
            </div>
            <Button onClick={editAssigedClient}>Submit</Button>
        </div>
    );
};

export default SalesWork;
