/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// MySQL Database connection setup
let pool: mysql.Pool;

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234'
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS mx_justlearn');
    await connection.end();

    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'mx_justlearn',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('MySQL Database connected and schema initialized.');
  } catch (error) {
    console.error('Error initializing MySQL database:', error);
  }
}
initDb();

// Initialize Gemini AI client lazily to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Database for high-fidelity interactive simulation
const db = {
  profile: {
    id: 'student-123',
    name: 'Ram Prasad',
    email: 'ramprasadsuthi@gmail.com',
    role: 'student' as const,
    phone: '+91 98765 43210',
    qualification: 'B.Tech Computer Science',
    college: 'MX College of Technology',
    skills: ['Java', 'HTML', 'CSS', 'JavaScript'],
    careerGoal: 'Java Full Stack Developer',
    experienceLevel: 'fresher' as const,
    subscription: 'free' as const,
    streak: 5,
    xpPoints: 340,
    coins: 120,
    completedCourses: [],
  },
  enrolledCourses: ['java-fs'],
  dailyReports: [
    { date: '2026-06-22', workDone: 'Set up local Spring Boot and configured PostgreSQL service.', hours: 6, feedback: 'Great job setting up local environment. Keep it up!' },
    { date: '2026-06-23', workDone: 'Created mock endpoints for User authentication, login registration processes.', hours: 5, feedback: 'Endpoints verified successfully. Clean code.' }
  ],
  projectMilestones: [
    { id: 'm1', title: 'Milestone 1: Database Setup & DDL Schema implementation', status: 'approved' as const, comment: 'Pristine table configurations with cascading deletes.' },
    { id: 'm2', title: 'Milestone 2: Implementing REST endpoints & CORS policies', status: 'submitted' as const },
    { id: 'm3', title: 'Milestone 3: React integration and OAuth flows', status: 'pending' as const }
  ],
  jobApplications: [
    { id: 'job1', jobId: 'job1', status: 'Screening', appliedAt: '2026-06-21' }
  ],
  communityPosts: [] as any[],
  trainerData: {
    classes: [
      { id: 'c1', title: 'Spring Security Deep Dive', time: 'Today, 4:00 PM', link: 'https://meet.google.com/abc-defg-hij', attendees: 34, isLive: true },
      { id: 'c2', title: 'React Hooks & State Optimization', time: 'Tomorrow, 10:00 AM', link: 'https://meet.google.com/xyz-lmno-pqr', attendees: 0, isLive: false }
    ],
    assignments: [
      { id: 'a1', title: 'Hibernate Lazy vs Eager Loading Script', dueDate: '2026-06-28', submittedCount: 14, gradedCount: 8 }
    ],
    students: [
      { id: 's1', name: 'Rahul Sharma', email: 'rahul@gmail.com', progress: 85, score: 92 },
      { id: 's2', name: 'Simran Preet', email: 'simran@gmail.com', progress: 40, score: 78 },
      { id: 's3', name: 'Devendra Kumar', email: 'dev@gmail.com', progress: 95, score: 98 }
    ]
  },
  adminData: {
    activeUsers: 342,
    courseSales: 125,
    subscriptionSales: 24500,
    topCourses: [
      { id: 'java-fs', name: 'Java Full Stack Developer Masterclass', sales: 65 },
      { id: 'python-fs', name: 'Python Full Stack Developer with Django', sales: 42 }
    ]
  },
  corporateData: {
    employees: [
      { id: 'emp1', name: 'Amit Jha', email: 'amit@company.com', course: 'Java Full Stack', progress: 90, score: 88, status: 'Compliant' },
      { id: 'emp2', name: 'Neha Gupta', email: 'neha@company.com', course: 'Data Science', progress: 30, score: 72, status: 'At Risk' },
      { id: 'emp3', name: 'Tarun Sen', email: 'tarun@company.com', course: 'Generative AI', progress: 75, score: 92, status: 'Compliant' }
    ],
    allocatedBudget: 50000,
    spentBudget: 24000,
  }
};

