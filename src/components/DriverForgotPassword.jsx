import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DriverForgotPassword = () => {
  // 👇 यहाँ अपना Render या Glitch वाला बैकएंड लिंक डालें
  const BASE_URL = "https://quickambu-backend-1.onrender.com/api/driver"; 

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ➔ STEP 1: OTP भेजना
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await axios.post(`${BASE_URL}/forgot-password`, { email });
      if (res.data.success) {
        setMessage("OTP आपकी ईमेल पर भेज दिया गया है!");
        setStep(2); // दूसरे स्टेप पर जाओ
      }
    } catch (err) {
      setError(err.response?.data?.message || "ईमेल भेजने में एरर!");
    }
    setLoading(false);
  };

  // ➔ STEP 2: OTP वेरीफाई करना
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
      if (res.data.success) {
        setMessage("OTP सही है! अब नया पासवर्ड बनाएँ।");
        setStep(3); // तीसरे स्टेप पर जाओ
      }
    } catch (err) {
      setError(err.response?.data?.message || "ग़लत OTP!");
    }
    setLoading(false);
  };

  // ➔ STEP 3: नया पासवर्ड सेट करना
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await axios.post(`${BASE_URL}/reset-password`, { email, newPassword });
      if (res.data.success) {
        alert("🎉 पासवर्ड सफलतापूर्वक बदल गया है! अब आप लॉगिन कर सकते हैं।");
        navigate('/driver-login'); // लॉगिन पेज पर भेज दो
      }
    } catch (err) {
      setError(err.response?.data?.message || "पासवर्ड बदलने में एरर!");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '20px' }}>Driver Password Reset</h2>

        {/* मैसेज और एरर दिखाने के लिए */}
        {message && <p style={{ color: 'green', backgroundColor: '#d1fae5', padding: '10px', borderRadius: '5px', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
        {error && <p style={{ color: 'red', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px', textAlign: 'center', fontSize: '14px' }}>{error}</p>}

        {/* 🟢 STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>रजिस्टर की हुई ईमेल आईडी डालें:</p>
            <input 
              type="email" 
              placeholder="driver@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', outline: 'none' }}
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? "भेज रहे हैं..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* 🟢 STEP 2 FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>ईमेल पर आया 4 अंकों का OTP डालें:</p>
            <input 
              type="text" 
              placeholder="1234" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', outline: 'none', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }}
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? "वेरीफाई कर रहे हैं..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* 🟢 STEP 3 FORM */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>अपना नया पासवर्ड बनाएँ:</p>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', outline: 'none' }}
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? "पासवर्ड बदल रहे हैं..." : "Reset Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default DriverForgotPassword;