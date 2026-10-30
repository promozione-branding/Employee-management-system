
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Save,
  Workflow,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  listProposalNewService,
  getProposalNewByIdService,
} from "@/service/proposalNew";

const DURATION_OPTIONS = [
  { value: "3m", label: "3 Months", months: 3 },
  { value: "6m", label: "6 Months", months: 6 },
  { value: "12m", label: "12 Months", months: 12 },
  { value: "custom", label: "Custom", months: null },
];

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Add calendar months while safely handling dates such as January 31.
const addMonthsToDate = (dateString, months) => {
  if (!dateString || !months) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = targetMonthIndex % 12;

  const lastDayOfTargetMonth = new Date(
    targetYear,
    normalizedMonth + 1,
    0
  ).getDate();

  const targetDay = Math.min(day, lastDayOfTargetMonth);

  const result = new Date(
    targetYear,
    normalizedMonth,
    targetDay
  );

  const resultYear = result.getFullYear();
  const resultMonth = String(result.getMonth() + 1).padStart(2, "0");
  const resultDay = String(result.getDate()).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getProposalId = (proposal) =>
  proposal?._id || proposal?.id || "";


const getProposalLabel = (proposal) => {
  const number =
    proposal?.proposalNumber ||
    proposal?.quotationNumber ||
    proposal?._id ||
    proposal?.id ||
    "";

  const services = [
    ...new Set(
      (Array.isArray(proposal?.items) ? proposal.items : [])
        .map((item) => item.categoryLabel || item.category || item.label)
        .filter(Boolean)
    ),
  ];

  const serviceText = services.length
    ? services.join(", ")
    : "Services unavailable";

  const date = proposal?.createdAt
    ? formatDate(String(proposal.createdAt).slice(0, 10))
    : "";

  return [
    number,
    serviceText,
    date,
  ]
    .filter(Boolean)
    .join(" · ");
};


const getResponseData = (response) => {
  if (response?.success === false) {
    throw new Error(response.message || "Request failed.");
  }

  return response?.data;
};

const getProposalItems = (proposal) =>
  Array.isArray(proposal?.items) ? proposal.items : [];

export default function Createworkflow({ customerId, onSave }) {
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [startDate, setStartDate] = useState(getToday);
  const [duration, setDuration] = useState("3m");
  const [customEndDate, setCustomEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingProposalDetails, setLoadingProposalDetails] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the customer's proposal history.
  const fetchProposals = useCallback(async () => {
    if (!customerId) {
      setProposals([]);
      setSelectedProposalId("");
      setSelectedProposal(null);
      setSelectedCategory("");
      setLoadingProposals(false);
      setError("Customer ID is required to create a workflow.");
      return;
    }

    setLoadingProposals(true);
    setError("");

    try {
      const response = await listProposalNewService(customerId);
      const data = getResponseData(response);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.proposals)
          ? data.proposals
          : [];

      setProposals(list);
    } catch (err) {
      console.error("Failed to load proposal history:", err);

      setProposals([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load proposal history."
      );
    } finally {
      setLoadingProposals(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Load full proposal details whenever a proposal is selected.
  const handleProposalChange = async (proposalId) => {
    setSelectedProposalId(proposalId);
    setSelectedProposal(null);
    setSelectedCategory("");
    setError("");

    if (!proposalId) return;

    setLoadingProposalDetails(true);

    try {
      const response = await getProposalNewByIdService(proposalId);
      const data = getResponseData(response);

      const proposal = data?.proposal || data;

      if (!proposal || !Array.isArray(proposal.items)) {
        throw new Error(
          "The selected proposal does not contain valid proposal items."
        );
      }

      setSelectedProposal(proposal);
    } catch (err) {
      console.error("Failed to load proposal details:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load the selected proposal."
      );

      toast.error("Could not load proposal details.");
    } finally {
      setLoadingProposalDetails(false);
    }
  };

  // Get unique categories/services from the selected proposal.
  const categories = useMemo(() => {
    const items = getProposalItems(selectedProposal);
    const uniqueCategories = new Map();

    items.forEach((item) => {
      if (!item?.category) return;

      if (!uniqueCategories.has(item.category)) {
        uniqueCategories.set(item.category, {
          value: item.category,
          label:
            item.categoryLabel ||
            item.label ||
            item.category,
        });
      }
    });

    return Array.from(uniqueCategories.values());
  }, [selectedProposal]);

  // Calculate the end date from the selected duration.
  const computedEndDate = useMemo(() => {
    if (!startDate) return "";

    if (duration === "custom") {
      return customEndDate;
    }

    const selectedDuration = DURATION_OPTIONS.find(
      (option) => option.value === duration
    );

    if (!selectedDuration?.months) return "";

    return addMonthsToDate(startDate, selectedDuration.months);
  }, [startDate, duration, customEndDate]);

  const handleStartDateChange = (value) => {
    setStartDate(value);

    // Avoid retaining an invalid custom end date after the start changes.
    if (customEndDate && value && customEndDate < value) {
      setCustomEndDate("");
    }
  };

  const handleDurationChange = (value) => {
    setDuration(value);
    setCustomEndDate("");
  };

  const resetForm = () => {
    setSelectedProposalId("");
    setSelectedProposal(null);
    setSelectedCategory("");
    setStartDate(getToday());
    setDuration("3m");
    setCustomEndDate("");
    setDescription("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerId) {
      toast.error("Customer ID is missing.");
      return;
    }

    if (!selectedProposalId || !selectedProposal) {
      toast.error("Please select a proposal.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a service/category.");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    if (!computedEndDate) {
      toast.error("Please select an end date.");
      return;
    }

    if (computedEndDate < startDate) {
      toast.error("End date cannot be earlier than the start date.");
      return;
    }

    if (typeof onSave !== "function") {
      toast.error(
        "Workflow save API is not connected yet. Please connect onSave."
      );
      return;
    }

    const selectedCategoryDetails = categories.find(
      (category) => category.value === selectedCategory
    );

    const payload = {
      customerId,
      proposalId: getProposalId(selectedProposal),
      proposalNumber: selectedProposal.proposalNumber || "",
      category: selectedCategory,
      categoryLabel:
        selectedCategoryDetails?.label || selectedCategory,
      description: description.trim(),
      startDate,
      duration,
      endDate: computedEndDate,
    };

    setSaving(true);

    try {
      await onSave(payload);

      toast.success("Workflow created successfully.");
      resetForm();
    } catch (err) {
      console.error("Failed to save workflow:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create workflow."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50";

  const labelClassName =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <Workflow className="h-4 w-4 text-gray-700" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Create Workflow
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Create a workflow from an existing customer proposal.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-5">
        {/* Proposal selection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Proposal Details
            </h3>
          </div>

          <div>
            <label htmlFor="workflow-proposal" className={labelClassName}>
              Select Proposal <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                id="workflow-proposal"
                value={selectedProposalId}
                onChange={(event) =>
                  handleProposalChange(event.target.value)
                }
                disabled={loadingProposals || saving}
                className={`${inputClassName} appearance-none pr-9`}
                required
              >
                <option value="">
                  {loadingProposals
                    ? "Loading proposal history..."
                    : "Choose a proposal"}
                </option>

                {proposals.map((proposal) => {
                  const id = getProposalId(proposal);

                  if (!id) return null;

                  return (
                    <option key={id} value={id}>
                      {getProposalLabel(proposal)}
                    </option>
                  );
                })}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            {!loadingProposals && proposals.length === 0 && !error && (
              <p className="mt-1.5 text-xs text-gray-500">
                No proposals were found for this customer.
              </p>
            )}
          </div>

          {loadingProposalDetails && (
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading proposal details...
            </div>
          )}

          {/* Selected proposal summary */}
          {selectedProposal && !loadingProposalDetails && (
            <div className="rounded-lg border border-emerald-400 bg-emerald-50 p-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-emerald-900">
                    {selectedProposal.proposalNumber ||
                      "Selected proposal"}
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-800">
                    {categories.length}{" "}
                    {categories.length === 1 ? "service" : "services"}{" "}
                    available in this proposal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Category selection */}
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Workflow Category
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Select the service included in the chosen proposal.
            </p>
          </div>

          <div>
            <label htmlFor="workflow-category" className={labelClassName}>
              Service / Category <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                id="workflow-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                disabled={
                  !selectedProposal ||
                  loadingProposalDetails ||
                  saving ||
                  categories.length === 0
                }
                className={`${inputClassName} appearance-none pr-9`}
                required
              >
                <option value="">
                  {!selectedProposal
                    ? "Select a proposal first"
                    : categories.length === 0
                      ? "No services found in this proposal"
                      : "Choose a service"}
                </option>

                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {selectedCategory && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">
                {categories.find(
                  (category) => category.value === selectedCategory
                )?.label || selectedCategory}
              </span>
            </div>
          )}
        </section>

        {/* Description */}
        <section className="space-y-1.5">
          <label
            htmlFor="workflow-description"
            className="block text-sm font-semibold text-gray-800"
          >
            Description
            <span className="ml-1 font-normal text-gray-400">
              (Optional)
            </span>
          </label>

          <textarea
            id="workflow-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the work, deliverables, goals, or special instructions..."
            rows={4}
            disabled={saving}
            className={`${inputClassName} resize-y`}
          />

          <p className="text-xs text-gray-500">
            Add the details your team needs to complete this workflow.
          </p>
        </section>

        {/* Dates and duration */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Start date */}
            <div>
              <label
                htmlFor="workflow-start-date"
                className={labelClassName}
              >
                Start Date <span className="text-red-500">*</span>
              </label>

              <input
                id="workflow-start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  handleStartDateChange(event.target.value)
                }
                disabled={saving}
                className={inputClassName}
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="workflow-duration"
                className={labelClassName}
              >
                Duration <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="workflow-duration"
                  value={duration}
                  onChange={(event) =>
                    handleDurationChange(event.target.value)
                  }
                  disabled={saving}
                  className={`${inputClassName} appearance-none pr-9`}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Custom end date */}
            {duration === "custom" && (
              <div className="sm:col-span-2">
                <label
                  htmlFor="workflow-custom-end-date"
                  className={labelClassName}
                >
                  Custom End Date{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="workflow-custom-end-date"
                  type="date"
                  value={customEndDate}
                  min={startDate || undefined}
                  onChange={(event) =>
                    setCustomEndDate(event.target.value)
                  }
                  disabled={saving}
                  className={inputClassName}
                  required
                />
              </div>
            )}

            {/* Calculated end date */}
            <div className={duration === "custom" ? "sm:col-span-2" : ""}>
              <label
                htmlFor="workflow-end-date"
                className={labelClassName}
              >
                End Date
              </label>

              <input
                id="workflow-end-date"
                type="text"
                value={formatDate(computedEndDate)}
                readOnly
                className={`${inputClassName} bg-gray-50 font-medium text-gray-700`}
              />

              <p className="mt-1.5 text-xs text-gray-500">
                {duration === "custom"
                  ? "Select the end date manually above."
                  : "Automatically calculated from the start date and duration."}
              </p>
            </div>
          </div>
        </section>

        {/* Timeline summary */}
        {startDate && computedEndDate && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">
              WORKFLOW TIMELINE
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 font-medium text-gray-800">
                {formatDate(startDate)}
              </span>

              <span className="text-gray-400">→</span>

              <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 font-medium text-gray-800">
                {formatDate(computedEndDate)}
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loadingProposals ||
              loadingProposalDetails ||
              !selectedProposal ||
              !selectedCategory ||
              !startDate ||
              !computedEndDate ||
              computedEndDate < startDate
            }
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Workflow
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
