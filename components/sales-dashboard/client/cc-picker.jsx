// components/sales-dashboard/client/cc-picker.jsx

'use client';
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const CcPicker = ({ title, employees, selected, onToggle, search, setSearch }) => {
    const filtered = useMemo(() => {
        const q = (search || '').trim().toLowerCase();
        if (!q) return employees;
        return employees.filter((u) => {
            const name = (u?.name || '').toLowerCase();
            const email = (u?.email || '').toLowerCase();
            return name.includes(q) || email.includes(q);
        });
    }, [employees, search]);

    return (
        <div className="flex flex-col gap-2">
            <Label>{title}</Label>
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="max-h-52 divide-y overflow-y-auto rounded-lg border bg-white">
                {filtered.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">No match found</div>
                ) : (
                    filtered.map((u) => {
                        const isSelected = selected.some((s) => s?._id === u?._id);
                        return (
                            <label
                                key={u?._id}
                                className={`flex cursor-pointer items-center gap-3 p-2 text-sm ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <input type="checkbox" checked={isSelected} onChange={() => onToggle(u)} />
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate font-medium text-gray-800">
                                        {u?.name || 'Unnamed'}
                                        {u?.role ? <span className="ml-2 text-xs text-gray-500 capitalize">({u.role})</span> : null}
                                    </span>
                                    <span className="truncate text-xs text-gray-500">{u?.email}</span>
                                </div>
                            </label>
                        );
                    })
                )}
            </div>
            {selected.length > 0 && (
                <div className="text-xs text-gray-600">
                    {selected.length} recipient{selected.length > 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
};

export default CcPicker;
