import ClientHistory from "./ClientHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteClient from "./DeleteClient";

const page = async ({ params }) => {
  const { id } = await params;
  return (
    <>
      <Tabs defaultValue="history" className="">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="deleteCustomer">Delete Customer</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className={"w-full"}>
          <ClientHistory customerId={id} />
        </TabsContent>
        <TabsContent value="deleteCustomer">
          <DeleteClient />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default page;
