/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User Roles
export type UserRole = 'super_admin' | 'trainer' | 'student' | 'corporate_admin';

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  qualification?: string;
  college?: string;
  skills: string[];
  careerGoal?: string;
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior';
  subscription: 'free' | 'starter' | 'professional' | 'career_accelerator' | 'enterprise';
  streak: number;
  xpPoints: number;
  coins: number;
  completedCourses: string[];
}

// Course Structure
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isPrivateYoutube?: boolean;
  previewAllowed: boolean;
  contentMarkdown?: string;
  textContent?: string;
  pdfUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorBio?: string;
  rating: number;
  studentCount: number;
  duration: string;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl: string;
  badge: 'Free' | 'Premium' | 'Popular' | 'Hot';
  description: string;
  learningOutcomes: string[];
  skillsCovered: string[];
  modules: Module[];
  faqs: { question: string; answer: string }[];
}

// Assessment Structure
export interface Question {
  id: string;
  type: 'mcq' | 'checkbox' | 'boolean' | 'fill' | 'coding' | 'scenario';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  scenarioContext?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  passPercentage: number;
  questions: Question[];
}

// Coding Challenge
export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints: string;
  starterTemplates: { [key: string]: string };
  testCases: { input: string; output: string; isHidden: boolean }[];
  xpPoints: number;
}

// Job Listing
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceRequired: string;
  salaryRange: string;
  skillsRequired: string[];
  description: string;
}

// Internship Program
export interface Internship {
  id: string;
  title: string;
  company: string;
  duration: string;
  stipend: string;
  status: 'active' | 'applied' | 'completed';
  dailyReports: { date: string; workDone: string; hours: number; feedback?: string }[];
}

// Community Post
export interface CommunityPost {
  id: string;
  author: string;
  authorRole: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: { id: string; author: string; content: string; date: string }[];
  date: string;
}

// Project Details
export interface StudentProject {
  id: string;
  title: string;
  description: string;
  milestones: { id: string; title: string; status: 'pending' | 'submitted' | 'approved'; comment?: string }[];
  category: string;
}
