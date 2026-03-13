"use client";

import { useEffect, useState } from "react";
import { allEmployeeContactService } from "@/service/employee-dashboard/dashboard";
import { Mail, Phone, User } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

const AllEmployeeContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await allEmployeeContactService();
        if (res.success) {
          setContacts(res?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch employee contacts", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 bg-white px-5 py-5  rounded-xl lg:h-[68vh] shadow-lg">
        <Skeleton height={24} width={200} className="mb-4" />

        <div className="flex flex-col gap-3 h-[50vh] overflow-y-hidden ">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Skeleton circle height={50} width={50} />
                <div className="flex-1">
                  <Skeleton height={20} width="60%" />
                  <Skeleton height={14} width="40%" className="mt-1" />
                  <div className="mt-2 flex items-center gap-2">
                    <Skeleton circle width={16} height={16} />
                    <Skeleton height={16} width="80%" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!contacts.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No employee contacts found
      </p>
    );
  }

  return (
    <div className="space-y-4 bg-[#f3eaea] px-5 py-5  rounded-xl lg:h-[68vh] shadow-lg">
      <h3 className="text-lg font-semibold">Employee Contacts</h3>

      <div className="flex flex-col gap-3 h-[50vh] overflow-y-scroll ">
        {contacts.map((employee) => (
          <div
            key={employee._id}
            className="rounded-lg border p-4 hover:shadow-sm transition"
          >
            <div className="flex items-start gap-3">
              {employee?.basicDetails?.profileImage ? (
                <Image
                  src={employee?.basicDetails?.profileImage}
                  height={50}
                  width={50}
                  alt={employee.basicDetails?.name || "Profile image"}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground mt-1" />
              )}

              <div className="flex-1">
                <p className="font-medium">{employee.basicDetails?.name}</p>

                <p className="text-xs text-muted-foreground">
                  {employee.basicDetails?.designation}
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${employee.basicDetails?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {employee.basicDetails?.email}
                  </a>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${employee.basicDetails?.phone}`}
                    className="text-black hover:underline"
                  >
                    {employee.basicDetails?.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllEmployeeContact;
