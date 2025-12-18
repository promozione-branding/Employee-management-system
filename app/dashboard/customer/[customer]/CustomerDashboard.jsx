import CustomerProposal from "../CustomerProposal";
import AllInvoice from "../invoice/AllInvoice";
import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LedgerDetails from "../ledger/LedgerDetails";

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
        <TabsContent value="ledger"><LedgerDetails customerId={customerId}/></TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
