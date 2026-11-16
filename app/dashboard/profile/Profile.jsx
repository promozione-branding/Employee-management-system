// app/dashboard/profile/Profile.jsx

'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Phone, Briefcase, User, Loader2, Save, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createAdminBasicDetailService, getAdminBasicDetailService, uploadProfileIageServices } from '@/service/admin-dashboard/admin-basic';
import { useAdminStore } from '@/lib/store/AdminStore';

const Profile = () => {
    const { adminDetail } = useAdminStore();
    const [profileDetail, setProfileDetail] = useState({});

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        profileImage: '',
        department: '',
        phone: '',
    });
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Show immediate local preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);

        // 2. Prepare FormData and call upload service
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setUploading(true);
            const response = await uploadProfileIageServices(uploadData);
            if (response.success) {
                setFormData((prev) => ({ ...prev, profileImage: response.url }));
                toast.success('Image uploaded successfully');
            }

            // Mocking successful response for your logic:
            setFormData((prev) => ({ ...prev, profileImage: response.url }));
        } catch (error) {
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.profileImage) return toast.error('Please upload a profile image first.');
        try {
            setLoading(true);
            const result = await createAdminBasicDetailService({
                ...formData,
                userId: adminDetail?._id,
            });
            if (result.success) {
                toast.success('Profile details saved successfully!');
            }
        } catch (error) {
            console.log(error);
            toast.error('Error saving details. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    async function fetchAdminBasicDetail() {
        try {
            const res = await getAdminBasicDetailService(adminDetail?._id);
            if (res.success) {
                setProfileDetail({ ...res?.data, adminDetail: res?.adminDetail });
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (!adminDetail?._id) return;
        fetchAdminBasicDetail();
    }, [adminDetail?._id]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            {profileDetail?.adminDetail ? (
                <div className="animate-in fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm duration-500">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-8 py-6">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Admin Profile</h1>
                            <p className="text-sm text-slate-500">View and manage your account details.</p>
                        </div>
                        <button
                            onClick={() => setProfileDetail((prev) => ({ ...prev, adminDetail: false }))}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 active:scale-95"
                        >
                            Edit Information
                        </button>
                    </div>

                    <div className="space-y-10 p-8">
                        <div className="flex flex-col items-center gap-8 sm:flex-row">
                            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-sm">
                                {profileDetail?.profileImage ? (
                                    <img src={profileDetail?.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-slate-300" />
                                )}
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">{profileDetail.department} Team</h2>
                                <div className="flex flex-col gap-2 text-slate-500 sm:flex-row sm:gap-6">
                                    <span className="flex items-center gap-2 text-sm font-medium italic">
                                        <Briefcase className="h-4 w-4 text-slate-400" /> {profileDetail.department}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm font-medium italic">
                                        <Phone className="h-4 w-4 text-slate-400" /> {profileDetail.phone}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-8">
                            <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                                <div className="rounded-lg bg-emerald-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Profile verified and active</p>
                                    <p className="mt-0.5 text-xs font-medium text-emerald-700">
                                        Account details were last synchronized on{' '}
                                        {new Date(profileDetail.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
                        <h1 className="text-xl font-bold text-slate-800">Basic Information</h1>
                        <p className="text-sm text-slate-500">Update your profile photo and basic details here.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 p-8">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                            <div className="group relative">
                                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-inner">
                                    {imagePreview || formData.profileImage ? (
                                        <img src={imagePreview || formData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-300" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="image-upload"
                                    className="absolute -right-2 -bottom-2 cursor-pointer rounded-xl bg-blue-600 p-2.5 text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
                                >
                                    <Camera className="h-5 w-5" />
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <h3 className="font-semibold text-slate-700">Profile Photo</h3>
                                <p className="text-sm text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                                {formData.profileImage && !uploading && (
                                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                                        <CheckCircle className="h-3 w-3" /> Uploaded
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Department Field */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 italic">
                                    <Briefcase className="h-4 w-4 text-slate-400" /> Department
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                    className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Select Department</option>
                                    <option value="sales">Sales</option>
                                </select>
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 italic">
                                    <Phone className="h-4 w-4 text-slate-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 886XXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    className="h-11 w-full rounded-xl border border-slate-300 px-4 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-6">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {loading ? 'Processing...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
