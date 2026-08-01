import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { TrendingUp, PieChart, ShieldCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsCharts({ spendingData }) {
  if (!spendingData) {
    return (
      <div className="p-8 text-center text-slate-400">Loading spending analytics...</div>
    );
  }

  const { categoryBreakdown = {}, monthlyBreakdown = {}, statusDistribution = {} } = spendingData;

  // Prepare Category Doughnut Data
  const categoryLabels = Object.keys(categoryBreakdown);
  const categoryValues = Object.values(categoryBreakdown);
  const categoryChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
    datasets: [
      {
        label: 'Spending ($)',
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: [
          '#3b82f6', // Brand Blue
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#8b5cf6', // Purple
          '#ec4899', // Pink
          '#06b6d4', // Cyan
          '#64748b', // Slate
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Prepare Monthly Bar Data
  const monthlyLabels = Object.keys(monthlyBreakdown);
  const monthlyValues = Object.values(monthlyBreakdown);
  const monthlyChartData = {
    labels: monthlyLabels.length > 0 ? monthlyLabels : ['Current Month'],
    datasets: [
      {
        label: 'Monthly Expenditure ($)',
        data: monthlyValues.length > 0 ? monthlyValues : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 8,
      },
    ],
  };

  // Prepare Status Pie Data
  const statusChartData = {
    labels: ['Active', 'Expiring Soon (30d)', 'Expired'],
    datasets: [
      {
        data: [
          statusDistribution.Active || 0,
          statusDistribution['Expiring Soon'] || 0,
          statusDistribution.Expired || 0,
        ],
        backgroundColor: [
          '#10b981', // Green
          '#f59e0b', // Yellow
          '#ef4444', // Red
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Warranty Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time visualization of equipment investment and warranty lifecycle health.
          </p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Spending Trend Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Monthly Spending Overview</h3>
          </div>
          <div className="h-64">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown Doughnut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Expenditure by Category</h3>
          </div>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Warranty Status Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2 max-w-lg mx-auto w-full">
          <div className="flex items-center space-x-2 justify-center">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Warranty Health Breakdown</h3>
          </div>
          <div className="h-64">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
