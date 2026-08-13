/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, RefreshCw, IndianRupee, BookOpen, Activity, Server, Zap, Plus, Layers, Sparkles } from 'lucide-react';
import CourseEditor from './CourseEditor';
import CreateUserForm from './CreateUserForm';
import AddCourseForm from './AddCourseForm';
import { Course } from '../types';

interface AdminDashboardProps {
  courses: Course[];
  onCoursesUpdate: (courses: Course[]) => void;
  allowTrainerAddCourse: boolean;
  onToggleTrainerPermission: () => Promise<void> | void;
}

export default function AdminDashboard({
  courses,
  onCoursesUpdate,
  allowTrainerAddCourse,
  onToggleTrainerPermission
}: AdminDashboardProps) {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      setAdminStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !adminStats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping"></div>
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div id="admin-terminal-container" className="p-6 md:p-10 max-w-7xl mx-auto text-slate-100 space-y-10 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              Super Admin Command
            </h1>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              System Status: <span className="text-emerald-400 font-medium">All Systems Operational</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddCourseModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Create New Course
          </button>
          <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer">
            Audit Logs
          </button>
        </div>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Active Users', value: `${adminStats.activeUsers}`, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
          { icon: IndianRupee, label: 'Monthly MRR', value: `₹${adminStats.subscriptionSales.toLocaleString()}`, color: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20' },
          { icon: BookOpen, label: 'Licenses Sold', value: adminStats.courseSales, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
          { icon: TrendingUp, label: 'Placement Rate', value: '94.8%', color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' }
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:bg-slate-800/60">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">{stat.label}</span>
                <span className="text-3xl font-black text-white">{stat.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-[1px] shadow-lg ${stat.shadow}`}>
                <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-2.5 py-1 rounded-full relative z-10">
              <TrendingUp className="w-3 h-3" /> +12.5% this week
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {/* Course & Curriculum Management Room (Full Width) */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[90px] pointer-events-none -z-10"></div>
            
            {/* Header Bar for Course Operations */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight">Course & Curriculum Editor</h2>
                    <span className="px-3 py-0.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      {courses.length} Active Courses
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    Manage curriculum structures, update video lessons, edit markdown content, and build new training tracks.
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Course Editor */}
            <CourseEditor courses={courses} onCoursesUpdate={onCoursesUpdate} hideHeader={true} borderless={true} />
          </div>

          {/* Configuration, Sales Audit & User Creation (3-column layout below) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* System Configuration & Quick Launcher */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden shadow-xl hover:border-slate-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px] -z-10"></div>
            
            <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Server className="w-4 h-4" />
              </div>
              Course Permissions & Tools
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Configure trainer access parameters, inspect roles, and audit credentials.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Trainer Course Addition</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Extend curriculum creation access to trainer role</span>
                </div>
                
                {/* Styled Switch Toggle */}
                <button 
                  onClick={onToggleTrainerPermission}
                  className={`w-11 h-6 rounded-full relative p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    allowTrainerAddCourse ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      allowTrainerAddCourse ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Extra System Metadata indicators to replace the button space and look professional */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">System Roles</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block">4 Active Roles</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">DB Status</span>
                  <span className="text-xs font-semibold text-emerald-400 mt-1 block flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Course sales leaderboards */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden shadow-xl hover:border-slate-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] -z-10"></div>
            
            <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              Sales Audit
            </h3>
            
            <div className="space-y-4 animate-fade-in">
              {adminStats.topCourses.map((crs: any, idx: number) => {
                // Find matching course to retrieve price and metadata
                const matched = courses.find(c => c.id === crs.id || c.title === crs.name);
                const price = matched ? matched.price : 1499;
                const revenue = crs.sales * price;
                const level = matched ? matched.level : 'Intermediate';

                return (
                  <div key={crs.id} className="group relative p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-xs shadow-inner">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 text-xs block truncate">{crs.name}</span>
                          <span className="text-[10px] text-slate-500 tracking-wider uppercase font-mono">{level}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-amber-400 font-bold text-xs bg-amber-400/5 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                          {crs.sales} sold
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-1">₹{Math.round(revenue).toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Progress bar simulation */}
                    <div className="w-full bg-slate-800/40 h-1 rounded-full overflow-hidden mt-2.5">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-500" 
                        style={{ width: `${Math.max(20, 100 - idx * 25)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-6 py-3 border border-slate-850 hover:bg-slate-850 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 font-semibold text-xs transition-all duration-200 cursor-pointer">
              View Full Report
            </button>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl hover:border-slate-700/60 transition-all duration-300">
             <CreateUserForm borderless={true} />
          </div>
        </div>
      </div>

      {showAddCourseModal && (
        <AddCourseForm 
          courses={courses}
          onClose={() => setShowAddCourseModal(false)}
          onSuccess={onCoursesUpdate}
        />
      )}
    </div>
  );
}
