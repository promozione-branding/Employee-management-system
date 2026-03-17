// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   getReminderService,
//   createReminderService,
// } from "@/service/employee-dashboard/reminder";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Trash2, Bell } from "lucide-react";
// import toast from "react-hot-toast";
// import Skeleton from "react-loading-skeleton";

// const EmployeeReminder = ({ employeeId }) => {
//   const [reminders, setReminders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [description, setDescription] = useState("");
//   const [reminderAt, setReminderAt] = useState("");

//   const fetchReminders = async () => {
//     try {
//       setLoading(true);
//       const res = await getReminderService(employeeId);
//       setReminders(res?.data?.reminder || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

// const formatDate = (date) => {
//   if (!date) return "";

//   const d = new Date(date);

//   if (isNaN(d.getTime())) return "";

//   return d.toISOString().slice(0, 16);
// };

//   const handleCreate = async () => {
//     try {
//       if (!description || !reminderAt) return;

//       console.log(employeeId, description, reminderAt);

//       const res = await createReminderService({
//         employeeId,
//         description,
//         reminderAt,
//       });

//       if (res.success) {
//         toast.success(res.message || "reminder create successfully");
//         setDescription("");
//         setReminderAt("");
//         fetchReminders();
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response.data.message || "error while create reminder");
//     }
//   };

//   useEffect(() => {
//     if (employeeId) fetchReminders();
//   }, [employeeId]);

//   return (
//     <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 lg:h-[68vh] lg:w-1/2">
//       <div className="flex items-center gap-2 mb-4">
//         <Bell className="text-blue-600" />
//         <h2 className="text-xl font-bold">Reminders</h2>
//       </div>

//       {/* Create Reminder */}
//       <div className="flex flex-col md:flex-row gap-3 mb-6">
//         <Input
//           placeholder="Reminder description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//         <Input
//           type="datetime-local"
//           value={formatDate(reminderAt)}
//           onChange={(e) => setReminderAt(e.target.value)}
//         />
//         <Button onClick={handleCreate}>Add</Button>
//       </div>

//       {/* List */}
//       {loading ? (
//         <ul className="space-y-3 lg:h-[40vh] overflow-hidden">
//           {[...Array(4)].map((_, i) => (
//             <li key={i} className="p-3 border rounded-lg">
//               <Skeleton height={20} width="70%" />
//               <Skeleton height={14} width="40%" className="mt-2" />
//             </li>
//           ))}
//         </ul>
//       ) : reminders.length === 0 ? (
//         <p className="text-sm text-slate-500">No reminders added</p>
//       ) : (
//         <ul className="space-y-3 lg:h-[40vh] overflow-y-auto">
//           {reminders.map((item) => (
//             <li
//               key={item._id}
//               className="flex items-center justify-between p-3 border rounded-lg"
//             >
//               <div>
//                 <p className="font-medium">{item.description}</p>
//                 <p className="text-xs text-slate-500">
//                   ⏰ {new Date(item.reminderAt).toLocaleString()}
//                 </p>
//                 {item.reminderSend && (
//                   <span className="text-green-600 text-xs font-semibold">
//                     ✔ Sent
//                   </span>
//                 )}
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default EmployeeReminder;



"use client";

import React, { useEffect, useState } from "react";
import {
  getReminderService,
  createReminderService,
} from "@/service/employee-dashboard/reminder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

const EmployeeReminder = ({ employeeId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");

  /* ================= FETCH ================= */
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await getReminderService(employeeId);
      setReminders(res?.data?.reminder || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      if (!description || !reminderAt) {
        return toast.error("Fill all fields");
      }

      const localDate = new Date(reminderAt);

      const res = await createReminderService({
        employeeId,
        description,
        reminderAt: localDate,
      });

      if (res?.success) {
        toast.success(res.message || "Reminder created");
        setDescription("");
        setReminderAt("");
        fetchReminders();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error while creating reminder"
      );
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (employeeId) fetchReminders();
  }, [employeeId]);

  return (
    <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 lg:h-[68vh] lg:w-1/2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-blue-600" />
        <h2 className="text-xl font-bold">Reminders</h2>
      </div>

      {/* Create Reminder */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Input
          placeholder="Reminder description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          type="datetime-local"
          value={reminderAt}
          onChange={(e) => setReminderAt(e.target.value)}
        />

        <Button onClick={handleCreate}>Add</Button>
      </div>

      {/* List */}
      {loading ? (
        <ul className="space-y-3 lg:h-[40vh] overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="p-3 border rounded-lg">
              <Skeleton height={20} width="70%" />
              <Skeleton height={14} width="40%" className="mt-2" />
            </li>
          ))}
        </ul>
      ) : reminders.length === 0 ? (
        <p className="text-sm text-slate-500">No reminders added</p>
      ) : (
        <ul className="space-y-3 lg:h-[40vh] overflow-y-auto">
          {reminders.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{item.description}</p>

                {/* ✅ CORRECT DISPLAY */}
                <p className="text-xs text-slate-500">
                  ⏰ {new Date(item.reminderAt).toLocaleString()}
                </p>

                {item.reminderSend && (
                  <span className="text-green-600 text-xs font-semibold">
                    ✔ Sent
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeReminder;
