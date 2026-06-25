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
              setCurrentRole('student');
              setActiveTab('student_dashboard');
            }}
          />

          {/* MAIN CHASSIS PANELS */}
          <main className="flex-1 min-w-0 pb-16">
            
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

          </main>
        </div>
      )}
    </div>
  );
}
