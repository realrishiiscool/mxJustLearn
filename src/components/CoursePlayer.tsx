/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, BookOpen, Clock, Users, ArrowLeft,
  Sparkles, RefreshCw, Send, CheckCircle2, Bookmark, FileText, MessageSquare, Lock
} from 'lucide-react';
import { Course, Lesson } from '../types';

interface CoursePlayerProps {
  course: Course;
  onClose: () => void;
}

function getEmbedUrl(url: string): { type: 'youtube' | 'direct'; embedUrl: string } {
  if (!url) return { type: 'direct', embedUrl: '' };
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }
  return { type: 'direct', embedUrl: url };
}

function parseDuration(durationStr: string): number {
  if (!durationStr) return 600;
  const num = parseInt(durationStr.replace(/[^\d]/g, ''));
  if (isNaN(num)) return 600;
  if (durationStr.toLowerCase().includes('hr') || durationStr.toLowerCase().includes('hour')) {
    return num * 3600;
  }
  return num * 60;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? h : null,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].filter(x => x !== null).join(':');
}

export default function CoursePlayer({ course, onClose }: CoursePlayerProps) {
  // Guard against empty modules or lessons
  if (!course.modules || course.modules.length === 0 || !course.modules[0].lessons || course.modules[0].lessons.length === 0) {
    return (
      <div id="course-player-container" className="bg-slate-950 text-slate-200 min-h-screen flex flex-col justify-center items-center p-6 text-center">
        <BookOpen className="w-12 h-12 text-slate-500 mb-3" />
        <h2 className="text-xl font-bold text-white">No Lectures Available</h2>
        <p className="text-slate-400 text-xs mt-1 max-w-sm">This course syllabus is currently under construction. Please check back later!</p>
        <button onClick={onClose} className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
          Exit Player Node
        </button>
      </div>
    );
  }

  // Playlist tracking
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.modules[0].lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'pdf' | 'text'>('video');
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activeLesson) {
      if (activeLesson.videoUrl) {
        setActiveMediaTab('video');
      } else if (activeLesson.pdfUrl) {
        setActiveMediaTab('pdf');
      } else if (activeLesson.textContent) {
        setActiveMediaTab('text');
      }
      // Reset progress & real duration when changing lessons
      setRealDuration(null);
      setCurrentTime(0);
    }
  }, [activeLesson.id]);

  const parsedDuration = parseDuration(activeLesson.duration);
  const totalSeconds = realDuration !== null ? realDuration : parsedDuration;

  // Sync isPlaying state to YouTube iframe
  useEffect(() => {
    if (iframeRef.current) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: command
      }), '*');
      
      // Fallback trigger in case of delay or load state timing mismatches
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
          event: 'command',
          func: command
        }), '*');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, activeLesson.id]);

  // Listen to messages from YouTube iframe to get real duration, currentTime, and state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Info / Progress updates
        if (data.event === 'infoDelivery' && data.info) {
          const info = data.info;
          
          if (info.currentTime !== undefined) {
            setCurrentTime(Math.floor(info.currentTime));
          }
          
          if (info.duration !== undefined && info.duration > 0) {
            setRealDuration(Math.floor(info.duration));
          }

          // Only listen to ended state (0) to automatically halt playback at the end
          if (info.playerState === 0) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }

        // State change fallback (ended = 0)
        if (data.event === 'onStateChange' && data.info === 0) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle seek range change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [val, true]
      }), '*');
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

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
          {/* Media Format Selector Tabs */}
          {(activeLesson.videoUrl || activeLesson.pdfUrl || activeLesson.textContent) && (
            <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850/80 w-fit">
              {activeLesson.videoUrl && (
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === 'video'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" /> Video Lecture
                </button>
              )}
              
              {activeLesson.pdfUrl && (
                <button
                  onClick={() => setActiveMediaTab('pdf')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === 'pdf'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Document
                </button>
              )}
              
              {activeLesson.textContent && (
                <button
                  onClick={() => setActiveMediaTab('text')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === 'text'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Reading Material
                </button>
              )}
            </div>
          )}

          <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden flex flex-col relative group">
            {/* Player Viewport (Aspect Video) */}
            <div className="aspect-video relative bg-black">
              {(() => {
                if (activeMediaTab === 'pdf' && activeLesson.pdfUrl) {
                  const isGoogleDrive = activeLesson.pdfUrl.includes('drive.google.com');
                  const embedPdfUrl = getPdfEmbedUrl(activeLesson.pdfUrl);
                  
                  return (
                    <div className="w-full h-full relative bg-slate-900">
                      {isGoogleDrive ? (
                        <iframe 
                          key={`pdf-${activeLesson.id}`}
                          src={embedPdfUrl} 
                          className="w-full h-full border-0 bg-slate-900"
                          title="Google Drive PDF Reader"
                        />
                      ) : (
                        <embed 
                          key={`pdf-${activeLesson.id}`}
                          src={`${embedPdfUrl}#toolbar=0&navpanes=0`} 
                          type="application/pdf"
                          className="w-full h-full border-0"
                        />
                      )}
                      
                      {/* Transparent overlay covering the top bar (popout, print, download buttons) */}
                      <div className="absolute top-0 left-0 right-0 h-[50px] bg-transparent z-10 cursor-default" />
                    </div>
                  );
                } else if (activeMediaTab === 'text' && activeLesson.textContent) {
                  return (
                    <div className="w-full h-full bg-slate-900/85 p-8 overflow-y-auto text-slate-200 leading-relaxed font-sans text-xs scrollbar-thin">
                      <div 
                        className="space-y-4 max-w-2xl mx-auto" 
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(activeLesson.textContent) }} 
                      />
                    </div>
                  );
                } else {
                  // Video Tab
                  const { type, embedUrl } = getEmbedUrl(activeLesson.videoUrl);
                  if (type === 'youtube') {
                    return (
                      <div className="w-full h-full relative">
                        <iframe 
                          ref={iframeRef}
                          key={activeLesson.id}
                          src={`${embedUrl}?modestbranding=1&rel=0&controls=0&enablejsapi=1&showinfo=0&iv_load_policy=3`} 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full border-0 pointer-events-none"
                        />
                        {/* Transparent overlay covering the entire player to block all native interactions */}
                        <div className="absolute inset-0 bg-transparent z-10 cursor-pointer" onClick={togglePlay} />
                        
                        {activeLesson.isPrivateYoutube && (
                          <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-red-500/50 flex items-center gap-2 z-20">
                            <Lock className="w-3 h-3" /> Private YouTube Link - Requires Approved Google Account
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <video
                        id="player-video-source"
                        key={activeLesson.id}
                        src={embedUrl}
                        controls
                        autoPlay={isPlaying}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                }
              })()}
              
              {/* Play/Pause custom HUD overlays */}
              {!isPlaying && getEmbedUrl(activeLesson.videoUrl).type !== 'youtube' && activeMediaTab === 'video' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                  <Play className="w-16 h-16 text-white opacity-80" />
                </div>
              )}
            </div>

            {/* Custom Control Dock (Sits underneath the aspect-video screen) */}
            {activeMediaTab === 'video' && getEmbedUrl(activeLesson.videoUrl).type === 'youtube' && (
              <div className="bg-slate-900 border-t border-slate-800/80 px-5 py-4 flex items-center gap-4 z-20">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white cursor-pointer transition shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
                </button>
                
                <span className="text-[10px] font-mono text-slate-350 select-none">
                  {formatTime(currentTime)} / {formatTime(totalSeconds)}
                </span>
                
                <input
                  type="range"
                  min={0}
                  max={totalSeconds}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-indigo-500 h-1 rounded-lg bg-slate-800 cursor-pointer outline-none"
                />
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

          {/* Lesson Material (Rich Text / HTML / Markdown) Showcase */}
          {activeLesson.textContent && (
            <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 pb-2.5 border-b border-slate-800 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Lesson Reading Material & Resources
              </h3>
              <div 
                className="text-slate-350 leading-relaxed text-xs space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(activeLesson.textContent) }}
              />
            </div>
          )}

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
                          setCurrentTime(0);
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

function parseMarkdown(md: string): string {
  if (!md) return '';
  
  // Clean markdown breaks
  let html = md.replace(/\r\n/g, '\n');

  // 1. Code blocks (```javascript ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)(?:```|$)/g, '<pre class="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto my-3"><code class="language-$1">$2</code></pre>');
  
  // 2. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-indigo-300 text-[10px]">$1</code>');

  // 3. Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableRows: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        lines[i] = '';
        continue;
      }
      
      const cols = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isHeader = !inTable;
      inTable = true;
      
      const colTag = isHeader ? 'th' : 'td';
      const cellMarkup = cols.map(c => '<' + colTag + ' class="border border-slate-800 px-3 py-1.5 font-bold text-left text-slate-100 bg-slate-900">' + c + '</' + colTag + '>').join('');
      tableRows.push('<tr class="' + (isHeader ? 'bg-slate-900 font-bold text-white' : 'hover:bg-slate-900/20') + '">' + cellMarkup + '</tr>');
      lines[i] = '';
    } else {
      if (inTable) {
        lines[i] = '<table class="w-full border-collapse border border-slate-800 my-3 text-[11px]">' + tableRows.join('') + '</table>\n' + lines[i];
        inTable = false;
        tableRows = [];
      }
    }
  }
  if (inTable) {
    lines.push('<table class="w-full border-collapse border border-slate-800 my-3 text-[11px]">' + tableRows.join('') + '</table>');
  }
  html = lines.join('\n');

  // 4. Headers
  html = html.replace(/^### (.*?)$/gm, '<h4 class="text-sm font-bold text-white mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="text-base font-extrabold text-white mt-5 mb-2.5 border-b border-slate-800 pb-1">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="text-lg font-black text-indigo-400 mt-6 mb-3">$1</h2>');

  // 5. Bullet Lists
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="list-disc ml-4 my-1 text-slate-300">$1</li>');
  html = html.replace(/(<li class="list-disc ml-4 my-1 text-slate-300">.*?<\/li>\n?)+/gs, (match) => {
    return '<ul class="my-2 space-y-1 list-inside">' + match + '</ul>';
  });

  // 6. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr class="border-slate-800 my-4" />');

  // 7. Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');
  
  // 8. Italics
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>');

  // 9. Paragraph breaks
  const paragraphs = html.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (p && !p.startsWith('<h') && !p.startsWith('<ul') && !p.startsWith('<ol') && !p.startsWith('<table') && !p.startsWith('<pre') && !p.startsWith('<hr')) {
      paragraphs[i] = '<p class="my-2.5 text-slate-300 leading-relaxed">' + p + '</p>';
    }
  }
  html = paragraphs.join('\n');

  return html;
}

function getPdfEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return 'https://drive.google.com/file/d/' + match[1] + '/preview';
    }
  }
  return url;
}
