// app/dashboard/customer/Customer.jsx

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/layout/Loading";
import { FileText, Layers, UserRound } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

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

import CustomerInfoTab from "./components/CustomerInfoTab";
import AddProjectTab from "./components/AddProjectTab";
import ProjectHistoryTab, {
  ProposalViewModal,
} from "./components/ProjectHistoryTab";

const OTHERS = "others";

const TABS = [
  { id: "info", label: "Customer Info", icon: UserRound },
  { id: "projects", label: "Projects", icon: Layers },
];

const INITIAL_PROJECT_FORM = {
  projectName: "",
  proposalId: "",
  proposalNumber: "",
  proposalIsCustom: false,
  customProposalNumber: "",
  category: "",
  categoryLabel: "",
  categoryIsCustom: false,
  customServiceName: "",
  service: "",
  serviceName: "",
  serviceType: "",
  startDate: "",
  endDate: "",
};

const getResponseData = (res) => {
  if (res?.success === false) throw new Error(res.message || "Request failed.");
  return res?.data;
};

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export default function Customer({ customerId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab = TABS.some((t) => t.id === tabFromUrl)
    ? tabFromUrl
    : "info";

  const setTab = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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

  const projectDurations = useMemo(() => {
    const list = projectCycleData?.projectCycle?.projectDuration || [];
    return [...list].sort((a, b) => {
      const ta = a?.startDate ? new Date(a.startDate).getTime() : Infinity;
      const tb = b?.startDate ? new Date(b.startDate).getTime() : Infinity;
      return ta - tb;
    });
  }, [projectCycleData]);

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

  const handleProposalChange = async (value) => {
    if (value === OTHERS) {
      setSelectedProposal(null);
      setProjectFormData((prev) => ({
        ...prev,
        proposalId: "",
        proposalIsCustom: true,
        proposalNumber: "",
        category: "",
        categoryLabel: "",
        categoryIsCustom: false,
        customServiceName: "",
        service: "",
      }));
      return;
    }

    setProjectFormData((prev) => ({
      ...prev,
      proposalId: value,
      proposalIsCustom: false,
      customProposalNumber: "",
      category: "",
      categoryLabel: "",
      categoryIsCustom: false,
      customServiceName: "",
      proposalNumber: "",
    }));
    setSelectedProposal(null);

    if (!value) return;
    setLoadingProposalDetails(true);
    try {
      const response = await getProposalNewByIdService(value);
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

  const usedCategoriesForProposal = useMemo(() => {
    if (!projectFormData.proposalId) return new Set();
    const set = new Set();
    projectDurations.forEach((d) => {
      if (
        d?.proposalId &&
        String(d.proposalId) === String(projectFormData.proposalId) &&
        d?.category
      ) {
        set.add(String(d.category));
      }
    });
    if (currentEditedId) {
      const current = projectDurations.find(
        (d) => String(d?._id) === String(currentEditedId),
      );
      if (current?.category) set.delete(String(current.category));
    }
    return set;
  }, [projectDurations, projectFormData.proposalId, currentEditedId]);

  const handleCategoryChange = (value) => {
    if (value === OTHERS) {
      setProjectFormData((prev) => ({
        ...prev,
        category: OTHERS,
        categoryIsCustom: true,
        categoryLabel: prev.customServiceName || "",
        service: OTHERS,
      }));
      return;
    }
    const found = categories.find((c) => c.value === value);
    setProjectFormData((prev) => ({
      ...prev,
      category: value,
      categoryIsCustom: false,
      customServiceName: "",
      categoryLabel: found?.label || value,
      service: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      let serviceValue = "";
      let categoryValue = "";
      let categoryLabelValue = "";
      let proposalNumberValue = "";

      if (projectFormData.proposalIsCustom) {
        proposalNumberValue = (
          projectFormData.customProposalNumber || ""
        ).trim();
        if (!proposalNumberValue) {
          toast.error("Please enter a custom proposal number");
          return;
        }
      } else {
        proposalNumberValue = projectFormData.proposalNumber || "";
        if (!projectFormData.proposalId) {
          toast.error("Please select a proposal");
          return;
        }
      }

      if (projectFormData.categoryIsCustom) {
        const custom = (projectFormData.customServiceName || "").trim();
        if (!custom) {
          toast.error("Please enter a custom service name");
          return;
        }
        serviceValue = custom;
        categoryValue = custom;
        categoryLabelValue = custom;
      } else {
        if (!projectFormData.category) {
          toast.error("Please select a service/category");
          return;
        }
        serviceValue = projectFormData.category;
        categoryValue = projectFormData.category;
        categoryLabelValue =
          projectFormData.categoryLabel || projectFormData.category;
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
          proposalNumber: proposalNumberValue,
          category: categoryValue,
          categoryLabel: categoryLabelValue,
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
          proposalNumber: proposalNumberValue,
          category: categoryValue,
          categoryLabel: categoryLabelValue,
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
    const isCustomProposal = !data?.proposalId && Boolean(data?.proposalNumber);
    const isCustomCategory = !data?.proposalId && Boolean(data?.service);

    setProjectFormData({
      projectName: data?.projectName || "",
      proposalId: data?.proposalId || "",
      proposalNumber: data?.proposalNumber || "",
      proposalIsCustom: isCustomProposal,
      customProposalNumber: isCustomProposal
        ? data?.proposalNumber || ""
        : "",
      category: isCustomCategory ? OTHERS : data?.category || "",
      categoryLabel: data?.categoryLabel || "",
      categoryIsCustom: isCustomCategory,
      customServiceName: isCustomCategory ? data?.service || "" : "",
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

  const handleSaveStatus = async ({
    item,
    nextStatus,
    startDate,
    tenure,
    computedEnd,
  }) => {
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
        await fetchCustomerProjectCycle();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not save project status",
      );
    }
  };

  const openProposalView = async (proposalId) => {
    if (!proposalId) return;
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E3E8F0] bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                active
                  ? "bg-[#183F75] text-white shadow-sm"
                  : "text-[#4E607B] hover:bg-[#F2F4F9]"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" && <CustomerInfoTab customer={customerDetails} />}

      {activeTab === "projects" && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[20%_minmax(0,75%)] xl:justify-between">
          <div className="min-w-0">
            <AddProjectTab
              proposals={proposals}
              loadingProposals={loadingProposals}
              loadingProposalDetails={loadingProposalDetails}
              selectedProposal={selectedProposal}
              projectFormData={projectFormData}
              setField={updateProjectField}
              onProposalChange={handleProposalChange}
              categories={categories}
              usedCategoriesForProposal={usedCategoriesForProposal}
              onCategoryChange={handleCategoryChange}
              onSubmit={handleSubmit}
              onReset={resetProjectForm}
              submitting={submitting}
              isEditing={Boolean(currentEditedId)}
              projects={projectDurations}
              currentEditedId={currentEditedId}
            />
          </div>

          <div className="min-w-0">
            <ProjectHistoryTab
              projects={projectDurations}
              loading={loadingProjectCycle}
              onRefresh={fetchCustomerProjectCycle}
              onEdit={handleEditChange}
              onDelete={handleDelete}
              onViewProposal={openProposalView}
              deletingId={deletingId}
              onSaveStatus={handleSaveStatus}
            />
          </div>
        </div>
      )}

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
}
