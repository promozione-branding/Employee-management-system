// app/dashboard/customer/components/AddProjectTab.jsx

"use client";

import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

const OTHERS = "others";

const inputClassName =
  "w-full rounded-lg border border-[#DCE3EE] bg-white px-3 py-2.5 text-sm text-[#24334D] outline-none transition placeholder:text-[#9AA4B5] hover:border-[#B8C6DA] focus:border-[#4779C5] focus:ring-2 focus:ring-[#4779C5]/10";

const labelClassName = "mb-1.5 block text-xs font-semibold text-[#465570]";

const getProposalId = (p) => p?._id || p?.id || "";
const getProposalNumber = (p) =>
  p?.proposalNumber || p?.quotationNumber || p?._id || p?.id || "";

export default function AddProjectTab({
  proposals = [],
  loadingProposals,
  loadingProposalDetails,
  selectedProposal,
  projectFormData,
  setField,
  onProposalChange,
  categories = [],
  usedCategoriesForProposal,
  onCategoryChange,
  onSubmit,
  onReset,
  submitting,
  isEditing,
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-[#E9EDF4] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF3FC] text-[#315F9F]">
            {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#18365F] sm:text-base">
              {isEditing ? "Edit Project" : "Add Project"}
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[#8792A5]">
              {isEditing
                ? "Update the selected project details."
                : "Map a proposal and set the build timeline."}
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9]"
            aria-label="Cancel editing"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
        <div>
          <label htmlFor="projectName" className={labelClassName}>
            Project Name
          </label>
          <input
            id="projectName"
            type="text"
            value={projectFormData.projectName}
            onChange={(e) => setField("projectName", e.target.value)}
            placeholder="Enter project name"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="proposalSelect" className={labelClassName}>
            Proposal <span className="text-[#E05B4B]">*</span>
          </label>
          <select
            id="proposalSelect"
            required
            value={
              projectFormData.proposalIsCustom
                ? OTHERS
                : projectFormData.proposalId
            }
            onChange={(e) => onProposalChange(e.target.value)}
            disabled={loadingProposals || submitting}
            className={inputClassName}
          >
            <option value="">
              {loadingProposals ? "Loading proposals..." : "Select a proposal"}
            </option>
            {proposals.map((p) => {
              const id = getProposalId(p);
              if (!id) return null;
              return (
                <option key={id} value={id}>
                  {getProposalNumber(p)} ·{" "}
                  {(p.items || [])
                    .map((i) => i.categoryLabel || i.category)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ") || "Services"}
                </option>
              );
            })}
            <option value={OTHERS}>Others (custom proposal)</option>
          </select>
        </div>

        {projectFormData.proposalIsCustom && (
          <div>
            <label htmlFor="customProposalNumber" className={labelClassName}>
              Custom Proposal Number{" "}
              <span className="text-[#E05B4B]">*</span>
            </label>
            <input
              id="customProposalNumber"
              type="text"
              value={projectFormData.customProposalNumber}
              onChange={(e) =>
                setField("customProposalNumber", e.target.value)
              }
              placeholder="e.g. PROP-2025-001"
              className={inputClassName}
            />
            <p className="mt-1 text-[11px] text-[#8792A5]">
              No proposal file attached — the Eye/proposal view will be hidden
              for this project.
            </p>
          </div>
        )}

        {loadingProposalDetails && (
          <div className="flex items-center gap-2 text-xs text-[#718097]">
            <RefreshCw size={14} className="animate-spin" />
            Loading proposal details...
          </div>
        )}

        <div>
          <label htmlFor="categorySelect" className={labelClassName}>
            Service / Category <span className="text-[#E05B4B]">*</span>
          </label>
          <select
            id="categorySelect"
            required
            value={projectFormData.category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={
              submitting ||
              (!projectFormData.proposalIsCustom && !selectedProposal)
            }
            className={inputClassName}
          >
            <option value="">
              {projectFormData.proposalIsCustom
                ? "Choose a service or Others"
                : !selectedProposal
                  ? "Select a proposal first"
                  : "Choose a service"}
            </option>
            {categories.map((c) => {
              const already = usedCategoriesForProposal?.has(String(c.value));
              return (
                <option
                  key={c.value}
                  value={c.value}
                  disabled={already}
                  className={
                    already ? "font-semibold text-[#27834E]" : undefined
                  }
                >
                  {c.label}
                  {already ? " • created" : ""}
                </option>
              );
            })}
            <option value={OTHERS}>Others (custom service)</option>
          </select>
          {usedCategoriesForProposal?.size > 0 &&
            !projectFormData.categoryIsCustom && (
              <p className="mt-1 text-[11px] text-[#27834E]">
                Green items are already created for this proposal.
              </p>
            )}
        </div>

        {projectFormData.categoryIsCustom && (
          <div>
            <label htmlFor="customServiceName" className={labelClassName}>
              Custom Service Name <span className="text-[#E05B4B]">*</span>
            </label>
            <input
              id="customServiceName"
              type="text"
              value={projectFormData.customServiceName}
              onChange={(e) => {
                setField("customServiceName", e.target.value);
                setField("categoryLabel", e.target.value);
              }}
              placeholder="e.g. Website maintenance"
              className={inputClassName}
            />
          </div>
        )}

        {projectFormData.service === "web-dev" && (
          <div>
            <label htmlFor="serviceType" className={labelClassName}>
              Service Type
            </label>
            <select
              id="serviceType"
              value={projectFormData.serviceType}
              onChange={(e) => setField("serviceType", e.target.value)}
              className={inputClassName}
            >
              <option value="">Select service type</option>
              <option value="B2b">B2B</option>
              <option value="D2C">D2C</option>
            </select>
          </div>
        )}

        <div className="border-t border-dashed border-[#E1E7F0] pt-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays size={16} className="text-[#4779C5]" />
            <h3 className="text-xs font-bold text-[#34445F]">
              Build Timeline
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className={labelClassName}>
                Service Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={projectFormData.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelClassName}>
                Service End Date
              </label>
              <input
                id="endDate"
                type="date"
                min={projectFormData.startDate || undefined}
                value={projectFormData.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[#8792A5]">
            Renewal reminders start only after{" "}
            <strong>Save &amp; Go Live</strong> on the project card.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#183F75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12315C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : isEditing ? (
            <CheckCircle2 size={16} />
          ) : (
            <Plus size={17} />
          )}
          {submitting
            ? "Saving..."
            : isEditing
              ? "Update Project"
              : "Add Project"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onReset}
            disabled={submitting}
            className="w-full rounded-lg border border-[#DCE3EE] px-4 py-2.5 text-sm font-semibold text-[#63718A] transition hover:bg-[#F5F7FB] disabled:opacity-60"
          >
            Cancel Editing
          </button>
        )}
      </form>
    </section>
  );
}
