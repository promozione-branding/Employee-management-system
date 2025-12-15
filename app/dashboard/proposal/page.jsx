import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import Proposal from "./[create]/Proposal";
import AllProposal from "./all-proposal/AllProposal";

const page = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Create-Proposal">
        <TabsList>
          <TabsTrigger value="Create-Proposal">Create</TabsTrigger>
          <TabsTrigger value="Proposals">Proposals</TabsTrigger>
        </TabsList>
        <TabsContent value="Create-Proposal" className={"w-full"}><Proposal /></TabsContent>
        <TabsContent value="Proposals"><AllProposal /></TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
