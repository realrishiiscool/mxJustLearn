import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Shield, Flame, Trophy, Target, BookOpen, Sparkles, Lock, CheckCircle2, 
  Zap, Code, FileText, Gift, Star, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'engagement' | 'placement' | 'community';
  icon: React.ComponentType<any>;
  xpBonus: number;
  coinBonus: number;
  difficulty: 'Bronze' | 'Silver' | 'Gold' | 'Legendary';
  difficultyColor: string;
  checkUnlocked: (profile: UserProfile, enrolledCount: number) => boolean;
  progressPercentage: (profile: UserProfile, enrolledCount: number) => number;
  progressLabel: (profile: UserProfile, enrolledCount: number) => string;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge-first-step',
    title: 'First Contact',
    description: 'Kickstart your journey by enrolling in at least one enterprise training track.',
    category: 'learning',
    icon: BookOpen,
    xpBonus: 100,
    coinBonus: 20,
    difficulty: 'Bronze',
    difficultyColor: 'from-amber-600/20 to-amber-900/10 border-amber-800 text-amber-400',
    checkUnlocked: (profile, enrolledCount) => enrolledCount >= 1,
    progressPercentage: (profile, enrolledCount) => enrolledCount >= 1 ? 100 : 0,
    progressLabel: (profile, enrolledCount) => `${enrolledCount}/1 Enrolled`
  },
  {
    id: 'badge-streak-3',
    title: 'Habit Builder',
    description: 'Maintain a 3-day daily learning streak to prove consistent devotion.',
    category: 'engagement',
    icon: Flame,
    xpBonus: 150,
    coinBonus: 30,
    difficulty: 'Bronze',
    difficultyColor: 'from-amber-600/20 to-amber-900/10 border-amber-800 text-amber-400',
    checkUnlocked: (profile) => profile.streak >= 3,
    progressPercentage: (profile) => Math.min((profile.streak / 3) * 100, 100),
    progressLabel: (profile) => `${profile.streak}/3 Days`
  },
  {
    id: 'badge-xp-1000',
    title: 'Elite Scholar',
    description: 'Amass 1,000+ total XP points across modules, exams, or sandbox labs.',
    category: 'learning',
    icon: Star,
    xpBonus: 200,
    coinBonus: 40,
    difficulty: 'Silver',
    difficultyColor: 'from-slate-400/20 to-slate-600/10 border-slate-600 text-slate-300',
    checkUnlocked: (profile) => profile.xpPoints >= 1000,
    progressPercentage: (profile) => Math.min((profile.xpPoints / 1000) * 100, 100),
    progressLabel: (profile) => `${profile.xpPoints.toLocaleString()}/1,000 XP`
  },
  {
    id: 'badge-course-completed',
    title: 'Verified Graduate',
    description: 'Successfully pass and complete at least one course curriculum.',
    category: 'learning',
    icon: Award,
    xpBonus: 300,
    coinBonus: 50,
    difficulty: 'Silver',
    difficultyColor: 'from-slate-400/20 to-slate-600/10 border-slate-600 text-slate-300',
    checkUnlocked: (profile) => profile.completedCourses.length >= 1,
    progressPercentage: (profile) => profile.completedCourses.length >= 1 ? 100 : 0,
    progressLabel: (profile) => `${profile.completedCourses.length}/1 Completed`
  },
  {
    id: 'badge-streak-10',
    title: 'Unstoppable Momentum',
    description: 'Establish a legendary 10-day streak to unlock placement tier boost.',
    category: 'engagement',
    icon: Shield,
    xpBonus: 500,
    coinBonus: 100,
    difficulty: 'Gold',
    difficultyColor: 'from-yellow-600/20 to-yellow-900/10 border-yellow-800 text-yellow-400',
    checkUnlocked: (profile) => profile.streak >= 10,
    progressPercentage: (profile) => Math.min((profile.streak / 10) * 100, 100),
    progressLabel: (profile) => `${profile.streak}/10 Days`
  },
  {
    id: 'badge-xp-2000',
    title: 'Apex Contender',
    description: 'Gather 2,000+ total cumulative XP and enter top leaderboard percentiles.',
    category: 'engagement',
    icon: Trophy,
    xpBonus: 600,
    coinBonus: 120,
    difficulty: 'Gold',
    difficultyColor: 'from-yellow-600/20 to-yellow-900/10 border-yellow-800 text-yellow-400',
    checkUnlocked: (profile) => profile.xpPoints >= 2000,
    progressPercentage: (profile) => Math.min((profile.xpPoints / 2000) * 100, 100),
    progressLabel: (profile) => `${profile.xpPoints.toLocaleString()}/2,000 XP`
  },
  {
    id: 'badge-target-career',
    title: 'Strategic Navigator',
    description: 'Specify a custom Career Placement Target on your training portal.',
    category: 'placement',
    icon: Target,
    xpBonus: 150,
    coinBonus: 25,
    difficulty: 'Bronze',
    difficultyColor: 'from-amber-600/20 to-amber-900/10 border-amber-800 text-amber-400',
    checkUnlocked: (profile) => !!profile.careerGoal && profile.careerGoal !== 'Java Full Stack & Gen AI Solutions',
    progressPercentage: (profile) => (profile.careerGoal && profile.careerGoal !== 'Java Full Stack & Gen AI Solutions') ? 100 : 0,
    progressLabel: (profile) => (profile.careerGoal && profile.careerGoal !== 'Java Full Stack & Gen AI Solutions') ? 'Specified' : 'Pending'
  },
  {
    id: 'badge-resume-critique',
    title: 'Recruiter Ready',
    description: 'Complete designing an interactive resume and get instant AI analysis critique.',
    category: 'placement',
    icon: FileText,
    xpBonus: 250,
    coinBonus: 50,
    difficulty: 'Silver',
    difficultyColor: 'from-slate-400/20 to-slate-600/10 border-slate-600 text-slate-300',
    checkUnlocked: (profile) => profile.skills.length >= 3,
    progressPercentage: (profile) => Math.min((profile.skills.length / 3) * 100, 100),
    progressLabel: (profile) => `${profile.skills.length}/3 Core Skills`
  },
  {
    id: 'badge-perfect-league',
    title: 'Grandmaster Champion',
    description: 'Unlock 6 separate achievements and scale the global recruitment league.',
    category: 'community',
    icon: Sparkles,
    xpBonus: 1000,
    coinBonus: 250,
    difficulty: 'Legendary',
    difficultyColor: 'from-purple-600/20 to-pink-900/10 border-purple-800 text-purple-400 shadow-lg shadow-purple-950/40 animate-pulse',
    checkUnlocked: (profile, enrolledCount) => {
      // Count how many of the other badges are unlocked
      const count = BADGE_DEFINITIONS.filter(b => b.id !== 'badge-perfect-league' && b.checkUnlocked(profile, enrolledCount)).length;
      return count >= 5;
    },
    progressPercentage: (profile, enrolledCount) => {
      const count = BADGE_DEFINITIONS.filter(b => b.id !== 'badge-perfect-league' && b.checkUnlocked(profile, enrolledCount)).length;
      return Math.min((count / 5) * 100, 100);
    },
    progressLabel: (profile, enrolledCount) => {
      const count = BADGE_DEFINITIONS.filter(b => b.id !== 'badge-perfect-league' && b.checkUnlocked(profile, enrolledCount)).length;
      return `${count}/5 Badges`
    }
  }
];

