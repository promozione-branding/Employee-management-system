"use client";
import { CalendarCheck, ListTodo, User, Users } from "lucide-react";
import Link from "next/link";

const EmployeeDetailsDashboard = ({employeeId}) => {
  const cardList = [
    {
      label: "Profile",
      icon: <User size={24} />,
      description: "View personal details",
      href:`/dashboard/employee/employee-details/profile/${employeeId}`
    },
    {
      label: "Attendance",
      icon: <CalendarCheck size={24} />,
      description: "Track attendance logs",
      href:""
    },
    {
      label: "Task",
      icon: <ListTodo size={24} />,
      description: "Manage assigned tasks",
      href:`/dashboard/employee/employee-details/employee-task/${employeeId}`
    },
    {
      label: "Clients",
      icon: <Users size={24} />,
      description: "View assigned clients",
      href:""
    },
  ];

  return (
    <div>
      <h2 className="font-bold text-2xl text-center mb-5">Employee Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardList.map((card, index) => (
          <Link
          href={card?.href}
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                {card.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{card.label}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDetailsDashboard;
