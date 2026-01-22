"use client";

import { useState } from "react";

export default function SEOChecklistForm({ onSubmit, template }) {
  const [checklist, setChecklist] = useState(template);

  const toggleCompleted = (index) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              completed: !item.completed,
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
      <div className="text-sm text-gray-600">Progress: {progress}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-5 mt-5">
        {checklist.map((item, index) => (
          <div
            key={item.key}
            className="border rounded-2xl p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleCompleted(index)}
                className="h-4 w-4"
              />
              <span className="font-medium">{item.label}</span>
            </div>

            <input
              placeholder="Remarks"
              value={item.remarks}
              onChange={(e) => updateField(index, "remarks", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />

            <input
              type="url"
              placeholder="Proof URL"
              value={item.proofUrl}
              onChange={(e) => updateField(index, "proofUrl", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />

            {item.completedAt && (
              <p className="text-xs text-gray-500">
                Completed at: {new Date(item.completedAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="px-6 py-2 rounded-xl bg-black text-white text-sm my-5"
      >
        Save Checklist
      </button>
    </form>
  );
}
