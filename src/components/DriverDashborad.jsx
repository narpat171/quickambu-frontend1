import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, MapPin, Phone, AlertTriangle, CheckCircle, Navigation } from "lucide-react";
import io from 'socket.io-client';

// 🚀 सर्वर से जुड़ने के लिए सॉकेट
const socket = io("https://quickambu-backend-1.onrender.com");

function DriverDashboard() {
  const [driverData, setDriverData] = useState(null);
  const [error, setError] = useState("");
  const [incomingDuty, setIncomingDuty] = useState(null); // 🚨 नई ड्यूटी (इमरजेंसी) के लिए स्टेट
  const navigate = useNavigate();

  // 1. पेज खुलते ही ड्राइवर का डेटा मंगाना
  useEffect(() => {
    const token = localStorage.getItem("driverToken");

    if (!token) {
      navigate("/DriverLogin");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("https://quickambu-backend-1.onrender.com/api/driver/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await response.json();

        if (data.success) {
          setDriverData(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("सर्वर से डेटा लाने में दिक्कत हुई!");
      }
    };

    fetchProfile();
  }, [navigate]);

  // 2. 🚀 SOCKET LISTENER: एडमिन की रिक्वेस्ट सुनना
  useEffect(() => {
    if (!driverData) return; // जब तक ड्राइवर का डेटा न आए, तब तक मत सुनो

    const handleIncomingDuty = (dutyData) => {
      // 🚨 चेक करें कि क्या एडमिन ने इसी ड्राइवर (ID) को बुलाया है?
      if (dutyData.driverId === driverData._id) {
        setIncomingDuty(dutyData);
        // आप चाहें तो यहाँ एक ऑडियो अलार्म भी बजा सकते हैं!
      }
    };

    socket.on("incoming-duty", handleIncomingDuty);
    
    return () => socket.off("incoming-duty", handleIncomingDuty);
  }, [driverData]);

  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    navigate("/DriverLogin");
  };

  // 3. गूगल मैप्स पर रास्ता खोलना
  const handleAcceptDuty = () => {
    if (incomingDuty && incomingDuty.coords) {
      const [lat, lng] = incomingDuty.coords;
      // सीधा गूगल मैप्स में नेविगेशन खोल देगा
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
      setIncomingDuty(null); // पॉपअप बंद कर दो
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center pt-10 font-sans">
      
      {/* 🚨 NEW EMERGENCY POPUP (यह तभी दिखेगा जब एडमिन डिस्पैच करेगा) */}
      {incomingDuty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-red-600 p-6 text-white text-center relative">
              <div className="absolute inset-0 bg-red-500 animate-ping opacity-20"></div>
              <BellRing className="w-16 h-16 mx-auto mb-2 animate-bounce" />
              <h2 className="text-3xl font-black uppercase tracking-widest">Emergency!</h2>
              <p className="text-red-100 font-bold mt-1">New Dispatch Assigned</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Patient Name</p>
                <p className="text-xl font-black text-slate-800">{incomingDuty.patientName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-xs text-red-400 font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Emergency</p>
                  <p className="text-sm font-black text-red-700">{incomingDuty.emergency}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-400 font-bold uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Contact</p>
                  <p className="text-sm font-black text-blue-700">{incomingDuty.patientMobile}</p>
                </div>
              </div>

              <button 
                onClick={handleAcceptDuty}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 transition-all active:scale-95"
              >
                <Navigation className="w-6 h-6" /> Accept & Start Navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER PROFILE CARD */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-red-500 to-red-700"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Quick<span className="text-red-600">Ambu</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Driver Console</p>
        </div>
        
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold">{error}</div>
        ) : driverData ? (
          <div className="space-y-4 text-sm font-semibold text-slate-600">
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 uppercase tracking-wider text-xs font-bold">Driver Name</span> 
              <span className="text-lg font-black text-slate-800">{driverData.name}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 uppercase tracking-wider text-xs font-bold">Mobile No.</span> 
              <span className="text-base text-slate-800">{driverData.mobile}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-amber-600/70 uppercase tracking-wider text-xs font-black">Vehicle No.</span> 
              <span className="bg-amber-400 px-3 py-1.5 rounded-lg font-black text-slate-900 shadow-sm border border-amber-500/50">
                {driverData.vehicleNumber || driverData.ambulanceNumber || "N/A"}
              </span>
            </div>

            <div className="pt-6 flex items-center justify-center gap-2 text-emerald-500 font-bold bg-emerald-50 py-3 rounded-2xl border border-emerald-100">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Duty ON - Waiting for Dispatch
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full mt-8 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold transition flex justify-center items-center gap-2"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse">Connecting to Server...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;