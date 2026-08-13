import React, { useState } from 'react';
import { X, Save, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface AddCourseFormProps {
  courses: Course[];
  onClose: () => void;
  onSuccess: (courses: Course[]) => void;
}

export default function AddCourseForm({ courses, onClose, onSuccess }: AddCourseFormProps) {
  // Course form fields state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Java Full Stack');
  const [customCategory, setCustomCategory] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const defaultCategories = ['Java Full Stack', 'Python Django', 'Data Science & ML', 'Generative AI', 'Automation Testing', 'Cloud & DevOps'];
  const existingCategories = Array.from(new Set(courses.map(c => c.category)))
    .filter(cat => cat && cat.trim() !== '');
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));
  const [instructor, setInstructor] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [price, setPrice] = useState(0);
  const [badge, setBadge] = useState<'Free' | 'Premium' | 'Popular' | 'Hot'>('Free');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [skillsCovered, setSkillsCovered] = useState('');

  // Curriculum structure builder state
  interface FormLesson {
    title: string;
    videoUrl: string;
    textContent: string;
    pdfUrl: string;
    duration: string;
  }

  interface FormModule {
    title: string;
    lessons: FormLesson[];
  }

  const [modules, setModules] = useState<FormModule[]>([
    {
      title: 'Module 1: Course Onboarding & Setup',
      lessons: [
        {
          title: 'Lesson 1.1: Getting Started and Local Setup',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          textContent: '',
          pdfUrl: '',
          duration: '15 Mins'
        }
      ]
    }
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddModule = () => {
    setModules([
      ...modules,
      {
        title: `Module ${modules.length + 1}: New Syllabus Module`,
        lessons: [
          {
            title: `Lesson ${modules.length + 1}.1: New Lecture Topic`,
            videoUrl: '',
            textContent: '',
            pdfUrl: '',
            duration: '15 Mins'
          }
        ]
      }
    ]);
  };

  const handleRemoveModule = (modIdx: number) => {
    if (modules.length === 1) return;
    setModules(modules.filter((_, idx) => idx !== modIdx));
  };

  const handleModuleTitleChange = (modIdx: number, val: string) => {
    const updated = [...modules];
    updated[modIdx].title = val;
    setModules(updated);
  };

  const handleAddLesson = (modIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons.push({
      title: `Lesson ${modIdx + 1}.${updated[modIdx].lessons.length + 1}: New Lecture Topic`,
      videoUrl: '',
      textContent: '',
      pdfUrl: '',
      duration: '15 Mins'
    });
    setModules(updated);
  };

  const handleRemoveLesson = (modIdx: number, lesIdx: number) => {
    if (modules[modIdx].lessons.length === 1) return;
    const updated = [...modules];
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, idx) => idx !== lesIdx);
    setModules(updated);
  };

  const handleLessonFieldChange = (modIdx: number, lesIdx: number, field: keyof FormLesson, val: string) => {
    const updated = [...modules];
    updated[modIdx].lessons[lesIdx] = {
      ...updated[modIdx].lessons[lesIdx],
      [field]: val
    };
    setModules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !instructor.trim() || !description.trim()) {
      setErrorMsg('Please fill in all required fields (Title, Instructor, and Description).');
      return;
    }

    if (category === 'custom' && !customCategory.trim()) {
      setErrorMsg('Please enter a name for the custom category.');
      return;
    }

    setSubmitting(true);

    try {
      const newCourse: Partial<Course> = {
        title: title.trim(),
        category: category === 'custom' ? customCategory.trim() : category.trim(),
        instructor: instructor.trim(),
        instructorBio: instructorBio.trim() || 'Professional Senior Software Engineering Coach',
        rating: 4.8,
        studentCount: 0,
        duration: '12 Hours',
        price: Number(price) || 0,
        level,
        thumbnailUrl: thumbnailUrl.trim(),
        badge,
        description: description.trim(),
        learningOutcomes: learningOutcomes.split(',').map(item => item.trim()).filter(Boolean),
        skillsCovered: skillsCovered.split(',').map(item => item.trim()).filter(Boolean),
        modules: modules.map((mod, modIdx) => ({
          id: 'mod-' + Math.random().toString(36).substring(2, 9) + `_${modIdx}`,
          title: mod.title.trim() || `Module ${modIdx + 1}`,
          lessons: mod.lessons.map((les, lesIdx) => ({
            id: 'les-' + Math.random().toString(36).substring(2, 9) + `_${modIdx}_${lesIdx}`,
            title: les.title.trim() || `Lesson ${modIdx + 1}.${lesIdx + 1}`,
            duration: les.duration || '15 Mins',
            videoUrl: les.videoUrl.trim(),
            textContent: les.textContent.trim(),
            pdfUrl: les.pdfUrl.trim(),
            previewAllowed: modIdx === 0 && lesIdx === 0,
            isPrivateYoutube: false
          }))
        })),
        faqs: [
          {
            question: 'Are there coding assignments included in this course?',
            answer: 'Yes! This course includes intermediate assessment modules and LeetCode-style challenges built into the dashboard.'
          }
        ]
      };

      const res = await fetch('/api/courses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });

      const data = await res.json();
      if (data.success && data.courses) {
        setSuccessMsg('Course successfully created! Refreshing catalogs...');
        setTimeout(() => {
          onSuccess(data.courses);
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Server error: Unable to create new course.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error: Unable to connect to server backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="add-course-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-6xl w-full p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto my-4 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create a New Course</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Curriculum Builder Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/30 text-red-400 rounded-2xl flex items-center gap-3 text-xs animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-2xl flex items-center gap-3 text-xs animate-pulse">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Course Metadata & Info (5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">

              {/* Section 1: Basic Info */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-300 tracking-tight border-b border-slate-800 pb-2">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced TypeScript Architectures"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Category / Tech Track *</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomCategory('');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">-- Add Custom Category --</option>
                </select>
                {category === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Experience Level *</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Beginner">Beginner (No prior coding)</option>
                  <option value="Intermediate">Intermediate (Core syntax familiar)</option>
                  <option value="Advanced">Advanced (Design patterns & Scalability)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Pricing Mode & Badge *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-355 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                    <option value="Popular">Popular</option>
                    <option value="Hot">Hot</option>
                  </select>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Price in INR (₹)"
                    disabled={badge === 'Free'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Thumbnail Image URL</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Section 2: Coach Info */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-300 tracking-tight border-b border-slate-800 pb-2">2. Instructor & Coach Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Instructor Name *</label>
                <input
                  type="text"
                  required
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Dr. Samantha Ross"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Instructor Bio / Tagline</label>
                <input
                  type="text"
                  value={instructorBio}
                  onChange={(e) => setInstructorBio(e.target.value)}
                  placeholder="e.g. Ex-Google Architect, 10+ yrs JVM Systems"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Outcomes & Skills */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-300 tracking-tight border-b border-slate-800 pb-2">3. Detailed Overview & Curriculum Highlights</h3>
            
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Course Description *</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give a thorough overview of the learning journey, syllabus features, and practical applications..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Learning Outcomes (Comma-separated)</label>
                <input
                  type="text"
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  placeholder="Build production APIs, Deploy container clusters, Optimize index structures"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Skills Covered (Comma-separated)</label>
                <input
                  type="text"
                  value={skillsCovered}
                  onChange={(e) => setSkillsCovered(e.target.value)}
                  placeholder="TypeScript, Docker, REST, Kubernetes"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>
          </div> {/* End of Left Column */}

          {/* Right side: Curriculum Builder (7/12 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 4: Curriculum Builder */}
            <div className="bg-slate-950/30 p-5 md:p-6 rounded-3xl border border-slate-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-300 tracking-tight">4. Course Curriculum & Syllabus Structure</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Define learning modules and their respective lessons</p>
              </div>
              <button
                type="button"
                onClick={handleAddModule}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
              >
                + Add Module Node
              </button>
            </div>

            <div className="space-y-6 max-h-[58vh] overflow-y-auto pr-1.5 custom-scrollbar">
              {modules.map((mod, modIdx) => (
                <div key={modIdx} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 relative">
                  
                  {/* Module Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] text-indigo-400 font-mono uppercase tracking-wider mb-1">MODULE {modIdx + 1} TITLE</label>
                      <input
                        type="text"
                        required
                        value={mod.title}
                        onChange={(e) => handleModuleTitleChange(modIdx, e.target.value)}
                        placeholder="e.g. Module 1: Architecture Foundations"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-bold focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-end">
                      <button
                        type="button"
                        onClick={() => handleAddLesson(modIdx)}
                        className="px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl font-semibold transition cursor-pointer text-[10px]"
                      >
                        + Add Lesson
                      </button>
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(modIdx)}
                          className="px-3 py-2 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 rounded-xl font-semibold transition cursor-pointer text-[10px]"
                        >
                          Delete Module
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lessons inside Module */}
                  <div className="space-y-4 pt-2 border-t border-slate-850">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">LESSONS PLAYLIST</span>
                    {mod.lessons.map((les, lesIdx) => (
                      <div key={lesIdx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-850/80 space-y-3 relative group/lesson">
                        
                        {/* Lesson Header / Delete Button */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-mono">Lesson {modIdx + 1}.{lesIdx + 1}</span>
                          {mod.lessons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLesson(modIdx, lesIdx)}
                              className="text-red-450 hover:text-red-400 text-[10px] font-semibold transition cursor-pointer"
                            >
                              Remove Lesson
                            </button>
                          )}
                        </div>

                        {/* Title & Video Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 mb-1 font-semibold text-[10px]">Lesson Title *</label>
                            <input
                              type="text"
                              required
                              value={les.title}
                              onChange={(e) => handleLessonFieldChange(modIdx, lesIdx, 'title', e.target.value)}
                              placeholder="e.g. Getting Started & Architecture Overview"
                              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-350 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1 font-semibold text-[10px]">YouTube Video Embed Link</label>
                            <input
                              type="text"
                              value={les.videoUrl}
                              onChange={(e) => handleLessonFieldChange(modIdx, lesIdx, 'videoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/embed/..."
                              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-350 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* PDF & Material Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-550 mb-1 font-semibold text-[10px]">Reference PDF Document Link (URL)</label>
                            <input
                              type="text"
                              value={les.pdfUrl}
                              onChange={(e) => handleLessonFieldChange(modIdx, lesIdx, 'pdfUrl', e.target.value)}
                              placeholder="https://example.com/materials.pdf"
                              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-350 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-550 mb-1 font-semibold text-[10px]">Lesson Material (Rich Text / HTML / Markdown)</label>
                            <textarea
                              value={les.textContent}
                              onChange={(e) => handleLessonFieldChange(modIdx, lesIdx, 'textContent', e.target.value)}
                              placeholder="e.g. # Introduction..."
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-350 focus:outline-none resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
          </div> {/* End of Right Column */}
        </div> {/* End of Grid */}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 animate-fade-in">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-650/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> 
              {submitting ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
