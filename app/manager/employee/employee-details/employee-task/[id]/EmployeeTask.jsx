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
  }, []);

  if (isLoading) {
    return <div className="mt-5 text-center">Loading employee tasks...</div>;
  }

  return (
    <div className="mt-5">
      {tasks && tasks.length > 0 ? (
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {task.department.replace(/_/g, " ")}
                  </h3>
                  {task.clientId && (
                    <div className="mt-1">
                      <p className="text-sm font-medium text-gray-700">
                        Client: {task.clientId.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Company: {task.clientId.company}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    <p>Started: {new Date(task.startedAt).toLocaleString()}</p>
                    <p>
                      Last Updated: {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
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
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {task.progressPercentage.completeField} /{" "}
                    {task.progressPercentage.totalField}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        task.progressPercentage.totalField > 0
                          ? (task.progressPercentage.completeField /
                              task.progressPercentage.totalField) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Checklist</h4>
                <ul className="space-y-3">
                  {task.checklist.map((item) => (
                    <li
                      key={item._id}
                      className="border-b last:border-b-0 pb-2"
                    >
                      <div className="flex items-start">
                        <span
                          className={`mr-2 mt-0.5 ${
                            item.completed ? "text-green-500" : "text-gray-400"
                          }`}
                        >
                          {item.completed ? "✔" : "○"}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {item.label}
                          </p>
                          {item.completed && (
                            <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              <p>
                                <span className="font-semibold">
                                  Completed:
                                </span>{" "}
                                {new Date(item.completedAt).toLocaleString()}
                              </p>
                              {item.remarks && (
                                <p className="mt-1">
                                  <span className="font-semibold">
                                    Remarks:
                                  </span>{" "}
                                  {item.remarks}
                                </p>
                              )}
                              {item.proofUrl && (
                                <div className="mt-1">
                                  <span className="font-semibold">Proof:</span>{" "}
                                  <a
                                    href={item.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all"
                                  >
                                    {item.proofUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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
