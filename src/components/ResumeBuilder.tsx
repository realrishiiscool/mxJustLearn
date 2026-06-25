import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FileText, Download, RefreshCw, Bot, Plus, Trash2, Save, 
  Briefcase, Award, BookOpen, User, Mail, Phone, MapPin, 
  Check, Sparkles, Code, GraduationCap, Layout, ChevronRight, Eye
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProjectItem {
  id: string;
  title: string;
  technologies: string;
  description: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface ResumeBuilderProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  aiResumeFeedback: string;
  setAiResumeFeedback: (feedback: string) => void;
  handleResumeCritique: (customData: {
    qualification: string;
    college: string;
    careerGoal: string;
    skills: string[];
    experienceLevel: string;
  }) => Promise<void>;
  loadingResumeCritique: boolean;
}

type TemplateType = 'academic' | 'tech_mono' | 'creative_indigo' | 'executive';

export default function ResumeBuilder({
  profile,
  setProfile,
  aiResumeFeedback,
  setAiResumeFeedback,
  handleResumeCritique,
  loadingResumeCritique
}: ResumeBuilderProps) {
  // State for resume fields
  const [resumeName, setResumeName] = useState(profile.name);
  const [resumeEmail, setResumeEmail] = useState(profile.email);
  const [resumePhone, setResumePhone] = useState(profile.phone || '+91 98765 43210');
  const [resumeLocation, setResumeLocation] = useState('Bangalore, India');
  const [resumeQual, setResumeQual] = useState(profile.qualification || 'B.Tech CS & Engineering');
  const [resumeCollege, setResumeCollege] = useState(profile.college || 'MX Institute of Technology');
  const [resumeGradYear, setResumeGradYear] = useState('2026');
  const [resumeGoal, setResumeGoal] = useState(profile.careerGoal || 'Full Stack Software Engineer');
  const [resumeSkills, setResumeSkills] = useState(profile.skills.join(', ') || 'Java, Spring Boot, React, TypeScript, SQL');
  const [experienceLevel, setExperienceLevel] = useState<string>(profile.experienceLevel || 'fresher');

  // Multi-item lists for Projects & Work Experience
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'p1',
      title: 'Enterprise Banking Security Microservice',
      technologies: 'Spring Boot, Spring Security, JWT, PostgreSQL',
      description: 'Implemented a robust token authentication system handling security filters for 10,000+ active sessions, reducing latency by 15% through Redis caching.'
    },
    {
      id: 'p2',
      title: 'Cloud-Native Dynamic Kanban Dashboard',
      technologies: 'React 18, Tailwind CSS, Node.js, WebSockets',
      description: 'Built a responsive dashboard supporting drag-and-drop workflow task tracking with multi-user collaborative synchronization and live activity notifications.'
    }
  ]);

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: 'e1',
      company: 'MR Technologies (Co-Op Internship)',
      role: 'Associate Software Intern',
      duration: 'Jan 2026 - Present',
      description: 'Assisting in developing robust Java REST controllers, building automated testing scripts using Selenium WebDriver, and maintaining responsive frontend user interfaces.'
    }
  ]);

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('creative_indigo');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // PDF Export States
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    const disabledSheets: CSSStyleSheet[] = [];
    const inlineStyleBackups = new Map<HTMLElement, string>();
    let tempStyle: HTMLStyleElement | null = null;

    try {
      const element = document.getElementById('resume-pdf-render-target');
      if (!element) {
        throw new Error('Resume template target not found for PDF generation.');
      }

      // Create a single canvas for high performance color parsing
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');

      // Cache resolved colors to avoid duplicate calculations
      const oklchCache = new Map<string, string>();
      const resolveOklchToRgb = (colorStr: string): string => {
        if (oklchCache.has(colorStr)) {
          return oklchCache.get(colorStr)!;
        }
        try {
          if (ctx) {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = colorStr;
            ctx.fillRect(0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const rgb = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${(data[3] / 255).toFixed(3)})`;
            oklchCache.set(colorStr, rgb);
            return rgb;
          }
        } catch (e) {
          console.warn('Canvas color resolution failed:', colorStr, e);
        }
        return colorStr;
      };

      // 1. Resolve oklch colors in all active stylesheets (handling inline style tags, links, and CSSOM injected rules)
      let combinedCss = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.cssRules) {
            let sheetCss = '';
            for (let j = 0; j < sheet.cssRules.length; j++) {
              sheetCss += sheet.cssRules[j].cssText + '\n';
            }
            combinedCss += sheetCss + '\n';
            
            // Disable original stylesheet temporarily so it doesn't conflict
            sheet.disabled = true;
            disabledSheets.push(sheet);
          } else {
            // If cssRules is not readable but we have an href, verify if it is Google Fonts
            const href = sheet.href || '';
            if (!href.includes('fonts.googleapis.com') && !href.includes('fonts.gstatic.com')) {
              sheet.disabled = true;
              disabledSheets.push(sheet);
            }
          }
        } catch (e) {
          // If cross-origin / CORS blocks reading, disable it if it's not Google Fonts
          const href = sheet.href || '';
          if (!href.includes('fonts.googleapis.com') && !href.includes('fonts.gstatic.com')) {
            sheet.disabled = true;
            disabledSheets.push(sheet);
          }
        }
      }

      // Convert oklch/oklab in the combined css styles
      const oklchRegex = /okl(?:ch|ab)\((?:[^()]+|\([^()]*\))*\)/g;
      const sanitizedCss = combinedCss.replace(oklchRegex, (match) => {
        return resolveOklchToRgb(match);
      });

      // Inject the sanitized styles temporarily
      tempStyle = document.createElement('style');
      tempStyle.id = 'temp-pdf-styles';
      tempStyle.textContent = sanitizedCss;
      document.head.appendChild(tempStyle);

      // 2. Resolve oklch/oklab colors in inline style attributes of the target element and its children
      const elementsWithStyles = element.querySelectorAll('[style]');
      const allTargetElements = [element, ...Array.from(elementsWithStyles)];
      
      allTargetElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const originalStyle = el.getAttribute('style');
          if (originalStyle && (originalStyle.includes('oklch') || originalStyle.includes('oklab'))) {
            inlineStyleBackups.set(el, originalStyle);
            const replacedStyle = originalStyle.replace(oklchRegex, (match) => {
              return resolveOklchToRgb(match);
            });
            el.setAttribute('style', replacedStyle);
          }
        }
      });

      const opt = {
        margin:       [0.2, 0.2, 0.2, 0.2] as [number, number, number, number],
        filename:     `${resumeName.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: activeTemplate === 'tech_mono' ? '#020617' : (activeTemplate === 'creative_indigo' ? '#ffffff' : (activeTemplate === 'executive' ? '#f8fafc' : '#ffffff'))
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      // Use the bundled html2pdf package directly
      await html2pdf().set(opt).from(element).save();
      setDownloadSuccess(true);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setDownloadError(err.message || 'An error occurred during PDF generation.');
    } finally {
      // 1. Restore original style sheets
      disabledSheets.forEach((sheet) => {
        sheet.disabled = false;
      });

      // 2. Remove the temporary sanitized style tag
      if (tempStyle) {
        tempStyle.remove();
      }

      // 3. Restore original inline styles
      inlineStyleBackups.forEach((originalStyle, el) => {
        el.setAttribute('style', originalStyle);
      });

      setIsDownloadingPdf(false);
    }
  };

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      setResumeName(profile.name);
      setResumeEmail(profile.email);
      if (profile.phone) setResumePhone(profile.phone);
      if (profile.qualification) setResumeQual(profile.qualification);
      if (profile.college) setResumeCollege(profile.college);
      if (profile.careerGoal) setResumeGoal(profile.careerGoal);
      if (profile.skills && profile.skills.length > 0) {
        setResumeSkills(profile.skills.join(', '));
      }
    }
  }, [profile]);

  // Project managers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `p-${Date.now()}`,
      title: 'New Project Title',
      technologies: 'React, Node.js, SQLite',
      description: 'Briefly describe your key technical accomplishments and system performance metrics.'
    };
    setProjects([...projects, newProj]);
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Experience managers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `e-${Date.now()}`,
      company: 'Enterprise Inc.',
      role: 'Graduate Tech Analyst',
      duration: 'June 2025 - Dec 2025',
      description: 'Developed automated test suites, collaborated on agile sprints, and assisted senior mentors in code review operations.'
    };
    setExperiences([...experiences, newExp]);
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  // Save profile state back to server
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const skillsArray = resumeSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: resumePhone,
          qualification: resumeQual,
          college: resumeCollege,
          careerGoal: resumeGoal,
          skills: skillsArray,
          experienceLevel: experienceLevel
        })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerCritique = () => {
    const skillsArray = resumeSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleResumeCritique({
      qualification: resumeQual,
      college: resumeCollege,
      careerGoal: resumeGoal,
      skills: skillsArray,
      experienceLevel: experienceLevel
    });
  };

  const triggerPrintSimulation = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100 pb-12">
      {/* LEFT COLUMN: Controls & Input Forms (Col Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Template Selector Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Select Resume Template</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTemplate('creative_indigo')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTemplate === 'creative_indigo'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Creative Indigo</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Two-column elegant</span>
            </button>

            <button
              onClick={() => setActiveTemplate('academic')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTemplate === 'academic'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Classic Academic</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Formal serif layout</span>
            </button>

            <button
              onClick={() => setActiveTemplate('tech_mono')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTemplate === 'tech_mono'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Tech Specialist</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Monospace developer style</span>
            </button>

            <button
              onClick={() => setActiveTemplate('executive')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTemplate === 'executive'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Executive Elite</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sleek corporate styling</span>
            </button>
          </div>
        </div>

        {/* Input Form Content */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Resume Profile Details</h3>
              <p className="text-[10px] text-slate-400">Populate the live resume sheet dynamically.</p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700/60 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
            >
              {isSaving ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {saveSuccess ? 'Saved' : 'Save Details'}
            </button>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">1. Contact & Demographics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="text"
                  value={resumeEmail}
                  onChange={(e) => setResumeEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={resumePhone}
                  onChange={(e) => setResumePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Location</label>
                <input
                  type="text"
                  value={resumeLocation}
                  onChange={(e) => setResumeLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="space-y-3.5 pt-2">
            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">2. Education Qualification</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">College / University</label>
                <input
                  type="text"
                  value={resumeCollege}
                  onChange={(e) => setResumeCollege(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Degree / Stream</label>
                <input
                  type="text"
                  value={resumeQual}
                  onChange={(e) => setResumeQual(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Graduation Year</label>
                <input
                  type="text"
                  value={resumeGradYear}
                  onChange={(e) => setResumeGradYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Context */}
          <div className="space-y-3.5 pt-2">
            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">3. Career Targets</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Career Objective / Target Role</label>
                <input
                  type="text"
                  value={resumeGoal}
                  onChange={(e) => setResumeGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Key Technical Skills (Comma Separated)</label>
                <textarea
                  rows={2}
                  value={resumeSkills}
                  onChange={(e) => setResumeSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Experience Track Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="fresher">Fresher (Looking for Placement Internships)</option>
                  <option value="junior">Junior Developer (0-2 Yrs Experience)</option>
                  <option value="mid">Mid-level Developer (2-5 Yrs Experience)</option>
                  <option value="senior">Senior Engineer (5+ Yrs Experience)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Work Experiences Editor */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">4. Work Experience / Internships</h4>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            
            {experiences.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No work experience entries added yet.</p>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div key={exp.id} className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 relative space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-2.5 right-2.5 text-slate-600 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded font-bold text-slate-400">
                      Entry #{idx + 1}
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Role / Position</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Description & Accomplishments</label>
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none leading-normal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Projects Editor */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">5. Key Tech Projects</h4>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            
            {projects.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No academic/technical projects added yet.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 relative space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="absolute top-2.5 right-2.5 text-slate-600 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded font-bold text-slate-400">
                      Project #{idx + 1}
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => handleUpdateProject(proj.id, 'technologies', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-550 font-bold mb-0.5">Project Description & Outcomes</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none leading-normal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critique and Actions Trigger */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
            <button
              id="resume-critique-btn"
              onClick={triggerCritique}
              disabled={loadingResumeCritique}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1 hover:opacity-95 disabled:opacity-50 transition"
            >
              {loadingResumeCritique ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
              AI Recruiter Critique
            </button>
            <button
              onClick={triggerPrintSimulation}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/60 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Live Adaptation Sheet Preview (Col Span 7) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-xs text-slate-400">Live Resume Preview</h3>
          </div>
          <span className="font-mono text-[9px] bg-indigo-950/80 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
            Template: {activeTemplate.replace('_', ' ')}
          </span>
        </div>

        {/* --- ADAPTIVE TEMPLATE SHEETS --- */}

        {/* 1. CREATIVE INDIGO TEMPLATE */}
        {activeTemplate === 'creative_indigo' && (
          <div className="bg-white text-slate-900 rounded-3xl min-h-[640px] shadow-2xl relative border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            {/* Left Sidebar */}
            <div className="md:w-1/3 bg-slate-950 text-slate-200 p-6 flex flex-col gap-6">
              <div className="text-center md:text-left border-b border-slate-800 pb-5">
                <h3 className="text-lg font-black tracking-tight text-white uppercase">{resumeName}</h3>
                <p className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase mt-1 leading-tight">{resumeGoal}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-[10px]">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">Contact</h4>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{resumeEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{resumePhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{resumeLocation}</span>
                </div>
              </div>

              {/* Technical Expertise */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 text-[10px]">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-900 text-indigo-300 border border-indigo-950 px-2 py-0.5 rounded text-[9px] font-mono">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* LMS Achievements */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 text-[10px]">LMS Achievements</h4>
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/20 text-[9px] leading-relaxed text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-white">
                    <Award className="w-3 h-3 text-indigo-400" />
                    <span>Scoring Profile Verified</span>
                  </div>
                  <p>Logged {profile.xpPoints || 340} platform XP points with verified skills tracks.</p>
                </div>
              </div>
            </div>

            {/* Right Main Body */}
            <div className="flex-1 p-8 space-y-6 text-[11px] leading-relaxed">
              {/* Career Summary */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Professional Target
                </h4>
                <p className="text-slate-650">
                  Ambitious {resumeGoal} possessing verified competence. Eager to construct reliable algorithms, deploy highly available web portals, and contribute inside technical agile sprint teams.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  Education Profile
                </h4>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-slate-900 text-[11.5px]">{resumeCollege}</h5>
                    <p className="text-slate-650 font-medium">{resumeQual}</p>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded shrink-0">
                    Class of {resumeGradYear}
                  </span>
                </div>
              </div>

              {/* Work Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Career Experience
                  </h4>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="relative pl-3.5 border-l border-slate-200">
                        <div className="absolute left-[-4.5px] top-[4px] w-2 h-2 rounded-full bg-indigo-600" />
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{exp.company}</span>
                          <span className="font-mono text-[9px] text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider leading-none mb-1">{exp.role}</p>
                        <p className="text-slate-650 text-[10.5px]">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2.5 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    Featured Projects
                  </h4>
                  <div className="space-y-3.5">
                    {projects.map((proj) => (
                      <div key={proj.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{proj.title}</span>
                        </div>
                        <p className="text-[9px] font-mono text-indigo-600 font-bold mb-1.5">Tech stack: {proj.technologies}</p>
                        <p className="text-slate-650 text-[10.5px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CLASSIC ACADEMIC TEMPLATE */}
        {activeTemplate === 'academic' && (
          <div className="bg-white text-slate-900 p-10 rounded-3xl min-h-[640px] shadow-2xl relative border border-slate-200 font-serif leading-relaxed text-[11.5px]">
            {/* Centered Top Header */}
            <div className="text-center border-b border-slate-900 pb-4 mb-5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-950 uppercase font-sans">{resumeName}</h3>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1.5 text-[10px] font-mono text-slate-600">
                <span>{resumeEmail}</span>
                <span>•</span>
                <span>{resumePhone}</span>
                <span>•</span>
                <span>{resumeLocation}</span>
              </div>
            </div>

            <div className="space-y-5.5">
              {/* Career Goal */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-1.5 font-sans">
                  Target Profile
                </h4>
                <p className="text-slate-800">
                  Aspiring {resumeGoal}. Eager to leverage intensive learning track record from MX JustLearn and complete scalable database integrations, enterprise controllers, and dynamic system layouts.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2 font-sans">
                  Education Details
                </h4>
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>{resumeCollege}</span>
                  <span className="font-sans text-[10px]">Graduation: {resumeGradYear}</span>
                </div>
                <p className="text-slate-750 italic">{resumeQual}</p>
              </div>

              {/* Core Competencies */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2 font-sans">
                  Technical Expertise
                </h4>
                <p className="text-slate-850 font-mono text-[10px] tracking-tight bg-slate-50 p-2.5 rounded border border-slate-100">
                  {resumeSkills}
                </p>
              </div>

              {/* Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2.5 font-sans">
                    Relevant Training & Experience
                  </h4>
                  <div className="space-y-3.5">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 text-[11.5px]">{exp.company}</span>
                          <span className="text-[10px] font-sans text-slate-600">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-650 italic mb-1 font-sans">{exp.role}</p>
                        <p className="text-slate-800 text-[10.5px]">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2.5 font-sans">
                    Key Project Work
                  </h4>
                  <div className="space-y-3.5">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-slate-900 text-[11.5px]">{proj.title}</span>
                          <span className="text-[9px] font-mono text-indigo-700 font-bold">({proj.technologies})</span>
                        </div>
                        <p className="text-slate-800 text-[10.5px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TECH SPECIALIST / MONO TEMPLATE */}
        {activeTemplate === 'tech_mono' && (
          <div className="bg-slate-950 text-emerald-400 p-8 rounded-3xl min-h-[640px] shadow-2xl relative border border-emerald-900/30 font-mono text-[10.5px] leading-relaxed">
            {/* Terminal Top Accent */}
            <div className="flex items-center gap-1.5 border-b border-emerald-950 pb-4 mb-5 text-emerald-500">
              <span className="text-emerald-500 font-black">❯</span>
              <span>cat resume_applicant_profile.json</span>
            </div>

            <div className="space-y-5">
              {/* Bio block */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-950/40">
                <p className="text-emerald-500 font-bold uppercase tracking-wider mb-2">// CANDIDATE INITIAL IDENTIFIER</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div><span className="text-slate-500">const</span> name = <span className="text-emerald-300">"{resumeName}"</span>;</div>
                  <div><span className="text-slate-500">const</span> target = <span className="text-emerald-300">"{resumeGoal}"</span>;</div>
                  <div><span className="text-slate-500">const</span> email = <span className="text-slate-400">"{resumeEmail}"</span>;</div>
                  <div><span className="text-slate-500">const</span> phone = <span className="text-slate-400">"{resumePhone}"</span>;</div>
                </div>
              </div>

              {/* Education block */}
              <div>
                <p className="text-emerald-500 font-bold uppercase mb-1.5"># EDUCATION</p>
                <div className="border-l-2 border-emerald-900 pl-3">
                  <p className="text-white font-bold">{resumeCollege}</p>
                  <p className="text-slate-400">{resumeQual} · Class of {resumeGradYear}</p>
                </div>
              </div>

              {/* Core Skill Array */}
              <div>
                <p className="text-emerald-500 font-bold uppercase mb-1.5"># TECHNICAL_STACK_ARRAY</p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-900 border border-emerald-950 px-2 py-0.5 rounded text-emerald-300">
                      [{s.trim()}]
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience block */}
              {experiences.length > 0 && (
                <div>
                  <p className="text-emerald-500 font-bold uppercase mb-1.5"># PRODUCTION_EXPERIENCE_LOGS</p>
                  <div className="space-y-3">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-emerald-900 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{exp.company}</span>
                          <span className="text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-emerald-300 font-semibold">{exp.role}</p>
                        <p className="text-slate-400 text-[10px] mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects block */}
              {projects.length > 0 && (
                <div>
                  <p className="text-emerald-500 font-bold uppercase mb-1.5"># DEPLOYED_PROJECTS_OUTPUTS</p>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="border-l-2 border-emerald-900 pl-3">
                        <p className="text-white font-bold">{proj.title}</p>
                        <p className="text-slate-400 text-[9px] mt-0.5">Stack: {proj.technologies}</p>
                        <p className="text-slate-400 text-[10px] mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. EXECUTIVE ELITE TEMPLATE */}
        {activeTemplate === 'executive' && (
          <div className="bg-slate-50 text-slate-900 p-9 rounded-3xl min-h-[640px] shadow-2xl relative border border-slate-300 font-sans leading-relaxed text-[11px] flex flex-col justify-between">
            {/* Formal Gold-Trim Header Layout */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-5">
              <div className="flex flex-col md:flex-row justify-between items-baseline">
                <h3 className="text-2xl font-black uppercase tracking-widest text-slate-950">{resumeName}</h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Confidential CV</span>
              </div>
              <p className="text-[10px] text-indigo-750 font-bold tracking-widest uppercase mt-0.5">{resumeGoal}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[9.5px] font-semibold text-slate-600">
                <span>E: {resumeEmail}</span>
                <span>•</span>
                <span>P: {resumePhone}</span>
                <span>•</span>
                <span>L: {resumeLocation}</span>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              {/* Executive Summary */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Executive Briefcase Summary
                </h4>
                <p className="text-slate-700 italic">
                  Results-focused technical candidate seeking an enterprise placement in {resumeGoal} pipelines. Bringing validated platform track records from MX JustLearn and specialized skills arrays.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Academic Record
                </h4>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{resumeCollege}</span>
                  <span>{resumeGradYear}</span>
                </div>
                <p className="text-slate-650">{resumeQual}</p>
              </div>

              {/* Tech stack */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Acquired Capabilities
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[9.5px] font-semibold font-mono border border-slate-300">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Professional Experience History
                  </h4>
                  <div className="space-y-3.5">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{exp.company}</span>
                          <span className="text-[9.5px] text-slate-500 font-mono font-normal">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">{exp.role}</p>
                        <p className="text-slate-700 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Significant Projects Portfolio
                  </h4>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-950 text-[11px]">{proj.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono italic">({proj.technologies})</span>
                        </div>
                        <p className="text-slate-700 text-[10.5px] mt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Recruiter Critique Feedback Panel */}
        {aiResumeFeedback && (
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h4 className="font-bold text-sm text-slate-200">Executive AI Recruiter Analysis</h4>
            </div>
            <div className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
              {aiResumeFeedback}
            </div>
          </div>
        )}
      </div>

      {/* Hidden offscreen container for high-fidelity A4/letter PDF render target */}
      <div 
        id="resume-pdf-render-target" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '794px', // Standard 96 DPI A4 width
          minHeight: '1123px', // Standard 96 DPI A4 height
          backgroundColor: activeTemplate === 'tech_mono' ? '#020617' : (activeTemplate === 'creative_indigo' ? '#ffffff' : (activeTemplate === 'executive' ? '#f8fafc' : '#ffffff')),
          fontFamily: activeTemplate === 'academic' ? 'Georgia, serif' : 'system-ui, sans-serif'
        }}
        className="p-1"
      >
        {activeTemplate === 'creative_indigo' && (
          <div className="bg-white text-slate-900 overflow-hidden flex flex-row border border-slate-200" style={{ minHeight: '1100px' }}>
            {/* Left Sidebar */}
            <div className="w-1/3 bg-slate-950 text-slate-200 p-6 flex flex-col gap-6 shrink-0">
              <div className="text-left border-b border-slate-800 pb-5">
                <h3 className="text-lg font-black tracking-tight text-white uppercase">{resumeName}</h3>
                <p className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase mt-1 leading-tight">{resumeGoal}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-[10px]">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">Contact</h4>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{resumeEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{resumePhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{resumeLocation}</span>
                </div>
              </div>

              {/* Technical Expertise */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 text-[10px]">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-900 text-indigo-300 border border-indigo-950 px-2 py-0.5 rounded text-[9px] font-mono">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* LMS Achievements */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 text-[10px]">LMS Achievements</h4>
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/20 text-[9px] leading-relaxed text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-white">
                    <Award className="w-3 h-3 text-indigo-400" />
                    <span>Scoring Profile Verified</span>
                  </div>
                  <p>Logged {profile.xpPoints || 340} platform XP points with verified skills tracks.</p>
                </div>
              </div>
            </div>

            {/* Right Main Body */}
            <div className="flex-1 p-8 space-y-6 text-[11px] leading-relaxed">
              {/* Career Summary */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Professional Target
                </h4>
                <p className="text-slate-650">
                  Ambitious {resumeGoal} possessing verified competence. Eager to construct reliable algorithms, deploy highly available web portals, and contribute inside technical agile sprint teams.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  Education Profile
                </h4>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-slate-900 text-[11.5px]">{resumeCollege}</h5>
                    <p className="text-slate-650 font-medium">{resumeQual}</p>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded shrink-0">
                    Class of {resumeGradYear}
                  </span>
                </div>
              </div>

              {/* Work Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Career Experience
                  </h4>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="relative pl-3.5 border-l border-slate-200">
                        <div className="absolute left-[-4.5px] top-[4px] w-2 h-2 rounded-full bg-indigo-600" />
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{exp.company}</span>
                          <span className="font-mono text-[9px] text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider leading-none mb-1">{exp.role}</p>
                        <p className="text-slate-650 text-[10.5px]">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-0.5 mb-2.5 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    Featured Projects
                  </h4>
                  <div className="space-y-3.5">
                    {projects.map((proj) => (
                      <div key={proj.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{proj.title}</span>
                        </div>
                        <p className="text-[9px] font-mono text-indigo-600 font-bold mb-1.5">Tech stack: {proj.technologies}</p>
                        <p className="text-slate-650 text-[10.5px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTemplate === 'academic' && (
          <div className="bg-white text-slate-900 p-10 relative border border-slate-200 font-serif leading-relaxed text-[11.5px]" style={{ minHeight: '1100px' }}>
            {/* Centered Top Header */}
            <div className="text-center border-b border-slate-900 pb-4 mb-5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-950 uppercase font-sans">{resumeName}</h3>
              <div className="flex justify-center gap-x-3 gap-y-1 mt-1.5 text-[10px] font-mono text-slate-600">
                <span>{resumeEmail}</span>
                <span>•</span>
                <span>{resumePhone}</span>
                <span>•</span>
                <span>{resumeLocation}</span>
              </div>
            </div>

            <div className="space-y-5.5">
              {/* Career Goal */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-1.5 font-sans">
                  Target Profile
                </h4>
                <p className="text-slate-800">
                  Aspiring {resumeGoal}. Eager to leverage intensive learning track record from MX JustLearn and complete scalable database integrations, enterprise controllers, and dynamic system layouts.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2 font-sans">
                  Education Details
                </h4>
                <div className="flex justify-between font-bold text-slate-900 mb-1 font-sans">
                  <span>{resumeCollege}</span>
                  <span className="text-[10px]">Graduation: {resumeGradYear}</span>
                </div>
                <p className="text-slate-750 italic">{resumeQual}</p>
              </div>

              {/* Core Competencies */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2 font-sans">
                  Technical Expertise
                </h4>
                <p className="text-slate-850 font-mono text-[10px] tracking-tight bg-slate-50 p-2.5 rounded border border-slate-100">
                  {resumeSkills}
                </p>
              </div>

              {/* Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2.5 font-sans">
                    Relevant Training & Experience
                  </h4>
                  <div className="space-y-3.5">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-sans">
                          <span className="font-bold text-slate-900 text-[11.5px]">{exp.company}</span>
                          <span className="text-[10px] text-slate-660">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-650 italic mb-1 font-sans">{exp.role}</p>
                        <p className="text-slate-800 text-[10.5px]">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b-2 border-slate-950 pb-0.5 mb-2.5 font-sans">
                    Key Project Work
                  </h4>
                  <div className="space-y-3.5">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-0.5 font-sans">
                          <span className="font-bold text-slate-900 text-[11.5px]">{proj.title}</span>
                          <span className="text-[9px] font-mono text-indigo-750 font-bold">({proj.technologies})</span>
                        </div>
                        <p className="text-slate-800 text-[10.5px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTemplate === 'tech_mono' && (
          <div className="bg-slate-950 text-emerald-400 p-8 relative border border-emerald-900/30 font-mono text-[10.5px] leading-relaxed" style={{ minHeight: '1100px' }}>
            {/* Terminal Top Accent */}
            <div className="flex items-center gap-1.5 border-b border-emerald-950 pb-4 mb-5 text-emerald-500">
              <span className="text-emerald-500 font-black">❯</span>
              <span>cat resume_applicant_profile.json</span>
            </div>

            <div className="space-y-5">
              {/* Bio block */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-950/40">
                <p className="text-emerald-500 font-bold uppercase tracking-wider mb-2">// CANDIDATE INITIAL IDENTIFIER</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><span className="text-slate-500">const</span> name = <span className="text-emerald-300">"{resumeName}"</span>;</div>
                  <div><span className="text-slate-500">const</span> target = <span className="text-emerald-300">"{resumeGoal}"</span>;</div>
                  <div><span className="text-slate-500">const</span> email = <span className="text-slate-400">"{resumeEmail}"</span>;</div>
                  <div><span className="text-slate-500">const</span> phone = <span className="text-slate-400">"{resumePhone}"</span>;</div>
                </div>
              </div>

              {/* Education block */}
              <div>
                <p className="text-emerald-500 font-bold uppercase mb-1.5"># EDUCATION</p>
                <div className="border-l-2 border-emerald-900 pl-3">
                  <p className="text-white font-bold">{resumeCollege}</p>
                  <p className="text-slate-400">{resumeQual} · Class of {resumeGradYear}</p>
                </div>
              </div>

              {/* Core Skill Array */}
              <div>
                <p className="text-emerald-500 font-bold uppercase mb-1.5"># TECHNICAL_STACK_ARRAY</p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-900 border border-emerald-950 px-2 py-0.5 rounded text-emerald-300">
                      [{s.trim()}]
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience block */}
              {experiences.length > 0 && (
                <div>
                  <p className="text-emerald-500 font-bold uppercase mb-1.5"># PRODUCTION_EXPERIENCE_LOGS</p>
                  <div className="space-y-3">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-emerald-900 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{exp.company}</span>
                          <span className="text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-emerald-300 font-semibold">{exp.role}</p>
                        <p className="text-slate-400 text-[10px] mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects block */}
              {projects.length > 0 && (
                <div>
                  <p className="text-emerald-500 font-bold uppercase mb-1.5"># DEPLOYED_PROJECTS_OUTPUTS</p>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="border-l-2 border-emerald-900 pl-3">
                        <p className="text-white font-bold">{proj.title}</p>
                        <p className="text-slate-400 text-[9px] mt-0.5">Stack: {proj.technologies}</p>
                        <p className="text-slate-400 text-[10px] mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTemplate === 'executive' && (
          <div className="bg-slate-50 text-slate-900 p-9 relative border border-slate-300 font-sans leading-relaxed text-[11px] flex flex-col justify-between" style={{ minHeight: '1100px' }}>
            {/* Formal Gold-Trim Header Layout */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-5">
              <div className="flex flex-row justify-between items-baseline">
                <h3 className="text-2xl font-black uppercase tracking-widest text-slate-950">{resumeName}</h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Confidential CV</span>
              </div>
              <p className="text-[10px] text-indigo-750 font-bold tracking-widest uppercase mt-0.5">{resumeGoal}</p>
              
              <div className="flex gap-x-4 gap-y-1 mt-2 text-[9.5px] font-semibold text-slate-600">
                <span>E: {resumeEmail}</span>
                <span>•</span>
                <span>P: {resumePhone}</span>
                <span>•</span>
                <span>L: {resumeLocation}</span>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              {/* Executive Summary */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Executive Briefcase Summary
                </h4>
                <p className="text-slate-700 italic">
                  Results-focused technical candidate seeking an enterprise placement in {resumeGoal} pipelines. Bringing validated platform track records from MX JustLearn and specialized skills arrays.
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Academic Record
                </h4>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{resumeCollege}</span>
                  <span>{resumeGradYear}</span>
                </div>
                <p className="text-slate-650">{resumeQual}</p>
              </div>

              {/* Tech stack */}
              <div>
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Acquired Capabilities
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resumeSkills.split(',').map((s, idx) => (
                    <span key={idx} className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[9.5px] font-semibold font-mono border border-slate-300">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2">
                    Professional Experience History
                  </h4>
                  <div className="space-y-3.5">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{exp.company}</span>
                          <span className="text-[9.5px] text-slate-500 font-mono font-normal">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-indigo-750 font-bold uppercase tracking-wider">{exp.role}</p>
                        <p className="text-slate-700 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2">
                    Significant Projects Portfolio
                  </h4>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-950 text-[11px]">{proj.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono italic">({proj.technologies})</span>
                        </div>
                        <p className="text-slate-700 text-[10.5px] mt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- REAL-TIME PDF EXPORT MODAL --- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
              downloadSuccess 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : (downloadError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400')
            }`}>
              {downloadSuccess ? (
                <Check className="w-8 h-8" />
              ) : (downloadError ? (
                <span className="text-lg font-black font-mono">!</span>
              ) : (
                <FileText className="w-8 h-8 animate-pulse" />
              ))}
            </div>

            <h3 className="text-lg font-bold text-white">
              {downloadSuccess ? 'PDF Saved!' : (downloadError ? 'Export Error Occurred' : 'Resume Compiler Ready')}
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              {downloadSuccess 
                ? `Your customized **${activeTemplate.replace('_', ' ')}** resume for **${resumeName}** has been successfully generated and saved to your downloads folder.` 
                : (downloadError 
                  ? downloadError 
                  : `Your customized **${activeTemplate.replace('_', ' ')}** resume for **${resumeName}** has been compiled and is ready for export.`)}
            </p>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left text-xs space-y-2">
              <p className="text-slate-300 flex justify-between">
                <span className="text-slate-500">Selected Template:</span> 
                <span className="font-bold capitalize">{activeTemplate.replace('_', ' ')}</span>
              </p>
              <p className="text-slate-300 flex justify-between">
                <span className="text-slate-500">Key Tech Stack:</span> 
                <span className="font-bold truncate max-w-[180px]">{resumeSkills}</span>
              </p>
              <p className="text-slate-300 flex justify-between">
                <span className="text-slate-500">File Name:</span> 
                <span className="font-mono text-indigo-400 truncate max-w-[180px]">{resumeName.toLowerCase().replace(/\s+/g, '_')}_resume.pdf</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDownloadingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating PDF File...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Download PDF File
                  </>
                )}
              </button>
              
              <div className="flex gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl cursor-pointer border border-slate-700/50 transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Print Dialog
                </button>
                <button
                  onClick={() => {
                    setIsPrintModalOpen(false);
                    setDownloadSuccess(false);
                    setDownloadError(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-300 text-xs font-bold rounded-xl cursor-pointer border border-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