// --- MOCK DATABASE REST ENDPOINTS ---

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!pool) return res.status(500).json({ success: false, error: 'Database not initialized' });
    
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    
    res.json({ success: true, message: 'User registered successfully', userId: (result as any).insertId });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!pool) return res.status(500).json({ success: false, error: 'Database not initialized' });
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (users as any[])[0];
    
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({ success: true, message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Get Profile
app.get('/api/profile', (req, res) => {
  res.json(db.profile);
});

// Update Profile
app.post('/api/profile/update', (req, res) => {
  db.profile = { ...db.profile, ...req.body };
  res.json({ success: true, profile: db.profile });
});

// Enroll in Course
app.post('/api/courses/enroll', (req, res) => {
  const { courseId } = req.body;
  if (!db.enrolledCourses.includes(courseId)) {
    db.enrolledCourses.push(courseId);
  }
  res.json({ success: true, enrolledCourses: db.enrolledCourses });
});

// Get Internship Daily Reports
app.get('/api/internships/reports', (req, res) => {
  res.json(db.dailyReports);
});

// Add Internship Daily Report
app.post('/api/internships/reports/add', (req, res) => {
  const { workDone, hours } = req.body;
  const newReport = {
    date: new Date().toISOString().split('T')[0],
    workDone,
    hours: Number(hours),
    feedback: 'Report submitted. Pending mentor evaluation.'
  };
  db.dailyReports.unshift(newReport);
  db.profile.xpPoints += 15; // Reward with XP
  res.json({ success: true, dailyReports: db.dailyReports, profile: db.profile });
});

// Submit Project Milestone
app.post('/api/projects/milestone/submit', (req, res) => {
  const { milestoneId } = req.body;
  const mIndex = db.projectMilestones.findIndex(m => m.id === milestoneId);
  if (mIndex !== -1) {
    db.projectMilestones[mIndex].status = 'submitted';
  }
  res.json({ success: true, milestones: db.projectMilestones });
});

// Get Project Milestones
app.get('/api/projects/milestones', (req, res) => {
  res.json(db.projectMilestones);
});

// Get Job Applications
app.get('/api/jobs/applications', (req, res) => {
  res.json(db.jobApplications);
});

// Apply to Job
app.post('/api/jobs/apply', (req, res) => {
  const { jobId } = req.body;
  if (!db.jobApplications.some(app => app.jobId === jobId)) {
    db.jobApplications.push({
      id: Math.random().toString(36).substring(7),
      jobId,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0]
    });
    db.profile.xpPoints += 20; // Reward apply
  }
  res.json({ success: true, applications: db.jobApplications, profile: db.profile });
});

// Trainer endpoints
app.get('/api/trainer/data', (req, res) => {
  res.json(db.trainerData);
});

app.post('/api/trainer/schedule-class', (req, res) => {
  const { title, time, link } = req.body;
  db.trainerData.classes.push({
    id: 'c' + (db.trainerData.classes.length + 1),
    title,
    time,
    link,
    attendees: 0,
    isLive: false
  });
  res.json({ success: true, classes: db.trainerData.classes });
});

app.post('/api/trainer/create-assignment', (req, res) => {
  const { title, dueDate } = req.body;
  db.trainerData.assignments.push({
    id: 'a' + (db.trainerData.assignments.length + 1),
    title,
    dueDate,
    submittedCount: 0,
    gradedCount: 0
  });
  res.json({ success: true, assignments: db.trainerData.assignments });
});

// Admin endpoints
app.get('/api/admin/data', (req, res) => {
  res.json(db.adminData);
});

// Corporate endpoints
app.get('/api/corporate/data', (req, res) => {
  res.json(db.corporateData);
});

app.post('/api/corporate/allocate-budget', (req, res) => {
  const { budget } = req.body;
  db.corporateData.allocatedBudget = Number(budget);
  res.json({ success: true, corporateData: db.corporateData });
});


// --- AI INTEGRATION HANDLERS (GEMINI 3.5 FLASH) ---

// AI Mentor Chat Integration
app.post('/api/ai/mentor-chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    // Prepare contents array matching Type schema
    const formattedContents = [];
    
    // Process history
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        formattedContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      });
    }

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const systemInstruction = `You are "AI Mentor", an elite personal tutor on the MX JustLearn Learning Management System. 
Your goal is to explain concept errors, teach Java, Python, Automation, Cloud, DevOps, and Data Science, and guide student careers. 
Use clear software-industry analogies, keep explanations extremely readable, and wrap code blocks in markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('AI Mentor Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error occurred in AI Mentor' });
  }
});

// AI Coding Assistant (Explain, Fix, Optimize, Hint, Approach)
app.post('/api/ai/code-assistant', async (req, res) => {
  try {
    const { problemTitle, code, mode, language } = req.body;
    const ai = getGeminiClient();

    let prompt = '';
    let systemInstruction = '';

    if (mode === 'explain') {
      prompt = `Please explain the following ${language} code written for the challenge "${problemTitle}":\n\n\`\`\`${language}\n${code}\n\`\`\``;
      systemInstruction = `You are a professional software engineering coach. Walk through the logic step-by-step, explaining runtime complexities (Big O).`;
    } else if (mode === 'optimize') {
      prompt = `Analyze and optimize the performance of this ${language} solution for "${problemTitle}":\n\n\`\`\`${language}\n${code}\n\`\`\``;
      systemInstruction = `You are a high-performance database and algorithms expert. Identify bottlenecks, recommend optimization avenues, and write the optimized revision.`;
    } else if (mode === 'fix') {
      prompt = `Locate any syntax or logic bugs inside this ${language} code for "${problemTitle}" and fix them:\n\n\`\`\`${language}\n${code}\n\`\`\``;
      systemInstruction = `You are an compiler advisor. Fix compilation/logical errors, explain why they occurred, and supply the fully working codebase.`;
    } else if (mode === 'hint') {
      prompt = `I am stuck solving "${problemTitle}". Here is my current code in ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\`\nProvide me hints without giving away the full final solution!`;
      systemInstruction = `You are a respectful HackerRank/LeetCode reviewer. Guide the student using Socratic prompting. Do not output direct correct code; give hints and logic flows.`;
    } else {
      prompt = `Suggest high-level approaches to solve the problem "${problemTitle}".`;
      systemInstruction = `You are an algorithms expert. Describe common patterns (e.g., Sliding Window, Two Pointers, dynamic programming) to tackle this challenge.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('AI Code Assistant Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error in AI Code Assistant' });
  }
});

// AI Mock Interview Platform Evaluator
app.post('/api/ai/mock-interview', async (req, res) => {
  try {
    const { category, answers } = req.body;
    const ai = getGeminiClient();

    const formattedAnswers = answers.map((a: any, idx: number) => {
      return `Q${idx + 1}: ${a.question}\nAnswer given: ${a.answer}`;
    }).join('\n\n');

    const prompt = `Review the following mock interview responses for a "${category}" role and evaluate performance:\n\n${formattedAnswers}`;

    const systemInstruction = `You are an expert Silicon Valley interviewer grading a technical candidate. 
Analyze the responses and output a clear breakdown of scores on a scale of 0-100:
1. Technical Score (Logic, correctness, frameworks)
2. Communication Score (Clarity, structural flow)
3. Confidence Score (Directness, posture indicators)

Format your evaluation with elegant Markdown headings. Provide:
- Detailed breakdown scores
- Specific improvement tips
- Recommended study roadmap courses`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('AI Interview Platform Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error in Mock Interview Engine' });
  }
});

// AI Resume Critique
app.post('/api/ai/resume-critique', async (req, res) => {
  try {
    const { name, email, qualification, skills, careerGoal, experienceLevel } = req.body;
    const ai = getGeminiClient();

    const prompt = `Critique my professional profile as a candidate:\nName: ${name}\nEmail: ${email}\nQualification: ${qualification}\nSkills: ${skills.join(', ')}\nCareer Goal: ${careerGoal}\nLevel: ${experienceLevel}`;

    const systemInstruction = `You are an Executive Tech Recruiter. Analyze this candidate's profile. Highlight skills gaps, draft key bullet points to add, and specify which MX JustLearn premium courses would boost their chances.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('AI Resume Critique Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error critiquing resume' });
  }
});

// AI Course Chapter Summarizer
app.post('/api/ai/course-summary', async (req, res) => {
  try {
    const { courseTitle, chapterTitle } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a robust study summary for the chapter "${chapterTitle}" in the course "${courseTitle}". Mention key concepts, interview cheat-sheet points, and a mini-quiz question with its answer.`;

    const systemInstruction = `You are a high-speed technical compiler. Deliver an engaging, beautiful markdown summary sheet.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error generating summary' });
  }
});


// --- BUNDLE VITE DEV AND PROD SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MX JustLearn Full-Stack server booted at http://localhost:${PORT}`);
  });
}

startServer();
