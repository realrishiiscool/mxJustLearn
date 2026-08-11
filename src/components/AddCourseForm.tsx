import React, { useState } from 'react';
import { X, Save, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface AddCourseFormProps {
  onClose: () => void;
  onSuccess: (courses: Course[]) => void;
}

export default function AddCourseForm({ onClose, onSuccess }: AddCourseFormProps) {
  // Course form fields state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Java Full Stack');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [instructor, setInstructor] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [price, setPrice] = useState(0);
  const [badge, setBadge] = useState<'Free' | 'Premium' | 'Popular' | 'Hot'>('Free');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [skillsCovered, setSkillsCovered] = useState('');

  // Initial Module and Lesson details to start curriculum off
  const [moduleTitle, setModuleTitle] = useState('Module 1: Course Overview & Setup');
  const [lessonTitle, setLessonTitle] = useState('Lesson 1.1: Getting Started and Local Setup');
  const [lessonVideo, setLessonVideo] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [textContent, setTextContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !instructor.trim() || !description.trim()) {
      setErrorMsg('Please fill in all required fields (Title, Instructor, and Description).');
      return;
    }

    setSubmitting(true);

    try {
      const newCourse: Partial<Course> = {
        title: title.trim(),
        category: category.trim(),
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
        modules: [
          {
            id: 'mod-' + Math.random().toString(36).substring(2, 9),
            title: moduleTitle.trim() || 'Module 1: Course Overview',
            lessons: [
              {
                id: 'les-' + Math.random().toString(36).substring(2, 9),
                title: lessonTitle.trim() || 'Lesson 1.1: Getting Started',
                duration: '15 Mins',
                videoUrl: lessonVideo.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                textContent: textContent.trim(),
                pdfUrl: pdfUrl.trim(),
                previewAllowed: true,
                isPrivateYoutube: false
              }
            ]
          }
        ],
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
    <div id="add-course-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
        
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
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Java Full Stack">Java Full Stack</option>
                  <option value="Python Django">Python Django</option>
                  <option value="Data Science & ML">Data Science & ML</option>
                  <option value="Generative AI">Generative AI</option>
                  <option value="Automation Testing">Automation Testing</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
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

          {/* Section 4: Initial Curriculum Item */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-300 tracking-tight border-b border-slate-800 pb-2">4. Initial Course Module & Video Resource</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Initial Module Title</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Initial Lesson Name</label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Embedded Video Embed Link</label>
                  <input
                    type="text"
                    value={lessonVideo}
                    onChange={(e) => setLessonVideo(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Reference PDF Document Link (URL)</label>
                  <input
                    type="text"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/materials.pdf"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Lesson Material (Rich Text / HTML / Markdown)</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="<h3>Topic Overview</h3><p>Use html tags for list, links or images.</p>"
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
