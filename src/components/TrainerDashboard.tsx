/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, FileText, CheckCircle2, TrendingUp, RefreshCw, BookOpen, Star, Mail, GraduationCap, Video, Target, Lock } from 'lucide-react';
import CourseEditor from './CourseEditor';
import AddCourseForm from './AddCourseForm';
import { Course } from '../types';

interface TrainerDashboardProps {
  courses: Course[];
  onCoursesUpdate: (courses: Course[]) => void;
  allowTrainerAddCourse: boolean;
}

export default function TrainerDashboard({
  courses,
  onCoursesUpdate,
  allowTrainerAddCourse
}: TrainerDashboardProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

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
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-4 border-violet-500/20 rounded-full animate-ping"></div>
          <RefreshCw className="w-8 h-8 text-violet-500 animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div id="trainer-portal-container" className="p-6 md:p-10 max-w-7xl mx-auto text-slate-100 space-y-10 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-violet-500/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              Trainer Workspace
            </h1>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              Manage live classes, assignments, and mentor students
            </p>
          </div>
        </div>
        <button className="relative z-10 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-white/10 transition-all duration-300 flex items-center gap-2 cursor-pointer">
          <Video className="w-4 h-4" /> Start Quick Meeting
        </button>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Video, label: 'Active Lectures', value: `${classes.length} Sessions`, color: 'from-violet-500 to-purple-500' },
          { icon: Users, label: 'Students Managed', value: `${students.length} Enrolled`, color: 'from-pink-500 to-rose-500' },
          { icon: FileText, label: 'Total Assignments', value: '14 Submitted', color: 'from-blue-500 to-cyan-500' },
          { icon: Target, label: 'Avg Progress', value: '73.3% Rate', color: 'from-emerald-500 to-teal-500' }
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:bg-slate-800/60 overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity duration-300`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">{stat.label}</span>
                <span className="text-2xl font-black text-white">{stat.value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} p-[1px] shadow-lg`}>
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduler and assignment creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Live virtual classes scheduling */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl space-y-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl text-white">Schedule Lecture</h3>
          </div>
          
          <form onSubmit={handleScheduleClass} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Lecture Title</label>
              <input
                type="text"
                placeholder="e.g. Advanced React Patterns"
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 10:00 AM"
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Meeting Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/..."
                  value={newClassLink}
                  onChange={(e) => setNewClassLink(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Schedule Class
            </button>
          </form>

          {/* List scheduled classes */}
          <div className="space-y-4 pt-6 border-t border-slate-800/50">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Upcoming Sessions</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {classes.map((cls) => (
                <div key={cls.id} className="group p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-500/40 transition-all">
                  <div>
                    <h5 className="font-bold text-slate-200 text-sm">{cls.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-400 font-medium">{cls.time}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase whitespace-nowrap self-start sm:self-auto ${
                    cls.isLive 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                  }`}>
                    {cls.isLive ? (
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> LIVE NOW</span>
                    ) : 'SCHEDULED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment creations */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl space-y-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl text-white">Create Assignment</h3>
          </div>
          
          <form onSubmit={handlePostAssignment} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Build a REST API with Express"
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Due Date</label>
              <input
                type="text"
                placeholder="e.g. 2026-06-28"
                value={newAssignmentDueDate}
                onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Issue Assignment
            </button>
          </form>

          {/* Issued assignments list */}
          <div className="space-y-4 pt-6 border-t border-slate-800/50">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Active Assignments</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {assignments.map((asm) => (
                <div key={asm.id} className="group p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 hover:border-pink-500/40 transition-all">
                  <div>
                    <h5 className="font-bold text-slate-200 text-sm">{asm.title}</h5>
                    <span className="text-xs text-slate-500 font-medium block mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Due: {asm.dueDate}
                    </span>
                  </div>
                  <div className="flex flex-col items-start sm:items-end justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Graded</span>
                    <span className="font-mono text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                      {asm.gradedCount} / {asm.submittedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Addition & Roster Tools */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[50px] -z-10"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                <Video className="w-5 h-5" />
              </div>
              Course Builder Tools
            </h3>
            <p className="text-slate-400 text-xs mt-1.5">
              Assemble dynamic coding roadmaps, video resources, and lessons.
            </p>
          </div>

          <div>
            {allowTrainerAddCourse ? (
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center gap-2 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" /> Create New Course
              </button>
            ) : (
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-500">
                <Lock className="w-4 h-4 text-red-500/70" />
                <span>Course Creation Locked (Admin Permission Required)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <CourseEditor courses={courses} onCoursesUpdate={onCoursesUpdate} />
      </div>

      {/* Students Performance Grid log */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl text-white">Student Scorecards</h3>
          </div>
          <button className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors">
            View All Cohorts
          </button>
        </div>
        
        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <th className="pb-4 font-mono">Student Info</th>
                <th className="pb-4 font-mono">Course Progress</th>
                <th className="pb-4 font-mono">Assessment</th>
                <th className="pb-4 text-right font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-300 shadow-inner">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{std.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{std.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-300">Completion</span>
                        <span className="font-mono text-xs font-bold text-teal-400">{std.progress}%</span>
                      </div>
                      <div className="w-48 bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700/50">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)]" style={{ width: `${std.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                      <span className="font-bold text-slate-200 font-mono">{std.score}%</span>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <button
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl text-xs transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      Audit Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
