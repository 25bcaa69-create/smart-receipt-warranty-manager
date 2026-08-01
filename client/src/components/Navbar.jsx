import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LayoutDashboard, FileText, PieChart, LogOut, PlusCircle, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenUploadModal, onOpenProfileModal }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                SmartReceipt
              </span>
              <span className="text-xs text-brand-600 font-medium">Warranty Manager</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-brand-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'receipts'
                  ? 'bg-white text-brand-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Receipts</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-brand-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Action Controls & User Profile */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Receipt</span>
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onOpenProfileModal}
                title="View Profile Details"
                className="hidden lg:flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span className="truncate max-w-[120px]">{user?.name || user?.email}</span>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Subnav Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-3 ${activeTab === 'dashboard' ? 'text-brand-600 font-bold' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex flex-col items-center py-1 px-3 ${activeTab === 'receipts' ? 'text-brand-600 font-bold' : 'text-slate-500'}`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            Receipts
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 px-3 ${activeTab === 'analytics' ? 'text-brand-600 font-bold' : 'text-slate-500'}`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
}
