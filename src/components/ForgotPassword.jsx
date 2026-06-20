import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 👉 Naya: 'Mail' ki jagah ab 'Smartphone' icon import kiya hai
import { Smartphone, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'; 
import axios from 'axios'; 

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: New Password
  const [mobile, setMobile] = useState(''); // 👉 email ki jagah mobile
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  // ➔ Step 1: मोबाइल पर OTP मंगाना
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // 👉 API me ab mobile bhej rahe hain
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/forgot-password", { mobile });
      
      if(response.data.success) {
        setSuccessMsg(response.data.message || "OTP आपके मोबाइल पर भेज दिया गया है!");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "यह नंबर रजिस्टर नहीं है!");
    } finally {
      setLoading(false);
    }
  };

  // ➔ Step 2: OTP चेक करना
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // 👉 Verify API me bhi mobile bhej rahe hain
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/verify-otp", { mobile, otp });
      
      if(response.data.success) {
        setSuccessMsg(response.data.message || "OTP सही है! अब नया पासवर्ड बनाएँ।");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "ग़लत या एक्सपायर OTP! कृपया दोबारा चेक करें।");
    } finally {
      setLoading(false);
    }
  };

  // ➔ Step 3: नया पासवर्ड सेव करना
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // 👉 Reset API me bhi mobile bhej rahe hain
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/reset-password", { mobile, newPassword });
      
      if(response.data.success) {
        setSuccessMsg(response.data.message || "पासवर्ड सफलतापूर्वक बदल गया है! 🎉");
        
        // 2 सेकंड बाद वापस लॉगिन पेज पर भेज दें
        setTimeout(() => navigate('/UserLogin'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "पासवर्ड बदलने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 relative z-10">
        
        {/* Back to Login Button */}
        <Link to="/UserLogin" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            {/* 👉 Icons update kiye gaye hain */}
            {step === 1 ? <Smartphone size={32} /> : step === 2 ? <KeyRound size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "New Password"}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {/* 👉 Text update kiye gaye hain */}
            {step === 1 ? "अपना रजिस्टर्ड मोबाइल नंबर डालें" : step === 2 ? `OTP ${mobile} पर भेजा गया है` : "अपना नया सुरक्षित पासवर्ड बनाएँ"}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold p-3 rounded-xl text-center mb-4">{error}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-bold p-3 rounded-xl text-center mb-4 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {successMsg}</div>}

        {/* STEP 1: MOBILE FORM */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Smartphone size={18} /></div>
              <input 
                type="tel" 
                maxLength="10"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} // 👉 Sirf numbers allow karega
                className="w-full bg-slate-900 border border-slate-700 text-white py-3.5 pl-12 pr-4 rounded-xl outline-none focus:border-red-500 transition-colors"
                placeholder="10 अंकों का मोबाइल नंबर"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all cursor-pointer">
              {loading ? "Sending OTP..." : "Send OTP to Mobile"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><KeyRound size={18} /></div>
              <input 
                type="text" 
                maxLength="4"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 text-white py-3.5 pl-12 pr-4 rounded-xl text-center tracking-[1em] font-bold outline-none focus:border-red-500 transition-colors"
                placeholder="----"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all cursor-pointer">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD FORM */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={18} /></div>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white py-3.5 pl-12 pr-4 rounded-xl outline-none focus:border-red-500 transition-colors"
                placeholder="Enter New Password"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-all cursor-pointer">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}