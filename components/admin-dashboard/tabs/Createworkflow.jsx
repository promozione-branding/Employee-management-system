
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, FileText, Layers, Save } from "lucide-react";

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

// Add calendar months without overflowing into the following month.
// Example: October 31 + 3 months = January 31, where possible.
const addMonths = (dateString, months) => {
  if (!dateString || months == null) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return "";

  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;

  const lastDay = new Date(
    targetYear,
    targetMonth + 1,
    0
  ).getDate();

  const targetDay = Math.min(day, lastDay);

  return [
    targetYear,
    String(targetMonth + 1).padStart(2, "0"),
    String(targetDay).padStart(2, "0"),
  ].join("-");
};

const formatDate = (value) => {
  if (!value) return "—";

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 " +
  "text-sm text-gray-800 outline-none transition " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function Createworkflow({ customerId, onSave }) {
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState(getToday);
  const [duration, setDuration] = useState("3m");
  const [customEndDate, setCustomEndDate] = useState("");

  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load this customer's proposal history.
  useEffect(() => {
    let active = true;

    const fetchProposals = async () => {
      if (!customerId) {
        setProposals([]);
        setSelectedProposalId("");
        setSelectedProposal(null);
        return;
      }

      try {
        setLoadingProposals(true);

        const res = await listProposalNewService(customerId);

        if (!active) return;

        if (res?.success) {
          setProposals(Array.isArray(res.data) ? res.data : []);
        } else {
          setProposals([]);
          toast.error(res?.message || "Failed to load proposals");
        }
      } catch (error) {
        if (active) {
          setProposals([]);
          toast.error(
            error?.response?.data?.message || "Failed to load proposals"
          );
        }
      } finally {
        if (active) setLoadingProposals(false);
      }
    };

    fetchProposals();

    return () => {
      active = false;
    };
  }, [customerId]);

  // Load the complete proposal when the user selects one.
  useEffect(() => {
    let active = true;

    const fetchSelectedProposal = async () => {
      setSelectedProposal(null);
      setSelectedCategory("");

      if (!selectedProposalId) return;

      try {
        setLoadingProposal(true);

        const res = await getProposalNewByIdService(selectedProposalId);

        if (!active) return;

        if (res?.success && res.data) {
          setSelectedProposal(res.data);
        } else {
          toast.error(res?.message || "Failed to load selected proposal");
        }
      } catch (error) {
        if (active) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to load selected proposal"
          );
        }
      } finally {
        if (active) setLoadingProposal(false);
      }
    };

    fetchSelectedProposal();

    return () => {
      active = false;
    };
  }, [selectedProposalId]);

  // Only show categories that exist in the selected proposal's items.
  const categories = useMemo(() => {
    const items = selectedProposal?.items || [];
    const unique = new Map();

    for (const item of items) {
      if (!item?.category) continue;

      if (!unique.has(item.category)) {
        unique.set(item.category, {
          value: item.category,
          label: item.categoryLabel || item.category,
        });
      }
    }

    return Array.from(unique.values());
  }, [selectedProposal]);

  // Keep the category valid if proposal data changes.
  useEffect(() => {
    if (
      selectedCategory &&
      !categories.some((category) => category.value === selectedCategory)
    ) {
      setSelectedCategory("");
    }
  }, [categories, selectedCategory]);

  const computedEndDate = useMemo(() => {
    const selectedDuration = DURATION_OPTIONS.find(
      (option) => option.value === duration
    );

    if (!selectedDuration || selectedDuration.months == null) {
      return customEndDate;
    }

    return addMonths(startDate, selectedDuration.months);
  }, [startDate, duration, customEndDate]);

  const handleProposalChange = (event) => {
    setSelectedProposalId(event.target.value);
    setDuration("3m");
    setCustomEndDate("");
  };

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
    setCustomEndDate("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerId) {
      return toast.error("Customer ID is required");
    }

    if (!selectedProposalId || !selectedProposal) {
      return toast.error("Please select a proposal");
    }

    if (!selectedCategory) {
      return toast.error("Please select a service/category");
    }

    if (!startDate || !computedEndDate) {
      return toast.error("Please provide valid start and end dates");
    }

    if (computedEndDate < startDate) {
      return toast.error("End date cannot be before the start date");
    }

    if (typeof onSave !== "function") {
      return toast.error(
        "Workflow save API is not connected yet. Connect the onSave handler."
      );
    }

    const category = categories.find(
      (item) => item.value === selectedCategory
    );

    const payload = {
      customerId,
      proposalId: selectedProposal._id,
      proposalNumber: selectedProposal.proposalNumber,
      category: selectedCategory,
      categoryLabel: category?.label || selectedCategory,
      startDate,
      duration,
      endDate: computedEndDate,
    };

    try {
      setSaving(true);

      await onSave(payload);

      toast.success("Workflow saved successfully");

      setSelectedProposalId("");
      setSelectedProposal(null);
      setSelectedCategory("");
      setStartDate(getToday());
      setDuration("3m");
      setCustomEndDate("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save workflow"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Create Workflow
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a proposal, choose a service, and set its timeline.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-6 p-5 sm:p-7">
          {/* Proposal */}
          <div>
            <label
              htmlFor="workflow-proposal"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              Select Proposal
            </label>

            <select
              id="workflow-proposal"
              value={selectedProposalId}
              onChange={handleProposalChange}
              className={fieldClass}
              disabled={loadingProposals || !customerId}
              required
            >
              <option value="">
                {loadingProposals
                  ? "Loading proposals..."
                  : "Choose a proposal"}
              </option>

              {proposals.map((proposal) => (
                <option key={proposal._id} value={proposal._id}>
                  {proposal.proposalNumber || "Untitled proposal"}
                  {" — "}
                  {proposal.status || "draft"}
                </option>
              ))}
            </select>

            {!loadingProposals && proposals.length === 0 && customerId && (
              <p className="mt-2 text-xs text-amber-600">
                No proposals found for this customer.
              </p>
            )}
          </div>

          {/* Selected proposal details */}
          {selectedProposal && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    Selected proposal
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedProposal.proposalNumber || "Proposal"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-gray-600">
                  {selectedProposal.status || "draft"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                {selectedProposal.items?.length || 0} proposal item(s)
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label
              htmlFor="workflow-category"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <Layers className="h-4 w-4 text-indigo-600" />
              Heading / Service
            </label>

            <select
              id="workflow-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className={fieldClass}
              disabled={!selectedProposal || loadingProposal}
              required
            >
              <option value="">
                {loadingProposal
                  ? "Loading proposal items..."
                  : "Choose a service"}
              </option>

              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {selectedProposal && !loadingProposal && categories.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                This proposal has no categorized items.
              </p>
            )}

            {selectedCategory && (
              <p className="mt-2 text-xs text-gray-500">
                The workflow will be associated with the selected proposal
                category.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Start date */}
            <div>
              <label
                htmlFor="workflow-start-date"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Start Date
              </label>

              <input
                id="workflow-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={fieldClass}
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="workflow-duration"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Duration
              </label>

              <select
                id="workflow-duration"
                value={duration}
                onChange={handleDurationChange}
                className={fieldClass}
                required
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* End date */}
            <div className="sm:col-span-2">
              <label
                htmlFor="workflow-end-date"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                End Date
              </label>

              {duration === "custom" ? (
                <input
                  id="workflow-end-date"
                  type="date"
                  value={customEndDate}
                  min={startDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className={fieldClass}
                  required
                />
              ) : (
                <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(computedEndDate)}
                  </span>

                  <span className="text-xs text-gray-500">
                    Automatically calculated
                  </span>
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                {duration === "custom"
                  ? "Choose the end date manually."
                  : "The end date updates when you change the start date or duration."}
              </p>
            </div>
          </div>

          {/* Timeline summary */}
          {startDate && computedEndDate && (
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Workflow timeline
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Starts</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(startDate)}
                  </p>
                </div>

                <div className="h-px min-w-8 flex-1 bg-gray-300" />

                <div className="text-right">
                  <p className="text-xs text-gray-500">Ends</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(computedEndDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-5">
          <button
            type="submit"
            disabled={saving || loadingProposal || loadingProposals}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </form>
    </div>
  );
}
