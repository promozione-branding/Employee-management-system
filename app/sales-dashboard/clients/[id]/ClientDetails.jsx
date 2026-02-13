import CustomerTab from "@/components/sales-dashboard/client/CustomerTab";
import ProposalTab from "@/components/sales-dashboard/client/ProposalTab";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientDetails = ({ customerId }) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
        </TabsList>
        <TabsContent value="Customer">
          <CustomerTab customerId={customerId} />
        </TabsContent>
        <TabsContent value="proposal">
          <ProposalTab customerId={customerId} />
        </TabsContent>
        <TabsContent value="meeting">
          <UpdateTab customerId={customerId}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
