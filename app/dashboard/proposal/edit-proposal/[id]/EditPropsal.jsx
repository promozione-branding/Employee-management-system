// "use client";

// import CommonForm from "@/components/layout/Form";
// import GridForm from "@/components/layout/GridForm";
// import { editProposalFormControl, ServiceFormControl } from "@/config/data";
// import { initalServiceFormData, initialEditProposal } from "@/config/initialFormDate";
// import { getProposalByIdService } from "@/service/proposal";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// const EditPropsal = ({ id }) => {
//   const [proposalDetails, setProposalDetails] = useState({});
//   const [proposalLoading, setProposalLoading] = useState(true);

//   const [proposalFormData, setProposalFormData] = useState(initialEditProposal);

//   // ---------------- Editing state ----------------
//     const [editProposalServiceId, setEditProposalServiceId] = useState(null);

//      const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);

//   async function handleGetProposal() {
//     try {
//       const res = await getProposalByIdService(id);
//       if (res.success) {
//         setProposalDetails(res?.data);
//         setProposalLoading(false);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(
//         error?.response?.data?.message || "error while fetching the proposal",
//       );
//     }
//   }

//   async function handleEditProposal(e) {
//     e.preventDefault();
//     try {
//     } catch (error) {
//       console.log(error);
//       toast.error(
//         error?.response?.data?.message || "Error while editing proposal",
//       );
//     }
//   }

//   useEffect(() => {
//     if (!id) return;
//     handleGetProposal();
//   }, [id]);

//   return (
//     <div>
//       <div className="flex gap-3">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px] lg:w-1/2">
//           {proposalLoading ? (
//             <div className="animate-pulse space-y-6">
//               <div className="flex justify-between items-center border-b pb-4">
//                 <div className="h-8 bg-gray-200 rounded w-1/4" />
//                 <div className="h-4 bg-gray-200 rounded w-32" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="h-32 bg-gray-100 rounded-lg" />
//                 <div className="h-32 bg-gray-100 rounded-lg" />
//               </div>
//               <div className="h-48 bg-gray-50 rounded-lg border"></div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="h-20 bg-gray-100 rounded-lg" />
//                 <div className="h-20 bg-gray-100 rounded-lg" />
//                 <div className="h-20 bg-gray-100 rounded-lg" />
//                 <div className="h-20 bg-gray-100 rounded-lg" />
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-8 animate-in fade-in duration-500 ">
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-2">
//                 <div>
//                   <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
//                     Proposal Number
//                   </span>
//                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">
//                     {proposalDetails?.proposalNo}
//                   </h2>
//                 </div>
//                 <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
//                   Date:{" "}
//                   {proposalDetails?.dateOfProposal &&
//                     new Date(
//                       proposalDetails.dateOfProposal,
//                     ).toLocaleDateString()}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-3">
//                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
//                     Client Details
//                   </h3>
//                   <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
//                     <p className="font-extrabold text-lg text-gray-900">
//                       {proposalDetails?.clientName}
//                     </p>
//                     <p className="text-gray-700 font-medium">
//                       {proposalDetails?.clientCompany}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1 leading-relaxed">
//                       {proposalDetails?.clientAddress}
//                     </p>
//                     {proposalDetails?.GSTIN && (
//                       <div className="mt-3 flex items-center gap-2">
//                         <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
//                           GSTIN
//                         </span>
//                         <span className="text-sm font-mono text-gray-600">
//                           {proposalDetails.GSTIN}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
//                     Financial Summary
//                   </h3>
//                   <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
//                     <div className="flex justify-between items-end">
//                       <span className="text-sm text-gray-500">Grand Total</span>
//                       <span className="font-black text-2xl text-blue-700">
//                         ₹{proposalDetails?.totalAmount?.toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="h-px bg-blue-100/50" />
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <p className="text-gray-400 text-[10px] uppercase font-bold">
//                           Payment Method
//                         </p>
//                         <p className="font-semibold text-gray-700 capitalize">
//                           {proposalDetails?.paymentMethod}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-[10px] uppercase font-bold">
//                           Valid Until
//                         </p>
//                         <p className="font-semibold text-orange-600">
//                           {proposalDetails?.validTill &&
//                             new Date(
//                               proposalDetails.validTill,
//                             ).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-hidden border border-gray-100 rounded-xl">
//                 <table className="min-w-full divide-y divide-gray-100">
//                   <thead className="bg-gray-50/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         Service Item
//                       </th>
//                       <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         Duration
//                       </th>
//                       <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         Amount
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {proposalDetails?.services?.map((service) => (
//                       <tr
//                         key={service._id}
//                         className="hover:bg-gray-50/50 transition-colors"
//                       >
//                         <td className="px-6 py-2">
//                           <p className="text-sm font-bold text-gray-900">
//                             {service.serviceTitle}
//                           </p>
//                           <p className="text-xs text-gray-500 line-clamp-1">
//                             {service.description}
//                           </p>
//                         </td>
//                         <td className="px-6 py-2 text-sm text-gray-600 font-medium">
//                           {service.duration}
//                         </td>
//                         <td className="px-6 py-2 text-right text-sm font-black text-gray-900">
//                           ₹{service.finalAmount?.toLocaleString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
//                   Payment
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {proposalDetails?.partlyPayment?.map((payment, idx) => (
//                     <div
//                       key={payment._id}
//                       className="relative p-4 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden group"
//                     >
//                       <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity"></div>
//                       <p className="text-[10px] font-bold text-black uppercase mb-1">
//                         {payment.paymentDuration}
//                       </p>
//                       <p className="text-lg font-black text-gray-900">
//                         ₹{payment.paymentAmount?.toLocaleString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//         <div>
//           <div>
//             <CommonForm
//               formControls={editProposalFormControl}
//               formData={proposalFormData}
//               setFormData={setProposalFormData}
//             />
//           </div>
//           <div>
//             <CommonForm
//               formControls={ServiceFormControl}
//               formData={
//                 editProposalServiceId
//                   ? proposalServiceEditData
//                   : serviceFormData
//               }
//               setFormData={
//                 editProposalServiceId
//                   ? setProposalServiceEditData
//                   : setServiceFormData
//               }
//               onSubmit={
//                 editProposalServiceId
//                   ? handleEditProposalService
//                   : handleService
//               }
//               buttonText={
//                 editProposalServiceId ? "Edit Service" : "Add Service"
//               }
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditPropsal;


import React from 'react'

const EditPropsal = () => {
  return (
    <div>EditPropsal</div>
  )
}

export default EditPropsal