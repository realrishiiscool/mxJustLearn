import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface AdminRegisterModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AdminRegisterModal({ onClose, onSuccess }: AdminRegisterModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretToken, setSecretToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'super_admin',
          secret_token: secretToken
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Instead of forcing login, we can just say success
      alert('Admin account created successfully! Please log in.');
      onClose();
      // Remove the special path
      if (window.history.pushState) {
        window.history.pushState({}, '', '/');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">Admin Initialization</h2>
          <p className="text-slate-400 text-xs mt-2 text-center">Secure terminal for Super Admin provisioning.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 font-semibold relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="E.g. System Administrator"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="admin@mxjustlearn.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Master Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secret Admin Token</label>
            <input 
              type="password" 
              required 
              value={secretToken}
              onChange={(e) => setSecretToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Enter provisioning token"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition duration-200 uppercase tracking-wider text-sm"
          >
            {loading ? 'Authenticating...' : 'Initialize Super Admin'}
          </button>
        </form>

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
