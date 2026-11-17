// components/sales-dashboard/client/location-picker.jsx

'use client';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { captureLocation } from './update-utils';

const LocationPicker = ({ value, onChange, required = false }) => {
    const [loading, setLoading] = useState(false);

    const capture = async () => {
        setLoading(true);
        try {
            const loc = await captureLocation();
            onChange(loc);
            toast.success('Location captured');
        } catch (err) {
            const msg =
                err?.code === 1
                    ? 'Location permission denied — please allow location for this site'
                    : err?.code === 2
                    ? 'Location unavailable — try again'
                    : err?.code === 3
                    ? 'Location request timed out — try again'
                    : err?.message || 'Could not get location';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const showError = required && !value && !loading;

    return (
        <div
            className={`flex flex-col gap-2 rounded-lg border p-3 ${
                showError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
        >
            <div className="flex items-center justify-between">
                <Label>
                    Location {required && <span className="text-red-600">*</span>}
                </Label>
                <div className="flex gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={capture} disabled={loading}>
                        {loading ? 'Locating… (few seconds)' : value ? 'Recapture' : 'Capture Location'}
                    </Button>
                </div>
            </div>

            {value ? (
                <div className="space-y-1 text-xs text-gray-700">
                    <div>
                        <strong>Lat/Lng:</strong> {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                        {value.accuracy ? ` (±${Math.round(value.accuracy)}m)` : ''}
                    </div>
                    {value.address && (
                        <div>
                            <strong>Address:</strong> {value.address}
                        </div>
                    )}
                    <div className="text-gray-500">Captured: {new Date(value.capturedAt).toLocaleString()}</div>
                </div>
            ) : (
                <div className={`text-xs ${showError ? 'text-red-600' : 'text-gray-500'}`}>
                    {loading
                        ? 'Sampling GPS for best accuracy… please allow the browser prompt.'
                        : required
                        ? 'Location is required. Click Capture Location.'
                        : 'No location captured yet.'}
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
