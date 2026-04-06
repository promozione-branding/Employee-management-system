// "use client";

// import { getClientProposalUpdateHistory } from "@/service/customer/history";
// import React, { useEffect, useState } from "react";

// const UpdateProposalHistory = ({ proposalId }) => {
//   const [loading, setLoading] = useState(true);
//   const [history, setHistory] = useState(null);

//   useEffect(() => {
//     async function fetchHistory() {
//       try {
//         const res = await getClientProposalUpdateHistory(proposalId);
//         setHistory(res.data);
//       } catch (error) {
//         console.error("Error fetching update history:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (proposalId) fetchHistory();
//   }, [proposalId]);

//   if (loading) {
//     return <div className="p-6">Loading update history...</div>;
//   }

//   if (!history || !history.changes?.length) {
//     return <div className="p-6">No update history found</div>;
//   }

//   return (
//     <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
//       <h2 className="text-xl font-semibold text-blue-600">
//         Proposal Update History
//       </h2>

//       {history.changes.map((change) => (
//         <div key={change._id} className="border rounded-xl p-4 bg-gray-50">
//           <p className="font-semibold text-gray-700 mb-2">
//             Field: {change.field}
//           </p>

//           {/* SERVICES CHANGE */}
//           {change.field === "services" ? (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm font-medium text-red-500 mb-2">
//                   Old Services
//                 </p>
//                 {change.oldValue.map((s) => (
//                   <div key={s._id} className="p-3 border rounded-lg mb-2">
//                     <p>{s.serviceTitle}</p>
//                     <p className="text-xs">₹{s.finalAmount}</p>
//                   </div>
//                 ))}
//               </div>

//               <div>
//                 <p className="text-sm font-medium text-green-600 mb-2">
//                   New Services
//                 </p>
//                 {change.newValue.map((s) => (
//                   <div key={s._id} className="p-3 border rounded-lg mb-2">
//                     <p>{s.serviceTitle}</p>
//                     <p className="text-xs">₹{s.finalAmount}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center justify-between text-sm">
//               <div className="text-red-500">
//                 <p className="font-medium">Old</p>
//                 <p>{JSON.stringify(change.oldValue)}</p>
//               </div>

//               <div className="text-gray-400">→</div>

//               <div className="text-green-600 text-right">
//                 <p className="font-medium">New</p>
//                 <p>{JSON.stringify(change.newValue)}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UpdateProposalHistory;



"use client";

import { getClientProposalUpdateHistory } from "@/service/customer/history";
import React, { useEffect, useState } from "react";

const UpdateProposalHistory = ({ proposalId }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getClientProposalUpdateHistory(proposalId);
        setHistory(res.data);
      } catch (error) {
        console.error("Error fetching update history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (proposalId) fetchHistory();
  }, [proposalId]);

  if (loading) {
    return <div className="p-6">Loading update history...</div>;
  }

  if (!history || !history.changes?.length) {
    return <div className="p-6">No update history found</div>;
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-blue-600">
        Proposal Update History
      </h2>

      {history.changes.map((change) => (
        <div
          key={change._id}
          className="border rounded-xl p-4 bg-gray-50"
        >
          <p className="font-semibold text-gray-700 mb-2">
            Field: {change.field}
          </p>

          {/* SERVICES CHANGE */}
          {change.field === "services" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-red-500 mb-2">
                  Old Services
                </p>
                {change.oldValue.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 border rounded-lg mb-2"
                  >
                    <p>{s.serviceTitle}</p>
                    <p className="text-xs">₹{s.finalAmount}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-green-600 mb-2">
                  New Services
                </p>
                {change.newValue.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 border rounded-lg mb-2"
                  >
                    <p>{s.serviceTitle}</p>
                    <p className="text-xs">₹{s.finalAmount}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : change.field === "partlyPayment" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-red-500 mb-2">
                  Old Payment
                </p>
                {change.oldValue?.length ? (
                  change.oldValue.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 border rounded-lg mb-2"
                    >
                      <p className="font-medium">{p.paymentDuration}</p>
                      <p className="text-sm">Amount: ₹{p.paymentAmount}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No previous payment</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-green-600 mb-2">
                  New Payment
                </p>
                {change.newValue?.length ? (
                  change.newValue.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 border rounded-lg mb-2"
                    >
                      <p className="font-medium">{p.paymentDuration}</p>
                      <p className="text-sm">Amount: ₹{p.paymentAmount}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No payment added</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <div className="text-red-500">
                <p className="font-medium">Old</p>
                <p>{JSON.stringify(change.oldValue)}</p>
              </div>

              <div className="text-gray-400">→</div>

              <div className="text-green-600 text-right">
                <p className="font-medium">New</p>
                <p>{JSON.stringify(change.newValue)}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UpdateProposalHistory;

