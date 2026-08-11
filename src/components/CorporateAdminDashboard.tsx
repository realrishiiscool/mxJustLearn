/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, Award, TrendingUp, BarChart3, 
  RefreshCw, CheckCircle, AlertCircle, Calendar, Plus, Mail
} from 'lucide-react';

export default function CorporateAdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states to invite employees / students to corporate program
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteDept, setInviteDept] = useState('Engineering Team');

  useEffect(() => {
    fetchCorpData();
  }, []);

  const fetchCorpData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/corporate/data');
      const data = await res.json();
      setEmployees(data.employees || []);
      setBudget({
        allocated: data.allocatedBudget || 0,
        spent: data.spentBudget || 0
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Invite candidate to corporate portal
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    try {
      const res = await fetch('/api/corporate/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, department: inviteDept })
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
        setInviteEmail('');
        setInviteName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !budget) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="corporate-hq-container" className="p-8 max-w-6xl mx-auto text-slate-100 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-8 h-8 text-indigo-400" />
          University & Corporate HR Portal
        </h1>
        <p className="text-slate-400 text-xs mt-1">Audit team/class training metrics, track active corporate budgets, and invite students to direct corporate paths.</p>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">ALLOCATED TRAINING BUDGET</span>
          <span className="text-2xl font-black text-white mt-1 block">₹{budget.allocated.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-550 text-[10px] font-mono font-bold uppercase tracking-wider block">SPENT TRAINING BUDGET</span>
          <span className="text-2xl font-black text-green-400 mt-1 block">₹{budget.spent.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">ACTIVE REGISTERED ROSTER</span>
          <span className="text-2xl font-black text-white mt-1 block">{employees.length} Candidates</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider block">COHORT COMPLIANCE RATE</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">85.4% Passed</span>
        </div>
      </div>

      {/* Roster & Inviter columns splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invite Form panel Left */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
          <h3 className="font-bold text-base text-slate-200">Roster Seat Invitation</h3>
          <p className="text-slate-450 text-xs leading-relaxed">Add seats for students or corporate employees. Invited candidates receive activation credentials for training paths.</p>

          <form onSubmit={handleInvite} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Ram Prasad"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Email Address</label>
              <input
                type="email"
                placeholder="e.g. ram@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Target Cohort / Department</label>
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="Engineering Team">Engineering Team</option>
                <option value="Java Bootcamp Cohort">Java Bootcamp Cohort</option>
                <option value="Data Analytics Cohort">Data Analytics Cohort</option>
              </select>
            </div>

            <button
              id="invite-member-btn"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Allocate Seat License
            </button>
          </form>
        </div>

        {/* Roster table right */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base text-slate-200">Active Allocated Roster List</h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="text-slate-550 uppercase tracking-wider text-[10px] font-mono">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Required Roadmap Progress</th>
                  <th className="pb-3 pr-2 text-right">Seat Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {employees.map((emp, i) => (
                  <tr key={i} className="text-slate-300">
                    <td className="py-3.5 pl-2">
                      <span className="font-bold block text-slate-200">{emp.name}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">{emp.email}</span>
                    </td>
                    <td className="py-3.5 text-slate-400">{emp.department}</td>
                    <td className="py-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${emp.progress}%` }} />
                        </div>
                        <span>{emp.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        emp.status === 'active' ? 'bg-green-950/40 text-green-400 border border-green-900/20' : 'bg-slate-950 text-slate-500'
                      }`}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
