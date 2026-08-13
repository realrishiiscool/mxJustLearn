import React, { useState } from 'react';
import { UserPlus, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface CreateUserFormProps {
  borderless?: boolean;
}

export default function CreateUserForm({ borderless = false }: CreateUserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainer');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!data.success) {
        setStatus({ type: 'error', message: data.error || 'Failed to create user' });
      } else {
        setStatus({ type: 'success', message: 'User created successfully!' });
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={borderless ? "space-y-6 text-xs text-slate-300" : "bg-slate-900 border border-slate-800 rounded-3xl p-6 text-xs text-slate-300"}>
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Create System User</h3>
          <p className="text-slate-400 text-xs mt-0.5">Provision new trainers or staff accounts directly.</p>
        </div>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none transition duration-150"
            placeholder="E.g. Rajesh Kumar"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none transition duration-150"
            placeholder="rajesh@mxjustlearn.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporary Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none transition duration-150"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Role</label>
          <div className="relative">
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none appearance-none transition duration-150 cursor-pointer"
            >
              <option value="trainer">Trainer</option>
              <option value="corporate_admin">Corporate HR</option>
              <option value="student">Student</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 transition duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Provisioning...' : 'Provision Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
