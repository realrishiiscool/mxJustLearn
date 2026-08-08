/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, UserProfile, Course } from './types';
import Navigation from './components/Navigation';
import PublicPages from './components/PublicPages';
import StudentDashboard from './components/StudentDashboard';
import CodingArena from './components/CodingArena';
import TrainerDashboard from './components/TrainerDashboard';
import AdminDashboard from './components/AdminDashboard';
import CorporateAdminDashboard from './components/CorporateAdminDashboard';
import CoursePlayer from './components/CoursePlayer';
import AssessmentEngine from './components/AssessmentEngine';
import AuthModal from './components/AuthModal';

export default function App() {
  // Current logged role or public state
  const [currentRole, setCurrentRole] = useState<UserRole | 'public'>('public');

  // Currently authenticated profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-01',
    name: 'Ram Prasad',
    email: 'ramprasadsuthi@gmail.com',
    phone: '+91 98765 43210',
    college: 'MX University of Science',
    qualification: 'B.Tech CS / Fresher',
    careerGoal: 'Java Full Stack & Gen AI Solutions',
    skills: ['Java', 'HTML', 'SQL'],
    streak: 4,
    xpPoints: 340,
    coins: 45,
    role: 'student',
    subscription: 'standard',
    completedCourses: []
  });

  // Track enrolled courses (initialized with one active course)
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(['course-01']);

  // Active playing view tracking
  const [activePlayCourse, setActivePlayCourse] = useState<Course | null>(null);
  
  // Active assessment tracking
  const [activeAssessmentCourseId, setActiveAssessmentCourseId] = useState<string | null>(null);

  // Selected course for preview/details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Active top level tab selected in Navigation
  const [activeTab, setActiveTab] = useState('home');

  // Auth Modal Visibility
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleEnrollCourse = (courseId: string) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId]);
    }
  };

  return (
    <div id="mx-justlearn-app" className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-300">
      
      {/* 1. Video Player Overlays */}
      {activePlayCourse && (
        <CoursePlayer
          course={activePlayCourse}
          onClose={() => setActivePlayCourse(null)}
        />
      )}

      {/* 2. Assessment engine overlay */}
      {activeAssessmentCourseId && (
        <AssessmentEngine
          courseId={activeAssessmentCourseId}
          profile={profile}
          setProfile={setProfile}
          onClose={() => setActiveAssessmentCourseId(null)}
        />
      )}

      {/* 3. Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setProfile(prev => ({ ...prev, ...user, id: user.id || prev.id }));
            setCurrentRole(user.role || 'student');
            setActiveTab(user.role === 'student' ? 'dashboard' : `${user.role}_dashboard`);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Render Main App Dashboard Layout */}
      {!activePlayCourse && !activeAssessmentCourseId && (
        <div className="flex min-h-screen">
          
          {/* SIDE-NAVIGATION & WORKSPACE SWITCHER ROLE PANEL */}
          <Navigation
            currentRole={currentRole === 'public' ? 'student' : currentRole}
            setCurrentRole={(role) => {
              setCurrentRole(role);
              if (role === 'student') {
                setActiveTab('student_dashboard');
              } else if (role === 'trainer') {
                setActiveTab('trainer_dashboard');
              } else if (role === 'super_admin') {
                setActiveTab('admin_dashboard');
              } else if (role === 'corporate_admin') {
                setActiveTab('corporate_dashboard');
              }
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAuthenticated={currentRole !== 'public'}
            onLogout={() => {
              setCurrentRole('public');
              setActiveTab('home');
            }}
            onOpenLogin={() => {
              setShowAuthModal(true);
            }}
          />

          {/* MAIN CHASSIS PANELS */}
          <main className="flex-1 min-w-0 h-screen overflow-y-auto">
            {/* TOP HEADER */}
            <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-end items-center shadow-sm">
              {currentRole === 'public' ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="py-2 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-indigo-600/20 transition duration-300 transform hover:-translate-y-0.5"
                >
                  Login / Register
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-100">{profile.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{currentRole.replace('_', ' ')}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase">
                    {profile.name ? profile.name.charAt(0) : 'U'}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRole('public');
                      setActiveTab('home');
                    }}
                    className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/20 rounded-lg hover:bg-red-950/40 border border-red-900/30 transition duration-150"
                  >
                    Logout
                  </button>
                </div>
              )}
            </header>
            
            <div className="pb-16">
            
            {/* PUBLIC VIEWPORT */}
            {currentRole === 'public' && (
              <PublicPages
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedCourse={selectedCourse}
                onSelectCourse={setSelectedCourse}
                onEnroll={handleEnrollCourse}
                enrolledCourses={enrolledCourses}
              />
            )}

            {/* AUTHORIZED WORKSPACES */}
            {currentRole !== 'public' && (
              <div>
                {/* 1. STUDENT WORKSPACE */}
                {currentRole === 'student' && (
                  <div>
                    {(activeTab === 'home' || activeTab === 'catalog') && (
                      <PublicPages
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedCourse={selectedCourse}
                        onSelectCourse={setSelectedCourse}
                        onEnroll={handleEnrollCourse}
                        enrolledCourses={enrolledCourses}
                      />
                    )}
                    {(activeTab === 'dashboard' || activeTab === 'resume_builder' || activeTab === 'career_paths' || activeTab === 'internship_portal' || activeTab === 'community') && (
                      <StudentDashboard
                        profile={profile}
                        setProfile={setProfile}
                        enrolledCourses={enrolledCourses}
                        onEnrollCourse={handleEnrollCourse}
                        onLaunchPlayer={(course) => setActivePlayCourse(course)}
                        onLaunchAssessment={(cId) => setActiveAssessmentCourseId(cId)}
                        setActiveTab={setActiveTab}
                        activeTab={activeTab}
                      />
                    )}
                    {activeTab === 'coding' && (
                      <CodingArena
                        profile={profile}
                        setProfile={setProfile}
                      />
                    )}
                  </div>
                )}

                {/* 2. TRAINER WORKSPACE */}
                {currentRole === 'trainer' && (
                  <div>
                    {activeTab === 'trainer_dashboard' && <TrainerDashboard />}
                    {activeTab === 'catalog' && (
                      <PublicPages
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedCourse={selectedCourse}
                        onSelectCourse={setSelectedCourse}
                        onEnroll={handleEnrollCourse}
                        enrolledCourses={enrolledCourses}
                      />
                    )}
                  </div>
                )}

                {/* 3. SUPER ADMIN COMMAND WORKSPACE */}
                {currentRole === 'super_admin' && (
                  <div>
                    {activeTab === 'admin_dashboard' && <AdminDashboard />}
                    {activeTab === 'catalog' && (
                      <PublicPages
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedCourse={selectedCourse}
                        onSelectCourse={setSelectedCourse}
                        onEnroll={handleEnrollCourse}
                        enrolledCourses={enrolledCourses}
                      />
                    )}
                  </div>
                )}

                {/* 4. CORPORATE HR TRAINING WORKSPACE */}
                {currentRole === 'corporate_admin' && (
                  <div>
                    {activeTab === 'corporate_dashboard' && <CorporateAdminDashboard />}
                    {activeTab === 'catalog' && (
                      <PublicPages
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedCourse={selectedCourse}
                        onSelectCourse={setSelectedCourse}
                        onEnroll={handleEnrollCourse}
                        enrolledCourses={enrolledCourses}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
