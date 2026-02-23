"use client";

import { myClientService } from "@/service/admin-dashboard/dashboard-api";
import { Building, Code, Globe, Palette, Rocket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const MyClient = () => {
  const [clients, setClients] = useState([]);

  async function fetchClients() {
    try {
      const res = await myClientService();
      if (res.success) {
        setClients(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "server error");
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const icons = [
    { icon: Building, color: "bg-blue-50", iconColor: "text-blue-600" },
    { icon: Code, color: "bg-purple-50", iconColor: "text-purple-600" },
    { icon: Globe, color: "bg-yellow-50", iconColor: "text-yellow-600" },
    { icon: Palette, color: "bg-pink-50", iconColor: "text-pink-600" },
    { icon: Rocket, color: "bg-green-50", iconColor: "text-green-600" },
  ];

  return (
    <div className="lg:w-1/2 ">
      <Link href={"/dashboard/customer"} className="bg-white shadow-md border p-5 h-full  block rounded-lg">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">My Clients</h2>
         
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto ">
          {clients.length > 0 ? (
            clients.map((client, index) => {
              const { icon, color, iconColor } = icons[index % icons.length];
              const ClientIcon = icon;
              const status = client.proposals.length > 0 ? "Active" : "Pending";
              return (
                <Link
                  key={client._id}
                  href={`/dashboard/customer/${client?._id}`}
                  className="flex flex-col gap-4 "
                >
                  <div
                    className={`${color} p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${iconColor} p-2 bg-white rounded-lg`}>
                        <ClientIcon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {client.name}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                              status === "Active"
                                ? "bg-green-200 text-green-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {client.company}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {client.email}
                        </p>
                        <div className="mt-3 space-y-1">
                          {client.proposals.map((item) => (
                            <div
                              key={item?._id}
                              className="flex flex-wrap gap-1"
                            >
                              {item?.services?.map((s) => (
                                <span
                                  key={s._id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200"
                                >
                                  {s.serviceTitle}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-slate-500 text-center">No clients to display.</p>
          )}
        </div>
      </Link>
    </div>
  );
};
