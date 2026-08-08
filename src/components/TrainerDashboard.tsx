/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, FileText, CheckCircle2, TrendingUp, RefreshCw, BarChart2, Star, Mail } from 'lucide-react';
import CourseEditor from './CourseEditor';

export default function TrainerDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassTime, setNewClassTime] = useState('');
  const [newClassLink, setNewClassLink] = useState('');

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trainer/data');
      const data = await res.json();
      setClasses(data.classes);
      setAssignments(data.assignments);
      setStudents(data.students);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Schedule dynamic class room
  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle.trim() || !newClassTime.trim()) return;
    try {
      const res = await fetch('/api/trainer/schedule-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newClassTitle, time: newClassTime, link: newClassLink || 'https://meet.google.com/abc' })
      });
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
        setNewClassTitle('');
        setNewClassTime('');
        setNewClassLink('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post assignment
  const handlePostAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim() || !newAssignmentDueDate.trim()) return;
    try {
      const res = await fetch('/api/trainer/create-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newAssignmentTitle, dueDate: newAssignmentDueDate })
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments);
        setNewAssignmentTitle('');
        setNewAssignmentDueDate('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="trainer-portal-container" className="p-8 max-w-6xl mx-auto text-slate-100 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Trainer & Mentor Command Center</h1>
        <p className="text-slate-400 text-xs mt-1">Manage active virtual lectures, post student assignments, and audit course scorecards.</p>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block tracking-wider">ACTIVE LECTURES</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">{classes.length} Sessions</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block tracking-wider">TOTAL STUDENTS UNDER MANAGEMENT</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">{students.length} Candidates</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block tracking-wider">ASSIGNMENTS SUBMITTED</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">14 Submittals</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block tracking-wider">AVERAGE COURSE PROGRESS</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">73.3% Rate</span>
        </div>
      </div>

      {/* Scheduler and assignment creation column splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: live virtual classes scheduling */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-bold text-base text-slate-200">Schedule Live Lecture Class</h3>
          
          <form onSubmit={handleScheduleClass} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Lecture Title</label>
              <input
                type="text"
                placeholder="e.g. Spring Cloud Microservice meshes..."
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 10:00 AM"
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Meeting URL Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/..."
                  value={newClassLink}
                  onChange={(e) => setNewClassLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="schedule-class-btn"
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Schedule Lecture
            </button>
          </form>

          {/* List scheduled classes */}
          <div className="space-y-3.5 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Current Scheduled Rooms</h4>
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-200">{cls.title}</h5>
                  <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">{cls.time}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  cls.isLive ? 'bg-red-950/40 text-red-400 border border-red-900/20' : 'bg-slate-900 text-slate-400'
                }`}>{cls.isLive ? 'LIVE NOW' : 'SCHEDULED'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: assignment creations */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-bold text-base text-slate-200">Issue Coding & MCQ Assignment</h3>
          
          <form onSubmit={handlePostAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Hibernate Lazy loading vs Eager SQL joins script..."
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Due Date</label>
              <input
                type="text"
                placeholder="e.g. 2026-06-28"
                value={newAssignmentDueDate}
                onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
              />
            </div>

            <button
              id="create-assignment-btn"
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Issue Assignment
            </button>
          </form>

          {/* Issued assignments list */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Issued Assignments</h4>
            {assignments.map((asm) => (
              <div key={asm.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-200">{asm.title}</h5>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Due: {asm.dueDate}</span>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-450">
                  <span>Graded: {asm.gradedCount} / {asm.submittedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Editor Integrated into Trainer Dashboard */}
      <CourseEditor />

      {/* Students Performance Grid log */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="font-bold text-base text-slate-200 mb-4">Student Progress & Scorecards</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                <th className="pb-3.5 pl-4">Name</th>
                <th className="pb-3.5">Email</th>
                <th className="pb-3.5">Progress Ratio</th>
                <th className="pb-3.5">LMS Assessment Score</th>
                <th className="pb-3.5 pr-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {students.map((std) => (
                <tr key={std.id} className="text-slate-300">
                  <td className="py-4 pl-4 font-bold text-slate-200">{std.name}</td>
                  <td className="py-4">{std.email}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${std.progress}%` }} />
                      </div>
                      <span className="font-mono text-[10px]">{std.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-green-400 font-mono">{std.score}%</td>
                  <td className="py-4 pr-4 text-right">
                    <button
                      id={`grade-student-${std.id}`}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 rounded-lg"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
