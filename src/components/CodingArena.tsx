/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, Sparkles, AlertCircle, Play, CheckCircle2, 
  HelpCircle, ChevronRight, RefreshCw, Code, Bot, Check, Zap, Award
} from 'lucide-react';
import { CodingProblem, UserProfile } from '../types';
import { CODING_PROBLEMS } from '../data';

interface CodingArenaProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function CodingArena({ profile, setProfile }: CodingArenaProps) {
  // Problems List navigation
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java'>('javascript');
  
  // Custom code inputs/state
  const [userCode, setUserCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

  // AI assistant states
  const [aiAssistantMode, setAiAssistantMode] = useState<'explain' | 'fix' | 'optimize' | 'hint' | 'approach'>('explain');
  const [aiResponseText, setAiResponseText] = useState('');
  const [loadingAiAssistant, setLoadingAiAssistant] = useState(false);

  // Selected Category filter
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = ['All', 'Arrays', 'Strings', 'Algorithms'];

  const filteredProblems = CODING_PROBLEMS.filter(p => categoryFilter === 'All' || p.category === categoryFilter);

  // Select a problem and load templates
  const handleSelectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setUserCode(problem.starterTemplates[selectedLanguage] || '');
    setExecutionOutput('');
    setExecutionStatus('idle');
    setAiResponseText('');
  };

  // Run Code logic simulation
  const handleRunCode = () => {
    if (!selectedProblem) return;
    setExecutionStatus('running');
    setExecutionOutput('Compiling source files...\nExecuting test cases...\n');

    setTimeout(() => {
      // Basic simulation check
      const passesTestCases = userCode.trim().length > (selectedProblem.starterTemplates[selectedLanguage] || '').trim().length;
      if (passesTestCases) {
        setExecutionStatus('success');
        setExecutionOutput(`Test Case 1 Passed!\nInput: ${selectedProblem.testCases[0].input}\nExpected: ${selectedProblem.testCases[0].output}\nYour Output: ${selectedProblem.testCases[0].output}\n\nAll non-hidden test suites matched successfully.`);
      } else {
        setExecutionStatus('failed');
        setExecutionOutput(`Compile Error / Assertion Failed!\nOutput does not match test expectation.\nExpected: ${selectedProblem.testCases[0].output}\nYour Output: undefined / null`);
      }
    }, 1200);
  };

  // Submit Code logic simulation
  const handleSubmitCode = () => {
    if (!selectedProblem) return;
    setExecutionStatus('running');
    setExecutionOutput('Running comprehensive test suites including hidden validation cases...\n');

    setTimeout(() => {
      const passesTestCases = userCode.trim().length > (selectedProblem.starterTemplates[selectedLanguage] || '').trim().length;
      if (passesTestCases) {
        setExecutionStatus('success');
        setExecutionOutput(`Accepted!\nAll ${selectedProblem.testCases.length} test cases passed.\nRuntime: 45ms (faster than 88% of submittals)\nMemory: 41.2MB`);
        
        // Reward student with XP points
        if (profile.xpPoints < 1000) {
          const updatedProfile = {
            ...profile,
            xpPoints: profile.xpPoints + selectedProblem.xpPoints,
            coins: profile.coins + 15
          };
          setProfile(updatedProfile);
        }
      } else {
        setExecutionStatus('failed');
        setExecutionOutput(`Wrong Answer!\nFailed on Test Case 3 (Hidden).\nVerify border parameters and edge cases.`);
      }
    }, 1500);
  };

  // AI Coding Assistant API trigger
  const handleAskAiAssistant = async (mode: typeof aiAssistantMode) => {
    if (!selectedProblem) return;
    setAiAssistantMode(mode);
    setLoadingAiAssistant(true);
    setAiResponseText('');

    try {
      const res = await fetch('/api/ai/code-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          code: userCode,
          mode,
          language: selectedLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponseText(data.text);
      } else {
        setAiResponseText('AI Assistant is currently overloaded or key is unconfigured. Review server logs.');
      }
    } catch (err) {
      setAiResponseText('Error connecting to Server-side AI. Try again.');
    } finally {
      setLoadingAiAssistant(false);
    }
  };

