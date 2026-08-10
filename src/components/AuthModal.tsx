import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<'student' | 'trainer'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hidden admin login trigger (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        window.location.href = '/admin-register'; // or handle a hidden admin login state if needed
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Enforce role check visually if they selected trainer but are student
        if (data.user.role !== 'super_admin' && data.user.role !== 'corporate_admin') {
           if (isLogin && loginRole === 'trainer' && data.user.role !== 'trainer') {
             setError('This account does not have trainer privileges.');
             setLoading(false);
             return;
           }
           if (isLogin && loginRole === 'student' && data.user.role !== 'student') {
             setError('This account is registered as a trainer. Please login as a trainer.');
             setLoading(false);
             return;
           }
        }
        
        onSuccess(data.user);
      } else {
        // Auto-login after registration or show message
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      if (isLogin) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl relative">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          {isLogin ? 'Sign in to continue your journey.' : 'Join the platform as a student.'}
        </p>

        {isLogin && (
          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => setLoginRole('student')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                loginRole === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('trainer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                loginRole === 'trainer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trainer Login
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition duration-200"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-400 font-bold hover:text-indigo-300 transition"
          >
            {isLogin ? 'Create one' : 'Login here'}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
