import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react'; // ➔ CheckCircle आइकॉन जोड़ा
import axios from "axios";

function DriverLogin() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  
  // ➔ 1. ड्राइवर लॉगिन सक्सेस पॉप-अप के लिए स्टेट
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      alert("कृपया 10 अंकों का सही मोबाइल नंबर डालें!");
      return;
    }

    try {
      // ➔ ड्राइवर लॉगिन API हिट करना
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/driver/login", {
        mobile,
        password
      });

      if (response.data.success) {
        // ड्राइवर का टोकन सेव करें
        localStorage.setItem("driverToken", response.data.token);
        
        // ➔ 2. बोरिंग alert हटाकर अपना शानदार पॉप-अप दिखाओ!
        setShowSuccessPopup(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "लॉगिन फेल हो गया!");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/Role">
              <button className="text-gray-600 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-1.5">
              <Link to="/"><img src={Logo} alt="logo" className="w-15"/></Link>
              <div className="flex flex-col leading-none">
                <span className="text-red-600 font-extrabold text-lg tracking-wide">QuickAmbu</span>
                <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ambulance</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-r from-red-50 to-white flex items-center justify-center px-4 py-10 relative">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl border p-8">

          <div className="flex flex-col items-center mb-6">
            <img src={Logo} alt="QuickAmbu" className="w-16" />
            <h1 className="text-2xl font-bold mt-2 text-center">
              Driver <span className="text-red-600">Login</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1 text-center">
              Login to accept emergency requests and save lives.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* मोबाइल नंबर इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Mobile Number</label>
              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10 digit registered mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            {/* पासवर्ड इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Password</label>
              <input
                type="password"
                placeholder="Enter your driver password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-semibold transition-colors mt-2 cursor-pointer text-sm shadow-md"
            >
              Login as Driver ➔
            </button>
            
            <div className="text-center pt-2">
              <span className="text-gray-500 text-xs">Want to join us? </span>
              <Link to="/AmbuRegister" className="text-blue-600 text-xs font-semibold hover:underline">Register Ambulance</Link>
            </div>
          </form>
        </div>

        {/* ➔ 3. शानदार ड्राइवर सक्सेस पॉप-अप */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center transform scale-100 animate-bounce-short">
              
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Driver Login Success!</h2>
              <p className="text-gray-500 text-sm mb-6">Welcome back! You are now ready to receive emergency duty requests.</p>
              
              {/* ➔ 4. ड्राइवर को उसके डैशबोर्ड (/dashboard) पर भेजें */}
              <button 
                onClick={() => navigate("/AmbulanceDashboard")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/30 active:scale-95"
              >
                Go to Driver Panel ➔
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default DriverLogin;