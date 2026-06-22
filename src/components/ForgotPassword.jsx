import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 👇 1. यहाँ Loader2 इम्पोर्ट किया है
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'; 
import axios from 'axios'; 

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(''); 
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/forgot-password", { email });
      if(response.data.success) {
        setSuccessMsg(response.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "यह ईमेल रजिस्टर नहीं है!");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/verify-otp", { email, otp });
      if(response.data.success) {
        setSuccessMsg(response.data.message);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "ग़लत या एक्सपायर OTP!");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/reset-password", { email, newPassword });
      if(response.data.success) {
        setSuccessMsg(response.data.message);
        setTimeout(() => navigate('/UserLogin'), 2000);
      }
    } catch (err) {
      setError("पासवर्ड बदलने में समस्या आई।");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 👇 यहाँ overflow-hidden लगाया है ताकि लोडर कार्ड के बाहर न निकले */}
      <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 relative z-10 overflow-hidden">
        
        {/* 🔴 RED LOADING SPINNER OVERLAY (यह सिर्फ तब दिखेगा जब loading true होगी) */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-3xl transition-all">
            <Loader2 className="w-14 h-14 text-red-500 animate-spin mb-3" />
            <span className="text-red-400 font-bold tracking-widest animate-pulse text-sm">
              {step === 1 ? "SENDING OTP..." : step === 2 ? "VERIFYING..." : "UPDATING PASSWORD..."}
            </span>
          </div>
        )}

        <Link to="/UserLogin" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            {step === 1 ? <Mail size={32} /> : step === 2 ? <KeyRound size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "New Password"}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {step === 1 ? "अपनी रजिस्टर्ड ईमेल आईडी डालें" : step === 2 ? `OTP ${email} पर भेजी गई है` : "अपना नया सुरक्षित पासवर्ड बनाएँ"}
          </p>
        </div>

        {/* Messages */}
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold p-3 rounded-xl text-center mb-4">{error}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-bold p-3 rounded-xl text-center mb-4 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {successMsg}</div>}

        {/* 🟢 STEP 1 FORM (ईमेल डालने के लिए) */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1.5 block">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2">
              Send OTP
            </button>
          </form>
        )}

        {/* 🟢 STEP 2 FORM (OTP डालने के लिए) */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1.5 block">Enter 4-digit OTP</label>
              <input 
                type="text" 
                maxLength={4}
                placeholder="1234" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
                className="w-full bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600 text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2">
              Verify OTP
            </button>
          </form>
        )}

        {/* 🟢 STEP 3 FORM (नया पासवर्ड बनाने के लिए) */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1.5 block">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter new password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3.5 pr-12 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
                />
                
                {/* 👁️ आँख वाला बटन */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2">
              Reset Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
}