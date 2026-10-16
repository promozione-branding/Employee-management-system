// app/dashboard/calling/page.jsx

import CallLogs from "@/components/admin-dashboard/calling/CallLogs";

export const metadata = {
  title: "Call Logs",
};

export default function Page() {
  return (
    <div className="p-4 md:p-6">
      <CallLogs />
    </div>
  );
}
