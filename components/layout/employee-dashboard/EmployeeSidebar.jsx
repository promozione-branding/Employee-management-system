"use client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  User,
  LogOut,
  Menu,
  Briefcase,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "@/service/axiosInstance";

const EmployeeSidebar = ({ open, setOpen }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");
      sessionStorage.removeItem("employeeData");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
      console.log(error);
    }
  };

  const navLinks = [
    {
      href: "/employee-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={24} />,
    },
    {
      href: "/employee-dashboard/clients",
      label: "Client",
      icon: <UsersRound size={24} />,
    },
    {
      href: "/employee-dashboard/attendance",
      label: "Attendance",
      icon: <CalendarCheck size={24} />,
    },

    {
      href: "/employee-dashboard/leaves",
      label: "Leaves",
      icon: <FileText size={24} />,
    },
    {
      href: "/employee-dashboard/projects",
      label: "Projects",
      icon: <Briefcase size={24} />,
    },
    {
      href: "/employee-dashboard/profile",
      label: "Profile",
      icon: <User size={24} />,
    },
  ];

  return (
    <div
      className={`bg-white border-r text-black p-4 flex flex-col transition-all h-screen duration-300 ease-in-out relative ${
        open ? "w-64" : "w-14 md:w-20"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        {open && <h1 className="text-2xl font-bold truncate">Promizone</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="hover:bg-gray-100 ml-auto"
        >
          <Menu size={24} />
        </Button>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="ghost"
            className={`justify-start gap-4 hover:bg-zinc-700 hover:text-white p-3 ${
              !open && "justify-center"
            }`}
          >
            <Link href={link.href} className="flex items-center w-full">
              {link.icon}
              {open && <span className="ml-3">{link.label}</span>}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          className={`justify-start gap-4 hover:bg-gray-500 hover:text-white w-full p-3 ${
            !open && "justify-center"
          }`}
          onClick={handleLogout}
        >
          <LogOut size={24} />
          {open && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
