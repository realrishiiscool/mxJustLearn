import React, { useState } from 'react';
import { 
  Map, CheckCircle2, Play, Compass, Award, Sparkles, ArrowRight, 
  BookOpen, Clock, Target, Plus, ChevronRight, Bookmark, ArrowUpRight, Check
} from 'lucide-react';
import { Course, UserProfile } from '../types';
import { CAREER_PATHS } from '../data';

interface LearningRoadmapProps {
  courses: Course[];
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  enrolledCourses: string[];
  onEnrollCourse: (courseId: string) => void;
  onLaunchPlayer: (course: Course) => void;
  onLaunchAssessment: (courseId: string) => void;
}

// Define mock interactive completion state per student course
interface CourseProgressDetail {
  courseId: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  completedModulesCount: number;
  totalModulesCount: number;
  lastAccessed: string;
}

export default function LearningRoadmap({
  courses,
  profile,
  setProfile,
  enrolledCourses,
  onEnrollCourse,
  onLaunchPlayer,
  onLaunchAssessment
}: LearningRoadmapProps) {
  // Local state for interactive mock progress (stored locally to let user play with state)
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, CourseProgressDetail>>(() => {
    // Generate initial realistic progresses
    const initialProgress: Record<string, CourseProgressDetail> = {};
    
    courses.forEach(course => {
      let totalLessons = 0;
      course.modules.forEach(m => totalLessons += m.lessons.length);
      
      // Determine default progress based on whether course is enrolled or completed
      const isEnrolled = enrolledCourses.includes(course.id);
      const isCompleted = profile.completedCourses.includes(course.id);
      
      let completedLessons = 0;
      let completedModules = 0;
      
      if (isCompleted) {
        completedLessons = totalLessons;
        completedModules = course.modules.length;
      } else if (isEnrolled) {
        // Enrolled courses start with some mock completion
        completedLessons = Math.min(Math.floor(totalLessons * 0.4) + 1, totalLessons);
        completedModules = Math.min(Math.floor(course.modules.length * 0.5), course.modules.length);
      }

      initialProgress[course.id] = {
        courseId: course.id,
        completedLessonsCount: completedLessons,
        totalLessonsCount: totalLessons,
        completedModulesCount: completedModules,
        totalModulesCount: course.modules.length,
        lastAccessed: isEnrolled ? '2 days ago' : 'Never'
      };
    });

    return initialProgress;
  });

  // Current career goal input to filter recommendations
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempCareerGoal, setTempCareerGoal] = useState(profile.careerGoal || 'Java Full Stack Developer');

  // Trigger saving the career goal
  const handleSaveGoal = async () => {
    setEditingGoal(false);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerGoal: tempCareerGoal
        })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error updating career goal:', err);
    }
  };

  // Safe helper to calculate course percent completion
  const getCourseProgressPercentage = (courseId: string) => {
    const detail = courseProgressMap[courseId];
    if (!detail || detail.totalLessonsCount === 0) return 0;
    return Math.round((detail.completedLessonsCount / detail.totalLessonsCount) * 100);
  };

  // Simulate marking a lesson completed to showcase interactive progress updates!
  const handleSimulateProgress = (courseId: string) => {
    setCourseProgressMap(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      
      const newCompleted = Math.min(current.completedLessonsCount + 1, current.totalLessonsCount);
      // Recalculate modules completion proportionally
      const progressRatio = newCompleted / current.totalLessonsCount;
      const newModulesCompleted = Math.min(
        Math.floor(current.totalModulesCount * progressRatio), 
        current.totalModulesCount
      );

      // If fully completed, update profile's completedCourses
      if (newCompleted === current.totalLessonsCount) {
        if (!profile.completedCourses.includes(courseId)) {
          const updatedCompleted = [...profile.completedCourses, courseId];
          setProfile({
            ...profile,
            completedCourses: updatedCompleted,
            xpPoints: profile.xpPoints + 100, // Reward XP for completing course
            coins: profile.coins + 20
          });
        }
      }

      return {
        ...prev,
        [courseId]: {
          ...current,
          completedLessonsCount: newCompleted,
          completedModulesCount: newModulesCompleted,
          lastAccessed: 'Just now'
        }
      };
    });
  };

  // Find enrolled courses
  // Ensure we display at least some enrolled courses to prevent empty state
  const enrolledList = courses.filter(c => enrolledCourses.includes(c.id));
  const otherCourses = courses.filter(c => !enrolledCourses.includes(c.id));

  // Determine current active learning target
  const careerGoalNormalized = (profile.careerGoal || tempCareerGoal).toLowerCase();
  
  // Custom logic to recommend future learning paths based on current student career goal
  const getSuggestedCourses = () => {
    // Filter out already enrolled/completed courses for recommendations
    const pool = courses.filter(c => !enrolledCourses.includes(c.id));
    
    if (careerGoalNormalized.includes('java') || careerGoalNormalized.includes('spring')) {
      return pool.sort((a, b) => {
        if (a.id === 'java-fs' || a.skillsCovered.includes('Java')) return -1;
        return 1;
      });
    } else if (careerGoalNormalized.includes('ai') || careerGoalNormalized.includes('machine') || careerGoalNormalized.includes('data')) {
      return pool.sort((a, b) => {
        if (a.id === 'ai-eng' || a.id === 'data-science') return -1;
        return 1;
      });
    } else if (careerGoalNormalized.includes('test') || careerGoalNormalized.includes('automation') || careerGoalNormalized.includes('qa')) {
      return pool.sort((a, b) => {
        if (a.id === 'auto-test') return -1;
        return 1;
      });
    } else if (careerGoalNormalized.includes('python') || careerGoalNormalized.includes('django')) {
      return pool.sort((a, b) => {
        if (a.id === 'python-fs') return -1;
        return 1;
      });
    }
    
    return pool; // Default return other non-enrolled courses
  };

  const suggestedCoursesList = getSuggestedCourses();

  // Find matching career path config
  const matchingPath = CAREER_PATHS.find(path => 
    path.title.toLowerCase().includes('java') && careerGoalNormalized.includes('java') ||
    path.title.toLowerCase().includes('python') && careerGoalNormalized.includes('python') ||
    path.title.toLowerCase().includes('ai') && (careerGoalNormalized.includes('ai') || careerGoalNormalized.includes('machine')) ||
    path.title.toLowerCase().includes('automation') && (careerGoalNormalized.includes('test') || careerGoalNormalized.includes('qa'))
  ) || CAREER_PATHS[0]; // fallback to first path

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      
      {/* 1. Career Goal Context Controller */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Personal Career Orientation</span>
          </div>
          {editingGoal ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={tempCareerGoal}
                onChange={(e) => setTempCareerGoal(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-80"
              />
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {profile.careerGoal || 'Java Full Stack & Gen AI Solutions'}
              </h2>
              <button
                onClick={() => setEditingGoal(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
              >
                [Edit Target]
              </button>
            </div>
          )}
          <p className="text-slate-400 text-xs">
            We adapt your recommended learning paths and timeline tracks to matches your professional target.
          </p>
        </div>

        {/* Global Progress Statistics */}
        <div className="flex gap-4 sm:gap-6 shrink-0 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-white">{enrolledCourses.length}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Enrolled</span>
          </div>
          <div className="border-r border-slate-800 h-10 self-center" />
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-green-400">{profile.completedCourses.length}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Completed</span>
          </div>
          <div className="border-r border-slate-800 h-10 self-center" />
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-indigo-400">{profile.xpPoints}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">XP Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: Visual Course Timeline Progress Map (Col Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-base text-white">Visual Timeline & Milestones</h3>
            </div>
            <span className="text-[10px] text-slate-400">Click node items to interactive simulate progress</span>
          </div>

          {enrolledList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
              <Compass className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
              <div>
                <h4 className="font-bold text-white text-sm">No Active Enrolled Courses</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  Enroll in any of our premium curated courses below to initialize your learning milestones tracking timeline!
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-900/60 ml-4 pl-8 space-y-8 py-2">
              {enrolledList.map((course, idx) => {
                const percent = getCourseProgressPercentage(course.id);
                const detail = courseProgressMap[course.id] || {
                  completedLessonsCount: 0,
                  totalLessonsCount: 4,
                  completedModulesCount: 0,
                  totalModulesCount: 2,
                  lastAccessed: 'Never'
                };
                const isCompleted = profile.completedCourses.includes(course.id) || percent === 100;

                return (
                  <div key={course.id} className="relative group">
                    {/* Node marker point on the absolute left timeline */}
                    <div className={`absolute left-[-42px] top-4 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500/30 text-white' 
                        : percent > 0 
                          ? 'bg-indigo-600 border-indigo-900 text-white animate-pulse' 
                          : 'bg-slate-950 border-slate-850 text-slate-600'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Timeline card body */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition duration-300 space-y-4">
                      
                      {/* Top Header info */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-indigo-950/80 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                              {course.category}
                            </span>
                            {isCompleted && (
                              <span className="text-[9px] font-mono bg-green-950/80 text-green-400 border border-green-900/40 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Course Verified
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-sm mt-1.5 group-hover:text-indigo-300 transition">
                            {course.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Instructor: {course.instructor} • Last accessed: {detail.lastAccessed}
                          </p>
                        </div>

                        {/* Interactive simulation action */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <button
                            onClick={() => handleSimulateProgress(course.id)}
                            disabled={isCompleted}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition ${
                              isCompleted 
                                ? 'bg-slate-950 text-green-400/80 border-slate-850 cursor-default'
                                : 'bg-slate-950 border-slate-800 text-indigo-400 hover:text-indigo-300 hover:border-slate-700 cursor-pointer'
                            }`}
                            title="Simulate completing lessons to see progress bars adjust!"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            {isCompleted ? 'Finished' : '+1 Lesson'}
                          </button>
                        </div>
                      </div>

                      {/* Course progress metrics */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-400">
                            Lessons: {detail.completedLessonsCount} / {detail.totalLessonsCount} completed
                          </span>
                          <span className={`font-black ${isCompleted ? 'text-green-400' : 'text-indigo-400'}`}>
                            {percent}% Complete
                          </span>
                        </div>
                        {/* Progress slider bar */}
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full transition-all duration-550 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Expandable Module Checklists */}
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60 text-[10.5px] space-y-2.5">
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Course Modules Overview & Sync
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {course.modules.map((mod, modIdx) => {
                            const isModuleFinished = detail.completedModulesCount > modIdx || isCompleted;
                            return (
                              <div 
                                key={mod.id} 
                                className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                                  isModuleFinished 
                                    ? 'bg-green-950/10 border-green-950/20 text-slate-300' 
                                    : 'bg-slate-900/40 border-slate-850 text-slate-450'
                                }`}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                                  isModuleFinished ? 'text-green-400' : 'text-slate-700'
                                }`} />
                                <span className="truncate font-semibold text-[10px]">{mod.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action trigger button */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => onLaunchPlayer(course)}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Launch Interactive Player
                        </button>
                        <button
                          onClick={() => onLaunchAssessment(course.id)}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700/50 rounded-xl text-[11px] font-bold cursor-pointer transition"
                        >
                          Take Practice Test
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Recommendations & Future Learning Paths (Col Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base text-white">Suggested Future Tracks</h3>
          </div>

          {/* Core Career Path Step breakdown matching current Goal */}
          {matchingPath && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-xs text-white">Curated Recruitment Roadmap</h4>
                  <span className="text-[9px] font-mono text-indigo-400 block mt-0.5 uppercase tracking-wider">
                    Target: {matchingPath.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg">
                  {matchingPath.duration} Track
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                {matchingPath.description}
              </p>

              {/* Steps timeline mapping */}
              <div className="space-y-3.5 border-l border-slate-800 pl-3.5 relative pt-1">
                {matchingPath.steps.map((step, idx) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Node circle */}
                      <div className={`absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                        isDone 
                          ? 'bg-green-500 border-green-500' 
                          : isCurrent 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'bg-slate-900 border-slate-700'
                      }`} />
                      
                      <h5 className={`font-bold text-[11px] ${
                        isDone ? 'text-green-400' : isCurrent ? 'text-indigo-400' : 'text-slate-300'
                      }`}>
                        {idx + 1}. {step.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Enroller Cards */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              Recommended Course Catalog
            </h4>

            {suggestedCoursesList.length === 0 ? (
              <p className="text-xs italic text-slate-500">
                You've enrolled in all available courses inside this career path! You're on track for placement reference.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {suggestedCoursesList.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-indigo-900/60 transition duration-300 flex items-start gap-4"
                  >
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-850"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[8px] font-mono font-black uppercase text-indigo-400 tracking-widest block">
                        {course.level} · {course.duration}
                      </span>
                      <h5 className="font-bold text-white text-[11.5px] truncate leading-snug">
                        {course.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate leading-snug">
                        Covering: {course.skillsCovered.slice(0, 3).join(', ')}...
                      </p>
                      
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-[11px] font-black text-white">
                          ₹{Math.round(Number(course.price))}
                        </span>
                        <button
                          onClick={() => onEnrollCourse(course.id)}
                          className="px-2.5 py-1 bg-slate-850 hover:bg-indigo-600 hover:text-white text-indigo-400 border border-slate-800 text-[9.5px] font-black rounded-lg flex items-center gap-0.5 cursor-pointer transition duration-150"
                        >
                          <Plus className="w-3 h-3" /> Enroll Track
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resume Integration Booster Tip Box */}
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl flex gap-3.5">
            <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h5 className="font-bold text-white text-[11px]">MX Career Placement referrals</h5>
              <p className="text-slate-400 leading-normal text-[10.5px]">
                Enrolling in and completing course modules automatically appends verified skills credentials directly to your generated <strong>Resume Builder CV</strong> and increases recruiter placement referral matching stats by up to 45%.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