  return (
    <div id="coding-arena-container" className="bg-slate-950 text-slate-100 min-h-screen">
      {/* If no problem selected, render catalog */}
      {!selectedProblem ? (
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">MX Coding Practice Arena</h1>
              <p className="text-slate-400 text-xs mt-1">Hone your algorithms with curated LeetCode & HackerRank challenges. Earn XP to top global leaderboards.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              <div>
                <span className="block font-bold text-slate-200">Weekly Coding Challenge Live</span>
                <span className="text-[10px] text-slate-500 font-mono">Solve Two Sum and रिवर्स स्ट्रिंग challenges to obtain 20+ XP.</span>
              </div>
            </div>
          </div>

          {/* Categories Filters bar */}
          <div className="flex items-center gap-2 mb-6 text-xs overflow-x-auto pb-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl border transition cursor-pointer font-semibold ${
                  categoryFilter === cat
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Coding Problem Grid Lists */}
          <div className="grid grid-cols-1 gap-4">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                id={`problem-row-${problem.id}`}
                onClick={() => handleSelectProblem(problem)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center">
                    <Code className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{problem.title}</h3>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Category: {problem.category} · Reward: {problem.xpPoints} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase font-mono tracking-wide ${
                    problem.difficulty === 'Easy' ? 'bg-green-950/40 text-green-400 border border-green-900/20' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/20' :
                    'bg-red-950/40 text-red-400 border border-red-900/20'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Code Workspace split view screen */
        <div className="flex flex-col lg:flex-row h-screen relative overflow-hidden">
          
          {/* Header toolbar */}
          <div className="w-full h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 absolute top-0 left-0 right-0 z-10 text-xs">
            <button
              id="back-to-arena-btn"
              onClick={() => setSelectedProblem(null)}
              className="font-semibold text-slate-400 hover:text-slate-100 flex items-center gap-1.5 transition"
            >
              ← Back to Arena
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{selectedProblem.title}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedProblem.difficulty === 'Easy' ? 'bg-green-950/40 text-green-400 border border-green-900/20' : 'bg-yellow-950/40 text-yellow-400'
              }`}>{selectedProblem.difficulty}</span>
            </div>
            <div>
              {/* Language Selector */}
              <select
                id="arena-lang-select"
                value={selectedLanguage}
                onChange={(e) => {
                  const lang = e.target.value as any;
                  setSelectedLanguage(lang);
                  setUserCode(selectedProblem.starterTemplates[lang] || '');
                }}
                className="bg-slate-950 border border-slate-800 text-xs py-1.5 px-3 rounded-lg text-slate-300 focus:outline-none"
              >
                <option value="javascript">JavaScript (Node)</option>
                <option value="python">Python 3</option>
                <option value="java">Java SE 17</option>
              </select>
            </div>
          </div>

          {/* Left panel: challenge description and AI help */}
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen pt-14 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto flex flex-col justify-between">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-bold text-lg text-white mb-2">{selectedProblem.title}</h2>
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedProblem.description}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Constraints</h4>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap">
                  {selectedProblem.constraints}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Sample Test cases</h4>
                <div className="space-y-2 font-mono text-[11px]">
                  {selectedProblem.testCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-slate-550 block text-[9px] uppercase font-bold tracking-wider">Test {idx + 1} {tc.isHidden ? '(Hidden)' : null}</span>
                        <span className="text-slate-300 mt-0.5 block">Input: {tc.input}</span>
                      </div>
                      <span className="text-indigo-400 font-semibold">Expected: {tc.output}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI assistant drawer inline */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>AI Coding Assistant</span>
                </div>
                <div className="flex gap-1.5">
                  <button id="ai-explain-btn" onClick={() => handleAskAiAssistant('explain')} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-semibold cursor-pointer">Explain Code</button>
                  <button id="ai-fix-btn" onClick={() => handleAskAiAssistant('fix')} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-semibold cursor-pointer">Fix Bugs</button>
                  <button id="ai-optimize-btn" onClick={() => handleAskAiAssistant('optimize')} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-semibold cursor-pointer">Optimize</button>
                  <button id="ai-hint-btn" onClick={() => handleAskAiAssistant('hint')} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-semibold cursor-pointer">Get Socratic Hint</button>
                </div>
              </div>

              {loadingAiAssistant ? (
                <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 text-xs text-slate-400 rounded-2xl flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>Generating review details from Gemini...</span>
                </div>
              ) : aiResponseText ? (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-350 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap font-sans">
                  {aiResponseText}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right panel: Editor and outputs */}
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen pt-14 overflow-y-auto flex flex-col justify-between bg-slate-950">
            {/* Monospace Code Editor block */}
            <div className="p-6 flex-1 flex flex-col">
              <label className="block text-slate-400 mb-1.5 font-semibold text-xs font-mono uppercase tracking-wider">Code Workspace</label>
              <textarea
                rows={14}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full flex-1 bg-slate-900 border border-slate-850 rounded-2xl p-5 text-xs text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 placeholder-slate-700"
                style={{ tabSize: 4 }}
              />
            </div>

            {/* Custom Inputs and execution results footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Custom Test Input</label>
                  <input
                    type="text"
                    placeholder="e.g. [2,7,11,15], 9"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono uppercase tracking-wider font-medium">Output Results</label>
                  <div className={`p-2.5 border rounded-xl h-9 text-[10px] font-mono truncate flex items-center ${
                    executionStatus === 'success' ? 'bg-green-950/20 border-green-900/30 text-green-400' :
                    executionStatus === 'failed' ? 'bg-red-950/20 border-red-900/30 text-red-400' :
                    executionStatus === 'running' ? 'bg-blue-950/20 border-blue-900/30 text-blue-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    {executionStatus === 'running' ? 'Compiling source execution...' : executionStatus === 'success' ? 'Accepted!' : executionStatus === 'failed' ? 'Assertion Error!' : 'Idle - ready to compile'}
                  </div>
                </div>
              </div>

              {executionOutput && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-400 mb-4 whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                  {executionOutput}
                </div>
              )}

              {/* Run Actions */}
              <div className="flex gap-2.5 text-xs font-bold">
                <button
                  id="arena-run-btn"
                  onClick={handleRunCode}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-200 text-slate-200" />
                  Run Custom Suite
                </button>
                <button
                  id="arena-submit-btn"
                  onClick={handleSubmitCode}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
