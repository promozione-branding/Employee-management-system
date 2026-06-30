"use client";

import Loading from "@/components/layout/Loading";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  UserRoundPen,
} from "lucide-react";
import toast from "react-hot-toast";
import { getEmployeeProfileService } from "@/service/employee-dashboard/employee";
import Image from "next/image";
import Link from "next/link";

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
        toast.error("Error while fetching employee details");
      }
    }
    fetchProfileDetails();
  }, [employeeId]);

  useEffect(() => {
    const employeeData = JSON.parse(sessionStorage.getItem("employeeData"));
    if (employeeData?.basicDetails) {
      setEmployeeId(employeeData?._id);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  const { basicDetails, employeeId: empId } = profileData || {};

  return (
    <div className="max-w-4xl mx-auto md:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50 p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6 relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
            <Image
              width={1000}
              height={1000}
              src={
                basicDetails?.profileImage || "https://via.placeholder.com/150"
              }
              alt={basicDetails?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {basicDetails?.name}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {basicDetails?.designation?.replace(/_/g, " ")}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
              EMPLOYEE ID: {empId}
            </span>
          </div>

          <Link href={`/manager/profile/edit/${employeeId}`} className="absolute right-10 top-5 h-10 w-10 flex items-center justify-center rounded-2xl border">
            <UserRoundPen />
          </Link>
        </div>

        {/* Details Grid */}
        <div className="p-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900 break-all">
                  {basicDetails?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {basicDetails?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900">
                  {basicDetails?.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="font-medium text-gray-900 capitalize">
                  {basicDetails?.gender?.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-lg shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {basicDetails?.dob
                    ? new Date(basicDetails.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Joining Date</p>
                <p className="font-medium text-gray-900">
                  {basicDetails?.joiningDate
                    ? new Date(basicDetails.joiningDate).toLocaleDateString()
                    : "N/A"}
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
