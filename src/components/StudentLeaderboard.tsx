import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Award, Sparkles, TrendingUp, User, Star, 
  Search, ArrowUp, ArrowDown, Play, Check, Zap, BookOpen, Clock, ChevronRight, Shield
} from 'lucide-react';
import { UserProfile } from '../types';

interface LeaderboardEntry {
  id: string;
  name: string;
  college: string;
  xpPoints: number;
  streak: number;
  completedCoursesCount: number;
  avatarColor: string;
  track: string;
  isCurrentUser?: boolean;
}

interface StudentLeaderboardProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function StudentLeaderboard({ profile, setProfile }: StudentLeaderboardProps) {
  // Prep populate standard mock leaderboard cohort
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([
    {
      id: 'l1',
      name: 'Aditya Vardhan',
      college: 'MX Institute of Technology',
      xpPoints: 2450,
      streak: 18,
      completedCoursesCount: 4,
      avatarColor: 'bg-rose-500',
      track: 'Java Full Stack'
    },
    {
      id: 'l2',
      name: 'Neha Deshmukh',
      college: 'Vellore Institute of Science',
      xpPoints: 2120,
      streak: 12,
      completedCoursesCount: 3,
      avatarColor: 'bg-amber-500',
      track: 'AI Engineering'
    },
    {
      id: 'l3',
      name: 'Simran Preet',
      college: 'Delhi Technological University',
      xpPoints: 1890,
      streak: 24,
      completedCoursesCount: 3,
      avatarColor: 'bg-emerald-500',
      track: 'Python Developer'
    },
    {
      id: 'l4',
      name: 'Devendra Kumar',
      college: 'MX Institute of Technology',
      xpPoints: 1650,
      streak: 9,
      completedCoursesCount: 2,
      avatarColor: 'bg-indigo-500',
      track: 'AI Engineering'
    },
    {
      id: 'l5',
      name: 'Rahul Sharma',
      college: 'RV College of Engineering',
      xpPoints: 1420,
      streak: 14,
      completedCoursesCount: 2,
      avatarColor: 'bg-purple-500',
      track: 'Automation Testing'
    },
    {
      id: 'l6',
      name: 'Ananya Roy',
      college: 'BMS College of Engineering',
      xpPoints: 950,
      streak: 5,
      completedCoursesCount: 1,
      avatarColor: 'bg-cyan-500',
      track: 'Java Full Stack'
    },
    {
      id: 'l7',
      name: 'Karthik Raja',
      college: 'PSG College of Technology',
      xpPoints: 840,
      streak: 3,
      completedCoursesCount: 1,
      avatarColor: 'bg-teal-500',
      track: 'Python Developer'
    }
  ]);

  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');
  const [searchQuery, setSearchQuery] = useState('');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'college' | 'track'>('all');
  const [justLeaped, setJustLeaped] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeStep, setChallengeStep] = useState<'none' | 'prompt' | 'answered'>('none');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Dynamic user data combined from profile prop
  const currentStudentEntry: LeaderboardEntry = {
    id: 'current-user',
    name: profile.name + ' (You)',
    college: profile.college || 'MX Institute of Technology',
    xpPoints: profile.xpPoints,
    streak: profile.streak,
    completedCoursesCount: profile.completedCourses.length,
    avatarColor: 'bg-indigo-600',
    track: profile.careerGoal || 'Java Full Stack',
    isCurrentUser: true
  };

  // Combine current student and mock students
  const combinedList = [...leaderboardData.filter(u => u.id !== 'current-user'), currentStudentEntry];

  // Apply sorting
  const sortedList = [...combinedList].sort((a, b) => {
    if (sortBy === 'xp') {
      return b.xpPoints - a.xpPoints;
    } else {
      return b.streak - a.streak;
    }
  });

  // Assign dynamic ranks
  const rankedList = sortedList.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  // Find current user's rank
  const currentUserRankInfo = rankedList.find(item => item.isCurrentUser);
  const currentUserRank = currentUserRankInfo ? currentUserRankInfo.rank : rankedList.length;

  // Filter list by search and cohort
  const filteredList = rankedList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.track.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (cohortFilter === 'college') {
      return item.college === (profile.college || 'MX Institute of Technology');
    }
    if (cohortFilter === 'track') {
      const myTrackKeyword = (profile.careerGoal || 'Java').toLowerCase().split(' ')[0];
      return item.track.toLowerCase().includes(myTrackKeyword);
    }
    return true;
  });

  // Action: Interactive Simulating a platform XP trigger (completing coding sandbox or reviewing notes)
  const handleSimulateDailyActivity = () => {
    const xpBoost = 150;
    const newXp = profile.xpPoints + xpBoost;
    const newStreak = profile.streak + 1;

    setProfile({
      ...profile,
      xpPoints: newXp,
      streak: newStreak,
      coins: profile.coins + 15
    });

    setJustLeaped(true);
    setTimeout(() => setJustLeaped(false), 3000);
  };

  // Mock mini challenge data against immediate rival
  const immediateRival = rankedList.find(item => item.rank === currentUserRank - 1);

  const rivalChallengeQuestion = {
    text: "Which of the following is true about garbage collection in Java?",
    options: [
      "It guarantees that there will be sufficient memory for programming allocation.",
      "The GC runs on a high-priority daemon thread continuously.",
      "You can suggest garbage collection explicitly using System.gc() but cannot force immediate execution.",
      "Unreferenced object variables are automatically deleted inside compile time."
    ],
    correctIdx: 2,
    xpReward: 100
  };

  const handleStartChallenge = (rivalId: string) => {
    setActiveChallengeId(rivalId);
    setChallengeStep('prompt');
    setSelectedAnswer(null);
  };

  const handleAnswerChallenge = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    setChallengeStep('answered');

    if (optionIdx === rivalChallengeQuestion.correctIdx) {
      // Reward Student XP!
      setProfile({
        ...profile,
        xpPoints: profile.xpPoints + rivalChallengeQuestion.xpReward,
        coins: profile.coins + 25
      });
      setJustLeaped(true);
      setTimeout(() => setJustLeaped(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-30px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400 animate-bounce" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">MX Professional Placement League</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Competitive Cohort Rankings
              <span className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-900/50 px-2 py-0.5 rounded font-bold">
                Daily Verified
              </span>
            </h2>
            <p className="text-slate-400 text-xs">
              Complete modules, solve interactive coding sandboxes, and maintain daily streaks to scale rankings. Higher placement tiers unlock direct recruiter fast-tracks.
            </p>
          </div>

          {/* Simulate Action and Leaped Status */}
          <div className="shrink-0 flex items-center gap-3">
            {justLeaped && (
              <span className="text-xs text-green-400 font-bold animate-pulse flex items-center gap-1">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400" /> Rank Updated!
              </span>
            )}
            <button
              onClick={handleSimulateDailyActivity}
              className="px-4.5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              Practice Daily Sandbox (+150 XP)
            </button>
          </div>
        </div>

        {/* Scoreboard Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Your Rank</span>
              <span className="block text-sm font-black text-white">#{currentUserRank} of {combinedList.length}</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Streak Track</span>
              <span className="block text-sm font-black text-orange-400">{profile.streak} Days</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Current XP</span>
              <span className="block text-sm font-black text-white">{profile.xpPoints} Points</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Status Tier</span>
              <span className="block text-sm font-black text-white">
                {currentUserRank <= 3 ? 'Elite Platinum' : currentUserRank <= 5 ? 'Senior Gold' : 'Rising Star'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Leaderboard Table, Right Rival Challenge / Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEADERBOARD TABLE COLUMN (Col Span 8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Controls & Search panel */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Cohort selection */}
            <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl self-start md:self-auto">
              <button
                onClick={() => setCohortFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cohortFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Global League
              </button>
              <button
                onClick={() => setCohortFilter('college')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cohortFilter === 'college' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My College
              </button>
              <button
                onClick={() => setCohortFilter('track')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cohortFilter === 'track' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Similar Track
              </button>
            </div>

            {/* Sorting criteria */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 rounded-xl p-0.5">
                <button
                  onClick={() => setSortBy('xp')}
                  className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    sortBy === 'xp' ? 'bg-slate-900 text-indigo-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
                  title="Sort by XP points"
                >
                  <Star className="w-3 h-3 fill-current" /> XP
                </button>
                <button
                  onClick={() => setSortBy('streak')}
                  className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    sortBy === 'streak' ? 'bg-slate-900 text-orange-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
                  title="Sort by Daily Streak"
                >
                  <Flame className="w-3 h-3" /> Streak
                </button>
              </div>
            </div>

          </div>

          {/* Leaders List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4.5 px-6">Rank</th>
                    <th className="py-4.5 px-4">Student Candidate</th>
                    <th className="py-4.5 px-4">Learning Track</th>
                    <th className="py-4.5 px-4 text-center">Courses Done</th>
                    <th className="py-4.5 px-4 text-center">Streak</th>
                    <th className="py-4.5 px-6 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredList.map((student) => {
                    const isTop3 = student.rank <= 3;
                    const isUser = student.isCurrentUser;

                    return (
                      <tr 
                        key={student.id} 
                        className={`transition ${
                          isUser 
                            ? 'bg-indigo-950/30 hover:bg-indigo-950/45 border-l-4 border-l-indigo-500' 
                            : 'hover:bg-slate-850/30'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 font-bold text-xs">
                          <div className="flex items-center gap-2">
                            {student.rank === 1 && (
                              <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center font-black text-[11px]" title="1st Place Medal">
                                🥇
                              </span>
                            )}
                            {student.rank === 2 && (
                              <span className="w-6 h-6 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-300 flex items-center justify-center font-black text-[11px]" title="2nd Place Medal">
                                🥈
                              </span>
                            )}
                            {student.rank === 3 && (
                              <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-black text-[11px]" title="3rd Place Medal">
                                🥉
                              </span>
                            )}
                            {!isTop3 && (
                              <span className="text-slate-450 font-mono text-[11px] w-6 text-center">
                                #{student.rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Candidate Identity */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl ${student.avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-inner`}>
                              {student.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-100 text-[11.5px] truncate flex items-center gap-1.5">
                                {student.name}
                                {isUser && (
                                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                                    You
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                                {student.college}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Course Path Target */}
                        <td className="py-4 px-4">
                          <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-bold text-slate-300 block w-fit">
                            {student.track}
                          </span>
                        </td>

                        {/* Completed Courses count */}
                        <td className="py-4 px-4 text-center text-slate-300 text-xs font-mono font-bold">
                          {student.completedCoursesCount}
                        </td>

                        {/* Streak Days */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs font-bold text-orange-400 font-mono">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{student.streak}d</span>
                          </div>
                        </td>

                        {/* XP Points */}
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono text-xs font-black ${
                            isUser ? 'text-indigo-400' : isTop3 ? 'text-white' : 'text-slate-300'
                          }`}>
                            {student.xpPoints.toLocaleString()} XP
                          </span>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <User className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                        <h4 className="font-bold text-slate-400 text-xs">No Matching Student Candidates</h4>
                        <p className="text-[10px] text-slate-550 mt-1">Try resetting your cohort or search filter terms.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RIVAL CHALLENGE & MOTIVATION BOOSTER (Col Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Rival Challenge Card */}
          {immediateRival ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Zap className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-xs text-white">Daily Rival Challenge</h4>
                  <span className="text-[9px] font-mono text-slate-400 block">Immediate rank challenger</span>
                </div>
              </div>

              {/* Rival info display */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${immediateRival.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                    {immediateRival.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-white text-[11px] truncate">{immediateRival.name}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">Rank #{immediateRival.rank} • {immediateRival.xpPoints} XP</p>
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/30 shrink-0">
                  +{immediateRival.xpPoints - profile.xpPoints} XP
                </span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your rival <strong>{immediateRival.name.split(' ')[0]}</strong> has a {immediateRival.streak}-day streak! Defeat their daily sandbox benchmark to leapfrog their rank position.
              </p>

              {/* Challenge Interactive Flow */}
              {challengeStep === 'none' && (
                <button
                  onClick={() => handleStartChallenge(immediateRival.id)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition duration-150"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Initiate Daily Placement Duel (+100 XP)
                </button>
              )}

              {challengeStep === 'prompt' && (
                <div className="space-y-3.5 pt-1 animate-fade-in">
                  <p className="text-[11px] font-bold text-white leading-relaxed">
                    {rivalChallengeQuestion.text}
                  </p>
                  <div className="space-y-2">
                    {rivalChallengeQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChallenge(idx)}
                        className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 text-[10.5px] text-slate-300 hover:text-white rounded-xl border border-slate-850 hover:border-slate-700 transition cursor-pointer leading-normal"
                      >
                        {String.fromCharCode(65 + idx)}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {challengeStep === 'answered' && (
                <div className="space-y-3.5 pt-1 text-xs">
                  {selectedAnswer === rivalChallengeQuestion.correctIdx ? (
                    <div className="p-3 bg-green-950/30 border border-green-900/30 rounded-2xl text-green-400 space-y-1">
                      <p className="font-extrabold flex items-center gap-1 text-[11px]">
                        <Check className="w-4 h-4 stroke-[3]" /> Correct Answer!
                      </p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Awesome job! You've received +100 XP Points. Check your position in the table to see how you have scaled ranks!
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-2xl text-red-400 space-y-1">
                      <p className="font-extrabold text-[11px]">Incorrect Answer</p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        No worries! Keep reviewing the <strong>Spring Boot Microservices</strong> course modules to reinforce enterprise garbage collection concepts.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setChallengeStep('none')}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 font-bold rounded-xl text-[10px] cursor-pointer transition"
                  >
                    Close Duel Dialogue
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center py-8">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto animate-pulse mb-2" />
              <h4 className="font-bold text-white text-xs">Apex Legend Position</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                You are currently rank #1 global champion! Continue practicing daily micro-projects to defend your title from challengers.
              </p>
            </div>
          )}

          {/* Placement Fast-track Milestones */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="font-extrabold text-xs text-white border-b border-slate-800 pb-2.5">
              League Milestones & Perks
            </h4>

            <div className="space-y-3.5">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-200">Platinum Fast-track (Top 3 Candidates)</h5>
                  <p className="text-slate-400 leading-normal text-[10.5px]">
                    Automatic recommendation badge on resume. Direct recruiter fast-track with vetted tier-1 corporate clients.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-slate-300/10 text-slate-300 border border-slate-300/20 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-200">Gold Placement Accelerator (Rank #4 - #10)</h5>
                  <p className="text-slate-400 leading-normal text-[10.5px]">
                    Earn weekly MX placement recommendation notifications. Access secret advanced mock interview pools.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-600/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-200">Daily Streak Multipliers</h5>
                  <p className="text-slate-400 leading-normal text-[10.5px]">
                    Maintain a 7+ day streak to receive a constant 1.5x XP score multiplier across all platform courses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Motivation Slogan Tip */}
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl flex gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h5 className="font-bold text-white text-[11px]">Engage and Level up!</h5>
              <p className="text-slate-400 leading-normal text-[10.5px]">
                A candidate maintaining a 10-day active streak solves coding sandboxes 65% faster on average. Level up to boost placement status.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
