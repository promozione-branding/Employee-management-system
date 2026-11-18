// components/admin-dashboard/tabs/Createworkflow.jsx

'use client';
import { createWorkflowService, updateWorkflowService } from '@/service/workflow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronDown, FileText, LoaderCircle, Save, Workflow, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { listProposalNewService, getProposalNewByIdService } from '@/service/proposalNew';
import { getLedgerNewService } from '@/service/proposalNew/ledgerNew';
import { hasLedgerEntryForProposal } from '@/lib/ledgerNewMath';
import WorkflowHistory from './WorkflowHistory';

const DURATION_OPTIONS = [
    { value: '3m', label: '3 Months', months: 3 },
    { value: '6m', label: '6 Months', months: 6 },
    { value: '12m', label: '12 Months', months: 12 },
    { value: 'custom', label: 'Custom', months: null }, 
];

const getToday = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const addMonthsToDate = (dateString, months) => {
    if (!dateString || !months) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const targetMonthIndex = month - 1 + months;
    const targetYear = year + Math.floor(targetMonthIndex / 12);
    const normalizedMonth = targetMonthIndex % 12;
    const lastDayOfTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    const targetDay = Math.min(day, lastDayOfTargetMonth);
    const result = new Date(targetYear, normalizedMonth, targetDay);
    return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    // Handle both "YYYY-MM-DD" and ISO strings
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getProposalId = (proposal) => proposal?._id || proposal?.id || '';

const getProposalLabel = (proposal) => {
    const number = proposal?.proposalNumber || proposal?.quotationNumber || proposal?._id || proposal?.id || '';
    const services = [
        ...new Set((Array.isArray(proposal?.items) ? proposal.items : []).map((item) => item.categoryLabel || item.category || item.label).filter(Boolean)),
    ];
    const serviceText = services.length ? services.join(', ') : 'Services unavailable';
    const date = proposal?.createdAt ? formatDate(String(proposal.createdAt).slice(0, 10)) : '';
    return [number, serviceText, date].filter(Boolean).join(' · ');
};

const getResponseData = (response) => {
    if (response?.success === false) throw new Error(response.message || 'Request failed.');
    return response?.data;
};

const getProposalItems = (proposal) => (Array.isArray(proposal?.items) ? proposal.items : []);

export default function Createworkflow({ customerId, onSave, onGoToLedger }) {
    const [proposals, setProposals] = useState([]);
    const [selectedProposalId, setSelectedProposalId] = useState('');
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [startDate, setStartDate] = useState(getToday);
    const [duration, setDuration] = useState('3m');
    const [customEndDate, setCustomEndDate] = useState('');
    const [description, setDescription] = useState('');

    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [loadingLedger, setLoadingLedger] = useState(true);

    const [loadingProposals, setLoadingProposals] = useState(true);
    const [loadingProposalDetails, setLoadingProposalDetails] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [refreshKey, setRefreshKey] = useState(0);
    
    // 👈 NEW: Track if we are editing an existing workflow
    const [editingWorkflowId, setEditingWorkflowId] = useState(null);

    const fetchProposals = useCallback(async () => {
        if (!customerId) {
            setProposals([]);
            setLoadingProposals(false);
            return;
        }
        setLoadingProposals(true);
        try {
            const response = await listProposalNewService(customerId);
            const data = getResponseData(response);
            const list = Array.isArray(data) ? data : Array.isArray(data?.proposals) ? data.proposals : [];
            setProposals(list);
        } catch (err) {
            console.error('Failed to load proposal history:', err);
            setError('Failed to load proposal history.');
        } finally {
            setLoadingProposals(false);
        }
    }, [customerId]);

    useEffect(() => { fetchProposals(); }, [fetchProposals]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!customerId) { setLoadingLedger(false); return; }
            setLoadingLedger(true);
            try {
                const res = await getLedgerNewService(customerId);
                if (!cancelled) setLedgerEntries(res?.success ? res.data || [] : []);
            } catch {
                if (!cancelled) setLedgerEntries([]);
            } finally {
                if (!cancelled) setLoadingLedger(false);
            }
        })();
        return () => { cancelled = true; };
    }, [customerId]);

    const hasLedgerEntry = selectedProposalId ? hasLedgerEntryForProposal(ledgerEntries, selectedProposalId) : false;
    const ledgerBlocked = Boolean(selectedProposalId && !loadingLedger && !hasLedgerEntry);

    const handleProposalChange = async (proposalId) => {
        setSelectedProposalId(proposalId);
        setSelectedProposal(null);
        setSelectedCategory('');
        setError('');
        if (!proposalId) return;
        setLoadingProposalDetails(true);
        try {
            const response = await getProposalNewByIdService(proposalId);
            const data = getResponseData(response);
            const proposal = data?.proposal || data;
            setSelectedProposal(proposal);
        } catch (err) {
            setError('Failed to load the selected proposal.');
        } finally {
            setLoadingProposalDetails(false);
        }
    };

    const categories = useMemo(() => {
        const items = getProposalItems(selectedProposal);
        const uniqueCategories = new Map();
        items.forEach((item) => {
            if (item?.category && !uniqueCategories.has(item.category)) {
                uniqueCategories.set(item.category, {
                    value: item.category,
                    label: item.categoryLabel || item.label || item.category,
                });
            }
        });
        return Array.from(uniqueCategories.values());
    }, [selectedProposal]);

    const computedEndDate = useMemo(() => {
        if (!startDate) return '';
        if (duration === 'custom') return customEndDate;
        const selectedDuration = DURATION_OPTIONS.find((option) => option.value === duration);
        if (!selectedDuration?.months) return '';
        return addMonthsToDate(startDate, selectedDuration.months);
    }, [startDate, duration, customEndDate]);

    const handleStartDateChange = (value) => {
        setStartDate(value);
        if (customEndDate && value && customEndDate < value) setCustomEndDate('');
    };

    const handleDurationChange = (value) => {
        setDuration(value);
        setCustomEndDate('');
    };

    const resetForm = () => {
        setSelectedProposalId('');
        setSelectedProposal(null);
        setSelectedCategory('');
        setStartDate(getToday());
        setDuration('3m');
        setCustomEndDate('');
        setDescription('');
        setError('');
        setEditingWorkflowId(null);
    };

    // 👈 NEW: Populate the form when edit is clicked
    const handleEditWorkflow = (workflow) => {
        setEditingWorkflowId(workflow._id);
        
        // We need to select the proposal first so that the categories load
        setSelectedProposalId(workflow.proposalId);
        setLoadingProposalDetails(true);
        getProposalNewByIdService(workflow.proposalId).then((res) => {
            const data = getResponseData(res);
            setSelectedProposal(data?.proposal || data);
        }).finally(() => setLoadingProposalDetails(false));

        // Set the rest of the form fields
        setSelectedCategory(workflow.category);
        setStartDate(new Date(workflow.startDate).toISOString().split('T')[0]);
        setDuration(workflow.duration || 'custom');
        
        // If duration is custom, set the custom end date
        if (workflow.duration === 'custom') {
            setCustomEndDate(new Date(workflow.endDate).toISOString().split('T')[0]);
        }
        
        setDescription(workflow.description || '');
        
        // Scroll to top so user can see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!customerId || !selectedProposalId || !selectedCategory || !startDate || !computedEndDate) {
            toast.error('Please fill all required fields.');
            return;
        }

        if (computedEndDate < startDate) {
            toast.error('End date cannot be earlier than the start date.');
            return;
        }

        const selectedCategoryDetails = categories.find((category) => category.value === selectedCategory);
        
        const payload = {
            customerId,
            proposalId: getProposalId(selectedProposal),
            proposalNumber: selectedProposal?.proposalNumber || '',
            category: selectedCategory,
            categoryLabel: selectedCategoryDetails?.label || selectedCategory,
            description: description.trim(),
            startDate,
            duration,
            endDate: computedEndDate,
        };

        setSaving(true);
        try {
            if (editingWorkflowId) {
                await updateWorkflowService(editingWorkflowId, payload);
                toast.success('Workflow updated successfully.');
            } else {
                await createWorkflowService(payload); // or await onSave(payload) if you prefer
                toast.success('Workflow created successfully.');
            }
            
            resetForm();
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            toast.error(err?.message || 'Failed to save workflow.');
        } finally {
            setSaving(false);
        }
    };

    const inputClassName = 'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50';
    const labelClassName = 'mb-1.5 block text-sm font-medium text-gray-700';

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
                
                {/* Header (with dynamic text) */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
                            <Workflow className="h-4 w-4 text-gray-700" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                {editingWorkflowId ? 'Edit Workflow' : 'Create Workflow'}
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                {editingWorkflowId ? 'Update the existing workflow details.' : 'Create a workflow from an existing customer proposal.'}
                            </p>
                        </div>
                    </div>
                    
                    {editingWorkflowId && (
                        <button onClick={resetForm} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
                            <X className="h-3 w-3" /> Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-5">
                    {/* ... (Keep all your existing form sections exactly as they are: Proposal Details, Category, Description, Timeline) ... */}
                    
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-800">Proposal Details</h3>
                        </div>
                        <div>
                            <label htmlFor="workflow-proposal" className={labelClassName}>Select Proposal <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="workflow-proposal"
                                    value={selectedProposalId}
                                    onChange={(event) => handleProposalChange(event.target.value)}
                                    disabled={loadingProposals || saving || !!editingWorkflowId} // Disable if editing
                                    className={`${inputClassName} appearance-none pr-9`}
                                    required
                                >
                                    <option value="">{loadingProposals ? 'Loading...' : 'Choose a proposal'}</option>
                                    {proposals.map((proposal) => {
                                        const id = getProposalId(proposal);
                                        return <option key={id} value={id}>{getProposalLabel(proposal)}</option>;
                                    })}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>
                        {loadingProposalDetails && <div className="text-sm text-gray-500 flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin"/> Loading details...</div>}
                        {ledgerBlocked && <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border">Kindly make entry on ledger to continue</div>}
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800">Workflow Category</h3>
                        <div>
                            <label htmlFor="workflow-category" className={labelClassName}>Service / Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="workflow-category"
                                    value={selectedCategory}
                                    onChange={(event) => setSelectedCategory(event.target.value)}
                                    disabled={!selectedProposal || loadingProposalDetails || saving || categories.length === 0}
                                    className={`${inputClassName} appearance-none pr-9`}
                                    required
                                >
                                    <option value="">{!selectedProposal ? 'Select a proposal first' : 'Choose a service'}</option>
                                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-1.5">
                        <label htmlFor="workflow-description" className="block text-sm font-semibold text-gray-800">Description <span className="ml-1 font-normal text-gray-400">(Optional)</span></label>
                        <textarea
                            id="workflow-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe the work..."
                            rows={4}
                            disabled={saving}
                            className={`${inputClassName} resize-y`}
                        />
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-800">Timeline</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="workflow-start-date" className={labelClassName}>Start Date <span className="text-red-500">*</span></label>
                                <input
                                    id="workflow-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => handleStartDateChange(event.target.value)}
                                    disabled={saving}
                                    className={inputClassName}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="workflow-duration" className={labelClassName}>Duration <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        id="workflow-duration"
                                        value={duration}
                                        onChange={(event) => handleDurationChange(event.target.value)}
                                        disabled={saving}
                                        className={`${inputClassName} appearance-none pr-9`}
                                    >
                                        {DURATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>
                            {duration === 'custom' && (
                                <div className="sm:col-span-2">
                                    <label htmlFor="workflow-custom-end-date" className={labelClassName}>Custom End Date <span className="text-red-500">*</span></label>
                                    <input
                                        id="workflow-custom-end-date"
                                        type="date"
                                        value={customEndDate}
                                        min={startDate || undefined}
                                        onChange={(event) => setCustomEndDate(event.target.value)}
                                        disabled={saving}
                                        className={inputClassName}
                                        required
                                    />
                                </div>
                            )}
                            <div className={duration === 'custom' ? 'sm:col-span-2' : ''}>
                                <label className={labelClassName}>End Date</label>
                                <input type="text" value={formatDate(computedEndDate)} readOnly className={`${inputClassName} bg-gray-50 font-medium text-gray-700`} />
                            </div>
                        </div>
                    </section>

                    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                    <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                        <button type="button" onClick={resetForm} disabled={saving} className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loadingLedger || ledgerBlocked || loadingProposals || loadingProposalDetails || !selectedProposal || !selectedCategory || !startDate || !computedEndDate || computedEndDate < startDate}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {saving ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> {editingWorkflowId ? 'Update Workflow' : 'Create Workflow'}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Pass the edit handler to the history component */}
            <WorkflowHistory customerId={customerId} refreshKey={refreshKey} onEdit={handleEditWorkflow} />
        </div>
    );
}
