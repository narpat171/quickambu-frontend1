import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'; // ➔ CheckCircle आइकॉन जोड़ा
import axios from "axios";

function UserRegister() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  
  // ➔ 1. रजिस्ट्रेशन सक्सेस पॉप-अप के लिए स्टेट
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      alert("कृपया 10 अंकों का सही मोबाइल नंबर डालें!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("password", password);
    if (photo) {
      formData.append("profilePhoto", photo);
    }

    try {
      const response = await axios.post("https://quickambu-backend-1.onrender.com/api/user/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // ➔ 2. ब्राउज़र का alert हटाकर अपना शानदार पॉप-अप दिखाओ!
        setShowSuccessPopup(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "रजिस्ट्रेशन फेल हो गया!");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/UserLogin">
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
            <h1 className="text-2xl font-bold mt-2">
              Create <span className="text-red-600">User</span> Account
            </h1>
            <p className="text-gray-400 text-sm mt-1 text-center">
              Sign up to access instant ambulance booking
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* प्रोफाइल फोटो */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Profile Photo (Optional)</label>
              <div className="flex items-center gap-3 w-full border p-2 rounded-md bg-gray-50">
                <div className="bg-gray-200 p-2 rounded-full text-gray-500">
                  <Upload className="w-5 h-5" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 cursor-pointer outline-none"
                />
              </div>
            </div>

            {/* नाम इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            {/* मोबाइल नंबर इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Mobile Number</label>
              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            {/* ईमेल इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            {/* पासवर्ड इनपुट */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-md outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-semibold transition-colors mt-2 cursor-pointer text-sm"
            >
              Register Account
            </button>
            
            <div className="text-center pt-2">
              <span className="text-gray-500 text-xs">Already have an account? </span>
              <Link to="/UserLogin" className="text-blue-600 text-xs font-semibold hover:underline">Login here</Link>
            </div>
          </form>
        </div>

        {/* ➔ 3. कस्टम सक्सेस पॉप-अप (रजिस्ट्रेशन के लिए) */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center transform scale-100">
              
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Account Created! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">आपका अकाउंट सफलतापूर्वक बन गया है। अब आप लॉगिन कर सकते हैं।</p>
              
              {/* ➔ 4. रजिस्ट्रेशन के बाद लॉगिन पेज पर भेजना सही रहता है */}
              <button 
                onClick={() => navigate("/UserLogin")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/30 active:scale-95"
              >
                Go to Login Page ➔
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default UserRegister;