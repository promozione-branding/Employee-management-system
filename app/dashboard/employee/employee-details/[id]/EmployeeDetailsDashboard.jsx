"use client";

import { useState, useEffect } from "react";
import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import Loading from "@/components/layout/Loading";
import toast from "react-hot-toast";

const EmployeeDetailsDashboard = ({ employeeId }) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using dummy data for now
    const dummyData = {
      basicDetails: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 234 567 890",
        role: "Software Engineer",
      },
      attendance: {
        present: 20,
        absent: 2,
        late: 1,
        totalWorkingDays: 23,
      },
      tasks: {
        completed: 15,
        inProgress: 5,
        pending: 3,
        total: 23,
      },
      leaves: {
        balance: 12,
        used: 8,
        total: 20,
      },
    };
    setEmployeeData(dummyData);
    setLoading(false);
  }, [employeeId]);

  if (loading) {
    return <Loading />;
  }

  if (!employeeData) {
    return <p>Could not load employee details.</p>;
  }

  return (
    <div className="container mx-auto mt-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>
        <p className="text-gray-600">
          {employeeData.basicDetails.firstName}{" "}
          {employeeData.basicDetails.lastName}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Info */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Personal Information
          </h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">Email:</span>{" "}
              {employeeData.basicDetails.email}
            </p>
            <p>
              <span className="font-medium text-gray-600">Phone:</span>{" "}
              {employeeData.basicDetails.phone}
            </p>
            {employeeData.basicDetails.role && (
              <p>
                <span className="font-medium text-gray-600">Role:</span>{" "}
                {employeeData.basicDetails.role}
              </p>
            )}
          </div>
        </div>

        {/* Attendance Info */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Attendance Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 p-2 rounded">
              <p className="text-2xl font-bold text-green-600">
                {employeeData?.attendance?.present || 0}
              </p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="text-2xl font-bold text-red-600">
                {employeeData?.attendance?.absent || 0}
              </p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <p className="text-2xl font-bold text-yellow-600">
                {employeeData?.attendance?.late || 0}
              </p>
              <p className="text-sm text-gray-500">Late</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {employeeData?.attendance?.totalWorkingDays || 0}
              </p>
              <p className="text-sm text-gray-500">Total Days</p>
            </div>
          </div>
        </div>

        {/* Task Info */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Task Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {employeeData?.tasks?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {employeeData?.tasks?.inProgress || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {employeeData?.tasks?.pending || 0}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Total Tasks</span>
                <span>{employeeData?.tasks?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Info */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Leave Balance
          </h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {employeeData?.leaves?.balance || 0}
              </p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {employeeData?.leaves?.used || 0}
              </p>
              <p className="text-sm text-gray-500">Used</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {employeeData?.leaves?.total || 0}
              </p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer or additional content can go here */}
    </div>
  );
};

export default EmployeeDetailsDashboard;
