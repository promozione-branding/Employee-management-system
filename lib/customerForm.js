// lib/customerForm.js
// Single source of truth for Add/Edit Client form behaviour, shared by every
// layout (admin dashboard, manager, sales Sr. Manager / Executive, sub-components).
// Only `name` and `phone` are compulsory — every other field, including
// category, GSTIN and city, is optional. Old customers without a category
// simply get '' here, so existing data is never blocked or rewritten.

import { initalCustomerFormData } from '../config/initialFormDate.js';

export const CUSTOMER_REQUIRED_FIELDS = ['name', 'phone'];

const TEXT_FIELDS = [
    'name',
    'company',
    'GSTIN',
    'tanNo',
    'email',
    'phone',
    'website',
    'Address',
    'city',
    'state',
    'pincode',
    'country',
    'meetingDate',
    'category',
    'notes',
];

/** Form state for editing: whitelists form fields, tolerates legacy docs. */
export function buildCustomerFormData(customer) {
    const form = { ...initalCustomerFormData };
    if (!customer || typeof customer !== 'object') return form;

    for (const field of TEXT_FIELDS) {
        const value = customer[field];
        if (value == null) continue;
        // DB stores notes as string[]; the form edits a single line of text.
        form[field] = Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value);
    }
    form.category = typeof customer.category === 'string' ? customer.category : '';
    form.isPaid = customer.isPaid === true || customer.isPaid === 'Paid' ? 'Paid' : customer.isPaid ? 'Paid' : 'Unpaid';
    if (customer.isPaid === '' || customer.isPaid == null) form.isPaid = '';

    const exec = Array.isArray(customer.salesExecutive) ? customer.salesExecutive[0] : customer.salesExecutive;
    form.salesExecutive = exec ? String(exec._id ?? exec) : '';
    return form;
}

/** Returns an error message, or null when valid. Only name + phone required. */
export function validateCustomerForm(formData) {
    if (!String(formData?.name ?? '').trim()) return 'Please fill Client Name';
    const phone = String(formData?.phone ?? '').replace(/[\s+-]/g, '');
    if (!phone) return 'Please fill Contact No.';
    if (!/^\d+$/.test(phone)) return 'Please enter a valid Contact No.';
    return null;
}

/** API payload: trims text, omits blank optionals so edits never wipe saved data. */
export function buildCustomerPayload(formData) {
    const payload = {};
    for (const field of TEXT_FIELDS) {
        const value = typeof formData?.[field] === 'string' ? formData[field].trim() : formData?.[field];
        if (value == null || value === '') continue;
        payload[field] = field === 'phone' ? String(value).trim() : value;
    }
    payload.isPaid = formData?.isPaid === 'Paid' || formData?.isPaid === true;
    const exec = formData?.salesExecutive;
    if (typeof exec === 'string' && exec.trim()) payload.salesExecutive = [exec.trim()];
    else if (Array.isArray(exec) && exec.filter(Boolean).length) payload.salesExecutive = exec.filter(Boolean).map(String);
    return payload;
}
