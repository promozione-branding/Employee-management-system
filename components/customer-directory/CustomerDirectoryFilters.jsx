// components/customer-directory/CustomerDirectoryFilters.jsx

'use client';

import { X, Search, CalendarDays } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const inputClassName = 'h-12 rounded-xl border border-[#E0E5EF] bg-white px-4 text-sm text-[#0F1B33] outline-none transition focus:border-[#F27B1E]';

export const localDateString = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
};

export const getAddedDateRange = (filter, customFrom, customTo) => {
    if (filter === 'custom') return { dateFrom: customFrom, dateTo: customTo };
    if (filter === 'all') return { dateFrom: '', dateTo: '' };

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (filter === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (filter === 'month') start.setDate(1);
    return { dateFrom: localDateString(start), dateTo: localDateString(today) };
};

export default function CustomerDirectoryFilters({
    searchValue,
    onSearchChange,
    categoryValue,
    onCategoryChange,
    categoryOptions = [],
    paidOnly,
    onPaidChange,
    executiveValue,
    onExecutiveChange,
    executives = [],
    dateFilter,
    onDateFilterChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    searchPlaceholder = 'Search by name, company or phone',
    idPrefix = 'customer-directory',
}) {
    return (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative min-w-0">
                <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8A92A6]" />
                <Input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} className={inputClassName + ' w-full pr-10 pl-11'} />
                {searchValue && (
                    <button type="button" aria-label="Clear search" onClick={() => onSearchChange('')} className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#8A92A6] hover:text-[#0F1B33]">
                        <X size={16} />
                    </button>
                )}
            </div>

            {onExecutiveChange && (
                <select value={executiveValue} onChange={(event) => onExecutiveChange(event.target.value)} aria-label="Filter by sales executive" className={inputClassName + ' w-full'}>
                    <option value="all">All executives</option>
                    {executives.map((executive) => <option key={executive._id} value={executive._id}>{executive.basicDetails?.name || 'Unnamed executive'}</option>)}
                </select>
            )}

            <div className="relative min-w-0">
                <Input value={categoryValue} onChange={(event) => onCategoryChange(event.target.value)} placeholder="Filter by category" list={idPrefix + '-categories'} aria-label="Filter by category" className={inputClassName + ' w-full pr-10'} />
                <datalist id={idPrefix + '-categories'}>
                    {categoryOptions.map((category) => <option key={category} value={category} />)}
                </datalist>
                {categoryValue && (
                    <button type="button" aria-label="Clear category filter" onClick={() => onCategoryChange('')} className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#8A92A6] hover:text-[#0F1B33]">
                        <X size={16} />
                    </button>
                )}
            </div>

            <select value={dateFilter} onChange={(event) => onDateFilterChange(event.target.value)} aria-label="Filter clients by date added" className={inputClassName + ' w-full'}>
                <option value="all">Any added date</option>
                <option value="week">Added this week</option>
                <option value="month">Added this month</option>
                <option value="custom">Custom date range</option>
            </select>

            {dateFilter === 'custom' && (
                <div className="grid min-w-0 grid-cols-2 gap-2 sm:col-span-2">
                    <Input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} aria-label="Added from date" className={inputClassName + ' w-full px-2'} />
                    <Input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} aria-label="Added to date" className={inputClassName + ' w-full px-2'} />
                </div>
            )}

            <label className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-[#E0E5EF] px-3 text-sm font-medium text-[#5B6478]">
                <Checkbox checked={paidOnly} onCheckedChange={(checked) => onPaidChange(checked === true)} />
                Paid only
            </label>
        </div>
    );
}
