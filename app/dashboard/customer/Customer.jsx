
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Loading from "@/components/layout/Loading";
import { projectDurationFormControl } from "@/config/data";

import {
  createCustomerProjectCycleService,
  deleteCustomerProjectCycleService,
  getCustomerProjectCycleService,
  getCustomerServices,
  updateCustomerProjectCycleService,
  updateCustomerProjectPatchService,
} from "@/service/customer";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";
import toast from "react-hot-toast";

const INITIAL_PROJECT_FORM = {
  projectName: "",
  service: "",
  serviceName: "",
  serviceType: "",
  startDate: "",
  endDate: "",
};

const inputClassName =
  "w-full rounded-lg border border-[#DCE3EE] bg-white px-3 py-2.5 text-sm text-[#24334D] outline-none transition placeholder:text-[#9AA4B5] hover:border-[#B8C6DA] focus:border-[#4779C5] focus:ring-2 focus:ring-[#4779C5]/10";

const labelClassName =
  "mb-1.5 block text-xs font-semibold text-[#465570]";

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

const getWebsiteUrl = (website) => {
  if (!website) return null;

  const trimmedWebsite = website.trim();

  if (/^https?:\/\//i.test(trimmedWebsite)) {
    return trimmedWebsite;
  }

  return `https://${trimmedWebsite}`;
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

const Customer = ({ customerId }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [projectCycleData, setProjectCycleData] = useState(null);

  const [loadingProjectCycle, setLoadingProjectCycle] = useState(true);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const [projectFormData, setProjectFormData] = useState(
    INITIAL_PROJECT_FORM
  );

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const projectDurations =
    projectCycleData?.projectCycle?.projectDuration || [];

  const fetchCustomerProjectCycle = useCallback(async () => {
    setLoadingProjectCycle(true);

    try {
      const response = await getCustomerProjectCycleService(customerId);

      if (response?.success) {
        setProjectCycleData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch customer project cycle:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load project history"
      );
    } finally {
      setLoadingProjectCycle(false);
    }
  }, [customerId]);

  const fetchCurrentCustomer = useCallback(async () => {
    try {
      const response = await getCustomerServices(customerId);

      if (response?.success) {
        setCustomerDetails(response.data);
      } else {
        toast.error("Unable to load customer details");
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to load customer details"
      );
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;

    fetchCurrentCustomer();
    fetchCustomerProjectCycle();
  }, [customerId, fetchCurrentCustomer, fetchCustomerProjectCycle]);

  const updateProjectField = (field, value) => {
    setProjectFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetProjectForm = () => {
    setProjectFormData(INITIAL_PROJECT_FORM);
    setCurrentEditedId(null);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const serviceValue =
        projectFormData.service === "other"
          ? projectFormData.serviceName.trim()
          : projectFormData.service;

      if (!serviceValue) {
        toast.error("Please select or enter a service");
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
        const updatedProjectDuration = projectDurations.map((item) =>
          item._id === currentEditedId
            ? {
                ...item,
                service: serviceValue,
                serviceType: projectFormData.serviceType,
                startDate: projectFormData.startDate,
                endDate: projectFormData.endDate,
              }
            : item
        );

        const res = await updateCustomerProjectCycleService(
          projectCycleData?.projectCycle?._id,
          {
            projectDuration: updatedProjectDuration,
          }
        );

        if (res?.success) {
          toast.success("Project details updated successfully");
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
        };

        const res = await createCustomerProjectCycleService(formData);

        if (res?.success) {
          toast.success("Project added successfully");
          resetProjectForm();
          await fetchCustomerProjectCycle();
        }
      }
    } catch (error) {
      console.error("Failed to submit project:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error while processing project"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditChange = (data) => {
    setProjectFormData({
      projectName: data?.projectName || "",
      service: data?.service || "",
      serviceName: data?.service || "",
      serviceType: data?.serviceType || "",
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().split("T")[0]
        : "",
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().split("T")[0]
        : "",
    });

    setCurrentEditedId(data._id);
  };

  const handleProjectUpdate = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const serviceValue =
        projectFormData.service === "other"
          ? projectFormData.serviceName.trim()
          : projectFormData.service;

      if (!serviceValue) {
        toast.error("Please select or enter a service");
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

      const payload = {
        projectCycleId: projectCycleData?.projectCycle?._id,
        durationId: currentEditedId,
        projectName: projectFormData.projectName,
        service: serviceValue,
        serviceType: projectFormData.serviceType,
        startDate: projectFormData.startDate,
        endDate: projectFormData.endDate,
      };

      const res = await updateCustomerProjectPatchService(payload);

      if (res?.success) {
        toast.success("Project updated successfully");
        resetProjectForm();
        await fetchCustomerProjectCycle();
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Update failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(id);

      const res = await deleteCustomerProjectCycleService(id);

      if (res?.success) {
        toast.success("Project deleted successfully");
        await fetchCustomerProjectCycle();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error while deleting project"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!customerDetails) {
    return <Loading />;
  }

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
    SalesPersonName || salesExecutive?.basicDetails?.name;

  const address = [Address, city, state, pincode, country]
    .filter(Boolean)
    .join(", ");

  const isEditing = Boolean(currentEditedId);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Overview heading */}
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
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#F27B1E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#DE6810] focus:outline-none focus:ring-2 focus:ring-[#F27B1E]/30 sm:text-sm"
        >
          <FileText size={15} />
          Keywords
        </Link>
      </div>

      {/* Responsive three-column workspace */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(250px,0.88fr)_minmax(290px,1fr)_minmax(300px,1.05fr)]">
        {/* Customer information */}
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
                    <p className="text-[11px] text-[#8A96A9]">
                      Sales Person
                    </p>
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
                    <p className="text-[11px] text-[#8A96A9]">
                      Meeting Date
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#34445F]">
                      {formatDate(meetingDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add / edit project form */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
          <SectionHeader
            icon={isEditing ? Pencil : Plus}
            title={isEditing ? "Edit Project" : "Add Project"}
            subtitle={
              isEditing
                ? "Update the selected project details."
                : "Create a project and set its service timeline."
            }
            action={
              isEditing ? (
                <button
                  type="button"
                  onClick={resetProjectForm}
                  title="Cancel editing"
                  aria-label="Cancel editing"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9] hover:text-[#263650]"
                >
                  <X size={16} />
                </button>
              ) : null
            }
          />

          <form
            onSubmit={isEditing ? handleProjectUpdate : handleProjectSubmit}
            className="space-y-4 p-4 sm:p-5"
          >
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
              <label htmlFor="projectService" className={labelClassName}>
                Service <span className="text-[#E05B4B]">*</span>
              </label>

              <select
                id="projectService"
                required
                value={projectFormData.service}
                onChange={(e) =>
                  updateProjectField("service", e.target.value)
                }
                className={inputClassName}
              >
                <option value="" disabled>
                  Select a service
                </option>

                {projectDurationFormControl[0]?.options?.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
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

            {projectFormData.service === "other" && (
              <div>
                <label htmlFor="serviceName" className={labelClassName}>
                  Service Name <span className="text-[#E05B4B]">*</span>
                </label>

                <input
                  id="serviceName"
                  type="text"
                  required
                  value={projectFormData.serviceName}
                  onChange={(e) =>
                    updateProjectField("serviceName", e.target.value)
                  }
                  placeholder="Enter custom service name"
                  className={inputClassName}
                />
              </div>
            )}

            <div className="border-t border-dashed border-[#E1E7F0] pt-4">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-[#4779C5]" />
                <h3 className="text-xs font-bold text-[#34445F]">
                  Project Timeline
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className={labelClassName}>
                    Start Date
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
                    End Date
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex min-h-10 w-full items-center justify-center
                gap-2 rounded-lg bg-[#183F75] px-4 py-2.5
                text-sm font-semibold text-white shadow-sm
                transition hover:bg-[#12315C]
                focus:outline-none focus:ring-2 focus:ring-[#4779C5]/30
                disabled:cursor-not-allowed disabled:opacity-60
              "
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

        {/* Project / service history */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
          <SectionHeader
            icon={Clock3}
            title="Project & Service History"
            subtitle="Review timelines and manage existing projects."
            action={
              <button
                type="button"
                onClick={fetchCustomerProjectCycle}
                disabled={loadingProjectCycle}
                title="Refresh project history"
                aria-label="Refresh project history"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9] disabled:opacity-50"
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

          <div className="max-h-[650px] min-h-[240px] space-y-3 overflow-y-auto p-3 sm:p-4">
            {loadingProjectCycle ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                <RefreshCw
                  size={22}
                  className="animate-spin text-[#4779C5]"
                />
                <p className="text-sm font-medium text-[#718097]">
                  Loading project history...
                </p>
              </div>
            ) : projectDurations.length > 0 ? (
              projectDurations.map((item) => {
                const isDeleting = deletingId === item?._id;

                return (
                  <article
                    key={item?._id}
                    className="
                      rounded-xl border border-[#E3E8F0] bg-white p-3.5
                      transition hover:border-[#C8D6EA] hover:shadow-sm
                      sm:p-4
                    "
                  >
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
                            {item?.service || "Service not specified"}
                          </span>

                          {item?.serviceType && (
                            <span className="rounded-md bg-[#FFF2E7] px-2 py-1 text-[11px] font-semibold text-[#B96620]">
                              {item.serviceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[#F7F9FC] p-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-[#919CB0]">
                          Start Date
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#34445F]">
                          {formatDate(item?.startDate)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#F7F9FC] p-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-[#919CB0]">
                          End Date
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#34445F]">
                          {formatDate(item?.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#EEF1F6] pt-3">
                      <span className="text-[11px] text-[#929DB0]">
                        Project actions
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditChange(item)}
                          title="Edit project"
                          aria-label="Edit project"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F8] bg-[#F1F6FF] text-[#3569B4] transition hover:bg-[#E1ECFF]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item?._id)}
                          disabled={isDeleting}
                          title="Delete project"
                          aria-label="Delete project"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5DAD8] bg-[#FFF3F2] text-[#D45149] transition hover:bg-[#FFE5E3] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5FB] text-[#8293AE]">
                  <FileText size={25} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#34445F]">
                  No project history yet
                </h3>

                <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-[#8B97AA]">
                  Add a project using the form to see its service and timeline
                  details here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("projectName")
                      ?.focus()
                  }
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#DCE5EE] px-3 py-2 text-xs font-semibold text-[#315F9F] transition hover:bg-[#F2F6FC]"
                >
                  <Plus size={14} />
                  Start a project
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Customer;
