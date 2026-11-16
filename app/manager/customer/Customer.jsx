// app/manager/customer/Customer.jsx

'use client';
import Loading from '@/components/layout/Loading';
import { projectDurationFormControl } from '@/config/data';
import {
    createCustomerProjectCycleService,
    deleteCustomerProjectCycleService,
    getCustomerProjectCycleService,
    getCustomerServices,
    updateCustomerProjectCycleService,
    updateCustomerProjectPatchService,
} from '@/service/customer';
import { Building2, Calendar, Globe, Mail, MapPin, Pencil, Phone, Trash, User } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Customer = ({ customerId }) => {
    const [customerDetails, setCustomerDetails] = useState(null);
    const [projectCycleData, setProjectCycleData] = useState(null);
    const [loadingProjectCycle, setLoadingProjectCycle] = useState(false);
    const [currentEditedId, setCurrentEditedId] = useState(null);
    const [projectFormData, setProjectFormData] = useState({
        projectName: '',
        service: '',
        serviceName: '',
        serviceType: '',
        startDate: '',
        endDate: '',
    });

    const handleProjectSubmit = async (e) => {
        e.preventDefault();

        try {
            const serviceValue = projectFormData.service === 'other' ? projectFormData.serviceName : projectFormData.service;

            if (currentEditedId) {
                const updatedProjectDuration = projectCycleData?.projectCycle?.projectDuration?.map((item) =>
                    item._id === currentEditedId
                        ? {
                              ...item,
                              service: serviceValue,
                              serviceType: projectFormData?.serviceType,
                              startDate: projectFormData?.startDate,
                              endDate: projectFormData?.endDate,
                          }
                        : item
                );

                const res = await updateCustomerProjectCycleService(projectCycleData?.projectCycle?._id, { projectDuration: updatedProjectDuration });

                if (res.success) {
                    toast.success('Project details updated');
                    setProjectFormData({
                        service: '',
                        serviceName: '',
                        serviceType: '',
                        'start-date': '',
                        'end-date': '',
                    });
                    setCurrentEditedId(null);
                    fetchCustomerProjectCycle();
                }
            } else {
                const formData = {
                    projectName: projectFormData?.projectName,
                    clientId: customerId,
                    service: serviceValue,
                    serviceType: projectFormData?.serviceType,
                    'start-date': projectFormData.startDate,
                    'end-date': projectFormData.endDate,
                };
                // console.log(formData)
                const res = await createCustomerProjectCycleService(formData);
                if (res.success) {
                    toast.success('Project details submitted');
                    setProjectFormData({
                        projectName: '',
                        service: '',
                        serviceName: '',
                        serviceType: '',
                        startDate: '',
                        endDate: '',
                    });
                    fetchCustomerProjectCycle();
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while processing project cycle');
        }
    };

    async function fetchCustomerProjectCycle() {
        try {
            const response = await getCustomerProjectCycleService(customerId);
            if (response.success) {
                setLoadingProjectCycle(true);
                toast.success('Customer project duration fetched');
                setProjectCycleData(response.data);
            }
        } catch (error) {
            setLoadingProjectCycle(false);
            console.log(error);
            toast.error(error.message);
        }
    }

    const fetchCurrentCustomer = async () => {
        try {
            const response = await getCustomerServices(customerId);
            if (response.success) {
                toast.success('Customer details fetched');
                setCustomerDetails(response.data);
            }
        } catch (error) {
            console.log(error, 'hello error');
            toast.error(error?.response?.data?.message);
        }
    };

    // edit
    async function handleEditChange(data) {
        setProjectFormData({
            projectName: data?.projectName,
            service: data.service,
            serviceName: data.service,
            serviceType: data.serviceType || '',
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        });
        setCurrentEditedId(data._id);
    }

    // delete
    async function handleDelete(id) {
        const isConfirmed = window.confirm('Are you sure you want to delete this project?');

        if (!isConfirmed) return;

        try {
            const res = await deleteCustomerProjectCycleService(id);
            if (res.success) {
                toast.success('Project deleted successfully');
                fetchCustomerProjectCycle();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while deleting project');
        }
    }

    // edit
    async function handleProjectUpdate(e) {
        e.preventDefault();

        try {
            const payload = {
                projectCycleId: projectCycleData?.projectCycle?._id,
                durationId: currentEditedId,
                projectName: projectFormData?.projectName,
                service: projectFormData.service === 'other' ? projectFormData.serviceName : projectFormData.service,
                serviceType: projectFormData?.serviceType,
                startDate: projectFormData.startDate,
                endDate: projectFormData.endDate,
            };
            const res = await updateCustomerProjectPatchService(payload);

            if (res.success) {
                toast.success('Project updated successfully');
                setCurrentEditedId(null);
                setProjectFormData({
                    projectName: '',
                    service: '',
                    serviceName: '',
                    serviceType: '',
                    startDate: '',
                    endDate: '',
                });
                fetchCustomerProjectCycle();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update failed');
        }
    }

    useEffect(() => {
        fetchCurrentCustomer();
        fetchCustomerProjectCycle();
    }, []);

    if (!customerDetails) {
        return <Loading />;
    }

    const { name, company, GSTIN, phone, website, Address, city, state, pincode, country, meetingDate, tanNo, email, SalesPersonName, salesExecutive } =
        customerDetails;

    // console.log(projectFormData)

    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex h-fit w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:w-[30vw]">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{name}</h2>
                        <div className="mt-1 flex items-center gap-2 text-gray-500">
                            <Building2 size={14} />
                            <p className="text-sm font-medium">{company}</p>
                        </div>
                    </div>
                    <Link href={`/manager/employee/seo-sheet/${customerId}`} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white">
                        Keywords
                    </Link>
                </div>

                <div className="space-y-5 p-6">
                    {/* Contact Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail size={16} className="text-gray-400" />
                            <p className="text-sm">{email}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={16} className="text-gray-400" />
                            <p className="text-sm">{phone}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Globe size={16} className="text-gray-400" />
                            <a
                                href={website?.startsWith('http') ? website : `https://${website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="max-w-[200px] truncate text-sm hover:text-blue-600 hover:underline"
                            >
                                {website}
                            </a>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Business Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">GSTIN</p>
                            <p className="text-sm font-medium text-gray-700">{GSTIN}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">TAN No</p>
                            <p className="text-sm font-medium text-gray-700">{tanNo || 'NA'}</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Address */}
                    <div className="flex gap-3 text-gray-600">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                        <p className="text-sm leading-relaxed">
                            {Address}, {city}, {state} - {pincode}, {country}
                        </p>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Meta Info */}
                    <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <User size={14} />
                                <span>Sales Person</span>
                            </div>
                            <span className="font-medium text-gray-800 capitalize">{SalesPersonName || salesExecutive?.basicDetails?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} />
                                <span>Meeting Date</span>
                            </div>
                            <span className="font-medium text-gray-800">{new Date(meetingDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="w-full rounded-lg border p-4 lg:w-[30vw]">
                    <p className="mb-4 text-lg font-semibold">Add Project</p>
                    <form onSubmit={currentEditedId ? handleProjectUpdate : handleProjectSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Project</label>
                            <input
                                type="text"
                                value={projectFormData.projectName}
                                onChange={(e) =>
                                    setProjectFormData({
                                        ...projectFormData,
                                        projectName: e.target.value,
                                    })
                                }
                                placeholder="Enter Project Name"
                                className="rounded-md border p-2"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Service</label>
                            <select
                                value={projectFormData.service}
                                onChange={(e) =>
                                    setProjectFormData({
                                        ...projectFormData,
                                        service: e.target.value,
                                    })
                                }
                                className="rounded-md border p-2"
                            >
                                <option value="" disabled>
                                    Select Service
                                </option>
                                {projectDurationFormControl[0]?.options?.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {projectFormData.service === 'web-dev' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Service Type</label>
                                <select
                                    value={projectFormData?.serviceType}
                                    className="rounded-md border p-2"
                                    onChange={(e) =>
                                        setProjectFormData({
                                            ...projectFormData,
                                            serviceType: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select Service Type</option>
                                    <option value={'B2b'}>B2B</option>
                                    <option value={'D2C'}>D2C</option>
                                </select>
                            </div>
                        )}

                        {projectFormData.service === 'other' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Service Name</label>
                                <input
                                    type="text"
                                    value={projectFormData.serviceName}
                                    onChange={(e) =>
                                        setProjectFormData({
                                            ...projectFormData,
                                            serviceName: e.target.value,
                                        })
                                    }
                                    placeholder="Enter Service Name"
                                    className="rounded-md border p-2"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                className="rounded-lg border p-2"
                                type="date"
                                value={projectFormData.startDate}
                                onChange={(e) =>
                                    setProjectFormData({
                                        ...projectFormData,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={projectFormData?.endDate}
                                onChange={(e) =>
                                    setProjectFormData({
                                        ...projectFormData,
                                        endDate: e.target.value,
                                    })
                                }
                                className="rounded-md border p-2"
                            />
                        </div>

                        <button type="submit" className="rounded-md bg-black py-2 text-white transition-colors hover:bg-gray-800">
                            {currentEditedId ? 'Update Project' : 'Add project'}
                        </button>
                    </form>
                    {currentEditedId && (
                        <button
                            onClick={() => {
                                setCurrentEditedId(null);
                                setProjectFormData({
                                    service: '',
                                    serviceName: '',
                                    startDate: '',
                                    endDate: '',
                                });
                            }}
                            className="mt-2 w-full rounded-md bg-gray-500 py-2 text-white transition-colors hover:bg-gray-600"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full rounded-lg border p-4 lg:w-[30vw]">
                <p className="mb-4 text-xl font-semibold">Service</p>
                <div className="flex h-[400px] flex-col gap-3 overflow-y-auto">
                    {projectCycleData?.projectCycle?.projectDuration?.length > 0 ? (
                        projectCycleData?.projectCycle?.projectDuration?.map((item, idx) => (
                            <div key={idx} className="rounded-md border-b bg-gray-100 p-3">
                                <p className="font-semibold">{item?.projectName || '-'}</p>
                                <div className="flex">
                                    <p className="font-semibold capitalize">{item?.service}</p>
                                    {item?.serviceType && <p className="">&nbsp;- {item?.serviceType}</p>}
                                </div>
                                <div className="mt-1 text-sm">
                                    <p>Start Date: {new Date(item?.['startDate']).toLocaleDateString()}</p>
                                    <p>End Date: {new Date(item?.['endDate']).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <button
                                        onClick={() => handleEditChange(item)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item?._id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="mt-10 text-center text-gray-500">No Project History Found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Customer;
