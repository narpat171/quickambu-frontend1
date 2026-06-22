import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'; 
import axios from 'axios'; 

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(''); 
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 नया: पासवर्ड देखने/छुपाने के लिए
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 relative z-10">
        <Link to="/UserLogin" className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

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

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold p-3 rounded-xl text-center mb-4">{error}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-bold p-3 rounded-xl text-center mb-4 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {successMsg}</div>}

       {/* 🟢 STEP 3 FORM */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>अपना नया पासवर्ड बनाएँ:</p>
            
            {/* 👇 पासवर्ड वाला डिब्बा और आँख का बटन */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} // 👈 जादू यहाँ है (text या password)
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              />
              
              {/* 👁️ आँख वाला बटन */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '18px' 
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" disabled={loading} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? "पासवर्ड बदल रहे हैं..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}