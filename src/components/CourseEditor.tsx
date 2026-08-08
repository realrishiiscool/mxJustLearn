import React, { useState } from 'react';
import { COURSES } from '../data';
import { Course, Module, Lesson } from '../types';
import { Save, Edit2, PlayCircle, Lock } from 'lucide-react';

export default function CourseEditor() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0]?.id || '');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivateYoutube, setIsPrivateYoutube] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const course = COURSES.find(c => c.id === selectedCourseId);
  const mod = course?.modules.find(m => m.id === selectedModuleId);
  const lesson = mod?.lessons.find(l => l.id === selectedLessonId);

  const handleLessonSelect = (l: Lesson) => {
    setSelectedLessonId(l.id);
    setVideoUrl(l.videoUrl);
    setIsPrivateYoutube(!!l.isPrivateYoutube);
    setSuccessMsg('');
  };

  const handleSave = () => {
    if (lesson) {
      lesson.videoUrl = videoUrl;
      lesson.isPrivateYoutube = isPrivateYoutube;
      setSuccessMsg('Lesson updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-200">Course & Curriculum Editor</h3>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono uppercase">Admin & Trainer Only</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Column */}
        <div className="space-y-4 md:col-span-1 border-r border-slate-800 pr-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId('');
                setSelectedLessonId('');
                setSuccessMsg('');
              }}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 focus:outline-none"
            >
              <option value="">-- Choose Course --</option>
              {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {course && (
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Curriculum Modules</label>
              <div className="space-y-2">
                {course.modules.map(m => (
                  <div key={m.id} className="space-y-1">
                    <button
                      onClick={() => setSelectedModuleId(m.id === selectedModuleId ? '' : m.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors ${selectedModuleId === m.id ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-950 hover:bg-slate-800'}`}
                    >
                      {m.title}
                    </button>
                    {selectedModuleId === m.id && (
                      <div className="pl-4 space-y-1 mt-1">
                        {m.lessons.map(l => (
                          <button
                            key={l.id}
                            onClick={() => handleLessonSelect(l)}
                            className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 ${selectedLessonId === l.id ? 'bg-indigo-600/40 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span className="truncate">{l.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor Column */}
        <div className="md:col-span-2 space-y-6">
          {!lesson ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              Select a lesson from the left to edit its details.
            </div>
          ) : (
            <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-slate-850">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-sm text-slate-200">Editing: {lesson.title}</h4>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Video Source URL (Embed Link)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={isPrivateYoutube}
                  onChange={(e) => setIsPrivateYoutube(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-red-400" />
                    Private YouTube Link
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Enable this if the YouTube video is private. Students will need to be logged into an approved Google account to view it.
                  </div>
                </div>
              </label>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                {successMsg && (
                  <span className="text-green-400 font-semibold">{successMsg}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
