"use client";

import React, { useState } from "react";

const page = () => {
  const initialSections = [
    {
      title: "Planning & Architecture",
      tasks: [
        "Website architecture finalized",
        "SEO-friendly URLs confirmed",
        "SSR / SSG strategy approved",
        "Mobile-first layout approved",
        "Scope and integrations locked",
      ],
    },
    {
      title: "Development & Performance",
      tasks: [
        "Reusable components implemented",
        "Images optimized (WebP/AVIF)",
        "Lazy loading enabled",
        "Code minified and split",
        "Fonts limited to 2 families",
      ],
    },
    {
      title: "Security & Code Quality",
      tasks: [
        "SSL implemented",
        "XSS & SQL protection applied",
        "Environment variables secured",
        "Unused code removed",
        "Dev/Staging/Prod separated",
      ],
    },
  ];

  const [sections, setSections] = useState(() =>
    initialSections.map((section) => ({
      ...section,
      tasks: section.tasks.map((taskText) => ({
        text: taskText,
        checked: false,
        notes: "",
      })),
    }))
  );

  const handleCheckboxChange = (sectionIndex, taskIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].tasks[taskIndex].checked =
      !newSections[sectionIndex].tasks[taskIndex].checked;
    setSections(newSections);
  };

  const handleNotesChange = (sectionIndex, taskIndex, event) => {
    const newSections = [...sections];
    newSections[sectionIndex].tasks[taskIndex].notes = event.target.value;
    setSections(newSections);
  };

  const handleSaveProgress = () => {
    // Here you would typically send the `sections` state to your backend API
    console.log("Saving progress:", sections);
    alert("Progress saved! Check the console for the current state.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6">
      <h1 className="text-3xl font-bold text-center">Project Checklist</h1>

      {sections.map((section, sectionIndex) => (
        <div key={section.title} className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.tasks.map((task, taskIndex) => (
              <div
                key={task.text}
                className="flex flex-col gap-2 p-2 border rounded-lg"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={task.checked}
                    onChange={() =>
                      handleCheckboxChange(sectionIndex, taskIndex)
                    }
                  />
                  <span className="text-base">{task.text}</span>
                </label>
                <input
                  type="text"
                  placeholder="Add notes..."
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={task.notes}
                  onChange={(e) =>
                    handleNotesChange(sectionIndex, taskIndex, e)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSaveProgress}
        className="bg-black text-white py-2 px-4 rounded-2xl font-medium mx-auto"
      >
        Save Progress
      </button>
    </div>
  );
};

export default page;
