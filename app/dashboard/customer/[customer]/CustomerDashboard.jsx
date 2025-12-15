import CustomerProposal from "@/components/pages/Customer/CustomerProposal";
import AllInvoice from "@/components/pages/Invoice/AllInvoice";
import Customer from "@/components/subComponents/customer/Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerDashboard = ({ customerId }) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="invoice">invoice</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="Customer">
          <Customer customerId={customerId} />
        </TabsContent>
        <TabsContent value="invoice"><AllInvoice customerId={customerId}/></TabsContent>
        <TabsContent value="proposal"><CustomerProposal customerId={customerId}/></TabsContent>
        <TabsContent value="ledger">All ledger</TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
