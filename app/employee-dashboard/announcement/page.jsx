"use client";

import Loading from "@/components/layout/Loading";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { getListAnnouncementService } from "@/service/employee-dashboard/announcement";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, User, Megaphone } from "lucide-react";

const Announcement = () => {
  const { employee } = useEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [announcementList, setAnnouncementList] = useState([]);

  const designation_value = employee?.basicDetails?.designation;

  async function fetchAnnouncement() {
    try {
      if (designation_value === undefined) return;
      const res = await getListAnnouncementService(designation_value);
      if (res?.success) {
        setAnnouncementList(res?.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "error while fetching the announcement",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (designation_value === undefined) return;
    fetchAnnouncement();
  }, [designation_value]);

  if (loading) return <Loading />;
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Megaphone className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      </div>

      {announcementList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-500">
            No announcements available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcementList.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className="font-semibold text-lg text-gray-900 line-clamp-2"
                    title={announcement.title}
                  >
                    {announcement.title}
                  </h3>
                  {announcement.targetDepartment && (
                    <span className="text-[10px] font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                      {announcement.targetDepartment.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  {announcement.content}
                </p>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span className="capitalize">
                      {announcement.author?.username || "Admin"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(announcement.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcement;
