import SrAttachment from "@/components/sales-dashboard/auth-role/sr-manager/client/SrAttachment";
import InvoiceList from "@/components/sales-dashboard/auth-role/sr-manager/invoice/InvoiceList";
import LedgerDetails from "@/components/sales-dashboard/auth-role/sr-manager/ledger/LedgerDetails";
import CreateProposal from "@/components/sales-dashboard/auth-role/sr-manager/proposal/createProposal";
import CustomerTab from "@/components/sales-dashboard/client/CustomerTab";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientDetails = ({ customerId }) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
        </TabsList>
        <TabsContent value="Customer">
          <CustomerTab customerId={customerId} />
        </TabsContent>
        <TabsContent value="proposal">
          <CreateProposal customerId={customerId} />
        </TabsContent>
        <TabsContent value="meeting">
          <UpdateTab customerId={customerId} />
        </TabsContent>
        <TabsContent value="invoice">
          <InvoiceList customerId={customerId} />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerDetails customerId={customerId} />
        </TabsContent>
        <TabsContent value="attachment">
        <SrAttachment clientId={customerId}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
