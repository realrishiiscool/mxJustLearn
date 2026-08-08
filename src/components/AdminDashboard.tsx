/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Users, TrendingUp, RefreshCw, Activity, Terminal, DollarSign, Eye, BookOpen, KeyRound } from 'lucide-react';
import { DATABASE_SCHEMA_DDL } from '../data';
import CourseEditor from './CourseEditor';

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ddl' | 'tables'>('ddl');

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
    { name: 'users', desc: 'Saves master accounts, login credentials, streak logs, profile levels, and gamified XP.' },
    { name: 'roles & permissions', desc: 'Saves granular access control permissions matching (Super Admin, Trainer, Student, Corporate Admin).' },
    { name: 'courses, modules & lessons', desc: 'Maintains catalog structures, video player resources, metadata, and progress ticks.' },
    { name: 'assessments & questions', desc: 'Stores HackerRank MCQ sheets, negative marking multipliers, scenario configurations.' },
    { name: 'coding_problems & submissions', desc: 'Maintains LeetCode algorithmic test suites, runtime limits, compiler indicators.' },
    { name: 'internships & daily_reports', desc: 'Saves Co-op progress logs, student task descriptions, and mentor ratings.' },
    { name: 'jobs & job_applications', desc: 'Maintains hiring portal pipelines, resumes uploaded, recruiter status codes.' }
  ];

  if (loading || !adminStats) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="admin-terminal-container" className="p-8 max-w-6xl mx-auto text-slate-100 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            Super Admin Command Terminal
          </h1>
          <p className="text-slate-400 text-xs mt-1">Audit billing analytics, system resource pipelines, and study relational schema diagrams.</p>
        </div>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">ACTIVE SYSTEM USERS</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{adminStats.activeUsers} Members</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-600/10 border border-green-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">MONTHLY REVENUE RUNRATE</span>
            <span className="text-2xl font-black text-white mt-0.5 block">${adminStats.subscriptionSales.toLocaleString()} USD</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">PREMIUM MODULE LICENSE SALES</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{adminStats.courseSales} Sold</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">AVERAGE PLACEMENT COEFFICIENT</span>
            <span className="text-2xl font-black text-white mt-0.5 block">94.8% Success</span>
          </div>
        </div>
      </div>

      {/* Relational Database Explorer Section (Required deliverable) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white">Relational Enterprise Database Schema</h3>
              <p className="text-slate-400 text-xs mt-0.5">Physical Postgres definitions map representing production infrastructure.</p>
            </div>
          </div>

          <div className="flex gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveSchemaTab('ddl')}
              className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                activeSchemaTab === 'ddl' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
              }`}
            >
              PostgreSQL DDL Code
            </button>
            <button
              onClick={() => setActiveSchemaTab('tables')}
              className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                activeSchemaTab === 'tables' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
              }`}
            >
              Logical Tables Breakdown
            </button>
          </div>
        </div>

        {activeSchemaTab === 'ddl' ? (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 max-h-[380px] overflow-y-auto">
            <pre className="text-[10px] font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
              {DATABASE_SCHEMA_DDL}
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemaTables.map((tbl, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1">
                <h4 className="font-extrabold text-indigo-400 font-mono">TABLE: {tbl.name}</h4>
                <p className="text-slate-400 leading-relaxed">{tbl.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Editor Integrated into Admin Dashboard */}
      <CourseEditor />

      {/* Course sales leaderboards */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="font-bold text-base text-slate-200 mb-4">Core Program Sales Audit</h3>
        <div className="space-y-3 text-xs">
          {adminStats.topCourses.map((crs: any, idx: number) => (
            <div key={crs.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500">#{idx + 1}</span>
                <span className="font-bold text-slate-200">{crs.name}</span>
              </div>
              <span className="font-mono text-blue-400 font-bold">{crs.sales} Licenses Sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
