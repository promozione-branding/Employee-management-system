// components/subComponents/customer/CustomerForm.jsx
// THE common Add/Edit Client form — every layout (admin, manager, team,
// sales Sr. Manager / Executive) renders this, so fields stay identical
// everywhere. Only Client Name + Contact No. are compulsory; category, GST,
// city and all other fields are optional.

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import CommonForm from '@/components/layout/Form';
import { addCustomerFormControl } from '@/config/data';
import { buildCustomerFormData, buildCustomerPayload, validateCustomerForm } from '@/lib/customerForm';

/**
 * @param {object|null} customer  Existing customer to edit, or null to create.
 * @param {Array} salesExecutives [{ _id, basicDetails: { name } }]
 * @param {boolean} showSalesExecutive  Hide where assignment is automatic (sales executive view).
 * @param {(payload: object) => void} onSubmit  Receives the normalized API payload.
 */
const CustomerForm = ({ customer = null, salesExecutives = [], showSalesExecutive = true, buttonText, isSubmitting = false, onSubmit }) => {
    const [formData, setFormData] = useState(() => buildCustomerFormData(customer));

    const salesExecutiveControl = {
        label: 'Sales Executive',
        name: 'salesExecutive',
        componentType: 'select',
        options: (salesExecutives || []).filter((e) => e?._id).map(({ basicDetails, _id }) => ({ id: _id, label: basicDetails?.name || 'Unnamed executive' })),
    };

    const formControls = showSalesExecutive ? [...addCustomerFormControl, salesExecutiveControl] : addCustomerFormControl;

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validateCustomerForm(formData);
        if (error) {
            toast.error(error);
            return;
        }
        onSubmit(buildCustomerPayload(formData));
    };

    return (
        <CommonForm
            formData={formData}
            setFormData={setFormData}
            formControls={formControls}
            buttonText={buttonText || (customer ? 'Save changes' : 'Add client')}
            isBtnDisabled={isSubmitting}
            onSubmit={handleSubmit}
        />
    );
};

export default CustomerForm;
