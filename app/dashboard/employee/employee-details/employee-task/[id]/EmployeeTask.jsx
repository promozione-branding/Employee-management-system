"use client";

import { getEmployeeWorkService } from "@/service/admin-dashboard/employee/work";
import { useEffect, useState } from "react";

export default function EmployeeTask({ employeeId }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchEmployeeWork() {
    try {
      const res = await getEmployeeWorkService(employeeId);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeWork();
    }
  }, [employeeId]);

  if (isLoading) {
    return <div className="mt-5 text-center">Loading employee tasks...</div>;
  }

  return (
    <div className="mt-5">
      {tasks && tasks.length > 0 ? (
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {task.department.replace(/_/g, " ")}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Progress:</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (task.progressPercentage.completeField /
                          task.progressPercentage.totalField) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Checklist</h4>
                <ul className="mt-2 space-y-1">
                  {task.checklist.map((item) => (
                    <li key={item._id} className="flex items-center">
                      <span
                        className={`mr-2 ${
                          item.completed ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        {item.completed ? "✔" : "○"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No tasks found for this employee.
        </p>
      )}
    </div>
  );
}
