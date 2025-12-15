export const addProposalFormControl = [
  {
    label: "Date Of Proposal",
    name: "dateOfProposal",
    componentType: "input",
    type: "date",
  },
  // {
  //   label: "Discount",
  //   name: "discount",
  //   componentType: "input",
  //   type: "text",
  //   placeholder: "Enter Discount",
  // },
  // {
  //   label: "Discount Percentage",
  //   name: "discountPercentage",
  //   componentType: "input",
  //   type: "text",
  //   placeholder: "Enter Discount Percentage",
  // },
  {
    label: "Valid Till",
    name: "validTill",
    componentType: "input",
    type: "date",
  },
  {
    label: "Payment Method",
    name: "paymentMethod",
    componentType: "select",
    options: [
      { id: "upi", label: "UPI" },
      { id: "card", label: "Card" },
      { id: "net banking", label: "Net Banking" },
      { id: "cheque", label: "Cheque" },
    ],
  },
];

export const addInvoiceFormControl = [
  {
    label: "Client Name",
    name: "clientName",
    componentType: "input",
    type: "text",
    placeholder: "Enter product clientName",
  },
  {
    label: "Client Company",
    name: "clientCompany",
    componentType: "input",
    type: "text",
    placeholder: "Enter product clientCompany",
  },
  {
    label: "Client Address",
    name: "clientAddress",
    componentType: "input",
    type: "text",
    placeholder: "Enter product clientAddress",
  },
  {
    label: "GSTIN",
    name: "GSTIN",
    componentType: "input",
    type: "text",
    placeholder: "Enter product GSTIN",
  },
  {
    label: "Type Of Tax",
    name: "taxType",
    componentType: "select",
    options: [
      { id: "SGST/CGST", label: "SGST/CGST" },
      { id: "IGST", label: "IGST" },
    ],
  },
];

export const addCustomerFormControl = [
  {
    label: "Client Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter Client Name",
  },
  {
    label: "Client Company",
    name: "company",
    componentType: "input",
    type: "text",
    placeholder: "Enter Client Company",
  },
  {
    label: "GST No.",
    name: "GSTIN",
    componentType: "input",
    type: "text",
    placeholder: "Enter GST No",
  },
  {
    label: "TAN No.",
    name: "tanNo",
    componentType: "input",
    type: "text",
    placeholder: "Enter Tax Deduction and Collection Account Number",
  },
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "text",
    placeholder: "Enter Email",
  },
  {
    label: "Phone no.",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter Contact No",
  },
  {
    label: "Website name",
    name: "website",
    componentType: "input",
    type: "text",
    placeholder: "Enter Website url",
  },
  {
    label: "Address",
    name: "Address",
    componentType: "input",
    type: "text",
    placeholder: "Enter client address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter client city",
  },
  {
    label: "State",
    name: "state",
    componentType: "input",
    type: "text",
    placeholder: "Enter client state",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter Pincode",
  },
  {
    label: "Country",
    name: "country",
    componentType: "input",
    type: "text",
    placeholder: "Enter country",
  },
  {
    label: "Meeting Date",
    name: "meetingDate",
    componentType: "input",
    type: "date",
  },
  {
    label: "Sales Person Email",
    name: "salesPersonEmail",
    componentType: "input",
    type: "email",
    placeholder: "Enter sales Person Email",
  },
  {
    label: "Sales Person name",
    name: "SalesPersonName",
    componentType: "input",
    type: "text",
    placeholder: "Enter Sales Person name",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "input",
    type: "text",
    placeholder: "Enter Customer notes",
  },
];

export const ServiceFormControl = [
  {
    label: "Service Title",
    name: "serviceTitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter Service Title",
  },
  {
    label: "Service Description",
    name: "description",
    componentType: "input",
    type: "text",
    placeholder: "Enter Service Description",
  },
  {
    label: "Service Discount Amount",
    name: "discountAmount",
    componentType: "input",
    type: "text",
    placeholder: "Service Discount Amount",
  },
  {
    label: "Service Discount Amount Percentage",
    name: "discountPercentage",
    componentType: "input",
    type: "text",
    placeholder: "Service Discount Amount Percentage",
  },
  {
    label: "Amount",
    name: "amount",
    componentType: "input",
    type: "text",
    placeholder: "Enter Service Amount",
  },
  {
    label: "Duration of the project",
    name: "duration",
    componentType: "select",
    options: [
      { id: "1 Month", label: "1 Month" },
      { id: "3 Month", label: "3 Month" },
      { id: "6 Month", label: "6 Month" },
      { id: "9 Month", label: "9 Month" },
      { id: "1 Year", label: "1 Year" },
      { id: "2 Year", label: "2 Year" },
      { id: "3 Year", label: "3 Year" },
    ],
  },
];

export const editFormControls = [
  {
    label: "Client Name",
    name: "clientName",
    componentType: "input",
    type: "text",
  },
  {
    label: "Client Company",
    name: "clientCompany",
    componentType: "input",
    type: "text",
  },
  {
    label: "Client Address",
    name: "clientAddress",
    componentType: "textarea",
    type: "text",
  },
  {
    label: "Date Of Proposals",
    name: "dateOfProposal",
    componentType: "input",
    type: "date",
  },
  {
    label: "GSTIN",
    name: "GSTIN",
    componentType: "input",
    type: "text",
  },
  {
    label: "Tan No",
    name: "tanNo",
    componentType: "input",
    type: "text",
    placeholder: "Enter Tan no PDES03028F",
  },
  {
    label: "Discount",
    name: "discount",
    componentType: "input",
    type: "number",
    placeholder: "Enter only one discount Amount fields",
  },
  {
    label: "Discount Percentage",
    name: "discountPercentage",
    componentType: "input",
    placeholder: "Enter only one discount Percentage discount Amount fields",
    type: "number",
  },
  {
    label: "Valid Till",
    name: "validTill",
    componentType: "input",
    type: "date",
  },
  {
    label: "Payment Method",
    name: "paymentMethod",
    componentType: "select",
    options: [
      { id: "upi", label: "UPI" },
      { id: "card", label: "Card" },
      { id: "bank", label: "Bank" },
    ],
  },
];

export const createInviceFormControls = [
  {
    label: "Tax Type",
    name: "taxType",
    componentType: "select",
    options: [
      { id: "IGST", label: "IGST" },
      { id: "SGST/CGST", label: "SGST/CGST" },
    ],
  },
  {
    label: "Date Of Invoice",
    name: "invoiceDate",
    componentType: "input",
    type: "date",
  },
];

export const createServiceForInvoice = [
  {
    label: "Service Name",
    name: "serviceName",
    componentType: "input",
    type: "text",
    placeholder: "Enter product Service Name",
  },
  {
    label: "HSN code",
    name: "HSN",
    componentType: "input",
    type: "text",
    placeholder: "Enter HSN no",
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "text",
    placeholder: "Enter Service price",
  },
];

export const registerFormControl = [
  {
    label: "Username",
    name: "username",
    componentType: "input",
    type: "text",
    placeholder: "Enter Your Username",
  },
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "email",
    placeholder: "Enter Your Email",
  },
  {
    label: "Password",
    name: "password",
    componentType: "input",
    type: "password",
    placeholder: "Enter Your Password",
  },
];

export const loginFormControl = [
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "email",
    placeholder: "Enter Your Email",
  },
  {
    label: "Password",
    name: "password",
    componentType: "input",
    type: "password",
    placeholder: "Enter Your Password",
  },
];
