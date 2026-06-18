import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 🚨 यहाँ आपका सीक्रेट ID और Password है! (आप इसे बदल सकते हैं)
    const SECRET_ID = "admin";
    const SECRET_PASS = "admin123";

    if (adminId === SECRET_ID && password === SECRET_PASS) {
      // अगर पासवर्ड सही है, तो ब्राउज़र को याद दिला दो कि ये असली एडमिन है
      localStorage.setItem("adminAuth", "true");
      navigate("/admin"); // सीधा कंट्रोल रूम में भेजो
    } else {
      setError("❌ गलत ID या Password! आप एडमिन नहीं हैं।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 relative z-10">
        
        {/* Back Button */}
        <Link to="/Role" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Icon & Title */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">Admin Access</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Authorized Personnel Only</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Admin ID</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={18} /></div>
              <input 
                type="text" 
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-semibold py-3.5 pl-12 pr-4 rounded-xl outline-none focus:border-red-500 transition-colors"
                placeholder="Enter Secret ID"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={18} /></div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-semibold py-3.5 pl-12 pr-4 rounded-xl outline-none focus:border-red-500 transition-colors"
                placeholder="Enter Password"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all uppercase tracking-wider text-sm mt-4">
            Verify & Enter
          </button>
        </form>
      </div>
    </div>
  );
}