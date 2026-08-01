import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, ShieldCheck, Calendar, LogOut, Lock, KeyRound } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  // Format initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Member';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleUp">
        
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 px-6 pt-8 pb-14 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-brand-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center space-y-1">
            <span className="bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-brand-100 uppercase tracking-wider inline-block">
              Account Profile
            </span>
            <h2 className="text-xl font-extrabold text-white">User Account Details</h2>
          </div>
        </div>

        {/* Floating Avatar */}
        <div className="relative px-6 -mt-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-brand-600/30 ring-4 ring-white mx-auto">
            {getInitials(user.name)}
          </div>

          <div className="mt-3 space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Profile Info List */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            
            {/* Full Name */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 font-medium">
                <User className="w-4 h-4 text-brand-600" />
                <span>Full Name</span>
              </div>
              <span className="font-bold text-slate-900">{user.name}</span>
            </div>

            {/* Email Address */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 font-medium">
                <Mail className="w-4 h-4 text-brand-600" />
                <span>Email Address</span>
              </div>
              <span className="font-bold text-slate-900">{user.email}</span>
            </div>

            {/* Membership Date */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 font-medium">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Member Since</span>
              </div>
              <span className="font-bold text-slate-900">{formatDate(user.createdAt)}</span>
            </div>

            {/* Security Status */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Status</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                JWT Authenticated
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
