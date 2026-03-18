"use client";

import Loading from "@/components/layout/Loading";
import { getAllDeleteCustomer } from "@/service/customer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DeleteClient = () => {
  const [loading, setLoading] = useState(true);
  const [customerDeleteData, setCustomerDeleteData] = useState([]);

  console.log(customerDeleteData, "customerDeleteData");

  useEffect(() => {
    async function getDeleteCustomerHistory() {
      try {
        setLoading(true);
        const res = await getAllDeleteCustomer();
        if (res.success) {
          setCustomerDeleteData(res.data);
          toast.success(
            res.message || "Deleted customer history fetched successfully"
          );
        } else {
          toast.error(
            res.message || "Failed to fetch deleted customer history"
          );
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            "Error while fetching deleted customer"
        );
      } finally {
        setLoading(false);
      }
    }
    getDeleteCustomerHistory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mt-4">
      {customerDeleteData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {customerDeleteData.map((item) => {
            const data = item.changes[0]?.oldValue;
            if (!data) return null;
            return (
              <div
                key={item._id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.name}
                    </h3>
                    <p className="text-sm text-gray-500">{data.company}</p>
                  </div>
                  <div className="text-left md:text-right text-xs text-gray-500">
                    <p>
                      Deleted by{" "}
                      <span className="font-medium text-gray-700">
                        {item.changedBy?.email}
                      </span>
                    </p>
                    <p>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Contact Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Email:</span> {data.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {data.phone}
                      </p>
                      <p>
                        <span className="font-medium">Website:</span>{" "}
                        <a
                          href={data.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {data.website}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Address
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>{data.Address}</p>
                      <p>
                        {data.city}, {data.state}
                      </p>
                      <p>
                        {data.country} - {data.pincode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Official Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">GSTIN:</span> {data.GSTIN}
                      </p>
                      <p>
                        <span className="font-medium">TAN:</span> {data.tanNo}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Sales Info
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Sales Person:</span>{" "}
                        {data.SalesPersonName}
                      </p>
                      <p>
                        <span className="font-medium">Sales Email:</span>{" "}
                        {data.salesPersonEmail}
                      </p>
                      <p>
                        <span className="font-medium">Meeting Date:</span>{" "}
                        {data.meetingDate}
                      </p>
                    </div>
                  </div>

                  {data.notes && data.notes.length > 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                        Notes
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 bg-gray-50 p-3 rounded-md">
                        {data.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 border rounded-md">
          <p className="text-gray-500">No deleted customer history found.</p>
        </div>
      )}
    </div>
  );
};

export default DeleteClient;
