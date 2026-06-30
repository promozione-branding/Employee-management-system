"use client"

import SideBar from "@/components/layout/manager/Sidebar";
import { useManagerEmployeeStore } from "@/lib/store/mangerStore";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
    const details = useManagerEmployeeStore((s) => s.fetchEmployee);

    useEffect(() => {
        try {
            details();
        } catch (error) {
            console.log(error);
        }
    }, []);

    return <SideBar>{children}</SideBar>;
}
