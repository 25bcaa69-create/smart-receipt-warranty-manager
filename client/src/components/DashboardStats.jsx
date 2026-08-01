import React from 'react';
import { Package, ShieldCheck, AlertTriangle, ShieldAlert, DollarSign } from 'lucide-react';

export default function DashboardStats({ summary, onFilterByStatus }) {
  const stats = [
    {
      id: 'all',
      title: 'Total Products',
      value: summary?.totalProducts || 0,
      icon: Package,
      gradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      filterStatus: 'All',
    },
    {
      id: 'active',
      title: 'Active Warranties',
      value: summary?.activeWarranties || 0,
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      filterStatus: 'Active',
    },
    {
      id: 'expiring',
      title: 'Expiring Soon',
      subtitle: 'Within 30 Days',
      value: summary?.expiringSoonWarranties || 0,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      filterStatus: 'Expiring Soon',
    },
    {
      id: 'expired',
      title: 'Expired Warranties',
      value: summary?.expiredWarranties || 0,
      icon: ShieldAlert,
      gradient: 'from-rose-500 to-pink-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
      filterStatus: 'Expired',
    },
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Total Spent */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-brand-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-brand-100 inline-block uppercase tracking-wider">
            Smart Receipt Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Warranty Protection & Asset Control
          </h1>
          <p className="text-sm text-brand-100/90 leading-relaxed">
            Monitor product lifecycles, receive automated email reminders, and analyze hardware expenditure with zero hassle.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center space-x-4 min-w-[220px]">
          <div className="p-3 bg-brand-500/30 rounded-xl border border-brand-400/30 text-white">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-brand-200 uppercase font-semibold tracking-wider block">
              Total Managed Assets
            </span>
            <span className="text-2xl font-bold text-white tracking-tight block">
              {formatCurrency(summary?.totalSpent)}
            </span>
          </div>
        </div>

        {/* Decorative background circle graphics */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={() => onFilterByStatus && onFilterByStatus(stat.filterStatus)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.badgeBg}`}>
                  {stat.filterStatus}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-slate-500 block">
                  {stat.title} {stat.subtitle && <span className="text-slate-400 font-normal">({stat.subtitle})</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
