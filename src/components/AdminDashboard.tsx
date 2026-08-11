/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Database, Users, TrendingUp, RefreshCw, Terminal, IndianRupee, BookOpen, ChevronRight, Activity, Server, Zap, Plus } from 'lucide-react';
import { DATABASE_SCHEMA_DDL } from '../data';
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
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ddl' | 'tables'>('ddl');
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

  const schemaTables = [
    { name: 'users', desc: 'Master accounts, login credentials, streak logs, profile levels, and gamified XP.' },
    { name: 'roles & permissions', desc: 'Granular access control permissions matching (Super Admin, Trainer, Student, Corporate Admin).' },
    { name: 'courses, modules', desc: 'Maintains catalog structures, video player resources, metadata, and progress ticks.' },
    { name: 'assessments', desc: 'Stores HackerRank MCQ sheets, negative marking multipliers, scenario configurations.' },
    { name: 'coding_problems', desc: 'Maintains LeetCode algorithmic test suites, runtime limits, compiler indicators.' },
    { name: 'internships', desc: 'Saves Co-op progress logs, student task descriptions, and mentor ratings.' },
    { name: 'jobs & applications', desc: 'Maintains hiring portal pipelines, resumes uploaded, recruiter status codes.' }
  ];

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
          <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer">
            Audit Logs
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 cursor-pointer">
            <Zap className="w-4 h-4" /> Generate Report
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Relational DB & Sales */}
        <div className="lg:col-span-2 space-y-8">
          {/* Relational Database Explorer Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-inner">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Enterprise Schema</h3>
                  <p className="text-slate-400 text-sm mt-1">Physical Postgres infrastructure map.</p>
                </div>
              </div>

              <div className="flex bg-slate-950/80 rounded-xl p-1.5 border border-slate-800 backdrop-blur-md">
                <button
                  onClick={() => setActiveSchemaTab('ddl')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeSchemaTab === 'ddl' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  DDL Source
                </button>
                <button
                  onClick={() => setActiveSchemaTab('tables')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeSchemaTab === 'tables' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Logical View
                </button>
              </div>
            </div>

            {activeSchemaTab === 'ddl' ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0d1117]/90 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-3">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-mono tracking-wider">schema.sql</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                    {DATABASE_SCHEMA_DDL}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schemaTables.map((tbl, idx) => (
                  <div key={idx} className="group p-5 bg-slate-950/50 backdrop-blur-sm border border-slate-800/80 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 hover:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-indigo-400 font-mono text-sm tracking-tight">{tbl.name}</h4>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{tbl.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-xl">
            <CourseEditor courses={courses} onCoursesUpdate={onCoursesUpdate} />
          </div>
        </div>

        {/* Right Column: Forms & Audit */}
        <div className="space-y-8">
          {/* System Configuration & Course Creation Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -z-10"></div>
            
            <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Server className="w-5 h-5 text-indigo-400" />
              </div>
              Course Permissions & Tools
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Configure trainer access parameters and build new modules.
            </p>

            {/* Course Addition Trigger */}
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Course
            </button>

            <div className="border-t border-slate-800/80 my-5 pt-5">
              <div className="flex items-center justify-between">
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
            </div>
          </div>

          {/* Course sales leaderboards */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -z-10"></div>
            
            <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              Sales Audit
            </h3>
            
            <div className="space-y-4">
              {adminStats.topCourses.map((crs: any, idx: number) => (
                <div key={crs.id} className="group relative p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl hover:border-amber-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-300 text-xs shadow-inner">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-slate-200 text-sm">{crs.name}</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold text-sm bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      {crs.sales}
                    </span>
                  </div>
                  {/* Progress bar simulation */}
                  <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                      style={{ width: `${Math.max(20, 100 - idx * 25)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3.5 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 rounded-xl text-slate-300 font-semibold text-sm transition-all duration-300 cursor-pointer">
              View Full Report
            </button>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-xl">
             <CreateUserForm />
          </div>
        </div>
      </div>

      {showAddCourseModal && (
        <AddCourseForm 
          onClose={() => setShowAddCourseModal(false)}
          onSuccess={onCoursesUpdate}
        />
      )}
    </div>
  );
}
