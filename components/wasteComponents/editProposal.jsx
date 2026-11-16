// components/wasteComponents/editProposal.jsx

'use client';

import CommonForm from '@/components/layout/Form';
import GridForm from '@/components/layout/GridForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { editProposalFormControl, ServiceFormControl } from '@/config/data';
import { initalServiceFormData, initialEditProposal } from '@/config/initialFormDate';
import { editProposalService, getProposalByIdService } from '@/service/proposal';
import { createServicesService, deleteService, editService, fetchProposalServiceById, getAllService } from '@/service/service';
import { Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const EditPropsal = ({ id }) => {
    // that is for show proposal
    const [proposalDetails, setProposalDetails] = useState({});
    const [proposalLoading, setProposalLoading] = useState(true);

    // this is the main formData State for edit proposal
    const [proposalFormData, setProposalFormData] = useState(initialEditProposal);

    // ---------------- Editing state ----------------
    const [editProposalServiceId, setEditProposalServiceId] = useState(null);

    // services handling
    const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);
    const [proposalServiceEditData, setProposalServiceEditData] = useState(initalServiceFormData);

    const [servicesItem, setServicesItem] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const router = useRouter();

    function calculationOfTotalAmount() {
        const totalAfterServiceDiscounts = selectedServices.reduce((total, service) => {
            let servicePrice = service.amount;
            if (service.discountAmount) {
                servicePrice -= service.discountAmount;
            } else if (service.discountPercentage) {
                servicePrice -= (service.amount * service.discountPercentage) / 100;
            }

            return total + servicePrice;
        }, 0);
        return totalAfterServiceDiscounts;
    }

    async function handleGetProposal() {
        try {
            const res = await getProposalByIdService(id);
            if (res.success) {
                setProposalDetails(res?.data);
                setProposalLoading(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'error while fetching the proposal');
        }
    }

    // that is the main for edit the proposal
    async function mainHandleEditProposal(e) {
        e.preventDefault();

        if (selectedServices?.length === 0) {
            toast.error('Add Service');
            return;
        }

        const editProposalTemplate = {
            ...proposalFormData,
            totalAmount: calculationOfTotalAmount(),
            services: selectedServices,
            partlyPayment: reversePartPayment,
        };

        // only filled that
        const filledValues = {};
        for (const key in editProposalTemplate) {
            const value = editProposalTemplate[key];
            if (Object.hasOwn(editProposalTemplate, key) && value && (!Array.isArray(value) || value.length > 0)) {
                filledValues[key] = value;
            }
        }

        try {
            const res = await editProposalService(id, filledValues);
            if (res?.success) {
                toast.success('Proposal edit successfully');
                router.push(`/dashboard/proposal/pdf-download/${id}`);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Error while editing proposal');
        }
    }

    async function handleEditProposalService(e) {
        e.preventDefault();

        try {
            const res = await editService(editProposalServiceId, proposalServiceEditData);

            if (res.success) {
                toast.success('Service Updated successfully');
                setProposalServiceEditData(initalServiceFormData);
                fetchAllServices();
                setEditProposalServiceId(null);
            } else {
                toast.error(res.message || 'Failed to update service');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error updating services');
        }
    }

    // add services
    async function handleService(e) {
        e.preventDefault();
        try {
            if (!serviceFormData.serviceTitle || !serviceFormData.amount || !serviceFormData.duration) {
                toast.error('please fill the service details');
                return;
            }

            if (serviceFormData?.discountPercentage > 40) {
                toast.error("Discount can't be more than 40%");
            }

            if (serviceFormData.discountAmount && serviceFormData.discountPercentage) {
                toast.error("Can't use both discount Amount and Percentage");
                return;
            }

            if (serviceFormData.discountPercentage > 40) {
                toast.error("Discount can't be more than 40 Percentage");
                return;
            }

            if (serviceFormData.discountAmount > serviceFormData.amount) {
                toast.error("Discount can't be more than service Amount");
            }

            const response = await createServicesService(serviceFormData);
            if (response.success) {
                toast.success(response.message);
                setServiceFormData(initalServiceFormData);
                fetchAllServices();
            }
        } catch (error) {
            console.log(error);
            toast.success(error.message);
        }
    }

    async function fetchAllServices() {
        try {
            const response = await getAllService();
            if (response.success) {
                setServicesItem(response.data);
                toast.success('All Services Fetched');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const handleSelectService = (service) => {
        setSelectedServices((prevSelected) => {
            const isSelected = prevSelected.some((s) => s._id === service._id);
            if (isSelected) {
                return prevSelected.filter((s) => s._id !== service._id);
            } else {
                return [...prevSelected, service];
            }
        });
    };

    async function handleDeleteService(id) {
        const confirm = window.confirm('Are you sure to delete the service');
        if (confirm) {
            const res = await deleteService(id);
            if (res.success) {
                fetchAllServices();
            }
        }
    }

    // ---------------- Editing function ----------------
    async function getProposalServiceIdForEdit(id) {
        setEditProposalServiceId(id);

        const res = await fetchProposalServiceById(id);
        if (res.success) {
            setProposalServiceEditData(res?.data);
        }
    }

    // ---------------- here is the logic for partical payment ----------------
    // instance for proposal card Partial payment
    const totalService = calculationOfTotalAmount();
    const gstAmount = totalService * 0.18;
    const grandTotal = totalService + gstAmount;
    const tdsAmount = totalService * 0.02;

    // ---------------- handle Partly payment form ----------------

    // ----------------Partly Payment STATE ----------------
    const [isOtherDuration, setIsOtherDuration] = useState(false);
    const [listOfPayments, setListOfPayments] = useState([]);
    const [partlyPaymentFormData, setPartlyPaymentFormData] = useState({
        paymentDuration: '',
        paymentAmount: '',
    });

    const reversePartPayment = [...listOfPayments].reverse();

    async function handleParlyPaymentSubmit(e) {
        e.preventDefault();
        const currentAmount = Number(partlyPaymentFormData.paymentAmount);
        const totalPaid = listOfPayments.reduce((acc, curr) => acc + Number(curr.paymentAmount), 0);
        const remainingBalance = (Boolean(proposalDetails.tanNo) ? grandTotal - tdsAmount : grandTotal) - totalPaid;

        if (!partlyPaymentFormData.paymentDuration) {
            toast.error('Please select a payment duration');
            return;
        }

        if (currentAmount <= 0) {
            toast.error('Amount must be greater than 0');
            return;
        }

        if (currentAmount > remainingBalance) {
            toast.error(`Amount cannot exceed remaining balance of ₹ ${remainingBalance.toLocaleString('en-IN')}`);
            return;
        }

        setListOfPayments([partlyPaymentFormData, ...listOfPayments]);
        setPartlyPaymentFormData({ paymentDuration: '', paymentAmount: '' });
        setIsOtherDuration(false);
    }

    function handleDeletePayment(index) {
        setListOfPayments((prev) => prev.filter((_, i) => i !== index));
    }

    useEffect(() => {
        if (!id) return;
        handleGetProposal();
    }, [id]);

    useEffect(() => {
        fetchAllServices();
    }, []);

    return (
        <div className="container mx-auto p-4 lg:p-0">
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="order-1 w-full lg:lg:order-0 lg:w-1/4">
                    <CommonForm
                        onSubmit={mainHandleEditProposal}
                        formControls={editProposalFormControl}
                        formData={proposalFormData}
                        setFormData={setProposalFormData}
                    />
                </div>

                {/* second div  */}
                <div className="order-2 w-full lg:lg:order-0 lg:w-1/2">
                    <div className="">
                        <GridForm
                            formControls={ServiceFormControl}
                            formData={editProposalServiceId ? proposalServiceEditData : serviceFormData}
                            setFormData={editProposalServiceId ? setProposalServiceEditData : setServiceFormData}
                            onSubmit={editProposalServiceId ? handleEditProposalService : handleService}
                            buttonText={editProposalServiceId ? 'Edit Service' : 'Add Service'}
                        />
                    </div>

                    <div className="my-5 h-[40vh] overflow-y-scroll">
                        {!servicesItem.length ? (
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-red-500 p-4 text-white transition-colors duration-200 hover:bg-red-500">
                                Add some service
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-2 lg:grid-cols-2">
                                {servicesItem.map((item) => (
                                    <div key={item?._id} className="flex flex-col">
                                        <button
                                            onClick={() => handleSelectService(item)}
                                            className={`group block rounded-t-lg border p-4 shadow-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                                                selectedServices.some((s) => s?._id === item?._id)
                                                    ? 'border-blue-400 bg-blue-100'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <p className="py-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                                                    {item?.serviceTitle}
                                                </p>
                                                {item?.description && (
                                                    <p className="border-t py-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                                                        {item?.description}
                                                    </p>
                                                )}
                                            </div>

                                            {item?.discountPercentage ? (
                                                <p>Discount Percentage : {item?.discountPercentage}%</p>
                                            ) : (
                                                <p>Discount Amount : ₹ {item?.discountAmount?.toLocaleString('en-IN')}</p>
                                            )}

                                            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                                <span>{item?.duration}</span>
                                                <span className="font-bold text-gray-700">₹ {item?.amount?.toLocaleString('en-IN')}</span>
                                            </div>
                                        </button>

                                        <div className="flex justify-between rounded-b-2xl border px-4 py-3">
                                            <div onClick={() => getProposalServiceIdForEdit(item?._id)} className="cursor-pointer rounded-full bg-blue-300 p-2">
                                                <Edit />
                                            </div>
                                            <div onClick={() => handleDeleteService(item?._id)} className="cursor-pointer rounded-full bg-red-300 p-2">
                                                <Trash />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* third div  */}
                <div className="order-3 w-full lg:lg:order-0 lg:w-1/4">
                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                        {totalService === 0 ? (
                            <div className="text-center">Add some service</div>
                        ) : (
                            <div>
                                <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Payment Summary</h2>
                                <div className="space-y-0.5">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹ {totalService.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>GST (18%)</span>
                                        <span>₹ {gstAmount.toLocaleString('en-IN')}</span>
                                    </div>

                                    {Boolean(proposalDetails.tanNo) && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>TDS (2%)</span>
                                            <span>₹ {tdsAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold text-gray-900">
                                        <span>Total Amount</span>
                                        <span>{(Boolean(proposalDetails.tanNo) ? grandTotal - tdsAmount : grandTotal).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleParlyPaymentSubmit} className="flex flex-col gap-3 border-b pb-4">
                        <p className="text-xl font-bold">Partial Payment</p>
                        <select
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            value={isOtherDuration ? 'Other' : partlyPaymentFormData?.paymentDuration}
                            onChange={(e) => {
                                if (e.target.value === 'Other') {
                                    setIsOtherDuration(true);
                                    setPartlyPaymentFormData((prev) => ({
                                        ...prev,
                                        paymentDuration: '',
                                    }));
                                } else {
                                    setIsOtherDuration(false);
                                    setPartlyPaymentFormData((prev) => ({
                                        ...prev,
                                        paymentDuration: e.target.value,
                                    }));
                                }
                            }}
                        >
                            <option value="" disabled>
                                Select Payment Duration
                            </option>
                            <option value="Advance Payment">Advance Payment</option>
                            <option value="After 15 Days">After 15 Days</option>
                            <option value="After 30 Days">After 30 Days</option>
                            <option value="After 45 Days">After 45 Days</option>
                            <option value="After 60 Days">After 60 Days</option>
                            <option value="After 90 Days">After 90 Days</option>
                            <option value="After 120 Days">After 120 Days</option>
                            <option value="Other">Other</option>
                        </select>
                        {isOtherDuration && (
                            <Input
                                placeholder="Enter Custom Duration"
                                value={partlyPaymentFormData.paymentDuration}
                                onChange={(e) =>
                                    setPartlyPaymentFormData((prev) => ({
                                        ...prev,
                                        paymentDuration: e.target.value,
                                    }))
                                }
                            />
                        )}
                        <Input
                            placeholder="Enter the Amount"
                            type="number"
                            value={partlyPaymentFormData?.paymentAmount}
                            onChange={(e) =>
                                setPartlyPaymentFormData((prev) => ({
                                    ...prev,
                                    paymentAmount: e.target.value,
                                }))
                            }
                        />
                        <p className="text-sm text-gray-500">
                            Balance: ₹{' '}
                            {(
                                (Boolean(proposalDetails.tanNo) ? grandTotal - tdsAmount : grandTotal) -
                                listOfPayments.reduce((acc, curr) => acc + Number(curr.paymentAmount), 0)
                            ).toLocaleString('en-IN')}
                        </p>
                        <Button type="submit">Add</Button>
                    </form>

                    <div className="mt-4">
                        {reversePartPayment?.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {reversePartPayment?.map(({ paymentAmount, paymentDuration }, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                        <span className="text-sm font-medium text-gray-700">{paymentDuration}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-900">₹ {Number(paymentAmount).toLocaleString('en-IN')}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePayment(idx)}
                                                className="text-gray-400 transition-colors hover:text-red-500"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                                <p className="text-sm text-gray-500">No partial payments added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPropsal;
