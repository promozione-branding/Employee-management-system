// app/dashboard/customer/Customer.jsx

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "@/components/layout/Loading";

import {
  createCustomerProjectCycleService,
  deleteCustomerProjectCycleService,
  getCustomerProjectCycleService,
  getCustomerServices,
  updateCustomerProjectPatchService,
} from "@/service/customer";

import {
  listProposalNewService,
  getProposalNewByIdService,
} from "@/service/proposalNew";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";
import toast from "react-hot-toast";

const INITIAL_PROJECT_FORM = {
  projectName: "",
  proposalId: "",
  proposalNumber: "",
  category: "",
  categoryLabel: "",
  service: "",
  serviceName: "",
  serviceType: "",
  startDate: "",
  endDate: "",
};

const TENURE_OPTIONS = [
  { value: "3m", label: "3 Months", months: 3 },
  { value: "6m", label: "6 Months", months: 6 },
  { value: "12m", label: "12 Months", months: 12 },
  { value: "custom", label: "Custom", months: null },
];

const inputClassName =
  "w-full rounded-lg border border-[#DCE3EE] bg-white px-3 py-2.5 text-sm text-[#24334D] outline-none transition placeholder:text-[#9AA4B5] hover:border-[#B8C6DA] focus:border-[#4779C5] focus:ring-2 focus:ring-[#4779C5]/10";

const smallInputClassName =
  "w-full rounded-md border border-[#DCE3EE] bg-white px-2 py-1.5 text-xs text-[#24334D] outline-none focus:border-[#4779C5]";