interface StudentBadgesProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  enrolledCourses: string[];
}

export default function StudentBadges({ profile, setProfile, enrolledCourses }: StudentBadgesProps) {
  const [filterCategory, setFilterCategory] = useState<'all' | 'learning' | 'engagement' | 'placement' | 'unlocked'>('all');
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  // Filtered definitions
  const displayedBadges = BADGE_DEFINITIONS.filter(badge => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unlocked') return badge.checkUnlocked(profile, enrolledCourses.length);
    return badge.category === filterCategory;
  });

  const unlockedCount = BADGE_DEFINITIONS.filter(b => b.checkUnlocked(profile, enrolledCourses.length)).length;
  const totalCount = BADGE_DEFINITIONS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Interaction: Handle claiming a reward
  const handleClaimReward = (badgeId: string, xpBonus: number, coinBonus: number) => {
    if (claimedRewards.includes(badgeId)) return;

    setProfile({
      ...profile,
      xpPoints: profile.xpPoints + xpBonus,
      coins: profile.coins + coinBonus
    });

    setClaimedRewards([...claimedRewards, badgeId]);
    setJustClaimed(badgeId);
    setTimeout(() => setJustClaimed(null), 3000);
  };

  // Interactive Simulator to bump user stats and instantly trigger badge unlocks!
  const handleSimulateMilestone = (milestoneType: 'enrolled' | 'streak' | 'xp' | 'goal') => {
    if (milestoneType === 'streak') {
      setProfile({
        ...profile,
        streak: profile.streak >= 10 ? 3 : profile.streak + 4
      });
    } else if (milestoneType === 'xp') {
      setProfile({
        ...profile,
        xpPoints: profile.xpPoints + 450
      });
    } else if (milestoneType === 'goal') {
      setProfile({
        ...profile,
        careerGoal: 'Principal Cloud Solution Architect'
      });
    } else if (milestoneType === 'enrolled') {
      if (!profile.completedCourses.includes('java-fs')) {
        setProfile({
          ...profile,
          completedCourses: [...profile.completedCourses, 'java-fs']
        });
      }
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">

      {/* 1. Header Hero Progress Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Gamified Achievements Arena</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Badges & Milestones Hall
            </h2>
            <p className="text-slate-400 text-xs max-w-xl">
              Unlock verified skill credentials by reaching specific training, streak, and development milestones. Claim coin vouchers and bonus XP metrics immediately!
            </p>
          </div>

          {/* Compact visual badge status wheel */}
          <div className="shrink-0 flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#6366f1" strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 28} 
                        strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)} 
                        className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="text-sm font-black text-white">{completionPercentage}%</span>
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Total Unlocked</span>
              <span className="block text-base font-black text-white">{unlockedCount} / {totalCount} Badges</span>
              <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">Keep learning to unlock more!</span>
            </div>
          </div>
        </div>

        {/* Claiming notification popup toast inside component */}
        <AnimatePresence>
          {justClaimed && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute bottom-4 right-4 bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xl font-semibold"
            >
              <Gift className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span>Claimed! Bonuses successfully added to your MX Wallet</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Interactive Badge Simulator / Booster Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              Interactive Milestone Simulator
            </h4>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Click simulations below to immediately trigger profile changes and verify real-time badge unlocking behaviors!
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulateMilestone('streak')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-orange-400" /> +4 Streak Days
            </button>
            <button
              onClick={() => handleSimulateMilestone('xp')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
            >
              <Star className="w-3 h-3 text-yellow-400 fill-current" /> +450 XP points
            </button>
            <button
              onClick={() => handleSimulateMilestone('goal')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
            >
              <Target className="w-3 h-3 text-indigo-400" /> Save Career Goal
            </button>
            <button
              onClick={() => handleSimulateMilestone('enrolled')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-green-400" /> Finish Course
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filtering and Badges List */}
      <div className="space-y-6">
        
        {/* Category Filters */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'learning', label: 'Learning' },
              { id: 'engagement', label: 'Streak & Engagement' },
              { id: 'placement', label: 'Recruitment Prep' },
              { id: 'unlocked', label: 'Unlocked Only' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  filterCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-[10.5px] font-mono text-slate-500 font-semibold hidden md:inline">
            Showing {displayedBadges.length} items
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBadges.map((badge) => {
            const isUnlocked = badge.checkUnlocked(profile, enrolledCourses.length);
            const percentage = badge.progressPercentage(profile, enrolledCourses.length);
            const label = badge.progressLabel(profile, enrolledCourses.length);
            const isClaimed = claimedRewards.includes(badge.id);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ${
                  isUnlocked 
                    ? 'border-indigo-500/30 shadow-lg shadow-indigo-950/20 hover:border-indigo-400' 
                    : 'border-slate-800/80 opacity-70 hover:opacity-85'
                }`}
              >
                
                {/* Upper Details */}
                <div className="space-y-4">
                  
                  {/* Badge Icon, Tier Banner, Unlocked Sign */}
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl border ${
                      isUnlocked 
                        ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-650'
                    }`}>
                      <Icon className={`w-6 h-6 ${isUnlocked ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[8.5px] font-mono border px-2 py-0.5 rounded font-black uppercase tracking-wider ${badge.difficultyColor}`}>
                        {badge.difficulty} Tier
                      </span>
                      {isUnlocked ? (
                        <span className="text-[9px] font-mono bg-green-950/80 text-green-400 border border-green-900/40 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-slate-950 text-slate-550 border border-slate-850 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-[13px] tracking-tight">{badge.title}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{badge.description}</p>
                  </div>

                </div>

                {/* Progress Indicators & Reward claim button */}
                <div className="space-y-4 pt-5 border-t border-slate-850 mt-5">
                  
                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono text-slate-550">
                      <span>Requirement Status</span>
                      <span className={isUnlocked ? 'text-green-400 font-bold' : 'text-slate-400 font-bold'}>{label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-750 ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Reward / Action info */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono">
                      <span className="text-slate-500 block">Reward Vouchers:</span>
                      <span className="text-yellow-400 font-bold">+{badge.xpBonus} XP</span>
                      <span className="text-slate-500"> • </span>
                      <span className="text-indigo-400 font-bold">+{badge.coinBonus} Coins</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => handleClaimReward(badge.id, badge.xpBonus, badge.coinBonus)}
                        disabled={isClaimed}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shrink-0 ${
                          isClaimed 
                            ? 'bg-slate-950 text-slate-500 border border-slate-900 cursor-default' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white shadow shadow-indigo-500/10'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        {isClaimed ? 'Claimed' : 'Claim Reward'}
                      </button>
                    ) : (
                      <span className="text-[9.5px] text-slate-500 font-mono flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {displayedBadges.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
            <Shield className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
            <div>
              <h4 className="font-bold text-white text-sm">No Achievements in this Category</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No active unlocked achievements found for this filter query. Try selecting another filter above to see pending badges!
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
