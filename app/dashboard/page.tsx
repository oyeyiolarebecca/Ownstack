import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import RecentInvoices from "@/components/RecentInvoices";
import ActivityFeed from "@/components/ActivityFeed";
import RevenueChart from "@/components/RevenueChart";


export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex">

      <Sidebar />

      <div className="flex-1 p-8">

        <DashboardHeader />

        <StatsCards />

        <RecentInvoices />

        <ActivityFeed />

        <RevenueChart />

      </div>

    </main>
  );
}