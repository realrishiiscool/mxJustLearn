/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Assessment, CodingProblem, Job, CommunityPost, StudentProject } from './types';

// Relational Database Schema DDL for Super Admin Dashboard Visualizer
export const DATABASE_SCHEMA_DDL = `-- MX JustLearn Enterprise Relational Database Schema DDL
-- Target: PostgreSQL 16+

-- 1. Identity & Access Management
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    qualification VARCHAR(100),
    college VARCHAR(255),
    skills TEXT[], -- Array of skills
    career_goal VARCHAR(255),
    experience_level VARCHAR(50) CHECK (experience_level IN ('fresher', 'junior', 'mid', 'senior')),
    role_id INT REFERENCES roles(id),
    streak INT DEFAULT 1,
    xp_points INT DEFAULT 0,
    coins INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscriptions & Payments
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL
);

CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id),
    status VARCHAR(50) CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subscription_id INT REFERENCES user_subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('succeeded', 'failed', 'pending')),
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course Catalog Structure
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    instructor_bio TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    student_count INT DEFAULT 0,
    duration VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0.00,
    level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    thumbnail_url TEXT,
    badge VARCHAR(50),
    description TEXT NOT NULL,
    learning_outcomes TEXT[],
    skills_covered TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    video_url TEXT,
    content_markdown TEXT,
    preview_allowed BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_course_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

-- 4. Assessments & Exams
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    pass_percentage INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('mcq', 'checkbox', 'boolean', 'fill', 'coding', 'scenario')),
    text TEXT NOT NULL,
    options TEXT[], -- JSON list of options for MCQs
    correct_answer TEXT NOT NULL, -- Stored as string/json string
    scenario_context TEXT,
    points INT DEFAULT 10
);

CREATE TABLE user_assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    answers_json JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LeetCode Coding Arena
CREATE TABLE coding_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    constraints TEXT,
    starter_templates JSONB NOT NULL, -- Key-value for languages (Java, Python, JS, C, etc.)
    xp_points INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coding_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES coding_problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    code_content TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Accepted', 'Wrong Answer', 'Compile Error', 'Runtime Error', 'Time Limit Exceeded')),
    passed_test_cases INT DEFAULT 0,
    total_test_cases INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Interactive Portals & Internships
CREATE TABLE student_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES student_projects(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('ongoing', 'completed')),
    milestones_progress JSONB NOT NULL, -- JSON status tracker
    feedback TEXT,
    earned_badge TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    stipend VARCHAR(50)
);

CREATE TABLE user_internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('applied', 'active', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internship_daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_internship_id UUID REFERENCES user_internships(id) ON DELETE CASCADE,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_done TEXT NOT NULL,
    hours_logged DECIMAL(4, 2) NOT NULL,
    evaluator_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Placement & Job Portal
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    experience_required VARCHAR(100),
    salary_range VARCHAR(100),
    skills_required TEXT[],
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected')),
    resume_url TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Gamification, Certifications & Forums
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    unique_certificate_id VARCHAR(100) UNIQUE NOT NULL,
    digital_signature TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Subscription Pricing Plans
export const PRICING_PLANS = [
  {
    name: "Free Plan",
    price: "$0",
    period: "Forever",
    badge: "Basic Access",
    features: [
      "Access to Free Foundation Courses",
      "Limited Practice Coding Challenges",
      "Basic Assessments (5 attempts/mo)",
      "Standard Speed Web Video Playback",
      "Interactive Community Forums Access",
    ],
    notIncluded: [
      "No Professional Certificates",
      "No Live Classes & Live Q&A",
      "No AI Mentor & Interview Prep",
      "No Placement Assistance",
    ],
    buttonText: "Join for Free",
  },
  {
    name: "Starter Plan",
    price: "$29",
    period: "per month",
    badge: "Solo Learner",
    features: [
      "Access to 100+ Premium Courses",
      "Verified Certificates on Completion",
      "Unlimited Coding Arenas Challenges",
      "Comprehensive MCQ Assessments",
      "Community Chat Groups with Mentors",
    ],
    notIncluded: [
      "No AI Mentor & Mock Interviews",
      "No Projects & Internships Access",
      "No Guaranteed Placement calls",
    ],
    buttonText: "Start Starter Plan",
  },
  {
    name: "Professional Plan",
    price: "$49",
    period: "per month",
    badge: "Most Popular",
    isPopular: true,
    features: [
      "Unlimited Access to ALL Courses",
      "Interactive AI Mentor (24/7 Availability)",
      "Adaptive Coding Playground Support",
      "Real-World Milestone Projects",
      "Interactive Resume Builder Exports",
      "AI-Powered Mock Interviews Platform",
      "Live Scheduled Doubt Classes",
    ],
    buttonText: "Upgrade to Professional",
  },
  {
    name: "Career Accelerator Plan",
    price: "$99",
    period: "per month",
    badge: "Career Ready",
    features: [
      "All Professional Plan Features",
      "1-on-1 Mentor Support Booking",
      "Guaranteed Internship (MR Tech)",
      "Placement Support & Direct Resume Shares",
      "Live Advanced Batch Classes Access",
      "Job Interview Guaranteed Calls",
    ],
    buttonText: "Begin Career Drive",
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    period: "tailored billing",
    badge: "For Organizations",
    features: [
      "Unlimited Team Seats Provisioning",
      "Corporate Admin Performance Tracking",
      "Custom Training Roadmaps Creator",
      "Internal Skills Gap Analytics Dashboard",
      "Corporate Budgeting Analytics Tool",
      "Dedicated Enterprise Success Manager",
    ],
    buttonText: "Contact Sales",
  },
];

// Mock Career Paths
export const CAREER_PATHS = [
  {
    id: "java-path",
    title: "Java Full Stack Developer",
    description: "Master modern Java engineering from OOP foundations to Spring Boot microservices, React frontends, and cloud deployment pipelines.",
    duration: "6 Months",
    skills: ["Java SE", "Spring Boot", "Hibernate", "React.js", "Docker", "PostgreSQL"],
    steps: [
      { id: "s1", title: "Core Java Deep Dive", desc: "Object-oriented programming, data structures, multithreading, and collections.", status: "completed" },
      { id: "s2", title: "Advanced Java & JDBC", desc: "Java Database Connectivity, Servlets, JSP, and unit testing with JUnit.", status: "completed" },
      { id: "s3", title: "Spring Boot Microservices", desc: "Spring MVC, Spring Data JPA, Security, REST APIs, and microservices architecture.", status: "current" },
      { id: "s4", title: "Modern React Web Frontend", desc: "Integrating React state engines, Tailwind utility systems, and token authentication.", status: "pending" },
      { id: "s5", title: "Enterprise Capstone Project", desc: "Build a multi-service banking application with robust secure APIs.", status: "pending" },
      { id: "s6", title: "Rigorous Interview Prep", desc: "Mock dynamic coding round, Java system design, and recruiter mock calls.", status: "pending" }
    ]
  },
  {
    id: "python-path",
    title: "Python Full Stack Developer",
    description: "Establish a stellar engineering background in Python scripting, server-side Django frameworks, API designs, and rich client application frontends.",
    duration: "5 Months",
    skills: ["Python", "Django", "FastAPI", "React", "Docker", "Redis"],
    steps: [
      { id: "s1", title: "Python Core Essentials", desc: "Python syntax, decorators, multi-process scripts, and algorithms.", status: "pending" },
      { id: "s2", title: "Django Web Frameworks", desc: "ORM databases, forms, views, template engine, and Django REST framework.", status: "pending" },
      { id: "s3", title: "Asynchronous APIs with FastAPI", desc: "High-performance endpoint designs, dependency injection, and Pydantic validation.", status: "pending" },
      { id: "s4", title: "Cloud Deployment & Docker", desc: "Containerizing web services and orchestration using AWS/GCP pipelines.", status: "pending" }
    ]
  },
  {
    id: "ai-path",
    title: "AI & Generative AI Engineer",
    description: "Launch your career in the most sought-after sector. Go from fundamental Machine Learning to Large Language Models (LLMs) and Vector Databases.",
    duration: "8 Months",
    skills: ["Python", "TensorFlow", "PyTorch", "HuggingFace", "Vector DBs", "Gemini API"],
    steps: [
      { id: "s1", title: "Math & Statistical Foundations", desc: "Linear algebra, multivariable calculus, and probabilistic modeling.", status: "completed" },
      { id: "s2", title: "Classical Machine Learning", desc: "Scikit-Learn regression, trees, random forests, and hyperparameter tuning.", status: "completed" },
      { id: "s3", title: "Deep Learning & PyTorch", desc: "Neural networks, CNNs for computer vision, RNNs/Transformers for NLP.", status: "current" },
      { id: "s4", title: "Large Language Models & RAG", desc: "Prompt engineering, HuggingFace tools, LangChain, and Pinecone vector search.", status: "pending" },
      { id: "s5", title: "Developing Gemini AI Apps", desc: "Multi-modal Gemini API integration, streaming agents, and Live SDKs.", status: "pending" }
    ]
  },
  {
    id: "automation-path",
    title: "Automation Testing Engineer",
    description: "Transition into high-efficiency QA roles. Learn professional automated script development, continuous regression execution, and performance suites.",
    duration: "4 Months",
    skills: ["Selenium", "TestNG", "Cucumber", "REST Assured", "Jenkins", "SQL"],
    steps: [
      { id: "s1", title: "Manual Testing & QA Principles", desc: "Drafting robust test cases, bug lifecycles, and agile testing processes.", status: "completed" },
      { id: "s2", title: "Java Foundations for Selenium", desc: "Programming variables, syntax, lists, loops, and OOP for page objects.", status: "completed" },
      { id: "s3", title: "Selenium WebDriver & Locators", desc: "Web automation framework design, locators, dynamic wait elements, and page object model.", status: "current" },
      { id: "s4", title: "API Testing & CI/CD", desc: "Postman assertions, REST Assured, and automated regression scheduling via Jenkins.", status: "pending" }
    ]
  }
];

// Initial Mock Courses
export const COURSES: Course[] = [
  {
    id: "java-fs",
    title: "Java Full Stack Developer Masterclass",
    category: "Software Engineering",
    instructor: "Dr. Arvind Swamy",
    instructorBio: "Ex-Google Principal Engineer, Author of 'Mastering Concurrent Java', 15+ years training enterprise teams.",
    rating: 4.8,
    studentCount: 12450,
    duration: "86 Hours",
    price: 199,
    level: "Intermediate",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    badge: "Popular",
    description: "Learn building robust enterprise servers using Java SE/EE, Spring Boot, Spring Security, Hibernate, PostgreSQL, and modern React interfaces.",
    learningOutcomes: [
      "Understand OOP principles in Java and concurrent programming",
      "Architect microservice meshes with Spring Cloud Discovery and Gateway",
      "Build reactive, responsive client-side web apps using React & Tailwind",
      "Deploy containerized microservices into Kubernetes grids",
    ],
    skillsCovered: ["Java SE", "Spring Boot", "Microservices", "PostgreSQL", "React", "Docker", "JUnit"],
    modules: [
      {
        id: "m1",
        title: "Module 1: Java Core Language Architecture",
        lessons: [
          { id: "l1_1", title: "Course Onboarding & Enterprise Overview", duration: "12 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l1_2", title: "Java JVM, JRE, and JDK memory maps", duration: "24 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l1_3", title: "Generics, Wildcards, and Lambda Structures", duration: "35 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false },
        ]
      },
      {
        id: "m2",
        title: "Module 2: Building Secure REST APIs with Spring Boot",
        lessons: [
          { id: "l2_1", title: "Dependency Injection & IoC Container concepts", duration: "40 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: false },
          { id: "l2_2", title: "Spring Security OAuth2 JWT integrations", duration: "55 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false }
        ]
      }
    ],
    faqs: [
      { question: "Is this course appropriate for complete novices?", answer: "We assume basic programming variables familiarity, but we teach Java foundations from scratch." },
      { question: "Does this course guarantee placement?", answer: "MX JustLearn includes complete recruitment pathways with mock interviews, resume referrals, and active job notifications." }
    ]
  },
  {
    id: "python-fs",
    title: "Python Full Stack Developer with Django",
    category: "Software Engineering",
    instructor: "Sarah Jenkins",
    instructorBio: "Lead Backend Developer at PyCorp, Django contributor with a passion for teaching high-performance Web APIs.",
    rating: 4.7,
    studentCount: 8900,
    duration: "74 Hours",
    price: 149,
    level: "Beginner",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    badge: "Hot",
    description: "Write clean Python code, develop secure web servers with Django, deploy micro-services with FastAPI, and integrate responsive React pages.",
    learningOutcomes: [
      "Master Python data structures and algorithms",
      "Utilize Django ORM for migrations and clean database interactions",
      "Build high-speed asynchronous APIs using FastAPI",
      "Secure applications using dynamic Token Authentication",
    ],
    skillsCovered: ["Python", "Django", "FastAPI", "React.js", "MySQL", "Git", "API Security"],
    modules: [
      {
        id: "m1",
        title: "Module 1: Python Essentials & Data Structures",
        lessons: [
          { id: "l1", title: "Python Syntax and Virtual Environments", duration: "18 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l2", title: "OOP, Decorators, and Iterators in Python", duration: "32 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false }
        ]
      }
    ],
    faqs: [
      { question: "Do we learn React inside this Python program?", answer: "Yes, we cover integration of Django REST backends with a complete React UI." }
    ]
  },
  {
    id: "data-science",
    title: "Modern Data Science & Analytics Masterclass",
    category: "Data Science",
    instructor: "Dr. Vivek Chawla",
    instructorBio: "Senior Data Scientist, ex-Uber Researcher, PhD in Applied Statistics from Stanford.",
    rating: 4.9,
    studentCount: 15400,
    duration: "95 Hours",
    price: 249,
    level: "Advanced",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    badge: "Popular",
    description: "Go from linear algebra to predictive models, machine learning, Pandas pipelines, SciPy simulations, and beautiful Power BI reports.",
    learningOutcomes: [
      "Process complex big data structures with Pandas & NumPy",
      "Draft interactive, stunning data dashboards with Power BI",
      "Build and train predictive regression models and neural nets",
      "Perform A/B clinical tests and clean statistical analysis",
    ],
    skillsCovered: ["Python", "Pandas", "Power BI", "Statistics", "Machine Learning", "Seaborn"],
    modules: [
      {
        id: "m1",
        title: "Module 1: Professional SQL for Data Wrangling",
        lessons: [
          { id: "l1", title: "Advanced Joins, CTEs, and Window Functions", duration: "25 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l2", title: "Query Optimization and Analytical Aggregates", duration: "45 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false }
        ]
      }
    ],
    faqs: [
      { question: "Is Power BI covered extensively?", answer: "Absolutely. We include 15 hours dedicated to DAX, dashboards, and live analytical report generation." }
    ]
  },
  {
    id: "ai-eng",
    title: "Artificial Intelligence & Generative AI Engineering",
    category: "Artificial Intelligence",
    instructor: "Alan Miller",
    instructorBio: "Former OpenAI API Researcher, generative prompt engineer consultant for top Fortune 500 banks.",
    rating: 4.9,
    studentCount: 9320,
    duration: "112 Hours",
    price: 299,
    level: "Advanced",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
    badge: "Hot",
    description: "Architect state-of-the-art Generative AI systems. Master model fine-tuning, retrieval-augmented generation (RAG), vector databases, and Gemini API SDKs.",
    learningOutcomes: [
      "Understand transformer attention architectures",
      "Build intelligent AI agents with robust memory models",
      "Develop high-precision RAG systems with Pinecone & LangChain",
      "Implement multi-modal text, image, and voice streaming prompts",
    ],
    skillsCovered: ["Generative AI", "Transformers", "LangChain", "Vector DBs", "Gemini API", "HuggingFace"],
    modules: [
      {
        id: "m1",
        title: "Module 1: The NLP Transformer Revolution",
        lessons: [
          { id: "l1", title: "Attention Is All You Need Paper Breakdown", duration: "30 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l2", title: "Building your First Text Generator via Transformers", duration: "45 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false }
        ]
      }
    ],
    faqs: [
      { question: "What AI models will we write code for?", answer: "You will build production integrations using Gemini 3.5, Imagen, and other leading open-source LLMs." }
    ]
  },
  {
    id: "auto-test",
    title: "Professional Automation Testing Engineer",
    category: "Automation Testing",
    instructor: "Nisha Patel",
    instructorBio: "Principal QA Architect, Selenium core user group speaker, ex-Infosys Lead Tester.",
    rating: 4.6,
    studentCount: 7420,
    duration: "58 Hours",
    price: 129,
    level: "Beginner",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    badge: "Free",
    description: "Achieve QA perfection. Master Selenium WebDriver scripting, Cucumber BDD frameworks, TestNG execution grids, API tests, and CI/CD automation.",
    learningOutcomes: [
      "Design powerful page object models (POM) for automated suites",
      "Write clean Gherkin BDD behaviors integrated with Cucumber",
      "Build dynamic API assertions using REST Assured libraries",
      "Automate regressions within continuous deployment pipelines",
    ],
    skillsCovered: ["Selenium", "TestNG", "Cucumber", "REST Assured", "Jenkins", "SQL"],
    modules: [
      {
        id: "m1",
        title: "Module 1: Web Automation with Selenium WebDriver",
        lessons: [
          { id: "l1", title: "Dynamic Locator Strategies (XPath vs CSS Selectors)", duration: "25 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", previewAllowed: true },
          { id: "l2", title: "Handling Dynamic Elements, Frames & Alerts", duration: "35 mins", videoUrl: "https://www.w3schools.com/html/movie.mp4", previewAllowed: false }
        ]
      }
    ],
    faqs: [
      { question: "Do we require extensive Java experience?", answer: "No, we include an introductory Module covering the specific Java concepts used in Selenium automation." }
    ]
  }
];

// Initial Mock Assessments
export const ASSESSMENTS: Assessment[] = [
  {
    id: "java-exam",
    courseId: "java-fs",
    title: "Java Full Stack Developer Certification Assessment",
    durationMinutes: 10,
    passPercentage: 60,
    questions: [
      {
        id: "q1",
        type: "mcq",
        text: "Which of the following classes implements the Thread-safe, resizable list in Java?",
        options: [
          "java.util.ArrayList",
          "java.util.Vector",
          "java.util.concurrent.CopyOnWriteArrayList",
          "java.util.LinkedList"
        ],
        correctAnswer: "java.util.concurrent.CopyOnWriteArrayList",
        points: 10
      },
      {
        id: "q2",
        type: "boolean",
        text: "True or False: In Spring Boot, the @SpringBootApplication annotation aggregates @Configuration, @EnableAutoConfiguration, and @ComponentScan annotations.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10
      },
      {
        id: "q3",
        type: "mcq",
        text: "What is the primary architectural purpose of a Netflix Zuul or Spring Cloud Gateway service in a microservice mesh?",
        options: [
          "Providing database transaction replication services",
          "Serving as an API Gateway to handle routing, rate-limiting, and client security filters",
          "Serving as a distributed cache similar to Redis",
          "Compiling dynamic Java bytecode at runtime"
        ],
        correctAnswer: "Serving as an API Gateway to handle routing, rate-limiting, and client security filters",
        points: 10
      },
      {
        id: "q4",
        type: "scenario",
        text: "Scenario: Your backend Spring Boot server is experiencing a sudden spike in DB connection errors during traffic rushes. Which of the following strategies represents the immediate best-practice resolution?",
        options: [
          "Increase the server CPU capacity indefinitely",
          "Configure a pooling provider like HikariCP with optimized maxPoolSize and connectionTimeout parameters",
          "Remove database constraints to allow fast inserts",
          "Re-route all requests through client local storage directly"
        ],
        correctAnswer: "Configure a pooling provider like HikariCP with optimized maxPoolSize and connectionTimeout parameters",
        points: 15,
        scenarioContext: "High Traffic Database Ingress Failures"
      }
    ]
  },
  {
    id: "python-exam",
    courseId: "python-fs",
    title: "Python Web Core Competency Assessment",
    durationMinutes: 10,
    passPercentage: 60,
    questions: [
      {
        id: "q1",
        type: "mcq",
        text: "Which Django command is executed to update the physical database structure after models are modified?",
        options: [
          "python manage.py runserver",
          "python manage.py makemigrations && python manage.py migrate",
          "python manage.py syncdb",
          "python manage.py compilemodels"
        ],
        correctAnswer: "python manage.py makemigrations && python manage.py migrate",
        points: 10
      }
    ]
  }
];

// LeetCode Coding Arena Problems
export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "p1",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    starterTemplates: {
      javascript: `function twoSum(nums, target) {\n    // Write your JavaScript code here\n    \n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your Python code here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java code here\n        return new int[]{};\n    }\n}`
    },
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]", isHidden: false },
      { input: "[3,2,4], 6", output: "[1,2]", isHidden: false },
      { input: "[3,3], 6", output: "[0,1]", isHidden: true }
    ],
    xpPoints: 10
  },
  {
    id: "p2",
    title: "Reverse String",
    difficulty: "Easy",
    category: "Strings",
    description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    starterTemplates: {
      javascript: `function reverseString(s) {\n    // Modify s in-place\n    \n}`,
      python: `def reverse_string(s: list[str]) -> None:\n    # Modify s in-place\n    pass`,
      java: `class Solution {\n    public void reverseString(char[] s) {\n        // Modify s in-place\n    }\n}`
    },
    testCases: [
      { input: "['h','e','l','l','o']", output: "['o','l','l','e','h']", isHidden: false },
      { input: "['H','a','n','n','a','h']", output: "['h','a','n','n','a','H']", isHidden: true }
    ],
    xpPoints: 10
  },
  {
    id: "p3",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Algorithms",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    starterTemplates: {
      javascript: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n    \n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`
    },
    testCases: [
      { input: "'abcabcbb'", output: "3", isHidden: false },
      { input: "'bbbbb'", output: "1", isHidden: false },
      { input: "'pwwkew'", output: "3", isHidden: true }
    ],
    xpPoints: 20
  }
];

// Placement & Job Listings
export const JOB_LISTINGS: Job[] = [
  {
    id: "job1",
    title: "Associate Java Software Engineer",
    company: "MX Infotech",
    location: "Bangalore, India (Onsite)",
    type: "Full-time",
    experienceRequired: "Fresher to 1 Year",
    salaryRange: "₹6,00,000 - ₹8,50,000 per annum",
    skillsRequired: ["Java", "Spring Boot", "SQL", "Git"],
    description: "Join the core software team at MX Infotech. You will design, develop, and implement secure back-end Rest APIs, debug databases, and participate in daily agile sprints."
  },
  {
    id: "job2",
    title: "Junior Python Web Developer",
    company: "TechNexus Systems",
    location: "Hyderabad, India (Hybrid)",
    type: "Full-time",
    experienceRequired: "Fresher to 2 Years",
    salaryRange: "₹5,50,000 - ₹7,20,000 per annum",
    skillsRequired: ["Python", "Django", "HTML/CSS", "MySQL"],
    description: "We are looking for a Python developer who wants to work on cutting-edge ecommerce engines. Direct mentorship from senior developers included."
  },
  {
    id: "job3",
    title: "QA Automation Intern",
    company: "MR Technologies",
    location: "Remote (Global)",
    type: "Internship",
    experienceRequired: "No Experience Required",
    salaryRange: "₹25,000 per month (Stipend)",
    skillsRequired: ["Selenium", "Java", "TestNG"],
    description: "Participate in automated regression suites development, log defect workflows, and collaborate directly with developer divisions."
  }
];

// Initial Mock Community Posts
export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "cp1",
    author: "Rohan Das",
    authorRole: "Student",
    title: "Cleared the Java Full Stack Capstone! My experience and tips",
    content: "Just completed the multi-service banking simulation capstone. For anyone stuck on the Gateway JWT filter: make sure your CORS is configured correctly on Spring Boot or the request headers get cut! Feel free to ask questions.",
    category: "Java Full Stack Path",
    likes: 42,
    comments: [
      { id: "c1", author: "Priya Rao", content: "That CORS tip is a lifesaver, saved me hours!", date: "2026-06-23" }
    ],
    date: "2026-06-22"
  },
  {
    id: "cp2",
    author: "Mentor Dr. Arvind Swamy",
    authorRole: "Trainer",
    title: "Weekly Contest #4 starting this Saturday!",
    content: "Ready to test your algorithms? Weekly contest #4 is focusing on Dynamic Programming and Graphs. There are 3 challenges with 150 total XP points. Top 3 students will be recommended directly to MX Infotech hiring partners.",
    category: "Announcements",
    likes: 95,
    comments: [
      { id: "c2", author: "Rajesh K.", content: "Excited! Prepping the Trees & Graphs problems.", date: "2026-06-24" }
    ],
    date: "2026-06-23"
  }
];

// Standard Projects
export const STUDENT_PROJECTS: StudentProject[] = [
  {
    id: "proj1",
    title: "Secure Banking Portal Mockup",
    description: "Build a responsive client-side web application incorporating JWT authorization, multi-account routing, and real-time transaction graphs.",
    category: "Java Full Stack",
    milestones: [
      { id: "m1", title: "Setup Spring Security filter chain configs", status: "pending" },
      { id: "m2", title: "Configure JWT authentication filters", status: "pending" }
    ]
  },
  {
    id: "proj2",
    title: "Real-time Chat with WebSocket Sync",
    description: "Implement a full stack chat system serving private chat channels, group forums, and real-time active indicators using Node or Python socket servers.",
    category: "Full Stack Development",
    milestones: [
      { id: "m3", title: "Initialize express websocket listener", status: "pending" },
      { id: "m4", title: "Setup client socket emitter hooks", status: "pending" }
    ]
  }
];
