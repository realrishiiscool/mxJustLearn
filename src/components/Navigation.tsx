/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Award, Terminal, FileText, Briefcase, GraduationCap, Users, ShieldAlert, Layers, KeyRound } from 'lucide-react';
import { UserRole } from '../types';

interface NavigationProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navigation({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  isAuthenticated,
  onLogout,
  onOpenLogin
}: NavigationProps) {
  
  // Navigation tabs based on authentication and user roles
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { id: 'home', label: 'Home', icon: BookOpen },
        { id: 'catalog', label: 'Course Catalog', icon: Layers },
      ];
    }

    if (currentRole === 'student') {
      return [
        { id: 'dashboard', label: 'My Dashboard', icon: GraduationCap },
        { id: 'catalog', label: 'Catalog', icon: Layers },
        { id: 'coding', label: 'Coding Arena', icon: Terminal },
        { id: 'career_paths', label: 'Career Paths', icon: Award },
        { id: 'internship_portal', label: 'Internships', icon: Briefcase },
        { id: 'resume_builder', label: 'Resume Builder', icon: FileText },
        { id: 'community', label: 'Community', icon: Users },
      ];
    }

    if (currentRole === 'trainer') {
      return [
        { id: 'trainer_dashboard', label: 'Trainer Portal', icon: Users },
        { id: 'catalog', label: 'Course Catalog', icon: Layers },
        { id: 'community', label: 'Community', icon: Users },
      ];
    }

    if (currentRole === 'super_admin') {
      return [
        { id: 'admin_dashboard', label: 'Admin Terminal', icon: ShieldAlert },
        { id: 'catalog', label: 'Manage Catalog', icon: Layers },
        { id: 'community', label: 'Community', icon: Users },
      ];
    }

    if (currentRole === 'corporate_admin') {
      return [
        { id: 'corporate_dashboard', label: 'Corporate Office', icon: KeyRound },
        { id: 'catalog', label: 'Course Licensing', icon: Layers },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside id="sidebar-navigation" className="w-64 bg-slate-900/50 border-r border-slate-800 text-slate-100 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="font-extrabold text-sm tracking-wide text-white">MX</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">JustLearn</h1>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">BY MX INFOTECH</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Upgrader Panel & Role Selector & User Actions Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-4">
        {/* Career Accelerator Promo from Design Template */}
        <div className="p-3.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
          <p className="text-[10px] text-indigo-300 font-bold mb-1 tracking-wider uppercase">CAREER ACCELERATOR</p>
          <p className="text-[10px] text-slate-450 leading-tight mb-2.5">Unlock placement support & AI Mentorship</p>
          <button 
            onClick={() => setActiveTab('catalog')} 
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-[10px] transition duration-150 cursor-pointer"
          >
            Upgrade Plan
          </button>
        </div>

        {/* Dynamic Sandbox Role Toggle */}
        <div>
          <label className="block text-[9px] font-mono tracking-wider text-slate-500 mb-1.5">SANDBOX ROLE SWITCH</label>
          <select
            id="role-sandbox-select"
            value={currentRole}
            onChange={(e) => {
              setCurrentRole(e.target.value as UserRole);
              // Auto route to respective home
              if (e.target.value === 'student') setActiveTab('dashboard');
              else if (e.target.value === 'trainer') setActiveTab('trainer_dashboard');
              else if (e.target.value === 'super_admin') setActiveTab('admin_dashboard');
              else if (e.target.value === 'corporate_admin') setActiveTab('corporate_dashboard');
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg text-[11px] py-1.5 px-2 text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="student">Student / Fresher</option>
            <option value="trainer">Trainer / Mentor</option>
            <option value="super_admin">Super Admin</option>
            <option value="corporate_admin">Corporate Admin</option>
          </select>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">{dbUserSample(currentRole)}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">{currentRole.replace('_', ' ')}</span>
            </div>
            <button
              id="logout-btn"
              onClick={onLogout}
              className="px-2 py-1 text-[10px] font-semibold text-red-400 bg-red-950/20 rounded-lg hover:bg-red-950/40 border border-red-900/30 transition duration-150"
            >
              Exit
            </button>
          </div>
        ) : (
          <button
            id="login-trigger-btn"
            onClick={onOpenLogin}
            className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-md shadow-indigo-600/10 transition duration-150"
          >
            Access Sandbox Logins
          </button>
        )}
      </div>
    </aside>
  );
}

// Helper to resolve nice mock usernames for testing
function dbUserSample(role: UserRole) {
  if (role === 'student') return 'Ram Prasad';
  if (role === 'trainer') return 'Dr. Arvind Swamy';
  if (role === 'super_admin') return 'Super Admin (MX)';
  if (role === 'corporate_admin') return 'HR Admin (Wipro)';
  return 'Guest Account';
}
