import React, { useState } from 'react';
import { Course, Module, Lesson } from '../types';
import { Save, Edit2, PlayCircle, Lock } from 'lucide-react';

interface CourseEditorProps {
  courses: Course[];
  onCoursesUpdate: (courses: Course[]) => void;
}

export default function CourseEditor({ courses, onCoursesUpdate }: CourseEditorProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivateYoutube, setIsPrivateYoutube] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add module/lesson dynamic creation states
  const [newModuleName, setNewModuleName] = useState('');
  const [newLessonName, setNewLessonName] = useState('');

  const course = courses.find(c => c.id === selectedCourseId);
  const mod = course?.modules.find(m => m.id === selectedModuleId);
  const lesson = mod?.lessons.find(l => l.id === selectedLessonId);

  const handleLessonSelect = (l: Lesson) => {
    setSelectedLessonId(l.id);
    setVideoUrl(l.videoUrl);
    setIsPrivateYoutube(!!l.isPrivateYoutube);
    setTextContent(l.textContent || '');
    setPdfUrl(l.pdfUrl || '');
    setSuccessMsg('');
  };

  const handleAddModule = async () => {
    if (!newModuleName.trim() || !selectedCourseId) return;
    try {
      const res = await fetch('/api/courses/add-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId, title: newModuleName.trim() })
      });
      const data = await res.json();
      if (data.success && data.courses) {
        onCoursesUpdate(data.courses);
        setNewModuleName('');
        setSuccessMsg('Module added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonName.trim()) return;
    try {
      const res = await fetch('/api/courses/add-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, title: newLessonName.trim() })
      });
      const data = await res.json();
      if (data.success && data.courses) {
        onCoursesUpdate(data.courses);
        setNewLessonName('');
        setSuccessMsg('Lesson added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this course? This action will remove all modules, lessons, and employee enrollments and CANNOT be undone.");
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/courses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId })
      });
      const data = await res.json();
      if (data.success && data.courses) {
        onCoursesUpdate(data.courses);
        setSelectedCourseId('');
        setSelectedModuleId('');
        setSelectedLessonId('');
        setSuccessMsg('Course deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setSuccessMsg('Server error: Failed to delete course.');
      }
    } catch (e) {
      console.error(e);
      setSuccessMsg('Error connecting to server to delete course.');
    }
  };

  const handleSave = async () => {
    if (lesson && course && mod) {
      try {
        const res = await fetch('/api/courses/update-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            moduleId: mod.id,
            lessonId: lesson.id,
            videoUrl,
            isPrivateYoutube,
            textContent,
            pdfUrl
          })
        });
        const data = await res.json();
        if (data.success && data.courses) {
          onCoursesUpdate(data.courses);
          setSuccessMsg('Lesson updated successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          setSuccessMsg('Server error: Failed to update lesson.');
        }
      } catch (e) {
        console.error(e);
        // Fallback update in-session
        lesson.videoUrl = videoUrl;
        lesson.isPrivateYoutube = isPrivateYoutube;
        lesson.textContent = textContent;
        lesson.pdfUrl = pdfUrl;
        onCoursesUpdate([...courses]);
        setSuccessMsg('Lesson updated in-session (offline).');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
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
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            
            {/* Delete Course Button */}
            {selectedCourseId && (
              <button
                type="button"
                onClick={handleDeleteCourse}
                className="w-full mt-2 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 font-bold rounded-lg transition cursor-pointer text-[10px] uppercase tracking-wider text-center"
              >
                Delete This Course
              </button>
            )}
          </div>

          {course && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Curriculum Modules</label>
                <div className="space-y-2">
                  {course.modules.map(m => (
                    <div key={m.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedModuleId(m.id === selectedModuleId ? '' : m.id);
                          setNewLessonName('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors ${selectedModuleId === m.id ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-950 hover:bg-slate-800'}`}
                      >
                        {m.title}
                      </button>
                      {selectedModuleId === m.id && (
                        <div className="pl-4 space-y-1 mt-1 border-l border-slate-800">
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
                          
                          {/* Dynamic Lesson Adder */}
                          <div className="flex gap-1.5 pt-2 px-1">
                            <input
                              type="text"
                              placeholder="New Lesson Name..."
                              value={newLessonName}
                              onChange={(e) => setNewLessonName(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddLesson(m.id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px] transition cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Module Adder */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <label className="block text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Add New Module</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Module 3: Advanced Microservices"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition cursor-pointer text-[11px]"
                  >
                    Add
                  </button>
                </div>
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

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Reference PDF Document Link (URL)</label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none"
                  placeholder="https://example.com/materials.pdf"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Lesson Material (Rich Text / HTML / Markdown)</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none"
                  placeholder="<h3>Overview</h3><p>Content goes here...</p>"
                  rows={4}
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
