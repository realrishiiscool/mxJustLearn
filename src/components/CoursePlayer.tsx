/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Pause, BookOpen, Clock, Users, ArrowLeft,
  Sparkles, RefreshCw, Send, CheckCircle2, Bookmark, FileText, MessageSquare, Lock
} from 'lucide-react';
import { Course, Lesson } from '../types';

interface CoursePlayerProps {
  course: Course;
  onClose: () => void;
}

export default function CoursePlayer({ course, onClose }: CoursePlayerProps) {
  // Playlist tracking
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.modules[0].lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Bookmarks & Notes Loggers
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');

  // AI Summary state
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  // Doubt Chat assistant
  const [doubtText, setDoubtText] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');
  const [loadingDoubt, setLoadingDoubt] = useState(false);

  // Add bookmark
  const handleAddBookmark = () => {
    if (!bookmarks.includes(activeLesson.title)) {
      setBookmarks([...bookmarks, activeLesson.title]);
    }
  };

  // Add note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([...notes, `[${activeLesson.title}]: ${newNote}`]);
    setNewNote('');
  };

  // Trigger dynamic AI study sheet summary from Gemini
  const handleGenerateSummary = async () => {
    setLoadingAiSummary(true);
    setAiSummaryText('');
    try {
      const res = await fetch('/api/ai/course-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: course.title,
          chapterTitle: activeLesson.title
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiSummaryText(data.text);
      } else {
        setAiSummaryText('Failed to generate summary. Ensure process.env.GEMINI_API_KEY is active on Server.');
      }
    } catch (err) {
      setAiSummaryText('Error connecting to Server-side AI Summarizer.');
    } finally {
      setLoadingAiSummary(false);
    }
  };

  // Ask AI Doubt
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setLoadingDoubt(true);
    setDoubtResponse('');
    try {
      const res = await fetch('/api/ai/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Doubt in lesson "${activeLesson.title}" from course "${course.title}": ${doubtText}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setDoubtResponse(data.text);
      } else {
        setDoubtResponse('Error connecting to AI Tutor. Please review Server logs.');
      }
    } catch (err) {
      setDoubtResponse('AI is currently offline. Review internet configurations.');
    } finally {
      setLoadingDoubt(false);
    }
  };

  return (
    <div id="course-player-container" className="bg-slate-950 text-slate-200 min-h-screen">
      {/* Header bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-xs">
        <button
          id="player-exit-btn"
          onClick={onClose}
          className="font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          ← Exit Player Node
        </button>
        <div className="text-center font-bold">
          <span className="text-[10px] text-blue-400 font-mono block uppercase tracking-wider">ACTIVE CLASSROOM PLAYLIST</span>
          <span className="text-slate-200 text-sm mt-0.5 block truncate max-w-xs">{course.title}</span>
        </div>
        <div className="w-24 text-right" /> {/* Spacer */}
      </div>

      {/* Main Split Player view */}
      <div className="flex flex-col xl:flex-row h-[calc(100vh-53px)] overflow-hidden">
        
        {/* Left Column: Video screen & AI helpers */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-black border border-slate-850 rounded-3xl overflow-hidden aspect-video relative group">
            {activeLesson.isPrivateYoutube ? (
              <>
                <iframe 
                  key={activeLesson.id}
                  src={activeLesson.videoUrl} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full border-0"
                />
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-red-500/50 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Private YouTube Link - Requires Approved Google Account
                </div>
              </>
            ) : (
              <video
                id="player-video-source"
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Play/Pause custom HUD overlays */}
            {!isPlaying && !activeLesson.isPrivateYoutube && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <Play className="w-16 h-16 text-white opacity-80" />
              </div>
            )}
          </div>

          {/* Under player details & Bookmarks action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div>
              <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">CURRENT CHAPTER LECTURE</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{activeLesson.title}</h2>
              <p className="text-slate-500 text-xs mt-0.5">Lesson length: {activeLesson.duration}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="bookmark-lesson-btn"
                onClick={handleAddBookmark}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                Bookmark Timestamp
              </button>
            </div>
          </div>

          {/* Tabular AI Study Sheets Summarizer & Doubt Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Dynamic AI summarizer sheet */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>AI Study-Sheet Summary</span>
                  </div>
                  <button
                    id="generate-summary-btn"
                    onClick={handleGenerateSummary}
                    disabled={loadingAiSummary}
                    className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/25 rounded font-bold uppercase tracking-wide text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    {loadingAiSummary ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    Summarize Chapter
                  </button>
                </div>

                {aiSummaryText ? (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-slate-350 max-h-[220px] overflow-y-auto whitespace-pre-wrap font-sans">
                    {aiSummaryText}
                  </div>
                ) : (
                  <p className="text-slate-500 leading-normal">Click Summarize to query Gemini and generate study notes, quiz sheets and cheats for this lecture.</p>
                )}
              </div>
            </div>

            {/* Ask AI Doubt Box */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
              <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-4">
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Ask doubt to AI Mentor</span>
              </div>

              <form onSubmit={handleAskDoubt} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="doubt-input"
                    type="text"
                    placeholder="Ask about lambda, concurrency, JPA annotation errors..."
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    id="ask-doubt-submit"
                    type="submit"
                    disabled={loadingDoubt}
                    className="px-4 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center"
                  >
                    {loadingDoubt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>

                {doubtResponse && (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-slate-350 max-h-[160px] overflow-y-auto whitespace-pre-wrap font-sans mt-2">
                    {doubtResponse}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Video Chapters & notes sidebar */}
        <div className="w-full xl:w-80 bg-slate-900 border-t xl:border-t-0 xl:border-l border-slate-800 flex flex-col justify-between overflow-y-auto h-full text-xs">
          <div>
            {/* Chapters list */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/40">
              <h3 className="font-bold text-slate-200">Course Syllabus & Chapters</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Toggle and study modules systematically.</p>
            </div>

            <div className="p-3 space-y-4 max-h-[300px] xl:max-h-[380px] overflow-y-auto">
              {course.modules.map((mod, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block px-2 mb-1">{mod.title}</span>
                  {mod.lessons.map((les) => {
                    const isActive = activeLesson.id === les.id;
                    return (
                      <button
                        key={les.id}
                        id={`playlist-lesson-${les.id}`}
                        onClick={() => {
                          setActiveLesson(les);
                          setIsPlaying(true);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-blue-600/10 border border-blue-500/25 text-blue-400 font-semibold'
                            : 'hover:bg-slate-800/50 text-slate-450'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="block truncate text-[11px] text-slate-300 font-medium">{les.title}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{les.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Notes logger bottom section */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/20">
            <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Chapter Study Notes ({notes.length})</span>
            </h4>

            {notes.length > 0 && (
              <div className="space-y-2 max-h-[110px] overflow-y-auto text-[10px] text-slate-400 font-mono mb-3">
                {notes.map((note, i) => (
                  <div key={i} className="p-2 bg-slate-950 rounded border border-slate-850 whitespace-pre-wrap">
                    {note}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                id="notes-input"
                type="text"
                placeholder="Log study thoughts..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
              />
              <button
                id="notes-submit-btn"
                type="submit"
                className="px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg font-bold"
              >
                Log
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