const labelClassName = "mb-1.5 block text-xs font-semibold text-[#465570]";

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const addMonthsToDate = (dateString, months) => {
  if (!dateString || !months) return "";
  const [y, m, d] = dateString.split("-").map(Number);
  const tIndex = m - 1 + months;
  const tYear = y + Math.floor(tIndex / 12);
  const tMonth = tIndex % 12;
  const lastDay = new Date(tYear, tMonth + 1, 0).getDate();
  const tDay = Math.min(d, lastDay);
  const r = new Date(tYear, tMonth, tDay);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(
    r.getDate(),
  ).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const getWebsiteUrl = (website) => {
  if (!website) return null;
  const t = website.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const getProposalId = (p) => p?._id || p?.id || "";
const getProposalNumber = (p) =>
  p?.proposalNumber || p?.quotationNumber || p?._id || p?.id || "";

const getResponseData = (res) => {
  if (res?.success === false) throw new Error(res.message || "Request failed.");
  return res?.data;
};

function InfoItem({ icon: Icon, label, value, href }) {
  const hasValue = value !== undefined && value !== null && value !== "";
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5FB] text-[#4779C5]">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#929DB0]">
          {label}
        </p>
        {href && hasValue ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={String(value)}
            className="mt-0.5 flex min-w-0 items-center gap-1 break-all text-sm font-medium text-[#315F9F] hover:underline"
          >
            <span className="truncate">{value}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p
            title={hasValue ? String(value) : undefined}
            className="mt-0.5 break-words text-sm font-medium text-[#263650]"
          >
            {hasValue ? value : "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#E9EDF4] px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF3FC] text-[#315F9F]">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#18365F] sm:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-[#8792A5]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function ProposalViewModal({ open, proposal, loading, onClose }) {
  if (!open) return null;
  const items = Array.isArray(proposal?.items) ? proposal.items : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E9EDF4] px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#18365F]">
              Proposal {getProposalNumber(proposal) || ""}
            </h3>
            <p className="mt-0.5 text-xs text-[#8792A5]">
              {items.length} service item(s)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] hover:bg-[#F2F4F9]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-[#718097]">
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Loading proposal...
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8792A5]">
              No items found on this proposal.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const label =
                  item.categoryLabel || item.label || item.category || "—";
                return (
                  <div
                    key={item._id || idx}
                    className="rounded-lg border border-[#E3E8F0] bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#263B5B]">
                        {label}
                      </p>
                      {item.category && (
                        <span className="rounded-md bg-[#F0F4FA] px-2 py-1 text-[11px] font-semibold text-[#4E607B]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {(item.startDate || item.endDate || item.duration) && (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[#60708A]">
                        <div>
                          <span className="text-[#929DB0]">Start: </span>
                          {item.startDate ? formatDate(item.startDate) : "—"}
                        </div>
                        <div>
                          <span className="text-[#929DB0]">End: </span>
                          {item.endDate ? formatDate(item.endDate) : "—"}
                        </div>
                        <div>
                          <span className="text-[#929DB0]">Duration: </span>
                          {item.duration || "—"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectLiveCard({
  item,
  projectCycleId,
  onSaved,
  onEdit,
  onDelete,
  isDeleting,
  onViewProposal,
}) {
  const isLive = item?.status === "live";
  const hasProposal = Boolean(item?.proposalId);

  const [startDate, setStartDate] = useState(
    toInputDate(item?.activatedAt) || getToday(),
  );
  const [tenure, setTenure] = useState(item?.renewalDuration || "3m");
  const [customEnd, setCustomEnd] = useState(
    toInputDate(item?.renewalEndDate) || "",
  );
  const [saving, setSaving] = useState(false);

  const computedEnd = useMemo(() => {
    if (!startDate) return "";
    if (tenure === "custom") return customEnd;
    const opt = TENURE_OPTIONS.find((o) => o.value === tenure);
    if (!opt?.months) return "";
    return addMonthsToDate(startDate, opt.months);
  }, [startDate, tenure, customEnd]);

  const persist = async (nextStatus) => {
    if (!startDate) {
      toast.error("Please pick a renewal start date");
      return;
    }
    if (!computedEnd) {
      toast.error("Please pick a renewal end date");
      return;
    }
    if (computedEnd < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (nextStatus === "live") {
      const ok = window.confirm(
        "Start client renewal reminders for this project?",
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const payload = {
        projectCycleId,
        durationId: item._id,
        status: nextStatus,
        activatedAt: nextStatus === "live" ? startDate : item?.activatedAt,
        renewalDuration: tenure === "custom" ? "custom" : tenure,
        renewalEndDate: computedEnd,
        resetRenewalMilestones: nextStatus === "live",
      };
      const res = await updateCustomerProjectPatchService(payload);
      if (res?.success) {
        toast.success(
          nextStatus === "live"
            ? "Project is live — renewal clock started"
            : "Project set back to In Build",
        );
        onSaved?.();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not save project status",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-xl border border-[#E3E8F0] bg-white p-3.5 transition hover:border-[#C8D6EA] hover:shadow-sm sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3FC] text-[#4779C5]">
          <FileText size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-bold text-[#263B5B]">
            {item?.projectName || "Untitled Project"}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-[#F0F4FA] px-2 py-1 text-[11px] font-semibold capitalize text-[#4E607B]">
              {item?.categoryLabel || item?.service || "Service"}
            </span>
            {item?.proposalNumber && (
              <span className="rounded-md bg-[#EEF7EE] px-2 py-1 text-[11px] font-semibold text-[#2F7A44]">
                {item.proposalNumber}
              </span>
            )}
            {isLive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-bold text-[#27834E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#27834E]" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F9] px-2 py-1 text-[10px] font-bold text-[#718097]">
                IN BUILD
              </span>
            )}
          </div>
        </div>

        {/* Proposal view icon — only if mapped */}
        {hasProposal && (
          <button
            type="button"
            onClick={() => onViewProposal(item.proposalId)}
            title="View proposal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D8E5F8] bg-[#F1F6FF] text-[#3569B4] hover:bg-[#E1ECFF]"
          >
            <Eye size={14} />
          </button>
        )}
      </div>

      {/* Two timelines */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#E6ECF5] bg-[#F7F9FC] p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190A6]">
            Build Window
          </p>
          <div className="mt-1.5 space-y-1 text-xs text-[#34445F]">
            <div className="flex justify-between gap-2">
              <span className="text-[#929DB0]">Start</span>
              <span className="font-semibold">
                {formatDate(item?.startDate)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#929DB0]">End</span>
              <span className="font-semibold">{formatDate(item?.endDate)}</span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-2.5 ${
            isLive
              ? "border-[#CBEBD6] bg-[#F1FBF4]"
              : "border-[#E6ECF5] bg-[#F7F9FC]"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190A6]">
            Renewal Window (mailer)
          </p>
          <div className="mt-1.5 space-y-1 text-xs text-[#34445F]">
            <div className="flex justify-between gap-2">
              <span className="text-[#929DB0]">Start</span>
              <span className="font-semibold">
                {item?.activatedAt
                  ? formatDate(item.activatedAt)
                  : "Not active"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#929DB0]">End</span>
              <span className="font-semibold">
                {item?.renewalEndDate
                  ? formatDate(item.renewalEndDate)
                  : "Not active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live controls */}
      <div className="mt-3 rounded-lg border border-[#EEF1F6] bg-[#FAFBFD] p-2.5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8190A6]">
          Renewal setup
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div>
            <label className="text-[10px] font-semibold text-[#8190A6]">
              Renewal start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${smallInputClassName} mt-1`}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#8190A6]">
              Tenure
            </label>
            <select
              value={tenure}
              onChange={(e) => {
                setTenure(e.target.value);
                if (e.target.value !== "custom") setCustomEnd("");
              }}
              className={`${smallInputClassName} mt-1`}
            >
              {TENURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#8190A6]">
              Renewal end
            </label>
            {tenure === "custom" ? (
              <input
                type="date"
                value={customEnd}
                min={startDate || undefined}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={`${smallInputClassName} mt-1`}
              />
            ) : (
              <input
                type="text"
                readOnly
                value={computedEnd ? formatDate(computedEnd) : "—"}
                className={`${smallInputClassName} mt-1 bg-gray-50 font-medium text-[#34445F]`}
              />
            )}
          </div>
        </div>

        {tenure !== "custom" && computedEnd && (
          <p className="mt-2 text-[10px] text-[#8792A5]">
            Auto-calculated from renewal start + tenure. Edit the start date to
            recalculate.
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F6] pt-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#34445F]">
            <input
              type="checkbox"
              checked={isLive}
              disabled={saving}
              onChange={(e) => persist(e.target.checked ? "live" : "in_build")}
              className="h-4 w-4 accent-[#27834E]"
            />
            Project is Live
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => persist("live")}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 ${
                isLive
                  ? "bg-[#27834E] hover:bg-[#1F6B3E]"
                  : "bg-[#183F75] hover:bg-[#12315C]"
              }`}
            >
              {saving ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              {isLive ? "Save renewal" : "Save & Go Live"}
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F8] bg-[#F1F6FF] text-[#3569B4] hover:bg-[#E1ECFF]"
              aria-label="Edit"
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item?._id)}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5DAD8] bg-[#FFF3F2] text-[#D45149] hover:bg-[#FFE5E3] disabled:opacity-50"
              aria-label="Delete"
            >
              {isDeleting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

const Customer = ({ customerId }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [projectCycleData, setProjectCycleData] = useState(null);

  const [loadingProjectCycle, setLoadingProjectCycle] = useState(true);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [projectFormData, setProjectFormData] = useState(INITIAL_PROJECT_FORM);

  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingProposalDetails, setLoadingProposalDetails] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [proposalModal, setProposalModal] = useState({
    open: false,
    proposal: null,
    loading: false,
  });

  const projectDurations = projectCycleData?.projectCycle?.projectDuration || [];
  const projectCycleId = projectCycleData?.projectCycle?._id;

  const fetchCustomerProjectCycle = useCallback(async () => {
    setLoadingProjectCycle(true);
    try {
      const response = await getCustomerProjectCycleService(customerId);
      if (response?.success) setProjectCycleData(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load project history",
      );
    } finally {
      setLoadingProjectCycle(false);
    }
  }, [customerId]);

  const fetchCurrentCustomer = useCallback(async () => {
    try {
      const response = await getCustomerServices(customerId);
      if (response?.success) setCustomerDetails(response.data);
      else toast.error("Unable to load customer details");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load customer details",
      );
    }
  }, [customerId]);

  const fetchProposals = useCallback(async () => {
    if (!customerId) return;
    setLoadingProposals(true);
    try {
      const response = await listProposalNewService(customerId);
      const data = getResponseData(response);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.proposals)
          ? data.proposals
          : [];
      setProposals(list);
    } catch (error) {
      setProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    fetchCurrentCustomer();
    fetchCustomerProjectCycle();
    fetchProposals();
  }, [
    customerId,
    fetchCurrentCustomer,
    fetchCustomerProjectCycle,
    fetchProposals,
  ]);

  const updateProjectField = (field, value) => {
    setProjectFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetProjectForm = () => {
    setProjectFormData(INITIAL_PROJECT_FORM);
    setCurrentEditedId(null);
    setSelectedProposal(null);
  };

  const handleProposalChange = async (proposalId) => {
    updateProjectField("proposalId", proposalId);
    updateProjectField("category", "");
    updateProjectField("categoryLabel", "");
    updateProjectField("proposalNumber", "");
    setSelectedProposal(null);

    if (!proposalId) return;
    setLoadingProposalDetails(true);
    try {
      const response = await getProposalNewByIdService(proposalId);
      const data = getResponseData(response);
      const proposal = data?.proposal || data;
      if (!proposal || !Array.isArray(proposal.items)) {
        throw new Error("Selected proposal has no items.");
      }
      setSelectedProposal(proposal);
      updateProjectField(
        "proposalNumber",
        proposal.proposalNumber || proposal.quotationNumber || "",
      );
    } catch (err) {
      toast.error("Could not load proposal details.");
    } finally {
      setLoadingProposalDetails(false);
    }
  };

  const categories = useMemo(() => {
    const items = Array.isArray(selectedProposal?.items)
      ? selectedProposal.items
      : [];
    const map = new Map();
    items.forEach((item) => {
      if (!item?.category) return;
      if (!map.has(item.category)) {
        map.set(item.category, {
          value: item.category,
          label: item.categoryLabel || item.label || item.category,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedProposal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const serviceValue =
        projectFormData.service === "other"
          ? projectFormData.serviceName.trim()
          : projectFormData.category || projectFormData.service;

      if (!serviceValue) {
        toast.error("Please select a proposal & service");
        return;
      }
      if (
        projectFormData.startDate &&
        projectFormData.endDate &&
        projectFormData.endDate < projectFormData.startDate
      ) {
        toast.error("End date cannot be before start date");
        return;
      }

      if (currentEditedId) {
        const payload = {
          projectCycleId,
          durationId: currentEditedId,
          projectName: projectFormData.projectName,
          service: serviceValue,
          serviceType: projectFormData.serviceType,
          startDate: projectFormData.startDate,
          endDate: projectFormData.endDate,
          proposalId: projectFormData.proposalId || undefined,
          proposalNumber: projectFormData.proposalNumber || "",
          category: projectFormData.category || "",
          categoryLabel: projectFormData.categoryLabel || "",
        };
        const res = await updateCustomerProjectPatchService(payload);
        if (res?.success) {
          toast.success("Project updated successfully");
          resetProjectForm();
          await fetchCustomerProjectCycle();
        }
      } else {
        const formData = {
          projectName: projectFormData.projectName.trim(),
          clientId: customerId,
          service: serviceValue,
          serviceType: projectFormData.serviceType,
          "start-date": projectFormData.startDate,
          "end-date": projectFormData.endDate,
          proposalId: projectFormData.proposalId || undefined,
          proposalNumber: projectFormData.proposalNumber || "",
          category: projectFormData.category || "",
          categoryLabel: projectFormData.categoryLabel || "",
        };
        const res = await createCustomerProjectCycleService(formData);
        if (res?.success) {
          toast.success("Project added successfully");
          resetProjectForm();
          await fetchCustomerProjectCycle();
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error while processing project",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditChange = (data) => {
    setProjectFormData({
      projectName: data?.projectName || "",
      proposalId: data?.proposalId || "",
      proposalNumber: data?.proposalNumber || "",
      category: data?.category || "",
      categoryLabel: data?.categoryLabel || "",
      service: data?.service || "",
      serviceName: data?.service || "",
      serviceType: data?.serviceType || "",
      startDate: toInputDate(data?.startDate),
      endDate: toInputDate(data?.endDate),
    });
    setCurrentEditedId(data._id);
    if (data?.proposalId) {
      (async () => {
        try {
          setLoadingProposalDetails(true);
          const response = await getProposalNewByIdService(data.proposalId);
          const dd = getResponseData(response);
          const p = dd?.proposal || dd;
          if (p?.items) setSelectedProposal(p);
        } catch {
          /* ignore */
        } finally {
          setLoadingProposalDetails(false);
        }
      })();
    } else {
      setSelectedProposal(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      setDeletingId(id);
      const res = await deleteCustomerProjectCycleService(id);
      if (res?.success) {
        toast.success("Project deleted successfully");
        await fetchCustomerProjectCycle();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error while deleting project",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openProposalView = async (proposalId) => {
    if (!proposalId) return; // safety; button hidden anyway
    setProposalModal({ open: true, proposal: null, loading: true });
    try {
      const response = await getProposalNewByIdService(proposalId);
      const data = getResponseData(response);
      setProposalModal({
        open: true,
        proposal: data?.proposal || data,
        loading: false,
      });
    } catch {
      toast.error("Could not load proposal");
      setProposalModal({ open: false, proposal: null, loading: false });
    }
  };

  if (!customerDetails) return <Loading />;

  const {
    name,
    company,
    GSTIN,
    phone,
    website,
    Address,
    city,
    state,
    pincode,
    country,
    meetingDate,
    tanNo,
    email,
    SalesPersonName,
    salesExecutive,
  } = customerDetails;

  const salesPerson =
    SalesPersonName || salesExecutive?.[0]?.basicDetails?.name;
  const address = [Address, city, state, pincode, country]
    .filter(Boolean)
    .join(", ");
  const isEditing = Boolean(currentEditedId);

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18365F] sm:text-lg">
            Customer Overview
          </h2>
          <p className="mt-1 text-xs text-[#8792A5] sm:text-sm">
            Customer information, project setup, and service history.
          </p>
        </div>
        <Link
          href={`/dashboard/employee/seo-sheet/${customerId}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#F27B1E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#DE6810] sm:text-sm"
        >
          <FileText size={15} />
          Keywords
        </Link>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(250px,0.88fr)_minmax(290px,1fr)_minmax(300px,1.05fr)]">
        {/* Customer info */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E9EDF4] bg-gradient-to-r from-[#F5F8FD] to-white px-4 py-5 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5EEFC] text-[#315F9F]">
                <Building2 size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-bold leading-snug text-[#18365F]">
                  {name || "Unnamed Customer"}
                </h3>
                <p className="mt-1 break-words text-sm text-[#7B879A]">
                  {company || "Company not provided"}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-semibold text-[#27834E]">
                  <CheckCircle2 size={11} />
                  Customer Profile
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <InfoItem
              icon={Mail}
              label="Email Address"
              value={email}
              href={email ? `mailto:${email}` : undefined}
            />
            <InfoItem
              icon={Phone}
              label="Phone Number"
              value={phone}
              href={phone ? `tel:${phone}` : undefined}
            />
            <InfoItem
              icon={Globe}
              label="Website"
              value={website}
              href={getWebsiteUrl(website)}
            />
            <div className="border-t border-dashed border-[#E1E7F0]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-lg bg-[#F7F9FC] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929DB0]">
                  GSTIN
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[#34445F]">
                  {GSTIN || "Not provided"}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7F9FC] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929DB0]">
                  TAN Number
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[#34445F]">
                  {tanNo || "Not provided"}
                </p>
              </div>
            </div>
            <div className="border-t border-dashed border-[#E1E7F0]" />
            <InfoItem
              icon={MapPin}
              label="Business Address"
              value={address || null}
            />
            <div className="rounded-xl border border-[#E8EDF5] bg-[#F8FAFD] p-3.5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8190A6]">
                Account Information
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <UserRound
                    size={15}
                    className="mt-0.5 shrink-0 text-[#7C8DA7]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#8A96A9]">Sales Person</p>
                    <p className="mt-0.5 break-words text-sm font-semibold text-[#34445F]">
                      {salesPerson || "Not assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays
                    size={15}
                    className="mt-0.5 shrink-0 text-[#7C8DA7]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#8A96A9]">Meeting Date</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#34445F]">
                      {formatDate(meetingDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add / Edit project */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
          <SectionHeader
            icon={isEditing ? Pencil : Plus}
            title={isEditing ? "Edit Project" : "Add Project"}
            subtitle={
              isEditing
                ? "Update the selected project details."
                : "Map a proposal and set the build timeline."
            }
            action={
              isEditing ? (
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9]"
                  aria-label="Cancel editing"
                >
                  <X size={16} />
                </button>
              ) : null
            }
          />

          <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
            <div>
              <label htmlFor="projectName" className={labelClassName}>
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectFormData.projectName}
                onChange={(e) =>
                  updateProjectField("projectName", e.target.value)
                }
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
                value={projectFormData.proposalId}
                onChange={(e) => handleProposalChange(e.target.value)}
                disabled={loadingProposals || submitting}
                className={inputClassName}
              >
                <option value="">
                  {loadingProposals
                    ? "Loading proposals..."
                    : "Select a proposal"}
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
              </select>
            </div>

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
                onChange={(e) => {
                  const v = e.target.value;
                  updateProjectField("category", v);
                  const found = categories.find((c) => c.value === v);
                  updateProjectField("categoryLabel", found?.label || v);
                  updateProjectField("service", v);
                }}
                disabled={!selectedProposal || categories.length === 0}
                className={inputClassName}
              >
                <option value="">
                  {!selectedProposal
                    ? "Select a proposal first"
                    : "Choose a service"}
                </option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {projectFormData.service === "web-dev" && (
              <div>
                <label htmlFor="serviceType" className={labelClassName}>
                  Service Type
                </label>
                <select
                  id="serviceType"
                  value={projectFormData.serviceType}
                  onChange={(e) =>
                    updateProjectField("serviceType", e.target.value)
                  }
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className={labelClassName}>
                    Service Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={projectFormData.startDate}
                    onChange={(e) =>
                      updateProjectField("startDate", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateProjectField("endDate", e.target.value)
                    }
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
                onClick={resetProjectForm}
                disabled={submitting}
                className="w-full rounded-lg border border-[#DCE3EE] px-4 py-2.5 text-sm font-semibold text-[#63718A] transition hover:bg-[#F5F7FB] disabled:opacity-60"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </section>

        {/* History */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
          <SectionHeader
            icon={Clock3}
            title="Project & Service History"
            subtitle="Two timelines: build window and renewal (mailer) window."
            action={
              <button
                type="button"
                onClick={fetchCustomerProjectCycle}
                disabled={loadingProjectCycle}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9] disabled:opacity-50"
                aria-label="Refresh project history"
              >
                <RefreshCw
                  size={15}
                  className={loadingProjectCycle ? "animate-spin" : ""}
                />
              </button>
            }
          />

          <div className="flex items-center justify-between gap-2 border-b border-[#EEF1F6] bg-[#FAFBFD] px-4 py-3 sm:px-5">
            <span className="text-xs font-medium text-[#78869C]">
              Total projects
            </span>
            <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#E8EFFB] px-2 py-1 text-xs font-bold text-[#315F9F]">
              {projectDurations.length}
            </span>
          </div>

          <div className="max-h-[750px] min-h-[240px] space-y-3 overflow-y-auto p-3 sm:p-4">
            {loadingProjectCycle ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                <RefreshCw size={22} className="animate-spin text-[#4779C5]" />
                <p className="text-sm font-medium text-[#718097]">
                  Loading project history...
                </p>
              </div>
            ) : projectDurations.length > 0 ? (
              projectDurations.map((item) => (
                <ProjectLiveCard
                  key={item?._id}
                  item={item}
                  projectCycleId={projectCycleId}
                  onSaved={fetchCustomerProjectCycle}
                  onEdit={handleEditChange}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item?._id}
                  onViewProposal={openProposalView}
                />
              ))
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5FB] text-[#8293AE]">
                  <FileText size={25} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#34445F]">
                  No project history yet
                </h3>
                <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-[#8B97AA]">
                  Add a project and map it to a proposal to see it here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ProposalViewModal
        open={proposalModal.open}
        proposal={proposalModal.proposal}
        loading={proposalModal.loading}
        onClose={() =>
          setProposalModal({ open: false, proposal: null, loading: false })
        }
      />
    </div>
  );
};

export default Customer;
