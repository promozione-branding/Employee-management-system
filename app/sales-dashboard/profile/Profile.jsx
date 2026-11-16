// app/sales-dashboard/profile/Profile.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { useEffect, useState } from 'react';
import { Briefcase, Calendar, Mail, MapPin, Phone, User, UserRoundPen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployeeProfileService } from '@/service/employee-dashboard/employee';
import Image from 'next/image';
import Link from 'next/link';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState(null);
    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        async function fetchProfileDetails() {
            try {
                if (employeeId) {
                    const res = await getEmployeeProfileService(employeeId);
                    if (res.success) {
                        setLoading(false);
                        setProfileData(res.data);
                    }
                }
            } catch (error) {
                console.log(error);
                toast.error('Error while fetching employee details');
            }
        }
        fetchProfileDetails();
    }, [employeeId]);

    useEffect(() => {
        const employeeData = JSON.parse(sessionStorage.getItem('employeeData'));
        if (employeeData?.basicDetails) {
            setEmployeeId(employeeData?._id);
        }
    }, []);

    if (loading) {
        return <Loading />;
    }

    const { basicDetails, employeeId: empId } = profileData || {};

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* Header Section */}
                <div className="relative flex flex-col items-center gap-6 border-b border-gray-100 bg-gray-50 p-8 md:flex-row">
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md">
                        <Image
                            width={1000}
                            height={1000}
                            src={basicDetails?.profileImage || 'https://via.placeholder.com/150'}
                            alt={basicDetails?.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{basicDetails?.name}</h1>
                        <p className="mt-1 font-medium text-gray-500">{basicDetails?.designation?.replace(/_/g, ' ')}</p>
                        <span className="mt-3 inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            ID: {empId}
                        </span>
                    </div>

                    <Link
                        href={`/employee-dashboard/profile/edit/${employeeId}`}
                        className="absolute top-5 right-10 flex h-10 w-10 items-center justify-center rounded-2xl border"
                    >
                        <UserRoundPen />
                    </Link>
                </div>

                {/* Details Grid */}
                <div className="p-8">
                    <h3 className="mb-6 border-b pb-2 text-lg font-semibold text-gray-800">Personal Information</h3>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-blue-50 p-2.5 text-blue-600">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Email Address</p>
                                <p className="font-medium break-all text-gray-900">{basicDetails?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-green-50 p-2.5 text-green-600">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium text-gray-900">{basicDetails?.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-orange-50 p-2.5 text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Address</p>
                                <p className="font-medium text-gray-900">{basicDetails?.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-purple-50 p-2.5 text-purple-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Gender</p>
                                <p className="font-medium text-gray-900 capitalize">{basicDetails?.gender?.toLowerCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-pink-50 p-2.5 text-pink-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium text-gray-900">{basicDetails?.dob ? new Date(basicDetails.dob).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                            <div className="shrink-0 rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-500">Joining Date</p>
                                <p className="font-medium text-gray-900">
                                    {basicDetails?.joiningDate ? new Date(basicDetails.joiningDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
