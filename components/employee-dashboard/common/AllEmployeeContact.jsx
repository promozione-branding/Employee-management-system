"use client";

import { useEffect, useState } from "react";
import { allEmployeeContactService } from "@/service/employee-dashboard/dashboard";
import { Mail, User } from "lucide-react";
import Loading from "@/components/layout/Loading";
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
    return <Loading />;
  }

  if (!contacts.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No employee contacts found
      </p>
    );
  }


  return (
    <div className="space-y-4 bg-white px-5 py-5 m-5 rounded-xl lg:w-1/2">
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllEmployeeContact;
