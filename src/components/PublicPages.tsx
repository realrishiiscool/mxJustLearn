/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, PlayCircle, Star, Users, Clock, ArrowRight, CheckCircle2, ChevronRight, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Course } from '../types';
import { COURSES, PRICING_PLANS } from '../data';

interface PublicPagesProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectCourse: (course: Course) => void;
  selectedCourse: Course | null;
  onEnroll: (courseId: string) => void;
  enrolledCourses: string[];
}

export default function PublicPages({
  activeTab,
  setActiveTab,
  onSelectCourse,
  selectedCourse,
  onEnroll,
  enrolledCourses
}: PublicPagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  const categories = ['All', 'Software Engineering', 'Data Science', 'Artificial Intelligence', 'Automation Testing'];

  // Handle Catalog Filters
  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.skillsCovered.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'Students') return b.studentCount - a.studentCount;
    return 0; // Default popular sort
  });

  // --- RENDERING DETAILED COURSE PREVIEW ---
  if (selectedCourse) {
    const isEnrolled = enrolledCourses.includes(selectedCourse.id);
    return (
      <div id="course-preview-page-container" className="p-8 max-w-5xl mx-auto text-slate-200">
        <button
          id="preview-back-btn"
          onClick={() => onSelectCourse(null)}
          className="mb-6 text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1.5 transition"
        >
          ← Back to Catalog
        </button>

        {/* Master Banner Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 mb-8 shadow-xl shadow-black/15 relative overflow-hidden">
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/70 border border-slate-850 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono mb-4">
                {selectedCourse.category}
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">{selectedCourse.title}</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs py-4 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Instructor</span>
                <span className="font-semibold text-slate-200 mt-1 block">{selectedCourse.instructor}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Total Duration</span>
                <span className="font-semibold text-slate-200 mt-1 block font-mono">{selectedCourse.duration}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Skill Level</span>
                <span className="font-semibold text-slate-200 mt-1 block">{selectedCourse.level}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Student Rating</span>
                <span className="font-semibold text-yellow-500 mt-1 block font-mono">★ {selectedCourse.rating} / 5</span>
              </div>
            </div>
          </div>

          {/* Action Sandbox Card */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 mb-4">
              <img src={selectedCourse.thumbnailUrl} alt={selectedCourse.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-11 h-11 text-white opacity-90 drop-shadow-lg" />
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">PROGRAM PRICE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white">${selectedCourse.price}</span>
                <span className="text-slate-550 text-xs font-semibold line-through">${(selectedCourse.price * 1.5).toFixed(0)}</span>
              </div>
              <span className="text-[10px] text-green-400 font-semibold mt-1 block">Full life-long platform access</span>
            </div>

            {isEnrolled ? (
              <button
                id="preview-study-btn"
                onClick={() => {
                  onSelectCourse(null);
                  setActiveTab('dashboard');
                }}
                className="w-full py-3 bg-green-600 hover:bg-green-550 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
              >
                Go to Active Learning Node
              </button>
            ) : (
              <button
                id="preview-enroll-btn"
                onClick={() => onEnroll(selectedCourse.id)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition duration-150 cursor-pointer"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>

        {/* Content Tabs (Curriculum, Outcomes, FAQ) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Outcomes */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-4">Learning Objectives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCourse.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Timeline */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
              <h3 className="font-bold text-base text-white mb-4">Course Curriculum</h3>
              <div className="space-y-4">
                {selectedCourse.modules.map((mod, idx) => (
                  <div key={idx} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                    <div className="p-4 bg-slate-900 border-b border-slate-850 font-semibold text-xs text-slate-200">
                      {mod.title}
                    </div>
                    <div className="p-2 divide-y divide-slate-900/60 text-xs">
                      {mod.lessons.map((les, j) => (
                        <div key={j} className="p-3 flex items-center justify-between text-slate-400">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="font-medium text-slate-300 truncate">{les.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[10px] text-slate-550">{les.duration}</span>
                            {les.previewAllowed && (
                              <span className="text-[9px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">Preview</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Instructor Profile Card */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-3 flex items-center justify-center font-extrabold text-md text-white border-2 border-slate-700 shadow">
                {selectedCourse.instructor.split(' ').map(n => n[0]).join('')}
              </div>
              <h4 className="font-bold text-sm text-slate-100">{selectedCourse.instructor}</h4>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mt-0.5">Primary Mentor</span>
              <p className="text-slate-450 text-xs leading-relaxed mt-3 border-t border-slate-800/80 pt-3">{selectedCourse.instructorBio}</p>
            </div>

            {/* FAQs */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
              <h3 className="font-bold text-sm text-white mb-4">Course FAQ</h3>
              <div className="space-y-4 text-xs">
                {selectedCourse.faqs.map((faq, i) => (
                  <div key={i} className="space-y-1.5">
                    <h5 className="font-bold text-slate-200">{faq.question}</h5>
                    <p className="text-slate-450 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING LANDING HOME ---
  if (activeTab === 'home') {
    return (
      <div id="landing-home-container" className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Visual Premium Hero */}
        <section className="relative overflow-hidden pt-24 pb-20 border-b border-slate-900">
          <div className="absolute inset-0 bg-radial-at-t from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 right-1/10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-medium text-slate-300 mb-6 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>AI-FIRST MODERN LEARNING PLATFORM</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Upgrade Your Skills.<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Accelerate Your Career.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Master Full Stack Java, Python, Automation Testing, Power BI, and Generative AI. Code inside our interactive browser, complete dynamic assessments, and obtain placement certification.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                id="hero-explore-btn"
                onClick={() => setActiveTab('catalog')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:opacity-95 transition flex items-center gap-2 group cursor-pointer"
              >
                Explore Courses
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition duration-150" />
              </button>
              <button
                id="hero-start-free-btn"
                onClick={() => setActiveTab('catalog')}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800/80 text-slate-200 border border-slate-800 rounded-xl font-semibold transition cursor-pointer"
              >
                Start Learning Free
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-900 text-left">
              <div>
                <h4 className="text-3xl font-extrabold text-white">98%</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Placement rate</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-white">15K+</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Students taught</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-white">500+</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Hiring partners</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-white">4.8★</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Average Course rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Course Section */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-indigo-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2">INDUSTRY ALIGNED CERTIFICATES</span>
              <h2 className="text-3xl font-bold tracking-tight text-white">Featured Career Programs</h2>
            </div>
            <button onClick={() => setActiveTab('catalog')} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 group cursor-pointer">
              See All Courses
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COURSES.slice(0, 3).map((course) => (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                onClick={() => onSelectCourse(course)}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-indigo-400 uppercase tracking-wide border border-indigo-500/20">
                      {course.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-indigo-400 font-medium font-mono uppercase tracking-wider block mb-1.5">{course.category}</span>
                    <h3 className="font-bold text-lg text-white mb-2 leading-snug group-hover:text-blue-400 transition">{course.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.skillsCovered.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[10px] bg-slate-850 text-slate-300 px-2.5 py-1 rounded-full font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-slate-200">{course.rating}</span>
                    <span>({course.studentCount.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories & Testimonials */}
        <section className="py-20 bg-slate-900/40 border-y border-slate-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold block mb-2">PROVEN PLACEMENTS</span>
              <h2 className="text-3xl font-bold tracking-tight text-white">Our Alumni Success Stories</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">Hear directly from students who unlocked senior technical roles and 100%+ salary multiplier growths.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
                <div className="absolute top-8 right-8 text-4xl text-indigo-500/20 font-serif">“</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-extrabold text-sm">
                    SK
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Sanjay Kumar</h4>
                    <p className="text-xs text-slate-500">Java Full Stack Alumnus</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  "I was a mechanical fresher looking to transition to coding. The LeetCode-style Coding Arena on MX JustLearn taught me data structures and Java algorithms simply. I was placed at Capgemini as an Associate Engineer!"
                </p>
                <div className="font-mono text-[10px] text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-3 py-1.5 rounded-lg inline-block">
                  PLACEMENT: ₹7.5 LPA · Capgemini
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
                <div className="absolute top-8 right-8 text-4xl text-indigo-500/20 font-serif">“</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-extrabold text-sm">
                    PR
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Priya Reddy</h4>
                    <p className="text-xs text-slate-500">Automation Tester</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  "The automation engineering program is incredible. Writing actual Selenium scripts, interacting directly with Gherkin BDD code inside assignments, and downloading the digital certificate enabled me to crack my TCS interview."
                </p>
                <div className="font-mono text-[10px] text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-3 py-1.5 rounded-lg inline-block">
                  SALARY GROWTH: 120% Increase · TCS
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
                <div className="absolute top-8 right-8 text-4xl text-indigo-500/20 font-serif">“</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-extrabold text-sm">
                    MD
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Manish Dwivedi</h4>
                    <p className="text-xs text-slate-500">Gen AI Alumnus</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  "The Generative AI syllabus is unmatched. Integrating real server-side Gemini API prompts, understanding LangChain vector indexing and deploying fully functional chatbots landed me a Lead AI Engineer job."
                </p>
                <div className="font-mono text-[10px] text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-3 py-1.5 rounded-lg inline-block">
                  PLACEMENT: ₹14 LPA · TechNexus
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Subscriptions Comparison */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold block mb-2">SUBSCRIPTION PLANS</span>
            <h2 className="text-3xl font-bold tracking-tight text-white">Invest In Your Technical Mastery</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">Pick an appropriate tier. High value learning built for students, job hunters, and enterprises alike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {PRICING_PLANS.map((plan, i) => (
              <div
                key={i}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                    Recommended
                  </div>
                )}
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">{plan.badge}</span>
                    <h3 className="font-bold text-md text-white mt-1">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-slate-500 text-xs block mt-1 font-medium font-mono">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded && plan.notIncluded.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-650 line-through">
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`pricing-btn-${i}`}
                  onClick={() => setActiveTab('catalog')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // --- RENDERING COURSE CATALOG ---
  if (activeTab === 'catalog') {
    return (
      <div id="catalog-page-container" className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Technical Course Catalog</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Browse high-fidelity microservices, generative artificial intelligence, and test frameworks.</p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shadow-lg shadow-black/10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search java, python, machine learning, testing, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/45 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-slate-500 font-medium">Level:</span>
              <select
                id="level-filter"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-transparent border-none text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="Popular">Most Popular</option>
                <option value="Rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Card Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course.id);
              return (
                <div
                  key={course.id}
                  id={`catalog-card-${course.id}`}
                  onClick={() => onSelectCourse(course)}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-indigo-400 uppercase tracking-wide border border-indigo-500/20 font-mono">
                        {course.badge}
                      </div>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] text-indigo-400 font-semibold font-mono uppercase tracking-wider block mb-1.5">{course.category}</span>
                      <h3 className="font-bold text-base text-white leading-snug group-hover:text-indigo-400 transition mb-2">{course.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {course.skillsCovered.slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-[9px] bg-slate-850 text-slate-300 px-2 rounded-full font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400 font-medium bg-slate-950/20">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-slate-200">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div>
                      {isEnrolled ? (
                        <span className="text-green-400 font-semibold bg-green-950/30 px-2 py-0.5 rounded border border-green-900/30 text-[10px]">Enrolled</span>
                      ) : (
                        <span className="text-indigo-400 font-semibold text-[10px]">View Preview</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No matching courses found</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your query, category filter or level configurations.</p>
          </div>
        )}
      </div>
    );
  }



  return null;
}
