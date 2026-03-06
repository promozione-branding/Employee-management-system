# Employee-management-system 👥

[![Version](https://img.shields.io/npm/v/own-crm?label=version)](https://www.npmjs.com/package/own-crm)  
[![License](https://img.shields.io/github/license/Aalekh-coder/Employee-management-system)](https://github.com/Aalekh-coder/Employee-management-system/blob/main/LICENSE)

A comprehensive employee management system built with modern JavaScript technologies to streamline HR processes. It offers features like performance tracking, attendance monitoring, leave management, and detailed analytics dashboards to empower teams and managers.

## ✨ Features

- Interactive employee dashboards with performance and attendance charts  
- Department-wise employee distribution and tenure insights  
- Leave & attendance tracking with monthly reports  
- Team skills assessment and salary distribution visualization  
- Quick action buttons for adding employees, managing leave, and performance reviews  
- Real-time team member status and contact information  
- Secure authentication and role-based access (implied by dependencies)  
- Integration with calendar, reminders, and notifications  

## 🚀 Installation

1. **Clone the repository**  
```bash
git clone https://github.com/Aalekh-coder/Employee-management-system.git
cd Employee-management-system
```

2. **Install dependencies**  
Make sure you have Node.js installed (v16+ recommended). Then run:  
```bash
npm install
```

3. **Configure environment variables**  
Create a `.env` file based on `.env.example` and fill in your credentials.

4. **Run the development server**  
```bash
npm run dev
```

5. **Build for production**  
```bash
npm run build
```

6. **Start production server**  
```bash
npm start
```

## 💻 Usage

- Access the app via your browser at `http://localhost:3000` by default.  
- Use the dashboard to view employee performance trends, department stats, and attendance reports.  
- Add new employees or manage existing ones using the quick action buttons.  
- Navigate through tabs to analyze team skills, salary distribution, and leave reports.  
- Monitor recent employee activities and stay updated with announcements.  
- Use the calendar and reminders integrated within the dashboard to plan and track tasks.

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.  
Ensure code follows existing style and includes proper error handling.  
Run linting before commits:  
```bash
npm run lint
```

## 📄 License

This project is licensed under the [MIT License](https://github.com/Aalekh-coder/Employee-management-system/blob/main/LICENSE).

---

## .env.example

```env
# MongoDB connection string (replace <username>, <password>, <dbname>)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT secret for authentication (keep this secure and private)
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary credentials for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email service credentials for notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Node environment
NODE_ENV=development

# Notes:
# - Replace placeholder values with your actual credentials.
# - Keep this file secure and never commit sensitive data to public repos.
# - For Cloudinary, get API keys at https://cloudinary.com/users/register
# - For email, ensure less secure app access is enabled or use app-specific passwords if required.
```


<!-- create ledger form  -->



"use client";
import {
  createLedgerService,
  fetchingProposalsInfo,
  ledgerEntriesService,
} from "@/service/ledger";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { customerLedgerService } from "@/service/customer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loading from "@/components/layout/Loading";

const CreateLedgerPage = ({ customerId }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({});
  const [proposalDetails, setProposalDetails] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [firstLedgerEntry, setFirstLedgerEntry] = useState(false);
  const router = useRouter();

  // loading
  const [loadingForProposalInfo, setLoadingForProposalInfo] = useState(true);
  const [loadingForLedgerDetails, setLoadingForLedgerDetails] = useState(true);

  async function fetchProposalInformation() {
    try {
      const res = await fetchingProposalsInfo(proposalId);
      if (res.success) {
        setLoadingForProposalInfo(false);
        setProposalDetails(res.data);
        fetchLedgerDetails(res?.data?.clientId);
      }
    } catch (error) {
      console.log(error);
      setLoadingForProposalInfo(true);
      toast.error(
        error.message || "error while fetching the proposal Information"
      );
    }
  }

  async function fetchLedgerDetails(id) {
    try {
      const res = await customerLedgerService(id);
      if (res.success) {
        setLoadingForLedgerDetails(false);
        setLedgerData(res.data);
      }
    } catch (error) {
      console.log(error);
      setLoadingForLedgerDetails(false);
      toast.error(error.message);
    }
  }

  
  const proposalDataEntriesData =
    ledgerData?.ledger?.entries?.filter(
      (item) => item?.voucher === "Proposal"
    ) || [];

  const paymentDataList =
    ledgerData?.ledger?.entries?.filter((item) =>
      ["upi", "card", "net banking", "cheque"].includes(item?.voucher)
    ) || [];

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setFormData({});
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // for the proposal entry
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      paymentMethod,
      ...formData,
    };

    const formDataLedger = {
      customerId: proposalDetails?.clientId,
      proposalIds: (prev) => [...prev, proposalDetails?._id],

      entries: [
        {
          date: submissionData?.entryDate,
          voucher: submissionData?.paymentMethod,
          debit: 0,
          credit: 0,
          balance:
            proposalDetails?.totalAmount +
            proposalDetails?.totalAmount * 0.18 -
            (proposalDetails?.tanNo ? proposalDetails?.totalAmount * 0.02 : 0),
          particular: {
            description: `Proposal #${proposalDetails?.proposalNo}`,
            items: [
              {
                subDescription: "18% GST",
                price: proposalDetails?.totalAmount * 0.18,
              },
              {
                subDescription: "Service Amount",
                price: proposalDetails?.totalAmount,
              },
              ...(proposalDetails?.tanNo
                ? [
                    {
                      subDescription: "2% TDS",
                      price: proposalDetails?.totalAmount * 0.02,
                    },
                  ]
                : []),
              {
                subDescription: "Total Amount",
                price:
                  proposalDetails?.totalAmount +
                  proposalDetails?.totalAmount * 0.18 -
                  (proposalDetails?.tanNo
                    ? proposalDetails?.totalAmount * 0.02
                    : 0),
              },
            ],
          },
          chequeDetails:
            submissionData?.paymentMethod === "cheque"
              ? {
                  chequeNumber: submissionData?.chequeNumber,
                  accountNo: submissionData?.accountNo,
                  chequeDate: submissionData?.chequeDate,
                  chequeAmount: submissionData?.amount,
                  bankName: submissionData?.bankName,
                  branchName: submissionData?.branchName,
                  ifscCode: submissionData?.ifscCode,
                }
              : {},
          net_banking:
            submissionData?.paymentMethod === "net-banking"
              ? {
                  transactionId: submissionData?.transactionId,
                  transactionDate: submissionData?.transactionDate,
                  transactionAmount: submissionData?.amount,
                }
              : {},
          upi:
            submissionData?.paymentMethod === "upi"
              ? {
                  upi_id: submissionData?.upiId,
                  payerName: submissionData?.payerName,
                  transactionId: submissionData?.upiTransactionId,
                }
              : {},
          credit_debit_card:
            submissionData?.paymentMethod === "card"
              ? {
                  card_type: submissionData?.cardType,
                  cardLastNo: submissionData?.last4Digits,
                  bankName: submissionData?.issuingBank,
                  cardHolderName: submissionData?.cardholderName,
                }
              : {},
        },
      ],
    };

    try {
      const res = await createLedgerService(formDataLedger);
      if (res.success) {
        toast.success("Ledger Entry create successfully");
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while create ledger");
    }
  };

  // this is the main entry function
  async function handleEntrySubmit(e) {
    e.preventDefault();

    const submissionData = {
      paymentMethod,
      ...formData,
    };

    if (
      Number(submissionData?.amount) >
      ledgerData?.ledger?.entries?.at(-1)?.balance
    ) {
      toast.error(
        `Balance is less than the Amount. remaining balance ${ledgerData.ledger?.entries
          .at(-1)
          .balance.toLocaleString("en-IN")} `
      );
      return;
    }

    const formDataLedger = {
      date: submissionData?.entryDate,
      voucher: submissionData?.paymentMethod,
      debit: 0,
      credit: Number(submissionData?.amount),
      balance: Number(
        ledgerData?.ledger?.entries?.at(-1)?.balance - submissionData?.amount
      ),
      particular: {
        description: submissionData?.description,
        items: [
          {
            subDescription: "18% GST",
            price: submissionData?.amount * 0.18,
          },
          ...(proposalDetails?.tanNo
            ? [
                {
                  subDescription: "2% TDS",
                  price: submissionData?.amount * 0.02,
                },
              ]
            : []),
          {
            subDescription: "Total Amount",
            price: Number(submissionData?.amount),
          },
        ],
      },
      chequeDetails:
        submissionData?.paymentMethod === "cheque"
          ? {
              chequeNumber: submissionData?.chequeNumber,
              accountNo: submissionData?.accountNo,
              chequeDate: submissionData?.chequeDate,
              chequeAmount: submissionData?.amount,
              bankName: submissionData?.bankName,
              branchName: submissionData?.branchName,
              ifscCode: submissionData?.ifscCode,
            }
          : {},
      net_banking:
        submissionData?.paymentMethod === "net-banking"
          ? {
              transactionId: submissionData?.transactionId,
              transactionDate: submissionData?.transactionDate,
              transactionAmount: submissionData?.amount,
            }
          : {},
      upi:
        submissionData?.paymentMethod === "upi"
          ? {
              upi_id: submissionData?.upiId,
              payerName: submissionData?.payerName,
              transactionId: submissionData?.upiTransactionId,
            }
          : {},
      credit_debit_card:
        submissionData?.paymentMethod === "card"
          ? {
              card_type: submissionData?.cardType,
              cardLastNo: submissionData?.last4Digits,
              bankName: submissionData?.issuingBank,
              cardHolderName: submissionData?.cardholderName,
            }
          : {},
    };

    try {
      const res = await ledgerEntriesService(ledgerData?.ledger?._id, {
        entriesData: formDataLedger,
      });

      if (res.success) {
        setPaymentMethod("");
        setFormData({});
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while create entries");
    }
  }

  useEffect(() => {
    // fetchProposalInformation();
    if (customerId !== "") {
      fetchLedgerDetails(customerId);
    }
  }, [customerId]);

  const renderChequeForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="chequeNumber"
        >
          Cheque Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="chequeNumber"
          type="text"
          placeholder="Enter Cheque Number"
          value={formData.chequeNumber || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="chequeDate"
        >
          Cheque Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="chequeDate"
          type="date"
          value={formData.chequeDate || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="accountNo"
        >
          Account No
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="accountNo"
          type="number"
          placeholder="Enter Account No"
          value={formData.accountNo || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="bankName"
        >
          Bank Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="bankName"
          type="text"
          placeholder="Enter Bank Name"
          value={formData.bankName || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="branchName"
        >
          Branch Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="branchName"
          type="text"
          placeholder="Enter Branch Name"
          value={formData.branchName || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="ifscCode"
        >
          IFSC Code
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="ifscCode"
          type="text"
          placeholder="Enter IFSC Code"
          value={formData.ifscCode || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderNetBankingForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="transactionId"
        >
          Transaction ID / UTR
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="transactionId"
          type="text"
          placeholder="Enter Transaction ID / UTR"
          value={formData.transactionId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="transactionDate"
        >
          Transaction Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="transactionDate"
          type="date"
          value={formData.transactionDate || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderUpiForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="upiId"
        >
          UPI ID
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="upiId"
          type="text"
          placeholder="Enter UPI ID"
          value={formData.upiId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="payerName"
        >
          Payer Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="payerName"
          type="text"
          placeholder="Enter Payer Name"
          value={formData.payerName || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="upiTransactionId"
        >
          UPI Transaction ID / UTR
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="upiTransactionId"
          type="text"
          placeholder="Enter UPI Transaction ID / UTR"
          value={formData.upiTransactionId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="cardType"
        >
          Card Type
        </label>
        <select
          id="cardType"
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
          value={formData.cardType || ""}
          onChange={handleChange}
        >
          <option value="">Select Card Type</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="last4Digits"
        >
          Last 4 Digits
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="last4Digits"
          type="text"
          maxLength="4"
          placeholder="Enter Last 4 Digits"
          value={formData.last4Digits || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="issuingBank"
        >
          Issuing Bank
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="issuingBank"
          type="text"
          placeholder="Enter Issuing Bank"
          value={formData.issuingBank || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="cardholderName"
        >
          Cardholder Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="cardholderName"
          type="text"
          placeholder="Enter Cardholder Name"
          value={formData.cardholderName || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderEntryDetails = (item) => {
    if (!item) return null;

    switch (item.voucher) {
      case "cheque":
        return (
          <>
            {item.chequeDetails?.chequeNumber && (
              <div>Cheque Number : {item.chequeDetails.chequeNumber}</div>
            )}
            {item.chequeDetails?.chequeDate && (
              <div>
                Cheque Date :{" "}
                {new Date(item.chequeDetails.chequeDate).toLocaleDateString(
                  "en-GB"
                )}
              </div>
            )}
            {item.chequeDetails?.bankName && (
              <div>Bank Name : {item.chequeDetails.bankName}</div>
            )}
            {item.chequeDetails?.branchName && (
              <div>Branch Name : {item.chequeDetails.branchName}</div>
            )}
            {item.chequeDetails?.ifscCode && (
              <div>IFSC Code : {item.chequeDetails.ifscCode}</div>
            )}
          </>
        );
      case "net-banking":
        return (
          <>
            {item.net_banking?.transactionId && (
              <div>Transaction ID : {item.net_banking.transactionId}</div>
            )}
            {item.net_banking?.transactionDate && (
              <div>
                Transaction Date :{" "}
                {new Date(item.net_banking.transactionDate).toLocaleDateString(
                  "en-GB"
                )}
              </div>
            )}
          </>
        );
      case "upi":
        return (
          <>
            {item.upi?.upi_id && <div>UPI ID : {item.upi.upi_id}</div>}
            {item.upi?.payerName && (
              <div>Payer Name : {item.upi.payerName}</div>
            )}
            {item.upi?.transactionId && (
              <div>Transaction ID : {item.upi.transactionId}</div>
            )}
          </>
        );
      case "card":
        return (
          <>
            {item.credit_debit_card?.card_type && (
              <div>Card Type : {item.credit_debit_card.card_type}</div>
            )}
            {item.credit_debit_card?.cardLastNo && (
              <div>Last 4 Digits : {item.credit_debit_card.cardLastNo}</div>
            )}
            {item.credit_debit_card?.bankName && (
              <div>Issuing Bank : {item.credit_debit_card.bankName}</div>
            )}
            {item.credit_debit_card?.cardHolderName && (
              <div>
                Cardholder Name : {item.credit_debit_card.cardHolderName}
              </div>
            )}
          </>
        );
      default:
        return <div>No details available for this transaction type.</div>;
    }
  };

  return (
    <>
      {loadingForLedgerDetails ? (
        <Loading />
      ) : (
        <div className="flex gap-5 flex-col md:flex-row lg:px-20">
          <div className="p-2 md:w-1/2">
            <h1 className="text-2xl font-bold text-center mb-2">
              Transation Details
            </h1>
            <form
              className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4"
              onSubmit={handleEntrySubmit}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="paymentMethod"
                >
                  Method of Payment
                </label>
                <select
                  id="paymentMethod"
                  onChange={handlePaymentMethodChange}
                  value={paymentMethod}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
                >
                  <option value="">Select a method</option>
                  <option value="cheque">Cheque</option>
                  <option value="net-banking">Net Banking</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              {paymentMethod === "cheque" && renderChequeForm()}
              {paymentMethod === "net-banking" && renderNetBankingForm()}
              {paymentMethod === "upi" && renderUpiForm()}
              {paymentMethod === "card" && renderCardForm()}
              {paymentMethod && (
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              )}
            </form>
          </div>

          <div className="md:w-1/2 flex flex-col gap-5">
            <div>
              <div className="grid grid-cols-2 gap-2">
                {proposalDataEntriesData.length > 0 &&
                  proposalDataEntriesData.map((item) => (
                    <div
                      key={item?._id}
                      className="border p-3 rounded-lg bg-white shadow-sm"
                    >
                      <p className="font-bold text-center mb-2 border-b pb-1">
                        {item?.particular?.description?.split(" ")[1]}
                      </p>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Amount</span>
                          <span className="font-medium">
                            ₹
                            {item?.particular?.items
                              ?.find(
                                (i) => i?.subDescription === "Service Amount"
                              )
                              ?.price?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST (18%)</span>
                          <span className="font-medium">
                            ₹
                            {item?.particular?.items
                              ?.find((i) => i?.subDescription === "18% GST")
                              ?.price?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {item?.particular?.items?.find(
                          (i) => i?.subDescription === "2% TDS"
                        ) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">TDS (2%)</span>
                            <span className="font-medium">
                              ₹
                              {item?.particular?.items
                                ?.find((i) => i?.subDescription === "2% TDS")
                                ?.price?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-1 mt-1">
                          <span>Total</span>
                          <span>
                            ₹
                            {item?.particular?.items
                              ?.find(
                                (i) => i?.subDescription === "Total Amount"
                              )
                              ?.price?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="font-bold text-right mt-2">
                Proposal Total : ₹{" "}
                {proposalDataEntriesData
                  ?.reduce((acc, item) => {
                    const amount = item?.particular?.items?.find(
                      (i) => i?.subDescription === "Total Amount"
                    )?.price;
                    return acc + (amount || 0);
                  }, 0)
                  .toLocaleString("en-IN")}
              </div>
            </div>
            <div className="border-t-2">
              {ledgerData?.ledger?.entries?.length > 1 && (
                <div>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                  >
                    {paymentDataList.map((item) => (
                      <AccordionItem value={item?._id} key={item?._id}>
                        <AccordionTrigger>
                          <div className="flex gap-10 w-full text-left">
                            <div className="capitalize w-1/4">
                              {item?.voucher}
                            </div>
                            <div className="text-blue-400 w-1/4">
                              ₹ {item?.credit?.toLocaleString("en-IN")}
                            </div>
                            <div className="w-1/4">
                              {new Date(item?.date).toLocaleDateString("en-GB")}
                            </div>
                            <div className="w-1/4">
                              ₹ {item?.balance?.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-2 gap-4 text-balance">
                          {renderEntryDetails(item)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateLedgerPage;


mongodb+srv://aalekhdb:HLP5wHDMZSAdri3m@cluster0.imxvstt.mongodb.net/