import SalesNavbar from "@/components/layout/sales-dashboard/SalesNavbar";
import SalesSidebar from "@/components/layout/sales-dashboard/SalesSidebar";

export default function SalesDashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SalesSidebar />

      {/* Right Section */}
      <div className="flex flex-col flex-1">
        <SalesNavbar />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
