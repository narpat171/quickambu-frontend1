import React, { useState, useEffect, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoWarning, IoCheckmark, IoClose, IoLocate, IoCloseCircle, IoCall } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { MdDirectionsCar, MdPerson, MdPhone } from "react-icons/md";
import { LogOut } from 'lucide-react'; 
import Logo from '../assets/logo.png'; 
import axios from 'axios';
import { useNavigate } from "react-router-dom";

// 🚀 Socket.io Import
import io from 'socket.io-client';
const socket = io("https://quickambu-backend.onrender.com");

const initialAmbulances = [];

// 🌍 HAVERSINE FORMULA (दो GPS कोऑर्डिनेट्स के बीच की असली दूरी नापने के लिए)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // धरती का रेडियस (Kilometers में)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // दूरी किलोमीटर में मिलेगी
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [userLocation, setUserLocation] = useState("");

  const [sentRequests, setSentRequests] = useState(() => {
    const saved = localStorage.getItem("quickambu_sent_requests");
    return saved ? JSON.parse(saved) : [];
  });

  const [incomingRequestsHistory, setIncomingRequestsHistory] = useState(() => {
    const saved = localStorage.getItem("quickambu_incoming_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [dispatchedAmbulanceIds, setDispatchedAmbulanceIds] = useState(() => {
    const saved = localStorage.getItem("quickambu_dispatched_ambs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("quickambu_sent_requests", JSON.stringify(sentRequests));
  }, [sentRequests]);

  useEffect(() => {
    localStorage.setItem("quickambu_incoming_history", JSON.stringify(incomingRequestsHistory));
  }, [incomingRequestsHistory]);

  useEffect(() => {
    localStorage.setItem("quickambu_dispatched_ambs", JSON.stringify(dispatchedAmbulanceIds));
  }, [dispatchedAmbulanceIds]);

  const [customNotification, setCustomNotification] = useState({ show: false, title: "", message: "", type: "success" });
  const [openFormId, setOpenFormId] = useState(null);
  const [imgIndexes, setImgIndexes] = useState({});
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmergency, setPatientEmergency] = useState("");
  const [isLocationFiltered, setIsLocationFiltered] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [enteredMasterKey, setEnteredMasterKey] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const COMPANY_MASTER_KEY = "QUICK_AMBU_BHALERI";

  const [currentLiveUser, setCurrentLiveUser] = useState(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) navigate("/AdminLogin");

    // 📍 चूँकि अभी बैकएंड में ड्राइवरों की लोकेशन सेव नहीं है, 
    // इसलिए टेस्टिंग के लिए हम राजस्थान के अलग-अलग शहरों की असली लोकेशन सेट कर रहे हैं
    const rajasthanCoords = [
      [28.2900, 74.9700], // चुरू शहर (भालेरी से करीब)
      [28.6700, 75.0300], // तारानगर (भालेरी के सबसे पास)
      [26.9124, 75.7873], // जयपुर (भालेरी से दूर)
      [28.0200, 73.3100], // बीकानेर
      [27.6000, 75.1500]  // सीकर
    ];

    const fetchAllDrivers = async () => {
      try {
        const response = await axios.get("https://quickambu-backend.onrender.com/api/driver/all");
        if (response.data.success && response.data.data.length > 0) {
          setAmbulances(response.data.data.map((d, index) => ({ 
            id: d._id, 
            driver: d.name, 
            phone: d.mobile,
            type: "ALS (ICU)",
            status: "Available",
            distance: "Click 'Search Nearest' to Calculate",
            kmValue: 99999, // डिफ़ॉल्ट बहुत ज़्यादा ताकि सॉर्टिंग सही हो
            coords: rajasthanCoords[index % rajasthanCoords.length], // 👈 हर ड्राइवर को असली लोकेशन दी गई
            images: [
              "https://th.bing.com/th/id/OIP.q4ZWBwsbzhHjYzDyiaV_twHaE8?w=161&h=150&c=6&r=0&o=7&dpr=1.5&pid=1.7&rm=3",
              "https://static.vecteezy.com/system/resources/previews/050/966/015/non_2x/modern-ambulance-interior-with-equipment-for-medical-emergency-photo.jpg"
            ]
          })));
        } else {
          setAmbulances(initialAmbulances);
        }
      } catch (error) { 
        setAmbulances(initialAmbulances);
      }
    };
    fetchAllDrivers();
  }, [navigate]);

  // 🚀 SOCKET LISTENERS
  useEffect(() => {
    socket.on("receive-request", (newReq) => {
      setCurrentLiveUser({
        id: newReq.id,
        name: newReq.name,
        phone: newReq.mobile,
        location: newReq.location || "Live GPS Location",
        emergencyType: newReq.emergency,
        time: newReq.time,
        coords: newReq.coords // 👈 मरीज़ की असली लोकेशन
      });
    });

    socket.on("journey-status-updated", (data) => {
      setSentRequests(prev => prev.map(req => req.id === data.reqId ? { ...req, status: getJourneyLabel(data.step) } : req));
    });

    socket.on("driver-location-update", (data) => {
      setSentRequests(prev => prev.map(req => {
        if (req.id === data.reqId) {
          // 📍 लाइव दूरी दोबारा नापें (मरीज़ की फिक्स लोकेशन से ड्राइवर की नई लोकेशन तक)
          const newLiveDistance = calculateDistance(req.userLat, req.userLng, data.lat, data.lng).toFixed(1);
          return { ...req, ambLat: data.lat, ambLng: data.lng, distanceKm: `${newLiveDistance} km` }; 
        }
        return req;
      }));

      // अगर ट्रैकिंग मोडल ओपन है, तो उसमें भी लाइव लोकेशन और लाइव दूरी अपडेट करें
      setTrackingData(prev => {
        if (prev && prev.id === data.reqId) {
          const newLiveDistance = calculateDistance(prev.userLat, prev.userLng, data.lat, data.lng).toFixed(1);
          return { ...prev, ambLat: data.lat, ambLng: data.lng, distanceKm: `${newLiveDistance} km` };
        }
        return prev;
      });
    });

    return () => {
      socket.off("receive-request");
      socket.off("journey-status-updated");
      socket.off("driver-location-update");
    };
  }, []);

  const getJourneyLabel = (step) => {
    const labels = ["Dispatched", "Ambulance Started", "On The Way", "Reached Patient", "Patient On Board", "Reached Hospital", "Trip Completed!"];
    return labels[step] || "Updating...";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndexes((prev) => {
        const updated = { ...prev };
        ambulances.forEach((amb) => {
          const currentIndex = prev[amb.id] || 0;
          updated[amb.id] = currentIndex === 0 ? 1 : 0;
        });
        return updated;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [ambulances]);

  useEffect(() => {
    if (currentLiveUser) {
      startAlertTone();
      setPatientName(currentLiveUser.name || "");
      setPatientPhone(currentLiveUser.phone || "");
      setPatientEmergency(currentLiveUser.emergencyType || "");
      setUserLocation(currentLiveUser.location || "");

      const isAlreadyLogged = incomingRequestsHistory.some(h => h.id === currentLiveUser.id);
      if (!isAlreadyLogged) {
        setIncomingRequestsHistory(prev => [
          {
            id: currentLiveUser.id || `REQ-${Date.now().toString().slice(-4)}`,
            time: currentLiveUser.time || new Date().toLocaleTimeString(),
            name: currentLiveUser.name,
            phone: currentLiveUser.phone,
            location: currentLiveUser.location,
            status: "Pending Action"
          },
          ...prev
        ]);
      }
    } else {
      stopAlertTone();
      setIsLocationFiltered(false);
    }
    return () => stopAlertTone();
  }, [currentLiveUser]);

  const startAlertTone = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }
      if (!oscillatorRef.current) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        const modulationTimer = setInterval(() => {
          if (oscillatorRef.current && ctx.state === "running") {
            const currentFreq = osc.frequency.value;
            osc.frequency.setValueAtTime(currentFreq === 600 ? 900 : 600, ctx.currentTime);
          } else {
            clearInterval(modulationTimer);
          }
        }, 400);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
      }
    } catch (e) {}
  };

  const stopAlertTone = () => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch (e) {}
      oscillatorRef.current = null;
    }
  };

  // 🚀 100% REAL DISTANCE CALCULATION
  const handleLocationSearchFilter = () => {
    if (!currentLiveUser || !currentLiveUser.coords) {
      setCustomNotification({ show: true, title: "Location Error", message: "मरीज़ की लोकेशन नहीं मिल पा रही है!", type: "error" });
      return;
    }

    const userLat = currentLiveUser.coords[0];
    const userLng = currentLiveUser.coords[1];

    setAmbulances(prev => prev.map(amb => {
      // अगर एम्बुलेंस के कोऑर्डिनेट्स हैं, तो असली दूरी निकालें
      if (amb.coords && amb.coords.length === 2) {
        const exactDistance = calculateDistance(userLat, userLng, amb.coords[0], amb.coords[1]);
        return { 
          ...amb, 
          kmValue: exactDistance, 
          distance: `${exactDistance.toFixed(1)} km` 
        };
      }
      return amb;
    }));
    setIsLocationFiltered(true);
  };

  const handleConfirmDeleteAmbulance = () => {
    if (enteredMasterKey === COMPANY_MASTER_KEY) {
      setAmbulances(prev => prev.filter(amb => amb.id !== deleteTargetId));
      setCustomNotification({ show: true, title: "Successfully Removed!", message: `Ambulance Unit ${deleteTargetId} has been securely removed.`, type: "success" });
      setDeleteTargetId(null);
      setEnteredMasterKey("");
    } else {
      setCustomNotification({ show: true, title: "Access Denied!", message: "Invalid Company Master Key! Action aborted.", type: "error" });
    }
  };

  // 🚀 सबसे नज़दीकी एम्बुलेंस सबसे ऊपर आएगी
  const displayedAmbulances = isLocationFiltered
    ? [...ambulances].sort((a, b) => a.kmValue - b.kmValue)
    : ambulances;

  const sendAmbulanceRequest = (ambId) => {
    if (!patientName || !patientPhone || !patientEmergency) {
      setCustomNotification({ show: true, title: "Incomplete Form", message: "Please fill details correctly!", type: "error" });
      return;
    }

    const amb = ambulances.find(a => a.id === ambId);
    const generatedReqId = currentLiveUser?.id || `REQ-${Date.now()}`;
    
    const userLat = currentLiveUser?.coords?.[0] || 26.8655; 
    const userLng = currentLiveUser?.coords?.[1] || 75.7834;

    // एम्बुलेंस की असली लोकेशन
    const ambulanceStartLat = amb.coords?.[0] || userLat;
    const ambulanceStartLng = amb.coords?.[1] || userLng;

    const dispatchData = { 
      reqId: generatedReqId,
      driverId: amb.id, 
      driverName: amb.driver, 
      vehicle: amb.id, 
      patientName: patientName, 
      patientMobile: patientPhone, 
      emergency: patientEmergency, 
      location: userLocation,
      coords: [userLat, userLng] 
    };

    socket.emit("dispatch-ambulance", dispatchData);
    
    const newDispatch = {
      id: generatedReqId,
      ambId: ambId,
      patientName: patientName,
      patientPhone: patientPhone,
      emergencyType: patientEmergency,
      location: userLocation,
      time: new Date().toLocaleTimeString(),
      status: "Dispatched",
      userLat: userLat, 
      userLng: userLng, 
      ambLat: ambulanceStartLat, // 👈 ट्रैक मैप के लिए एम्बुलेंस की स्टार्टिंग लोकेशन
      ambLng: ambulanceStartLng,
      distanceKm: amb.distance,
      driverName: amb.driver,
      driverPhone: amb.phone
    };

    setSentRequests([newDispatch, ...sentRequests]);
    setAmbulances(prev => prev.map(a => a.id === ambId ? { ...a, status: "Busy" } : a));
    setDispatchedAmbulanceIds(prev => [...prev, ambId]);

    setCustomNotification({ show: true, title: "Request Sent!", message: `Ambulance ${amb.driver} dispatched for ${patientName}.`, type: "success" });
    setOpenFormId(null);
    setCurrentLiveUser(null);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    return phone.replace(/[^0-9+]/g, ''); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 font-sans antialiased relative animate-page-fade">
      
      {/* HEADER */}
      <header className="bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-800 text-white h-20 flex items-center px-6 md:px-10 justify-between sticky top-0 z-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
            <img src={Logo} alt="QuickAmbu" className="w-12 h-12 object-contain relative drop-shadow-2xl"/> 
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-1">Quick<span className="text-red-500">Ambu</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Master Control Room</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Status</p>
            <p className="text-sm font-bold text-emerald-400">Online & Secure</p>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
          <button onClick={() => { localStorage.removeItem("adminAuth"); navigate("/"); }} className="flex items-center gap-2 bg-slate-800/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Exit Control</span>
          </button>
        </div>
      </header>

      {/* Modals... */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 transform transition-all duration-300 animate-scale-up">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mx-auto"><IoWarning /></div>
            <div className="text-center space-y-1">
              <h3 className="text-base md:text-lg font-black text-gray-950">Remove Vehicle Securely</h3>
              <p className="text-xs text-gray-500">Enter your company's master verification passkey to authorize deletion for <strong>{deleteTargetId}</strong>.</p>
            </div>
            <div className="space-y-3">
              <input type="password" placeholder="Enter Company Master Key" value={enteredMasterKey} onChange={(e) => setEnteredMasterKey(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-center text-xs md:text-sm tracking-widest font-mono focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"/>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => { setDeleteTargetId(null); setEnteredMasterKey(""); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition duration-150 cursor-pointer">Cancel</button>
                <button onClick={handleConfirmDeleteAmbulance} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 rounded-xl transition duration-150 shadow-sm shadow-red-200 cursor-pointer">Verify & Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {customNotification.show && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs md:max-w-sm w-full p-5 text-center space-y-4 transform transition-all duration-300 animate-scale-up">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto ${customNotification.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
              {customNotification.type === "success" ? <IoCheckmark /> : <IoClose />}
            </div>
            <div className="space-y-1">
              <h4 className="text-base md:text-lg font-bold text-gray-950">{customNotification.title}</h4>
              <p className="text-xs text-gray-600 font-medium">{customNotification.message}</p>
            </div>
            <button onClick={() => setCustomNotification({ ...customNotification, show: false })} className={`w-full text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer ${customNotification.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>Close</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Live Emergency Panel */}
        <div className={`bg-white border-2 rounded-2xl p-4 md:p-6 shadow-md space-y-4 transition-all duration-500 ${currentLiveUser ? "border-red-500 shadow-lg shadow-red-100" : "border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${currentLiveUser ? "bg-red-600 animate-ping" : "bg-gray-300"}`}></span>
              <h3 className={`text-sm md:text-base font-black tracking-tight uppercase ${currentLiveUser ? "text-red-700 animate-pulse-fast" : "text-gray-400"}`}>
                {currentLiveUser ? "LIVE EMERGENCY INCOMING SIGNAL DETECTED" : "INCOMING USER REQUEST PANEL"}
              </h3>
            </div>
            {currentLiveUser && (
              <span className="bg-red-600 text-white font-mono text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs">Time: {currentLiveUser.time || "Live"}</span>
            )}
          </div>

          {!currentLiveUser && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-center gap-2 text-amber-800 text-xs font-bold transition-all duration-300 animate-fade-in">
                <span><IoWarning /></span> No Active User Request Found (System Control Inboxes Locked)
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm transition-all duration-300 ${!currentLiveUser ? "opacity-50 pointer-events-none select-none" : "opacity-100"}`}>
            <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Patient Name</span>
              <p className="font-extrabold text-gray-900 mt-0.5">{currentLiveUser ? currentLiveUser.name : "—"}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Mobile Number</span>
              <p className="font-extrabold text-gray-900 mt-0.5">{currentLiveUser ? currentLiveUser.phone : "—"}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Emergency Type Log</span>
              <p className={`font-extrabold mt-0.5 ${currentLiveUser ? "text-red-600" : "text-gray-400"}`}>{currentLiveUser ? (currentLiveUser.emergencyType || "Emergency Alert") : "—"}</p>
            </div>
          </div>

          <div className={`bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border shadow-inner space-y-2 transition-all duration-300 ${currentLiveUser ? "border-red-200" : "border-gray-200 opacity-50 pointer-events-none select-none"}`}>
            <span className={`font-bold uppercase tracking-wider text-[10px] block ${currentLiveUser ? "text-red-500" : "text-gray-400"}`}>
              Realtime Synchronized GPS Location Address:
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-0.5">
              <p className="font-bold text-gray-800 break-words flex-1 text-xs md:text-sm">
                {currentLiveUser ? (currentLiveUser.location || "Location Coordinates Synced") : "Waiting for Transmission Signal..."}
              </p>
              <button disabled={!currentLiveUser} onClick={handleLocationSearchFilter} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-black text-[11px] uppercase px-4 py-2 rounded-lg transition-all duration-150 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transform active:scale-95 cursor-pointer">
                Search Nearest Ambulance
              </button>
            </div>
          </div>

          <div className={`pt-2 flex flex-col sm:flex-row gap-3 transition-all duration-300 ${!currentLiveUser ? "opacity-40 pointer-events-none select-none" : "opacity-100"}`}>
            <a href={currentLiveUser ? `tel:${formatPhoneNumber(currentLiveUser.phone)}` : "#"} onClick={stopAlertTone} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs md:text-sm py-3 rounded-xl shadow-md tracking-wider transition duration-200 transform active:scale-95 text-center cursor-pointer">
              <IoCall className="text-lg" /> CALL USER NOW {currentLiveUser ? `(${currentLiveUser.name})` : ""}
            </a>
            <button disabled={!currentLiveUser} onClick={() => setCurrentLiveUser(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs px-5 py-3 rounded-xl transition duration-200 transform active:scale-95 cursor-pointer">
              Dismiss Request
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "live", label: "LIVE CONTROL" },
            { id: "ambLogs", label: "BOOKINGS LOG" },
            { id: "patientLogs", label: "USER HISTORY" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 font-bold text-xs md:text-xs transition-all duration-300 relative cursor-pointer ${
                activeTab === tab.id ? "border-b-2 border-red-600 text-red-600 scale-105" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: LIVE CONTROL */}
        {activeTab === "live" && (
          <div className="space-y-4 transition-all duration-300 animate-fade-in">
            {!isLocationFiltered ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <IoLocate className="text-4xl text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-400">No Ambulances Loaded</h3>
                <p className="text-xs text-gray-300 mt-1">Click "Search Nearest Ambulance" above to find nearby ambulances</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-sm md:text-base font-extrabold text-gray-950 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                    Nearby Ambulances Found
                  </h2>
                  <button onClick={() => setIsLocationFiltered(false)} className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer">Clear Results</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
                  {displayedAmbulances.map((amb) => {
                    const imgIndex = imgIndexes[amb.id] || 0;
                    const isDispatched = dispatchedAmbulanceIds.includes(amb.id);

                    return (
                      <div key={amb.id} className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative ${isLocationFiltered ? "border-green-300 ring-2 ring-green-50/50" : "border-gray-200"}`}>

                        <button onClick={() => setDeleteTargetId(amb.id)} className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-red-600 text-white text-[10px] md:text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center transition-all duration-150 backdrop-blur-sm shadow-sm cursor-pointer" title="Remove Ambulance from Pool">
                          <RiDeleteBin6Line />
                        </button>

                        <div className="h-36 md:h-44 w-full bg-gray-100 relative overflow-hidden shrink-0">
                          <img src={amb.images[imgIndex]} alt="Ambulance" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" />
                        </div>
                        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] md:text-[10px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded-sm text-gray-600 break-all">{amb.type}</span>
                                <h3 className="text-sm md:text-base font-bold text-gray-950 mt-1">{amb.driver}</h3>
                              </div>
                              <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap transition-all duration-300 ${isDispatched ? "bg-blue-50 text-blue-700 animate-pulse" : amb.status === "Available" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                                ● {isDispatched ? "Dispatched" : amb.status}
                              </span>
                            </div>
                            <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                              <p className="flex items-center gap-1.5"><MdPhone className="text-gray-400 shrink-0" /> <strong>Phone:</strong> {amb.phone}</p>
                              <p className="flex items-center gap-1.5"><FaLocationDot className="text-gray-400 shrink-0" /> <strong>Distance:</strong> <span className={isLocationFiltered ? "text-green-600 font-extrabold" : ""}>{amb.distance}</span></p>
                            </div>
                          </div>

                          <div className="pt-1">
                            {isDispatched ? (
                              <a href={`tel:${formatPhoneNumber(amb.phone)}`} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all transform active:scale-95 duration-150 text-center animate-scale-up cursor-pointer">
                                <IoCall /> CALL DRIVER
                              </a>
                            ) : (
                              <>
                                <button onClick={() => setOpenFormId(openFormId === amb.id ? null : amb.id)} className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 transform active:scale-95 cursor-pointer ${openFormId === amb.id ? "bg-red-600 hover:bg-red-700 shadow-sm" : "bg-green-700 hover:bg-green-800"}`}>
                                  {openFormId === amb.id ? "Cancel / Close" : "Assign & Send"}
                                </button>
                                {openFormId === amb.id && (
                                  <div className="mt-3 p-3 md:p-4 border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl space-y-3 transition-all duration-300 origin-top animate-slide-down shadow-inner">
                                    <input type="text" placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-2 bg-white border rounded-md text-xs md:text-sm focus:ring-1 focus:ring-red-500 focus:outline-none transition-all" />
                                    <input type="text" placeholder="Phone Number" value={patientPhone} maxLength={10} onChange={(e) => setPatientPhone(e.target.value)} className="w-full p-2 bg-white border rounded-md text-xs md:text-sm focus:ring-1 focus:ring-red-500 focus:outline-none transition-all" />
                                    <input type="text" placeholder="Emergency Type" value={patientEmergency} onChange={(e) => setPatientEmergency(e.target.value)} className="w-full p-2 bg-white border rounded-md text-xs md:text-sm focus:ring-1 focus:ring-red-500 focus:outline-none transition-all" />
                                    <button onClick={() => sendAmbulanceRequest(amb.id)} className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md font-bold text-xs transition-all transform active:scale-95 cursor-pointer">Confirm & Dispatch</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: BOOKINGS LOG */}
        {activeTab === "ambLogs" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 space-y-4 transition-all duration-300 animate-fade-in shadow-sm">
            <div className="border-b pb-2"><h3 className="text-base md:text-lg font-black text-gray-950">Ambulance Bookings Log</h3></div>
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <MdDirectionsCar className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-xs md:text-sm text-gray-400">No bookings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse text-xs md:text-sm min-w-max">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Driver</th>
                      <th className="p-2.5">Patient Details</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Live Status</th>
                      <th className="p-2.5">Track Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentRequests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 animate-scale-up">
                        <td className="p-2.5 font-bold text-gray-700">{req.id}</td>
                        <td className="p-2.5 font-black text-red-600">{req.driverName}</td>
                        <td className="p-2.5 font-medium">{req.patientName} ({req.patientPhone})</td>
                        <td className="p-2.5 text-gray-500">{req.time}</td>
                        <td className="p-2.5">
                          <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold ${req.status === "Trip Completed!" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700 animate-pulse"}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <button onClick={() => setTrackingData(req)} className="bg-gray-800 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer">
                            <FaLocationDot /> Track Route
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER HISTORY */}
        {activeTab === "patientLogs" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 space-y-4 transition-all duration-300 animate-fade-in shadow-sm">
            <div className="border-b pb-2"><h3 className="text-base md:text-lg font-black text-gray-950">User Requests History</h3></div>
            {incomingRequestsHistory.length === 0 ? (
              <div className="text-center py-8">
                <MdPerson className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-xs md:text-sm text-gray-400">No panic alerts received.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequestsHistory.map((req) => (
                  <div key={req.id} className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center bg-gradient-to-r from-red-50/50 to-orange-50/50 p-3 md:p-4 rounded-xl border border-red-100 transition-all duration-300 hover:bg-red-50 shadow-sm hover:shadow-md animate-scale-up">
                    <div className="space-y-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-sm">{req.id}</span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold">{req.time}</span>
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-800 break-all">{req.name} ({req.phone}) <br />{req.location}</p>
                    </div>
                    <span className="bg-amber-500 text-white font-bold text-[10px] md:text-xs px-2.5 py-1 rounded-md shrink-0">{req.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🗺️ TRACKING MODAL (असली लोकेशन के साथ) */}
        {trackingData && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-slate-800 max-w-lg w-full p-6 space-y-4 transform transition-all duration-300 animate-scale-up relative">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><FaLocationDot className="text-blue-600"/> Live Tracking Route</h3>
                <button onClick={() => setTrackingData(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-gray-100 rounded-full p-1">
                  <IoCloseCircle className="text-2xl" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-blue-500 font-bold text-[10px] uppercase tracking-wider">Assigned Driver</p>
                  <p className="font-black text-gray-900 mt-1 text-sm">{trackingData.driverName}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Location Synced</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-100 shadow-sm">
                  <p className="text-green-600 font-bold text-[10px] uppercase tracking-wider">Patient Details</p>
                  <p className="font-black text-gray-900 mt-1 text-sm">{trackingData.patientName}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 break-all">{trackingData.location}</p>
                </div>
              </div>
              
              <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 relative shadow-inner">
                {/* 📍 असली लोकेशन मैप (A से B तक का रास्ता) */}
                <iframe
                  title="Live Route"
                  src={`https://maps.google.com/maps?saddr=${trackingData.ambLat},${trackingData.ambLng}&daddr=${trackingData.userLat},${trackingData.userLng}&output=embed`}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes pulseFast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-fast { animation: pulseFast 1s ease-in-out infinite; }
      `}</style>

    </div>
  );
}