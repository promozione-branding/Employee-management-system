"use client";

import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { useState, useEffect } from "react";

export default function SEOChecklistForm({ onSubmit, template, completed, buttonDisabled, project }) {
  // console.log(template, completed, project);
  const [checklist, setChecklist] = useState([]);
  const { employee } = useEmployeeStore();

  useEffect(() => {
    if (!template) return;

    const mergedChecklist = template.map((item) => {
      const saved = completed?.find((c) => c.key === item.key);

      return saved
        ? {
          ...item,
          ...saved,
        }
        : {
          ...item,
          completed: false,
          completedAt: null,
          remarks: "",
          proofUrl: "",
          completedBy: null,
        };
    });

    // Add custom checklist items
    const customItems = completed?.filter((saved) => !template.some((temp) => temp.key === saved.key)) || [];

    setChecklist([...customItems, ...mergedChecklist]);
  }, [template, completed, project?.workDetailId]);

  const toggleCompleted = (index) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            completed: !item.completed,
            completedBy: employee?._id,
            completedAt: !item.completed ? new Date().toISOString() : null,
          }
          : item,
      ),
    );
  };

  const updateField = (index, field, value) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const progress = Math.round(
    (checklist.filter((c) => c.completed).length / checklist.length) * 100,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(checklist);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="text-sm text-gray-600 mb-2">Progress of {project?.project?.projectName}: {progress}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-5 mt-5">
        {checklist.map((item, index) => {
          const isSaved = completed?.some((c) => c.key === item.key && c.completed,);
          return (
            <div
              key={item.key}
              className={`border rounded-2xl p-4 space-y-3 shadow-sm ${isSaved ? "border-emerald-500 bg-emerald-50" : ""
                }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleCompleted(index)}
                  className="h-4 w-4"
                  disabled={isSaved}
                />
                <span
                  className={`font-medium ${isSaved ? "line-through text-gray-500" : ""
                    }`}
                >
                  {item.label}
                </span>
              </div>

              <input
                placeholder="Remarks"
                value={item.remarks}
                required={item.completed}
                onChange={(e) => updateField(index, "remarks", e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                disabled={isSaved}
              />

              <input
                type="url"
                placeholder="Proof URL"
                value={item.proofUrl}
                onChange={(e) => updateField(index, "proofUrl", e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                disabled={isSaved}
              />

              {item.completedBy && (
                <p className="text-xs text-gray-500">
                  Completed by: {item.completedBy.basicDetails?.name}
                </p>
              )}
              {item.completedAt && (
                <p className="text-xs text-gray-500">
                  Completed at: {new Date(item.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={buttonDisabled}
        className="px-6 py-2 rounded-xl bg-black text-white text-sm my-5"
      >
        {buttonDisabled ? "Save Checklist..." : "Save Checklist"}
      </button>
    </form>
  );
}
