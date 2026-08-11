/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, Trophy, Sparkles, Compass, Briefcase, FileText, 
  Video, Calendar, MessageSquare, Plus, Check, Clock, ChevronRight,
  TrendingUp, Star, Send, Bot, AlertCircle, FileCheck, CheckCircle2, RefreshCw, X, Map, BookOpen, Shield
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Course, UserProfile, Job, CommunityPost } from '../types';
import { CAREER_PATHS, JOB_LISTINGS, COMMUNITY_POSTS, STUDENT_PROJECTS } from '../data';
import ResumeBuilder from './ResumeBuilder';
import LearningRoadmap from './LearningRoadmap';
import StudentLeaderboard from './StudentLeaderboard';
import StudentBadges from './StudentBadges';

interface StudentDashboardProps {
  courses: Course[];
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  enrolledCourses: string[];
  onEnrollCourse: (courseId: string) => void;
  onLaunchPlayer: (course: Course) => void;
  onLaunchAssessment: (courseId: string) => void;
  setActiveTab: (tab: string) => void;
  activeTab?: string;
}

export default function StudentDashboard({
  courses,
  profile,
  setProfile,
  enrolledCourses,
  onEnrollCourse,
  onLaunchPlayer,
  onLaunchAssessment,
  setActiveTab,
  activeTab
}: StudentDashboardProps) {
  // Navigation inside student dashboard
  const [studentSubTab, setStudentSubTab] = useState<'overview' | 'roadmap' | 'leaderboard' | 'badges' | 'career_paths' | 'internships' | 'resume' | 'interviews' | 'jobs' | 'community'>('overview');

  // Synchronize internal state when prop activeTab changes
  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'resume_builder') {
        setStudentSubTab('resume');
      } else if (activeTab === 'career_paths') {
        setStudentSubTab('career_paths');
      } else if (activeTab === 'internship_portal') {
        setStudentSubTab('internships');
      } else if (activeTab === 'community') {
        setStudentSubTab('community');
      } else if (activeTab === 'dashboard') {
        setStudentSubTab('overview');
      }
    }
  }, [activeTab]);

  const handleSubTabChange = (tabId: typeof studentSubTab) => {
    setStudentSubTab(tabId);
    if (tabId === 'resume') {
      setActiveTab('resume_builder');
    } else if (tabId === 'career_paths') {
      setActiveTab('career_paths');
    } else if (tabId === 'internships') {
      setActiveTab('internship_portal');
    } else if (tabId === 'community') {
      setActiveTab('community');
    } else if (tabId === 'overview') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };
  
  // Dynamic State variables
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [newReportWork, setNewReportWork] = useState('');
  const [newReportHours, setNewReportHours] = useState(8);

  const [milestones, setMilestones] = useState<any[]>([]);

  const [jobApps, setJobApps] = useState<any[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // --- FLOATING AI MENTOR STATE VARIABLES & CODES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const enrolledCourseObjects = courses.filter(c => enrolledCourses.includes(c.id));
  const availableContextCourses = enrolledCourseObjects.length > 0 ? enrolledCourseObjects : courses;
  const [selectedCourseContext, setSelectedCourseContext] = useState<Course>(availableContextCourses[0] || courses[0]);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedCourseContext) {
      setChatMessages([
        {
          role: 'model',
          content: `Hello! I am your **MX-AI Mentor**.\n\nI have loaded your context for **${selectedCourseContext.title}**.\n\nAsk me anything about concepts covered in this course (such as Spring Boot, Django, databases, React), or ask for study guides and interview advice!`
        }
      ]);
    }
  }, [selectedCourseContext]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        const container = document.getElementById('chat-messages-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    }
  }, [chatMessages, isGenerating, isChatOpen]);

  const getSuggestionsForCourse = (courseId: string) => {
    switch (courseId) {
      case 'java-fs':
        return [
          'Explain JVM Memory maps vs Stack',
          'Show a Spring Boot Controller example',
          'What are Spring Security JWT filters?'
        ];
      case 'python-fs':
        return [
          'What is Django ORM and migrations?',
          'Explain python list vs tuple vs dictionary',
          'Write an async API using FastAPI'
        ];
      case 'data-science':
        return [
          'What are SQL CTEs and window functions?',
          'Explain machine learning random forests',
          'How does gradient descent work?'
        ];
      case 'ai-eng':
        return [
          'How does the Transformer attention mechanism work?',
          'Explain RAG and vector databases',
          'How do I call the Gemini API in Node.js?'
        ];
      case 'auto-test':
        return [
          'Explain XPath vs CSS Selectors',
          'How do I handle dynamic wait elements in Selenium?',
          'Write a Page Object Model pattern example'
        ];
      default:
        return [
          'Suggest a 4-week study plan',
          'Give me a mock interview question',
          'Explain the career prospects for this'
        ];
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput;
    setChatInput('');
    const updated = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(updated);
    setIsGenerating(true);

    try {
      const contextPrompt = `[Selected Course Context: ${selectedCourseContext.title} - Description: ${selectedCourseContext.description}]\n\nQuestion: ${userMsg}`;
      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextPrompt, history: historyPayload })
      });

      const data = await response.json();
      if (data.success && data.text) {
        setChatMessages(prev => [...prev, { role: 'model' as const, content: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'model' as const, 
          content: `I encountered an issue getting assistance: ${data.error || 'Unknown error'}. Please try again.` 
        }]);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'model' as const, 
        content: `Could not connect to the MX AI Mentor server. Please check your internet connection.` 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendSuggestion = async (suggestText: string) => {
    if (isGenerating) return;

    const updated = [...chatMessages, { role: 'user' as const, content: suggestText }];
    setChatMessages(updated);
    setIsGenerating(true);

    try {
      const contextPrompt = `[Selected Course Context: ${selectedCourseContext.title} - Description: ${selectedCourseContext.description}]\n\nQuestion: ${suggestText}`;
      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextPrompt, history: historyPayload })
      });

      const data = await response.json();
      if (data.success && data.text) {
        setChatMessages(prev => [...prev, { role: 'model' as const, content: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'model' as const, 
          content: `I encountered an issue: ${data.error || 'Unknown error'}. Please try again.` 
        }]);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'model' as const, 
        content: `Could not connect to the MX AI Mentor server. Please try again.` 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```|\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3);
        const lines = content.split('\n');
        let lang = 'code';
        let code = content;
        if (lines.length > 0 && lines[0].trim().length > 0 && lines[0].trim().length < 15 && !lines[0].includes(' ') && !lines[0].includes('(')) {
          lang = lines[0].trim();
          code = lines.slice(1).join('\n');
        }
        return (
          <div key={index} className="my-2 border border-slate-800 rounded-lg overflow-hidden font-mono text-[11px] bg-slate-950 text-slate-350">
            <div className="bg-slate-900 px-3 py-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider flex justify-between items-center border-b border-slate-800/60">
              <span>{lang}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition cursor-pointer"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-left leading-normal"><code>{code}</code></pre>
          </div>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-indigo-300">{part.slice(2, -2)}</strong>;
      } else {
        return part.split('\n').map((line, lineIdx) => (
          <span key={`${index}-${lineIdx}`}>
            {line}
            {lineIdx < part.split('\n').length - 1 && <br />}
          </span>
        ));
      }
    });
  };

  // Resume builder form
  const [resumeTemplate, setResumeTemplate] = useState<'fresher' | 'developer' | 'professional'>('developer');
  const [resumeGoal, setResumeGoal] = useState(profile.careerGoal || 'Java Full Stack Developer');
  const [resumeSkills, setResumeSkills] = useState(profile.skills.join(', '));
  const [resumeCollege, setResumeCollege] = useState(profile.college || 'MX College of Technology');
  const [resumeQual, setResumeQual] = useState(profile.qualification || 'B.Tech CS');
  const [aiResumeFeedback, setAiResumeFeedback] = useState('');
  const [loadingResumeCritique, setLoadingResumeCritique] = useState(false);

  // Mock Interview states
  const [interviewMode, setInterviewMode] = useState<'tech' | 'hr' | 'system_design'>('tech');
  const [interviewActive, setInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ [key: number]: string }>({});
  const [aiInterviewResult, setAiInterviewResult] = useState('');
  const [loadingInterviewEvaluate, setLoadingInterviewEvaluate] = useState(false);

  // Community thread creator
  const [comPosts, setComPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Java Full Stack Path');
  const [newPostContent, setNewPostContent] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Recharts radar data for skill metrics based on profile fields
  const radarData = [
    { subject: 'Data Structures', A: profile.skills.includes('Java') ? 85 : 40, fullMark: 100 },
    { subject: 'Web Architecture', A: profile.skills.includes('HTML') ? 80 : 35, fullMark: 100 },
    { subject: 'System Design', A: profile.experienceLevel === 'senior' ? 90 : 45, fullMark: 100 },
    { subject: 'API Integrity', A: profile.skills.includes('Java') ? 75 : 30, fullMark: 100 },
    { subject: 'Agile Testing', A: profile.skills.includes('Selenium') ? 90 : 50, fullMark: 100 },
    { subject: 'Database Design', A: profile.skills.includes('SQL') ? 85 : 45, fullMark: 100 },
  ];

  // Fetch initial profile & report states
  useEffect(() => {
    fetchReports();
    fetchMilestones();
    fetchJobApps();
  }, []);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/internships/reports');
      const data = await res.json();
      setDailyReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/projects/milestones');
      const data = await res.json();
      setMilestones(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJobApps = async () => {
    try {
      const res = await fetch('/api/jobs/applications');
      const data = await res.json();
      setJobApps(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Internship daily report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportWork.trim()) return;
    try {
      const res = await fetch('/api/internships/reports/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workDone: newReportWork, hours: newReportHours })
      });
      const data = await res.json();
      if (data.success) {
        setDailyReports(data.dailyReports);
        setProfile(data.profile);
        setNewReportWork('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit project milestone
  const handleMilestoneSubmit = async (milestoneId: string) => {
    try {
      const res = await fetch('/api/projects/milestone/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId })
      });
      const data = await res.json();
      if (data.success) {
        setMilestones(data.milestones);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle job apply
  const handleJobApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (data.success) {
        setJobApps(data.applications);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Run AI Resume Critique
  const handleResumeCritique = async (customData?: {
    qualification: string;
    college: string;
    careerGoal: string;
    skills: string[];
    experienceLevel: string;
  }) => {
    setLoadingResumeCritique(true);
    setAiResumeFeedback('');
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        qualification: customData ? customData.qualification : resumeQual,
        skills: customData ? customData.skills : resumeSkills.split(',').map(s => s.trim()),
        careerGoal: customData ? customData.careerGoal : resumeGoal,
        experienceLevel: customData ? customData.experienceLevel : profile.experienceLevel
      };
      const res = await fetch('/api/ai/resume-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setAiResumeFeedback(data.text);
      } else {
        setAiResumeFeedback('Failed to fetch AI feedback. Verify GEMINI_API_KEY settings.');
      }
    } catch (err) {
      setAiResumeFeedback('An error occurred during AI analysis.');
    } finally {
      setLoadingResumeCritique(false);
    }
  };

  // Setup Mock Interview Questions
  const getInterviewQuestions = () => {
    if (interviewMode === 'tech') {
      return [
        { q: "What is the primary difference between a processes thread HashMap and ConcurrentHashMap in Java?" },
        { q: "Describe Spring Boot dependency injection and standard bean scopes." },
        { q: "Explain how RESTful API endpoints handle asynchronous security tokens (JWT)." }
      ];
    }
    if (interviewMode === 'system_design') {
      return [
        { q: "How would you design a distributed cache system serving millions of real-time requests?" },
        { q: "Describe relational SQL database replication vs NoSQL horizontal partitioning." },
        { q: "Explain microservices circuit-breaker designs and logging frameworks." }
      ];
    }
    return [
      { q: "Describe a project conflict you experienced and how you resolved it." },
      { q: "Why are you looking to join MX Infotech as a developer?" },
      { q: "Where do you envision your tech career in five years?" }
    ];
  };

  const questions = getInterviewQuestions();

  // Run AI Interview Evaluator
  const handleInterviewSubmit = async () => {
    setLoadingInterviewEvaluate(true);
    setAiInterviewResult('');
    try {
      const answersPayload = questions.map((q, idx) => ({
        question: q.q,
        answer: interviewAnswers[idx] || "No answer provided"
      }));

      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: interviewMode, answers: answersPayload })
      });
      const data = await res.json();
      if (data.success) {
        setAiInterviewResult(data.text);
      } else {
        setAiInterviewResult('Error executing review. Ensure your server-side API is active.');
      }
    } catch (err) {
      setAiInterviewResult('Failed to reach AI evaluation engine.');
    } finally {
      setLoadingInterviewEvaluate(false);
    }
  };

  // Handle Community Threads
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const newPost: CommunityPost = {
      id: 'post-' + Date.now(),
      author: profile.name,
      authorRole: 'Student',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      comments: [],
      date: new Date().toISOString().split('T')[0]
    };
    setComPosts([newPost, ...comPosts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleLikePost = (postId: string) => {
    setComPosts(comPosts.map(p => {
      if (p.id === postId) return { ...p, likes: p.likes + 1 };
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    setComPosts(comPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            { id: 'c-' + Date.now(), author: profile.name, content: newCommentText, date: 'Today' }
          ]
        };
      }
      return p;
    }));
    setNewCommentText('');
  };

  return (
    <div id="student-dashboard-workspace" className="p-8 max-w-6xl mx-auto text-slate-100 min-h-screen">
      {/* Upper Welcomer and Streak Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-indigo-500/20">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, {profile.name}!</h1>
              <span className="text-[10px] bg-indigo-900/40 text-indigo-300 font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-500/20">
                {profile.subscription.replace('_', ' ')} tier
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Ready to unlock your full potential? Your active goal: <span className="text-slate-200 font-semibold">{profile.careerGoal}</span></p>
          </div>
        </div>

        {/* Gamified counters */}
        <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800/80 p-3 rounded-2xl shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 border-r border-slate-800">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <div>
              <span className="block font-black text-white">{profile.streak} Days</span>
              <span className="text-[9px] text-slate-500 font-medium">STREAK</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 border-r border-slate-800">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <span className="block font-black text-white">{profile.xpPoints} XP</span>
              <span className="text-[9px] text-slate-500 font-medium">TOTAL POINTS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="block font-black text-white">{profile.coins} Coins</span>
              <span className="text-[9px] text-slate-500 font-medium">REWARDS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs within Student Workspace */}
      <div id="student-workspace-subnav" className="flex items-center gap-2 border-b border-slate-800/80 mb-8 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'overview', label: 'Overview Dashboard', icon: Compass },
          { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy },
          { id: 'badges', label: 'Badges & Achievements', icon: Sparkles },
          { id: 'career_paths', label: 'Career Roadmaps', icon: Award },
          { id: 'internships', label: 'MR Tech Internships', icon: FileText },
          { id: 'resume', label: 'Resume Builder', icon: FileText },
          { id: 'interviews', label: 'AI Mock Interview', icon: Bot },
          { id: 'jobs', label: 'Placements & Jobs', icon: Briefcase },
          { id: 'community', label: 'Discussion Forum', icon: MessageSquare }
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isActive = studentSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => handleSubTabChange(subTab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all font-semibold shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-t-2 border-t-indigo-500 text-indigo-400 font-bold border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. OVERVIEW DASHBOARD SUB-TAB */}
      {studentSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left column: enrolled courses */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-4">My Enrolled Course Modules</h3>
              <div className="space-y-4">
                {enrolledCourses.map((cId) => {
                  const course = courses.find(c => c.id === cId);
                  if (!course) return null;
                  return (
                    <div key={course.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={course.thumbnailUrl} alt={course.title} referrerPolicy="no-referrer" className="w-16 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-100">{course.title}</h4>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Instructor: {course.instructor} · {course.duration}</span>
                          {/* Progress bar simulation */}
                          <div className="w-48 bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-indigo-500 h-full w-2/5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto text-xs">
                        <button
                          id={`launch-player-${course.id}`}
                          onClick={() => onLaunchPlayer(course)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg transition"
                        >
                          Play Lectures
                        </button>
                        <button
                          id={`launch-exam-${course.id}`}
                          onClick={() => onLaunchAssessment(course.id)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-lg transition"
                        >
                          Take Exam
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Project milestones portal */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-1.5">Interactive Project Milestones</h3>
              <p className="text-slate-400 text-xs mb-4">Secure completion badges by completing live capstone submissions.</p>
              
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200">{m.title}</h4>
                      {m.comment && <p className="text-[10px] text-indigo-400 mt-0.5 italic">Evaluator: "{m.comment}"</p>}
                    </div>
                    <div>
                      {m.status === 'approved' && (
                        <span className="bg-green-950/40 text-green-400 border border-green-900/30 px-2.5 py-1 rounded font-bold uppercase tracking-wide">Approved</span>
                      )}
                      {m.status === 'submitted' && (
                        <span className="bg-yellow-950/40 text-yellow-400 border border-yellow-900/30 px-2.5 py-1 rounded font-bold uppercase tracking-wide">In Review</span>
                      )}
                      {m.status === 'pending' && (
                        <button
                          id={`submit-milestone-${m.id}`}
                          onClick={() => handleMilestoneSubmit(m.id)}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded font-semibold"
                        >
                          Submit Draft
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: metrics / calendar */}
          <div className="space-y-8">
            {/* Skill metrics chart radar */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-2">Skill Progress Analytics</h3>
              <div className="h-60 mt-4 text-xs font-mono text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <Radar name={profile.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Upcoming Batches Calendar list */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-3">Live Scheduled Session Room</h3>
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Spring Security & OAuth2 Filters</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-400 text-[9px] uppercase tracking-wider font-bold">Live Room</span>
                  </div>
                  <p className="text-slate-450 mt-1.5">Primary Tutor: Dr. Arvind Swamy</p>
                  <p className="text-indigo-400 font-mono text-[10px] mt-2 block">Scheduled: Today, 4:00 PM (10 mins remain)</p>
                  <a
                    href="https://meet.google.com/abc-defg-hij"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center block mt-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded font-bold"
                  >
                    Join Room Link
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Achievements Summary Widget */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-bold text-base text-white">My Unlocked Badges</h3>
                <button 
                  onClick={() => handleSubTabChange('badges')}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badges list */}
              <div className="grid grid-cols-4 gap-3">
                {/* Badge 1: First Contact (Enrolled >= 1) */}
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  enrolledCourses.length >= 1 
                    ? 'bg-amber-950/15 border-amber-800/40 text-amber-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-650'
                }`} title="First Contact Badge: Enrolled in a course">
                  <BookOpen className="w-5 h-5 mb-1 animate-pulse" />
                  <span className="text-[8px] font-mono font-bold truncate max-w-full">Pioneer</span>
                </div>

                {/* Badge 2: Streak 3+ */}
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  profile.streak >= 3 
                    ? 'bg-amber-950/15 border-amber-800/40 text-orange-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-650'
                }`} title="Habit Builder Badge: Streak >= 3 days">
                  <Flame className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-mono font-bold truncate max-w-full">Habit</span>
                </div>

                {/* Badge 3: XP 1000+ */}
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  profile.xpPoints >= 1000 
                    ? 'bg-slate-800/30 border-slate-700 text-slate-200' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-650'
                }`} title="Elite Scholar Badge: XP >= 1,000">
                  <Star className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-mono font-bold truncate max-w-full">Scholar</span>
                </div>

                {/* Badge 4: Streak 10+ */}
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  profile.streak >= 10 
                    ? 'bg-yellow-950/10 border-yellow-800/40 text-yellow-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-650'
                }`} title="Unstoppable Momentum Badge: Streak >= 10 days">
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-mono font-bold truncate max-w-full">Momentum</span>
                </div>
              </div>

              {/* Small message info */}
              <p className="text-[10px] text-slate-400 mt-3 text-center leading-normal">
                You have unlocked <strong>{
                  (enrolledCourses.length >= 1 ? 1 : 0) + 
                  (profile.streak >= 3 ? 1 : 0) + 
                  (profile.xpPoints >= 1000 ? 1 : 0) + 
                  (profile.streak >= 10 ? 1 : 0)
                } of 4</strong> foundational placement track achievements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LEARNING ROADMAP TIMELINE & RECOMMENDATIONS */}
      {studentSubTab === 'roadmap' && (
        <LearningRoadmap
          courses={courses}
          profile={profile}
          setProfile={setProfile}
          enrolledCourses={enrolledCourses}
          onEnrollCourse={onEnrollCourse}
          onLaunchPlayer={onLaunchPlayer}
          onLaunchAssessment={onLaunchAssessment}
        />
      )}

      {/* COMPETITIVE COHORT LEADERBOARD */}
      {studentSubTab === 'leaderboard' && (
        <StudentLeaderboard
          profile={profile}
          setProfile={setProfile}
        />
      )}

      {/* GAMIFIED BADGES & ACHIEVEMENTS */}
      {studentSubTab === 'badges' && (
        <StudentBadges
          profile={profile}
          setProfile={setProfile}
          enrolledCourses={enrolledCourses}
        />
      )}

      {/* 2. CAREER LEARNING PATH ROADMAPS */}
      {studentSubTab === 'career_paths' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white">Guided Technical Career Roadmaps</h2>
            <p className="text-slate-400 text-xs mt-1">Multi-stage paths matching modern enterprise recruitment standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CAREER_PATHS.map((path) => (
              <div key={path.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
                <h3 className="font-bold text-lg text-white mb-1.5">{path.title}</h3>
                <span className="text-[10px] font-mono text-indigo-400 block mb-3 uppercase tracking-wider">Estimated: {path.duration}</span>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">{path.description}</p>
                
                {/* Steps Timeline visualizer */}
                <div className="space-y-4 border-l-2 border-slate-800 pl-4 relative text-xs">
                  {path.steps.map((step, idx) => (
                    <div key={step.id} className="relative">
                      {/* Node circle */}
                      <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-slate-900 ${
                        step.status === 'completed' ? 'border-green-500 bg-green-500' :
                        step.status === 'current' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`} />
                      <h4 className={`font-bold ${step.status === 'completed' ? 'text-green-400' : step.status === 'current' ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {idx + 1}. {step.title}
                      </h4>
                      <p className="text-slate-450 mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. INTERNSHIP & DAILY REPORT PORTAL */}
      {studentSubTab === 'internships' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-950/50 border border-indigo-900/30 text-[9px] text-indigo-400 font-bold uppercase tracking-widest font-mono rounded mb-2">
                MR TECHNOLOGIES CO-OP INTERNSHIP
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Internship Progress & Daily Reporting Portal</h2>
              <p className="text-slate-400 text-xs mb-6">Enter detailed summaries of your daily software tasks below to obtain certifications.</p>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hours Logged</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newReportHours}
                    onChange={(e) => setNewReportHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Description & Coding Activities</label>
                  <textarea
                    rows={4}
                    placeholder="Describe backend database structure changes, UI component design commits, or selenium scripts written today..."
                    value={newReportWork}
                    onChange={(e) => setNewReportWork(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <button
                  id="submit-report-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Submit Daily Report
                </button>
              </form>
            </div>

            {/* Daily report logs */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="font-bold text-base text-slate-100 mb-4">Historical Internship Logs</h3>
              <div className="space-y-4 divide-y divide-slate-800/60 text-xs">
                {dailyReports.map((report, idx) => (
                  <div key={idx} className={`${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                      <span className="text-slate-500">{report.date}</span>
                      <span className="text-indigo-400 font-semibold">{report.hours} hours logged</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{report.workDone}</p>
                    {report.feedback && (
                      <div className="mt-2 p-2.5 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-indigo-300 italic text-[10px]">
                        Mentor evaluation feedback: "{report.feedback}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
              <Trophy className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-200">Co-Op Internship Certificate</h4>
              <p className="text-slate-450 text-xs mt-2 leading-relaxed">Logged 12 hours of total verified project work. Secure certification when logged time exceeds 30 hours.</p>
              
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-4 border border-slate-850">
                <div className="bg-indigo-500 h-full w-[40%]" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-2 font-medium">12H / 30H LOGGED</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE RESUME BUILDER */}
      {studentSubTab === 'resume' && (
        <ResumeBuilder
          profile={profile}
          setProfile={setProfile}
          aiResumeFeedback={aiResumeFeedback}
          setAiResumeFeedback={setAiResumeFeedback}
          handleResumeCritique={handleResumeCritique}
          loadingResumeCritique={loadingResumeCritique}
        />
      )}

      {/* 5. AI MOCK INTERVIEW PLATFORM */}
      {studentSubTab === 'interviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">AI-Powered Mock Interviews</h2>
              <p className="text-slate-400 text-xs mt-1">Simulate real-world hiring rounds with immediate, objective reviews from Gemini 3.5.</p>
            </div>

            {!interviewActive ? (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-400">Select Mock Interview Mode</label>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    id="mode-tech-btn"
                    onClick={() => setInterviewMode('tech')}
                    className={`p-4 rounded-2xl text-left border text-xs flex justify-between items-center ${
                      interviewMode === 'tech' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-200">Associate Technical Interview</h4>
                      <p className="text-slate-500 mt-0.5 text-[10px]">Java Core, multithreading, API structures, REST principles.</p>
                    </div>
                    {interviewMode === 'tech' && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>

                  <button
                    id="mode-sys-btn"
                    onClick={() => setInterviewMode('system_design')}
                    className={`p-4 rounded-2xl text-left border text-xs flex justify-between items-center ${
                      interviewMode === 'system_design' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-200">System Design Architect</h4>
                      <p className="text-slate-500 mt-0.5 text-[10px]">Distributed caching, databases, scaling, microservices meshes.</p>
                    </div>
                    {interviewMode === 'system_design' && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                </div>

                <button
                  id="start-interview-btn"
                  onClick={() => {
                    setInterviewActive(true);
                    setCurrentQuestionIndex(0);
                    setInterviewAnswers({});
                    setAiInterviewResult('');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/15 cursor-pointer"
                >
                  Start Simulated Interview Session
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-2 font-mono text-[10px]">
                  <span>MOCK CHALLENGE: QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                  <span className="text-indigo-400 font-bold uppercase">{interviewMode.replace('_', ' ')}</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-slate-200">
                  <p className="font-bold text-sm leading-snug">{questions[currentQuestionIndex].q}</p>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Your Response Description</label>
                  <textarea
                    rows={6}
                    placeholder="Provide your software technical solution details here..."
                    value={interviewAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => setInterviewAnswers({ ...interviewAnswers, [currentQuestionIndex]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg cursor-pointer"
                    >
                      Previous
                    </button>
                  )}

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg cursor-pointer"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      id="submit-interview-answers-btn"
                      onClick={() => {
                        setInterviewActive(false);
                        handleInterviewSubmit();
                      }}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-550 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Submit Response to AI Panel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interview Right Response display */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl min-h-[250px] flex flex-col justify-center">
              {loadingInterviewEvaluate ? (
                <div className="text-center space-y-2">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                  <h4 className="font-bold text-slate-300">Evaluating responses via Gemini...</h4>
                  <p className="text-[10px] text-slate-500">Checking parameters, tech accuracy, confidence metrics.</p>
                </div>
              ) : aiInterviewResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-base text-slate-200">Gemini Board Evaluation Results</h3>
                  </div>
                  <div className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap font-sans p-4 bg-slate-950 rounded-2xl border border-slate-850">
                    {aiInterviewResult}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 p-6">
                  <Bot className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-400 text-sm">Waiting for Interview Submission</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Complete your answers and click Submit to trigger high-fidelity AI feedback.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. PLACEMENT & JOB LISTINGS PORTAL */}
      {studentSubTab === 'jobs' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white">MX Placement & Active Jobs Portal</h2>
            <p className="text-slate-400 text-xs mt-1">Apply for direct listings with vetted partners. Verified profiles are auto-shared with recruiters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {JOB_LISTINGS.map((job) => {
              const isApplied = jobApps.some(app => app.jobId === job.id);
              const appDetails = jobApps.find(app => app.jobId === job.id);
              return (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-md text-white leading-tight">{job.title}</h3>
                        <span className="text-indigo-400 font-bold text-xs mt-1 block">{job.company}</span>
                      </div>
                      <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold uppercase">{job.type}</span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{job.description}</p>
                    
                    <div className="space-y-1 text-[11px] text-slate-400 mb-4 font-mono">
                      <p>📍 Location: <span className="text-slate-200">{job.location}</span></p>
                      <p>💼 Salary Range: <span className="text-slate-200">{job.salaryRange}</span></p>
                      <p>🎯 Experience: <span className="text-slate-200">{job.experienceRequired}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-6">
                      {job.skillsRequired.map((s, idx) => (
                        <span key={idx} className="bg-slate-950 text-slate-300 border border-slate-850 px-2 py-0.5 rounded text-[10px] font-medium font-mono">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isApplied ? (
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-green-400 font-bold">✓ Application Sent</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-900/20 text-[10px] font-semibold">{appDetails?.status || 'Applied'}</span>
                      </div>
                    ) : (
                      <button
                        id={`apply-job-${job.id}`}
                        onClick={() => handleJobApply(job.id)}
                        disabled={applyingJobId === job.id}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1"
                      >
                        {applyingJobId === job.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                        Send Profile Resume Application
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. COMMUNITY & DISCUSSION FORUM */}
      {studentSubTab === 'community' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Thread & Posts feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="font-bold text-base text-slate-100 mb-4">Start a Discussion Thread</h3>
              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Gateway JWT filters help..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-400 mb-1 font-semibold">Channel</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Java Full Stack Path">Java Full Stack Path</option>
                      <option value="Python Full Stack">Python Full Stack</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Thread Details</label>
                  <textarea
                    rows={3}
                    placeholder="Write your question, idea or placement milestones story..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none"
                  />
                </div>

                <button
                  id="submit-post-btn"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-lg cursor-pointer"
                >
                  Publish Thread
                </button>
              </form>
            </div>

            {/* Posts feed */}
            <div className="space-y-4">
              {comPosts.map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 text-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-[11px]">
                        {post.author[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{post.author}</span>
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">{post.authorRole}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wide bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{post.category}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 mb-2">{post.title}</h4>
                  <p className="text-slate-350 leading-relaxed mb-4">{post.content}</p>

                  <div className="flex items-center gap-4 text-slate-500 font-semibold mb-4">
                    <button id={`like-post-btn-${post.id}`} onClick={() => handleLikePost(post.id)} className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
                      👍 {post.likes} Likes
                    </button>
                    <button onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)} className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
                      💬 {post.comments.length} Comments
                    </button>
                  </div>

                  {activeCommentsPostId === post.id && (
                    <div className="space-y-3.5 border-t border-slate-850 pt-4 bg-slate-950/20 p-3 rounded-xl">
                      {post.comments.map((comment, i) => (
                        <div key={i} className="space-y-1 leading-snug">
                          <div className="flex items-center justify-between font-bold text-[10px]">
                            <span className="text-slate-300">{comment.author}</span>
                            <span className="text-slate-600 font-mono font-medium">{comment.date}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{comment.content}</p>
                        </div>
                      ))}

                      {/* Comment form */}
                      <div className="flex gap-2 pt-2 border-t border-slate-900">
                        <input
                          type="text"
                          placeholder="Add helpful reply..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none"
                        />
                        <button
                          id={`submit-comment-btn-${post.id}`}
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 bg-indigo-600 text-white rounded-lg font-bold"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar info */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h4 className="font-bold text-sm text-slate-100 mb-3">Community Channels</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                  <span>Java Full Stack Path</span>
                  <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold">142 Active</span>
                </li>
                <li className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                  <span>Python Full Stack</span>
                  <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold">89 Active</span>
                </li>
                <li className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850">
                  <span>Artificial Intelligence</span>
                  <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold">310 Active</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI MENTOR CHAT WIDGET */}
      <div id="floating-ai-mentor-container" className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div 
            id="ai-mentor-chat-panel"
            className="w-96 h-[550px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                    MX-AI Mentor
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  </h3>
                  <p className="text-[9px] text-slate-400">Personal Interactive Coaching</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Course Context bar */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider shrink-0">CONTEXT ROADMAP:</span>
              <select
                value={selectedCourseContext.id}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  if (course) setSelectedCourseContext(course);
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold truncate cursor-pointer"
              >
                {availableContextCourses.map(course => (
                  <option key={course.id} value={course.id} className="bg-slate-950">
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20" id="chat-messages-container">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none font-medium' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="space-y-1">
                        {renderMessageContent(msg.content)}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-[11px] flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Thinking with context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            {chatMessages.length <= 2 && !isGenerating && (
              <div className="p-3 bg-slate-950/30 border-t border-slate-850 space-y-1.5 shrink-0">
                <p className="text-[9px] font-mono uppercase text-slate-500 tracking-wider font-semibold">Suggested Questions:</p>
                <div className="flex flex-col gap-1.5">
                  {getSuggestionsForCourse(selectedCourseContext.id).map((suggest, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendSuggestion(suggest)}
                      className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-300 hover:text-white rounded border border-slate-800 transition duration-150 cursor-pointer truncate"
                    >
                      💡 {suggest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask about ${selectedCourseContext.title.split(' ')[0]}...`}
                disabled={isGenerating}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isGenerating || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <button
            id="floating-ai-mentor-btn"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-full shadow-lg shadow-indigo-500/20 transition duration-300 scale-100 hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs"
          >
            <div className="relative">
              <Bot className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 ring-2 ring-indigo-600 animate-pulse"></span>
            </div>
            <span>MX-AI Mentor</span>
          </button>
        )}
      </div>
    </div>
  );
}
