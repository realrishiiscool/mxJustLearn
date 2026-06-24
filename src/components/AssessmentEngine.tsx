/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Timer, AlertTriangle, CheckCircle2, 
  HelpCircle, ChevronRight, XCircle, ArrowRight, Download, Sparkles
} from 'lucide-react';
import { Assessment, Question, UserProfile } from '../types';
import { ASSESSMENTS } from '../data';

interface AssessmentEngineProps {
  courseId: string;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function AssessmentEngine({
  courseId,
  profile,
  setProfile,
  onClose
}: AssessmentEngineProps) {
  const assessment = ASSESSMENTS.find(a => a.courseId === courseId) || ASSESSMENTS[0];

  // Exam States
  const [examActive, setExamActive] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(assessment.durationMinutes * 60);
  const [examCompleted, setExamCompleted] = useState(false);
  
  // Results
  const [scorePercent, setScorePercent] = useState(0);
  const [passed, setPassed] = useState(false);
  const [certId, setCertId] = useState('');

  // Start exam timer loop
  useEffect(() => {
    if (!examActive || examCompleted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGradeExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examActive, examCompleted]);

  // Handle choice select
  const handleSelectAnswer = (qId: string, choice: string) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: choice });
  };

  // Grade exam responses
  const handleGradeExam = () => {
    setExamCompleted(true);
    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach((q) => {
      totalPoints += q.points;
      const userAnswer = selectedAnswers[q.id];
      const isCorrect = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.includes(userAnswer)
        : q.correctAnswer === userAnswer;
      
      if (isCorrect) {
        earnedPoints += q.points;
      }
    });

    const percent = Math.round((earnedPoints / totalPoints) * 100);
    const passStatus = percent >= assessment.passPercentage;

    setScorePercent(percent);
    setPassed(passStatus);

    if (passStatus) {
      // Award certificate details and reward XP
      const uniqueId = 'MXJL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setCertId(uniqueId);
      
      const updatedProfile = {
        ...profile,
        xpPoints: profile.xpPoints + 150,
        coins: profile.coins + 50,
        completedCourses: [...profile.completedCourses, courseId]
      };
      setProfile(updatedProfile);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="assessment-engine-modal" className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-xs font-semibold text-slate-500 hover:text-slate-350 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 cursor-pointer"
        >
          Cancel Quiz
        </button>

        {/* 1. QUIZ INTRODUCTION LANDING */}
        {!examActive && !examCompleted && (
          <div className="p-8 text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded-full border border-slate-850">Certification Exam Node</span>
              <h2 className="text-2xl font-black text-white mt-3 leading-tight">{assessment.title}</h2>
              <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                Complete the evaluation. Answer MCQ and scenario challenges to prove skills competency and earn verified certificates.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800/80 text-xs font-mono text-slate-300">
              <div>
                <span className="text-[9px] text-slate-550 block">TIMER LIMIT</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{assessment.durationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 block">QUESTION POOL</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{assessment.questions.length} Items</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 block">PASS THRESHOLD</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{assessment.passPercentage}% Score</span>
              </div>
            </div>

            <button
              id="start-exam-trigger-btn"
              onClick={() => setExamActive(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Begin Certification Quiz
            </button>
          </div>
        )}

        {/* 2. ACTIVE QUIZ TIMELINE QUESTIONS */}
        {examActive && !examCompleted && (
          <div className="p-8">
            {/* Upper Timer and details bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Timer className="w-4.5 h-4.5 text-blue-400" />
                <span className="font-mono text-slate-300 font-bold">{formatTime(timeRemaining)} Remaining</span>
              </div>
              <span className="font-mono text-slate-500 font-bold uppercase tracking-wider">QUESTION {currentQIdx + 1} OF {assessment.questions.length}</span>
            </div>

            {/* Scenario Context header if present */}
            {assessment.questions[currentQIdx].scenarioContext && (
              <div className="mb-4 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl text-xs text-indigo-300 italic">
                <strong>Scenario Background:</strong> {assessment.questions[currentQIdx].scenarioContext}
              </div>
            )}

            {/* Question Text */}
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-100 leading-snug">{assessment.questions[currentQIdx].text}</h3>
            </div>

            {/* Options lists MCQ selection */}
            <div className="space-y-3">
              {assessment.questions[currentQIdx].options?.map((option, idx) => {
                const isSelected = selectedAnswers[assessment.questions[currentQIdx].id] === option;
                return (
                  <button
                    key={idx}
                    id={`choice-${idx}`}
                    onClick={() => handleSelectAnswer(assessment.questions[currentQIdx].id, option)}
                    className={`w-full p-4 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{option}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-400 bg-blue-400' : 'border-slate-700'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next controls */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800/80">
              <button
                disabled={currentQIdx === 0}
                onClick={() => setCurrentQIdx(currentQIdx - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQIdx < assessment.questions.length - 1 ? (
                <button
                  id="quiz-next-btn"
                  onClick={() => setCurrentQIdx(currentQIdx + 1)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-550 text-white font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Next Question
                </button>
              ) : (
                <button
                  id="quiz-finish-btn"
                  onClick={handleGradeExam}
                  className="px-6 py-2 bg-green-600 hover:bg-green-550 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Grade & Submit
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. EXAM FINISHED RESULTS PANEL & CERTIFICATE */}
        {examCompleted && (
          <div className="p-8 text-center space-y-6">
            {passed ? (
              <div className="space-y-4">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-white">Congratulations, You Passed!</h3>
                <p className="text-slate-400 text-xs">You successfully completed the evaluation with a score of <strong className="text-green-400">{scorePercent}%</strong>, exceeding the passing benchmark.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <XCircle className="w-14 h-14 text-red-500 mx-auto" />
                <h3 className="text-2xl font-black text-white">Assessment Failed</h3>
                <p className="text-slate-400 text-xs">Your score of <strong className="text-red-400">{scorePercent}%</strong> did not meet the required pass benchmark of {assessment.passPercentage}%.</p>
                <button
                  id="quiz-retry-btn"
                  onClick={() => {
                    setExamActive(true);
                    setExamCompleted(false);
                    setCurrentQIdx(0);
                    setSelectedAnswers({});
                    setTimeRemaining(assessment.durationMinutes * 60);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-lg text-xs font-bold inline-block cursor-pointer"
                >
                  Retake Exam
                </button>
              </div>
            )}

            {/* PRINTABLE DIGITAL SIGNED CERTIFICATE */}
            {passed && (
              <div className="p-6 bg-white text-slate-900 rounded-2xl text-center border-4 border-double border-slate-350 shadow-inner max-w-lg mx-auto relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-600/5 rounded-full pointer-events-none" />
                
                <span className="text-[9px] tracking-widest uppercase font-black text-slate-400 block font-mono">MX JustLearn Credentials Node</span>
                
                <h4 className="text-lg font-black uppercase text-indigo-900 mt-2 tracking-tight">Certificate of Mastery</h4>
                <p className="text-[10px] text-slate-550 italic mt-1">This is to verify that student</p>
                
                <h5 className="text-md font-bold text-slate-900 my-2 underline decoration-blue-500 decoration-2">{profile.name}</h5>
                
                <p className="text-[10px] text-slate-700 max-w-sm mx-auto leading-relaxed">
                  has successfully passed the comprehensive evaluation parameters for the premium curriculum <strong>{assessment.title.replace('Assessment', '')}</strong>.
                </p>

                {/* Validation signatures */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 mt-5 pt-4 text-[9px] font-mono text-slate-500">
                  <div className="text-left">
                    <span className="font-bold text-slate-800">MX INFOTECH BOARD</span>
                    <span className="block mt-0.5">SHA256 Digital Signature Verified</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">CERTIFICATE ID</span>
                    <span className="block mt-0.5 text-blue-600 font-bold">{certId}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              id="quiz-close-btn"
              onClick={onClose}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-bold rounded-xl text-xs cursor-pointer"
            >
              Exit to Dashboard Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
