// components/subComponents/customer/CreateCustomer.jsx
// Thin wrapper around the common CustomerForm (keeps the old props API).

'use client';

import CustomerForm from '@/components/subComponents/customer/CustomerForm';
import { createCustomerServices, editCustomerServices } from '@/service/customer';
import toast from 'react-hot-toast';

const CreateCustomer = ({ setCustomerSiderbar, setCustomerCreated, customerDetails }) => {
    const handleSubmit = async (payload) => {
        try {
            const res = customerDetails?._id ? await editCustomerServices(customerDetails._id, payload) : await createCustomerServices(payload);
            if (res.success) {
                toast.success(customerDetails?._id ? res.message || 'Client updated successfully' : 'New customer add successfully');
                setCustomerSiderbar(false);
                setCustomerCreated(customerDetails?._id ? 'done2' : 'done');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message || 'Something went wrong');
        }
    };

    return (
        <div className="overflow-y-scroll">
            <p className="px-2 pb-5 text-center text-2xl font-semibold">{customerDetails ? 'Edit Client' : 'Create New Client'}</p>
            <CustomerForm
                key={customerDetails?._id || 'new-customer'}
                customer={customerDetails || null}
                showSalesExecutive={false}
                buttonText={customerDetails ? 'Edit Details' : 'Add Client'}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default CreateCustomer;
