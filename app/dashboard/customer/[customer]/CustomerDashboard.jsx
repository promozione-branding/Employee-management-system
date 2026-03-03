import CustomerProposal from "../CustomerProposal";
import AllInvoice from "../invoice/AllInvoice";
import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LedgerDetails from "../ledger/LedgerDetails";
import MeetingDashboard from "../meeting/MeetingDashboard";
import MeetingHistory from "../meeting/meetingHistory/MeetingHistory";
import HistoryPage from "../history/page";
import Attachment from "@/components/admin-dashboard/tabs/Attachment";

const CustomerDashboard = ({ customerId, salesPersonId }) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="invoice">invoice</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="meetingHistory">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
        </TabsList>
        <TabsContent value="Customer">
          <Customer customerId={customerId} />
        </TabsContent>
        <TabsContent value="invoice">
          <AllInvoice customerId={customerId} />
        </TabsContent>
        <TabsContent value="proposal">
          <CustomerProposal customerId={customerId} />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerDetails customerId={customerId} />
        </TabsContent>
        <TabsContent value="meeting">
          <MeetingDashboard
            customerId={customerId}
            salesPersonId={salesPersonId}
          />
        </TabsContent>
        <TabsContent value="meetingHistory">
          <HistoryPage customerId={customerId} />
          {/* <MeetingHistory customerId={customerId} /> */}
        </TabsContent>
        <TabsContent value="attachment">
          <Attachment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
