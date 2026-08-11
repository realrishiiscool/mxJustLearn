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
import { COURSES } from './src/data';

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [existingUsers] = await conn.query('SELECT COUNT(*) as count FROM users');
    if ((existingUsers as any[])[0].count === 0) {
      console.log('Seeding default users database...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await conn.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ('User1 Student', 'user1@gmail.com', ?, 'student')
      `, [hashedPassword]);
      console.log('Default users database seeded successfully.');
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        instructor_bio TEXT,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        student_count INT DEFAULT 0,
        duration VARCHAR(50),
        price DECIMAL(10, 2) DEFAULT 0.00,
        level VARCHAR(50),
        thumbnail_url TEXT,
        badge VARCHAR(50),
        description TEXT NOT NULL,
        learning_outcomes TEXT,
        skills_covered TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(255) PRIMARY KEY,
        module_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(50),
        video_url TEXT,
        text_content TEXT,
        pdf_url TEXT,
        preview_allowed BOOLEAN DEFAULT FALSE,
        is_private_youtube BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      )
    `);

    // Self-healing migrations for existing databases
    try {
      await conn.query('ALTER TABLE lessons ADD COLUMN text_content TEXT');
    } catch (e) {}
    try {
      await conn.query('ALTER TABLE lessons ADD COLUMN pdf_url TEXT');
    } catch (e) {}

    const [existingCourses] = await conn.query('SELECT COUNT(*) as count FROM courses');
    const courseCount = (existingCourses as any[])[0].count;
    if (courseCount < COURSES.length) {
      console.log('Clearing old/partial courses database to re-seed...');
      // Cascading deletes will clear modules and lessons automatically
      await conn.query('DELETE FROM courses');

      console.log('Seeding courses database with default mock catalog...');
      for (const course of COURSES) {
        await conn.query(`
          INSERT INTO courses (id, title, category, instructor, instructor_bio, rating, student_count, duration, price, level, thumbnail_url, badge, description, learning_outcomes, skills_covered)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          course.id,
          course.title,
          course.category,
          course.instructor,
          course.instructorBio || '',
          course.rating,
          course.studentCount,
          course.duration,
          course.price,
          course.level,
          course.thumbnailUrl,
          course.badge,
          course.description,
          JSON.stringify(course.learningOutcomes || []),
          JSON.stringify(course.skillsCovered || [])
        ]);

        for (const mod of course.modules) {
          const uniqueModId = `${course.id}_${mod.id}`;
          await conn.query(`
            INSERT INTO modules (id, course_id, title)
            VALUES (?, ?, ?)
          `, [uniqueModId, course.id, mod.title]);

          for (const les of mod.lessons) {
            const uniqueLesId = `${course.id}_${mod.id}_${les.id}`;
            await conn.query(`
              INSERT INTO lessons (id, module_id, title, duration, video_url, preview_allowed, is_private_youtube)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              uniqueLesId,
              uniqueModId,
              les.title,
              les.duration,
              les.videoUrl,
              les.previewAllowed ? 1 : 0,
              les.isPrivateYoutube ? 1 : 0
            ]);
          }
        }
      }
      console.log('Courses database seeded successfully.');
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_course (user_email, course_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Pre-enroll default student 'user1@gmail.com' in 'java-fs'
    await conn.query(`
      INSERT IGNORE INTO enrollments (user_email, course_id)
      VALUES ('user1@gmail.com', 'java-fs')
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
    ],
    allowTrainerAddCourse: false
  },
  courses: [] as any[],
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
    const { name, email, password, role, secret_token } = req.body;
    
    if (!pool) return res.status(500).json({ success: false, error: 'Database not initialized' });
    
    let userRole = 'student';
    if (role === 'super_admin') {
      if (secret_token !== 'admin-secret-xyz') {
        return res.status(403).json({ success: false, error: 'Invalid or missing secret token' });
      }
      userRole = 'super_admin';
    } else if (role === 'trainer') {
      // In a real app, you'd check if the creator is an admin. 
      // For this prototype, we'll allow it if role is explicitly trainer.
      userRole = 'trainer';
    } else if (role === 'corporate_admin') {
      userRole = 'corporate_admin';
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, userRole]);
    
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
app.post('/api/courses/enroll', async (req, res) => {
  try {
    const { email, courseId } = req.body;
    if (!pool) return res.status(500).json({ success: false, error: 'Database not connected' });

    if (!email) {
      if (!db.enrolledCourses.includes(courseId)) {
        db.enrolledCourses.push(courseId);
      }
      return res.json({ success: true, enrolledCourses: db.enrolledCourses });
    }

    await pool.query(`
      INSERT IGNORE INTO enrollments (user_email, course_id)
      VALUES (?, ?)
    `, [email, courseId]);

    const [rows] = await pool.query('SELECT course_id FROM enrollments WHERE user_email = ?', [email]);
    const list = (rows as any[]).map(r => r.course_id);
    res.json({ success: true, enrolledCourses: list });
  } catch (error: any) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during enrollment' });
  }
});

// Get user enrollments
app.get('/api/users/enrollments', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    if (!pool) return res.status(500).json({ success: false, error: 'Database not connected' });

    const [rows] = await pool.query('SELECT course_id FROM enrollments WHERE user_email = ?', [email]);
    const list = (rows as any[]).map(r => r.course_id);
    res.json({ success: true, enrolledCourses: list });
  } catch (error: any) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error fetching enrollments' });
  }
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

// Helper function to query and map courses list from database
async function getCoursesList() {
  if (!pool) return [];
  const conn = await pool.getConnection();
  try {
    const [coursesRows] = await conn.query('SELECT * FROM courses ORDER BY created_at ASC');
    const courses = coursesRows as any[];
    
    for (const course of courses) {
      // Map database snake_case to frontend camelCase
      course.thumbnailUrl = course.thumbnail_url;
      course.instructorBio = course.instructor_bio;
      course.studentCount = course.student_count;
      course.learningOutcomes = course.learning_outcomes ? JSON.parse(course.learning_outcomes) : [];
      course.skillsCovered = course.skills_covered ? JSON.parse(course.skills_covered) : [];

      // Fetch modules for this course
      const [modulesRows] = await conn.query('SELECT * FROM modules WHERE course_id = ? ORDER BY created_at ASC', [course.id]);
      course.modules = modulesRows as any[];
      
      for (const mod of course.modules) {
        // Fetch lessons for this module
        const [lessonsRows] = await conn.query('SELECT * FROM lessons WHERE module_id = ? ORDER BY created_at ASC', [mod.id]);
        mod.lessons = (lessonsRows as any[]).map(les => ({
          ...les,
          videoUrl: les.video_url,
          textContent: les.text_content,
          pdfUrl: les.pdf_url,
          previewAllowed: !!les.preview_allowed,
          isPrivateYoutube: !!les.is_private_youtube
        }));
      }

      // Fetch FAQs from mock courses if original exists
      const originalCourse = COURSES.find(c => c.id === course.id);
      course.faqs = originalCourse ? originalCourse.faqs : [
        {
          question: 'Are there coding assignments included in this course?',
          answer: 'Yes! This course includes intermediate assessment modules and LeetCode-style challenges built into the dashboard.'
        }
      ];
    }
    return courses;
  } catch (e) {
    console.error('Error fetching courses list from DB:', e);
    return [];
  } finally {
    conn.release();
  }
}

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await getCoursesList();
    res.json(courses);
  } catch (error: any) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error fetching courses' });
  }
});

// Add new course
app.post('/api/courses/add', async (req, res) => {
  try {
    const newCourse = req.body;
    if (!pool) return res.status(500).json({ success: false, error: 'Database not connected' });
    
    if (!newCourse.id) {
      newCourse.id = 'course-' + Math.random().toString(36).substring(2, 9);
    }

    const conn = await pool.getConnection();
    try {
      await conn.query('START TRANSACTION');

      await conn.query(`
        INSERT INTO courses (id, title, category, instructor, instructor_bio, rating, student_count, duration, price, level, thumbnail_url, badge, description, learning_outcomes, skills_covered)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newCourse.id,
        newCourse.title,
        newCourse.category,
        newCourse.instructor,
        newCourse.instructorBio || '',
        newCourse.rating || 0.0,
        newCourse.studentCount || 0,
        newCourse.duration || '12 Hours',
        newCourse.price || 0.00,
        newCourse.level || 'Beginner',
        newCourse.thumbnailUrl || '',
        newCourse.badge || 'Free',
        newCourse.description || '',
        JSON.stringify(newCourse.learningOutcomes || []),
        JSON.stringify(newCourse.skillsCovered || [])
      ]);

      if (newCourse.modules && Array.isArray(newCourse.modules)) {
        for (const mod of newCourse.modules) {
          const mId = mod.id || 'mod-' + Math.random().toString(36).substring(2, 9);
          await conn.query(`
            INSERT INTO modules (id, course_id, title)
            VALUES (?, ?, ?)
          `, [mId, newCourse.id, mod.title]);

          if (mod.lessons && Array.isArray(mod.lessons)) {
            for (const les of mod.lessons) {
              const lId = les.id || 'les-' + Math.random().toString(36).substring(2, 9);
              await conn.query(`
                INSERT INTO lessons (id, module_id, title, duration, video_url, text_content, pdf_url, preview_allowed, is_private_youtube)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                lId,
                mId,
                les.title,
                les.duration || '15 Mins',
                les.videoUrl || '',
                les.textContent || '',
                les.pdfUrl || '',
                les.previewAllowed ? 1 : 0,
                les.isPrivateYoutube ? 1 : 0
              ]);
            }
          }
        }
      }

      await conn.query('COMMIT');
    } catch (err) {
      await conn.query('ROLLBACK');
      throw err;
    } finally {
      conn.release();
    }

    const courses = await getCoursesList();
    res.json({ success: true, courses });
  } catch (error: any) {
    console.error('Error inserting course into DB:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error inserting course' });
  }
});

// Update a lesson (from Course Editor)
app.post('/api/courses/update-lesson', async (req, res) => {
  try {
    const { courseId, moduleId, lessonId, videoUrl, isPrivateYoutube, textContent, pdfUrl } = req.body;
    if (!pool) return res.status(500).json({ success: false, error: 'Database not connected' });

    await pool.query(`
      UPDATE lessons SET video_url = ?, is_private_youtube = ?, text_content = ?, pdf_url = ? WHERE id = ? AND module_id = ?
    `, [videoUrl || '', isPrivateYoutube ? 1 : 0, textContent || '', pdfUrl || '', lessonId, moduleId]);

    const courses = await getCoursesList();
    res.json({ success: true, courses });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error updating lesson' });
  }
});

// Permissions endpoints
app.get('/api/admin/permissions', (req, res) => {
  res.json({ allowTrainerAddCourse: db.adminData.allowTrainerAddCourse });
});

app.post('/api/admin/permissions/toggle', (req, res) => {
  db.adminData.allowTrainerAddCourse = !db.adminData.allowTrainerAddCourse;
  res.json({ success: true, allowTrainerAddCourse: db.adminData.allowTrainerAddCourse });
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
