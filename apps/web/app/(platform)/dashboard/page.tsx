"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
  CalendarIcon,
  UsersIcon,
  DollarIcon,
  TrendingUpIcon,
  UserAddIcon,
  CurrencyIcon,
  EventIcon,
  LightningIcon,
  ChartLineIcon,
  ChartBarIcon,
} from "@/components/dashboard/icons";
import { AreaChart, LineChart } from "@/components/charts";

export default function DashboardPage() {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "revenue", label: "Revenue" },
    { id: "users", label: "Users" },
    { id: "events", label: "Events" },
  ];

  // Revenue trend data (Sep to Oct - descending trend)
  const revenueData = [2000, 1900, 1700, 1500, 1300, 1100, 800];
  
  // User growth data (Jun to Sep - smooth growth curve)
  const userGrowthData = [0, 20, 45, 75, 115, 140, 165, 175, 180];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Comprehensive overview of your platform's performance"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard" },
          ]}
        />

        {/* Tabs */}
        <DashboardTabs tabs={tabs} defaultTab="overview" />

        {/* Top Stats - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <StatCard
            title="Total Events"
            value="31"
            icon={<CalendarIcon className="w-5 h-5 text-gray-500" />}
            trend={{ value: "+12.5% from last period", isPositive: true }}
            iconBgColor="bg-gray-50"
          />
          <StatCard
            title="Total Users"
            value="297"
            icon={<UsersIcon className="w-5 h-5 text-gray-500" />}
            trend={{ value: "-57.4% from last period", isPositive: false }}
            iconBgColor="bg-gray-50"
          />
          <StatCard
            title="Total Revenue"
            value="$2,380.50"
            icon={<DollarIcon className="w-5 h-5 text-gray-500" />}
            trend={{ value: "-55.9% from last period", isPositive: false }}
            iconBgColor="bg-gray-50"
          />
          <StatCard
            title="Conversion Rate"
            value="248%"
            icon={<TrendingUpIcon className="w-5 h-5 text-gray-500" />}
            iconBgColor="bg-gray-50"
          />
        </div>

        {/* Secondary Stats - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            title="Today's Registrations"
            value="42"
            icon={<UserAddIcon className="w-5 h-5 text-gray-500" />}
            iconBgColor="bg-gray-50"
          />
          <StatCard
            title="Today's Revenue"
            value="$50.00"
            icon={<CurrencyIcon className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-50"
          />
          <StatCard
            title="Upcoming Events"
            value="3"
            icon={<EventIcon className="w-5 h-5 text-purple-600" />}
            iconBgColor="bg-purple-50"
          />
          <StatCard
            title="Pending Payments"
            value="102"
            icon={<LightningIcon className="w-5 h-5 text-orange-600" />}
            iconBgColor="bg-orange-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Trend"
            subtitle="Monthly revenue over time"
            icon={<ChartLineIcon className="w-5 h-5" />}
          >
            <div className="h-64">
              <AreaChart
                data={revenueData}
                width={520}
                height={240}
                gradientId="revenueGradient"
                stroke="#5b8def"
                fillFrom="#5b8def"
                fillTo="#93c5fd"
                labels={["Sep", "", "", "", "", "", "Oct"]}
                className="w-full h-full"
              />
            </div>
          </ChartCard>

          <ChartCard
            title="User Growth"
            subtitle="New users over time"
            icon={<ChartBarIcon className="w-5 h-5" />}
          >
            <div className="h-64">
              <LineChart
                data={userGrowthData}
                width={520}
                height={240}
                stroke="#10b981"
                labels={["Jun", "", "Jul", "", "Aug", "", "Sep", "", ""]}
                className="w-full h-full"
              />
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
