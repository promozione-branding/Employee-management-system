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
"use client";

import Loading from "@/components/layout/Loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProposalDetail } from "@/service/customer/proposal";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createServicesService,
  deleteService,
  editService,
  fetchProposalServiceById,
  getAllService,
} from "@/service/service";
import { Edit, Trash } from "lucide-react";
import CommonForm from "@/components/layout/Form";
import { ServiceFormControl } from "@/config/data";
import { initalServiceFormData } from "@/config/initialFormDate";
import { Button } from "@/components/ui/button";
import { editProposalService } from "@/service/proposal";
import { useRouter } from "next/navigation";

const EditPropsal = ({ id }) => {
  const [proposalFormData, setProposalFormData] = useState({
    clientName: "",
    clientCompany: "",
    clientAddress: "",
    dateOfProposal: "",
    GSTIN: "",
    tanNo: "",
    validTill: "",
    paymentMethod: "",
  });

  const [loadingProposalDetails, setLoadingProposalDetails] = useState(true);
  const [proposalDetail, setProposalDetail] = useState({});

  const [servicesItem, setServicesItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [editProposalServiceId, setEditProposalServiceId] = useState(null);
  const [proposalServiceEditData, setProposalServiceEditData] = useState(
    initalServiceFormData,
  );
  const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);
  const router = useRouter();

  // this is the main form
  async function handleEditForm(e) {
    e.preventDefault();

    const filledItems = {};

    for (const key in proposalFormData) {
      if (Object.hasOwn(proposalFormData, key) && proposalFormData[key]) {
        filledItems[key] = proposalFormData[key];
      }
    }

    if (selectedServices.length > 0) {
      filledItems.services = selectedServices.map((item) => item._id);
    }

    // console.log(filledItems, "filledItems");

    try {
      // const res = await editProposalService(id, filledItems);
      // if (res.success) {
      //   toast.success(res.message || "Proposal Edit successfully");
      //   router.push("/dashboard/customer")
      // }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "");
    }
  }

  async function fetchProposalDetails() {
    try {
      const res = await getProposalDetail(id);
      if (res.success) {
        setProposalDetail(res.data);
        setLoadingProposalDetails(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message ||
          "Error while fetching the proposal details",
      );
    }
  }

  const handleProposalFormChange = (e) => {
    const { name, value } = e.target;
    setProposalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setProposalFormData((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  async function fetchAllServices() {
    try {
      const response = await getAllService();
      if (response.success) {
        setServicesItem(response.data);
        toast.success("All Services Fetched");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  async function handleService(e) {
    e.preventDefault();
    try {
      if (
        !serviceFormData.serviceTitle ||
        !serviceFormData.amount ||
        !serviceFormData.duration
      ) {
        toast.error("please fill the service details");
        return;
      }

      if (serviceFormData?.discountPercentage > 40) {
        toast.error("Discount can't be more than 40%");
      }

      if (
        serviceFormData.discountAmount &&
        serviceFormData.discountPercentage
      ) {
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
    const confirm = window.confirm("Are you sure to delete the service");
    if (confirm) {
      const res = await deleteService(id);
      if (res.success) {
        fetchAllServices();
      }
    }
  }

  async function getProposalServiceIdForEdit(id) {
    setEditProposalServiceId(id);

    const res = await fetchProposalServiceById(id);
    if (res.success) {
      setProposalServiceEditData(res?.data);
    }
  }

  async function handleEditProposalService(e) {
    e.preventDefault();

    try {
      const res = await editService(
        editProposalServiceId,
        proposalServiceEditData,
      );

      if (res.success) {
        toast.success("Service Updated successfully");
        setProposalServiceEditData(initalServiceFormData);
        fetchAllServices();
        setEditProposalServiceId(null);
      } else {
        toast.error(res.message || "Failed to update service");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error updating services");
    }
  }

  useEffect(() => {
    fetchProposalDetails();
    fetchAllServices();
  }, [id]);

  useEffect(() => {
    if (proposalDetail && Object.keys(proposalDetail).length > 0) {
      setSelectedServices([]);
    }
  }, [proposalDetail]);

  if (loadingProposalDetails) {
    return <Loading />;
  }

  return (
    <div className="flex gap-5">
      <div className="">
        <form onSubmit={handleEditForm}>
          <div className="grid grid-cols-2 gap-2 px-3 py-2">
            <div className="flex flex-col gap-2">
              <Label>Client Name</Label>
              <Input
                name="clientName"
                value={proposalFormData.clientName}
                onChange={handleProposalFormChange}
                placeholder="Client Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Client Company</Label>
              <Input
                name="clientCompany"
                value={proposalFormData.clientCompany}
                onChange={handleProposalFormChange}
                placeholder="Client Company"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Client Address</Label>
              <Input
                name="clientAddress"
                value={proposalFormData.clientAddress}
                onChange={handleProposalFormChange}
                placeholder="Client Address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>GSTIN</Label>
              <Input
                name="GSTIN"
                value={proposalFormData.GSTIN}
                onChange={handleProposalFormChange}
                placeholder="GSTIN"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>TAN No</Label>
              <Input
                name="tanNo"
                value={proposalFormData.tanNo}
                onChange={handleProposalFormChange}
                placeholder="TAN No"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Date Of Proposal</Label>
              <Input
                type="date"
                name="dateOfProposal"
                value={proposalFormData.dateOfProposal}
                onChange={handleProposalFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Valid Till</Label>
              <Input
                type="date"
                name="validTill"
                value={proposalFormData.validTill}
                onChange={handleProposalFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment Method</Label>
              <Select
                value={proposalFormData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="net banking">Net Banking</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className={"w-full"}>
            Edit Proposals
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 py-3 ">
          {!servicesItem.length ? (
            <div className="flex items-center justify-center bg-red-500 border-2 border-dashed border-gray-400 rounded-lg p-4 text-white hover:bg-red-500 transition-colors duration-200">
              Add some service
            </div>
          ) : (
            servicesItem.map((item) => (
              <div key={item?._id} className="flex flex-col">
                <button
                  onClick={() => handleSelectService(item)}
                  className={`group block rounded-t-lg p-4 border shadow-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    selectedServices.some((s) => s?._id === item?._id)
                      ? "bg-blue-100 border-blue-400"
                      : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors py-2">
                      {item?.serviceTitle}
                    </p>
                    {item?.description && (
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors border-t py-2">
                        {item?.description}
                      </p>
                    )}
                  </div>

                  {item?.discountPercentage ? (
                    <p>Discount Percentage : {item?.discountPercentage}%</p>
                  ) : (
                    <p>
                      Discount Amount : ₹{" "}
                      {item?.discountAmount?.toLocaleString("en-IN")}
                    </p>
                  )}

                  <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                    <span>{item?.duration}</span>
                    <span className="font-bold text-gray-700">
                      ₹ {item?.amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>

                <div className="flex justify-between px-4 py-3 border rounded-b-2xl ">
                  <div
                    onClick={() => getProposalServiceIdForEdit(item?._id)}
                    className="bg-blue-300 p-2 rounded-full cursor-pointer"
                  >
                    <Edit />
                  </div>
                  <div
                    onClick={() => handleDeleteService(item?._id)}
                    className="bg-red-300 p-2 rounded-full cursor-pointer"
                  >
                    <Trash />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-1/3">
        <CommonForm
          formControls={ServiceFormControl}
          formData={
            editProposalServiceId ? proposalServiceEditData : serviceFormData
          }
          setFormData={
            editProposalServiceId
              ? setProposalServiceEditData
              : setServiceFormData
          }
          onSubmit={
            editProposalServiceId ? handleEditProposalService : handleService
          }
          buttonText={editProposalServiceId ? "Edit Service" : "Add Service"}
        />
      </div>
    </div>
  );
};

export default EditPropsal;



here is the employee work details 



import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const body = await req.json();

//     const {
//       employeeId,
//       clientId,
//       department,
//       checklist = [],
//       status = "IN_PROGRESS",
//       progressPercentage,
//       startedAt,
//     } = body;

//     if (!employeeId || !clientId || !department) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "employeeId, clientId and department are required",
//         },
//         { status: 400 },
//       );
//     }

//     const employeeIds = Array.isArray(employeeId) ? employeeId : [employeeId];

//     // 🔒 DUPLICATE CHECK
//     const alreadyAssigned = await EmployeeWorkDetail.findOne({
//       clientId,
//       employeeId: { $in: employeeIds },
//     }).select("_id employeeId clientId");

//     if (alreadyAssigned) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "This client is already assigned to one of the selected employees",
//         },
//         { status: 409 }, // Conflict
//       );
//     }

//     // ✅ Create work detail
//     const workDetail = await EmployeeWorkDetail.create({
//       employeeId: employeeIds,
//       clientId,
//       department,
//       checklist,
//       status,
//       progressPercentage,
//       startedAt,
//     });

//     // ✅ Sync to Employee
//     await Employee.updateMany(
//       { _id: { $in: employeeIds } },
//       { $addToSet: { workDetails: workDetail._id } }, // safer than $push
//     );

//     await Customer.findByIdAndUpdate(clientId, {
//       $addToSet: { workDetails: workDetail._id },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Employee work detail created successfully",
//         data: workDetail,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Create EmployeeWorkDetail Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal Server Error",
//       },
//       { status: 500 },
//     );
//   }
// }
