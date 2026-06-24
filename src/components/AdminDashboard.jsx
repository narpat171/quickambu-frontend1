import React, { useState, useEffect, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoWarning, IoCheckmark, IoClose, IoLocate, IoCloseCircle, IoCall, IoVolumeMute } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { MdDirectionsCar, MdPerson, MdPhone } from "react-icons/md";
import { LogOut, Sun, Moon, Radar, CheckCircle2, Navigation } from 'lucide-react'; 
import Logo from '../assets/logo.png'; 
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

// 🚀 Socket.io Import
import io from 'socket.io-client';
const socket = io("https://quickambu-backend-1.onrender.com");

const initialAmbulances = [];

// 🌍 HAVERSINE FORMULA
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // 🌓 Dark Mode State
  const [isDark, setIsDark] = useState(() => localStorage.getItem("adminTheme") === "dark");

  useEffect(() => {
    localStorage.setItem("adminTheme", isDark ? "dark" : "light");
  }, [isDark]);

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

  useEffect(() => {
    localStorage.setItem("quickambu_sent_requests", JSON.stringify(sentRequests));
  }, [sentRequests]);

  useEffect(() => {
    localStorage.setItem("quickambu_incoming_history", JSON.stringify(incomingRequestsHistory));
  }, [incomingRequestsHistory]);

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
    const isAuth = localStorage.getItem("adminAuth");
    if (isAuth !== "true") {
      navigate("/AdminLogin");
    }

    localStorage.removeItem("quickambu_dispatched_ambs");

    const rajasthanCoords = [
      [28.2900, 74.9700], [28.6700, 75.0300], [26.9124, 75.7873], [28.0200, 73.3100], [27.6000, 75.1500]  
    ];

    const fetchAllDrivers = async () => {
      try {
        const response = await axios.get("https://quickambu-backend-1.onrender.com/api/driver/all");
        if (response.data.success && response.data.data.length > 0) {
          setAmbulances(response.data.data.map((d, index) => ({ 
            id: d._id, 
            driver: d.name, 
            phone: d.mobile,
            vehicleNumber: `RJ 18 PA ${1000 + index}`, // 👈 Mock Vehicle Number Added!
            type: "ALS (ICU)",
            status: "Available",
            kmValue: 99999,
            distance: "Distance Pending",
            coords: rajasthanCoords[index % rajasthanCoords.length], 
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

  useEffect(() => {
    const checkMissedRequests = () => {
      const missedReq = localStorage.getItem("global_pending_request");
      if (missedReq && !currentLiveUser) {
        const parsedReq = JSON.parse(missedReq);
        setCurrentLiveUser({
          id: parsedReq.id,
          name: parsedReq.name,
          phone: parsedReq.mobile,
          location: parsedReq.location || "Location Coordinates Synced",
          emergencyType: parsedReq.emergency,
          time: parsedReq.time,
          coords: parsedReq.coords 
        });
      }
    };

    checkMissedRequests();
    window.addEventListener("storage", checkMissedRequests);
    return () => window.removeEventListener("storage", checkMissedRequests);
  }, []);

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
        coords: newReq.coords 
      });
      localStorage.setItem("global_pending_request", JSON.stringify(newReq));
      setIsLocationFiltered(false); // Reset ambulance visibility on new request
    });

    socket.on("journey-status-updated", (data) => {
      const statusLabel = getJourneyLabel(data.step);
      setSentRequests(prev => prev.map(req => req.id === data.reqId ? { ...req, status: statusLabel } : req));
      setIncomingRequestsHistory(prev => prev.map(req => req.id === data.reqId ? { ...req, status: statusLabel } : req));
    });

    socket.on("driver-location-update", (data) => {
      setSentRequests(prev => prev.map(req => {
        if (req.id === data.reqId) {
          const newLiveDistance = calculateDistance(req.userLat, req.userLng, data.lat, data.lng).toFixed(1);
          return { ...req, ambLat: data.lat, ambLng: data.lng, distanceKm: `${newLiveDistance} km` }; 
        }
        return req;
      }));
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
    if (step === -1) return "Rejected by Driver";
    const labels = ["Dispatched", "Ambulance Started", "On The Way", "Reached Patient", "Patient On Board", "Reached Hospital", "Completed!", "Completed!"];
    return labels[step] || "Completed!";
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

  const dismissRequest = () => {
    localStorage.removeItem("global_pending_request");
    setCurrentLiveUser(null);
    setIsLocationFiltered(false); // Hide ambulances again
    stopAlertTone();
  };

  const handleLocationSearchFilter = () => {
    if (!currentLiveUser || !currentLiveUser.coords) {
      setCustomNotification({ show: true, title: "Location Error", message: "मरीज़ की लोकेशन नहीं मिल पा रही है!", type: "error" });
      return;
    }

    const userLat = currentLiveUser.coords[0];
    const userLng = currentLiveUser.coords[1];

    setAmbulances(prev => prev.map(amb => {
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
    setIsLocationFiltered(true); // 👈 This makes ambulances visible
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
    localStorage.setItem("newEmergencyRide", JSON.stringify(dispatchData));
    
    const newDispatch = {
      id: generatedReqId,
      ambId: ambId,
      vehicleNumber: amb.vehicleNumber, // 👈 Gaadi Number Saved
      patientName: patientName,
      patientPhone: patientPhone,
      emergencyType: patientEmergency,
      location: userLocation,
      time: new Date().toLocaleTimeString(),
      status: "Dispatched",
      userLat: userLat, 
      userLng: userLng, 
      ambLat: ambulanceStartLat, 
      ambLng: ambulanceStartLng,
      distanceKm: amb.distance,
      driverName: amb.driver,
      driverPhone: amb.phone
    };

    setSentRequests([newDispatch, ...sentRequests]);
    setIncomingRequestsHistory(prev => prev.map(req => req.id === generatedReqId || req.id === currentLiveUser?.id ? { ...req, status: "Dispatched" } : req));
    
    localStorage.removeItem("global_pending_request");
    setCustomNotification({ show: true, title: "Request Sent!", message: `Ambulance ${amb.driver} dispatched.`, type: "success" });
    setOpenFormId(null);
    setCurrentLiveUser(null);
  };

  const formatPhoneNumber = (phone) => phone ? phone.replace(/[^0-9+]/g, '') : "";

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
        
        {/* ================= HEADER ================= */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 h-20 flex items-center px-6 md:px-10 justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
              <Link to="/"><img src={Logo} alt="QuickAmbu" className="w-12 h-12 object-contain relative drop-shadow-xl"/></Link>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-1 dark:text-white">Quick<span className="text-red-500">Ambu</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Master Control Room</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex flex-col text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Status</p>
              <p className="text-sm font-bold text-emerald-500">Online & Secure</p>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-slate-700 hidden md:block"></div>
            
            {/* 🌓 Dark Mode Toggle Button */}
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button onClick={() => { localStorage.removeItem("adminAuth"); navigate("/"); }} className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Exit Control</span>
            </button>
          </div>
        </header>

        {/* Modals */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-sm w-full p-6 space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto"><IoWarning /></div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Remove Vehicle</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Master Passkey required to delete <strong>{deleteTargetId}</strong>.</p>
              </div>
              <div className="space-y-3">
                <input type="password" placeholder="Master Key" value={enteredMasterKey} onChange={(e) => setEnteredMasterKey(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-center tracking-widest font-mono outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all"/>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setDeleteTargetId(null); setEnteredMasterKey(""); }} className="flex-1 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 rounded-xl transition cursor-pointer">Cancel</button>
                  <button onClick={handleConfirmDeleteAmbulance} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition cursor-pointer">Remove</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {customNotification.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border dark:border-slate-800">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto ${customNotification.type === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                {customNotification.type === "success" ? <IoCheckmark /> : <IoClose />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{customNotification.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{customNotification.message}</p>
              </div>
              <button onClick={() => setCustomNotification({ ...customNotification, show: false })} className={`w-full text-white text-sm font-bold py-3 rounded-xl cursor-pointer ${customNotification.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>Close</button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

          {/* ================= LIVE EMERGENCY PANEL ================= */}
          <div className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 md:p-8 shadow-lg space-y-5 transition-all duration-500 relative overflow-hidden ${currentLiveUser ? "border-red-500 shadow-red-500/20" : "border-gray-200 dark:border-slate-800"}`}>
            {currentLiveUser && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-700 animate-pulse"></div>}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-800 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full ${currentLiveUser ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse" : "bg-gray-300 dark:bg-slate-700"}`}></span>
                <h3 className={`text-base md:text-lg font-black tracking-wide uppercase ${currentLiveUser ? "text-red-600 dark:text-red-500" : "text-gray-400 dark:text-slate-500"}`}>
                  {currentLiveUser ? "LIVE EMERGENCY SIGNAL DETECTED" : "RADAR STANDBY MODE"}
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                {currentLiveUser && (
                  <button onClick={stopAlertTone} className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer">
                    <IoVolumeMute className="text-lg" /> Stop Siren
                  </button>
                )}
                {currentLiveUser && (
                  <span className="bg-red-600 text-white font-mono text-[10px] md:text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">Time: {currentLiveUser.time || "Live"}</span>
                )}
              </div>
            </div>

            {!currentLiveUser ? (
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
                <Radar className="w-12 h-12 text-gray-300 dark:text-slate-600 animate-spin-slow" />
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-bold">No Active Emergency Requests</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Waiting for transmission from user devices...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <span className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Patient Name</span>
                    <p className="font-extrabold text-gray-900 dark:text-white mt-1 text-base">{currentLiveUser.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <span className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Mobile Number</span>
                    <p className="font-extrabold text-gray-900 dark:text-white mt-1 text-base">{currentLiveUser.phone}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <span className="text-red-400 dark:text-red-500 font-bold uppercase tracking-wider text-[10px]">Emergency Type</span>
                    <p className="font-extrabold text-red-700 dark:text-red-400 mt-1 text-base">{currentLiveUser.emergencyType || "Emergency Alert"}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Navigation className="w-3 h-3"/> GPS Location Sync
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <p className="font-bold text-gray-800 dark:text-slate-200 break-words flex-1 text-sm md:text-base leading-snug">
                      {currentLiveUser.location || "Coordinates Synced"}
                    </p>
                    <button onClick={handleLocationSearchFilter} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                      <FaLocationDot /> Search Ambulance
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a href={`tel:${formatPhoneNumber(currentLiveUser.phone)}`} onClick={stopAlertTone} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                    <IoCall className="text-lg" /> Call Patient
                  </a>
                  <button onClick={dismissRequest} className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                    Dismiss
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ================= TABS ================= */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth whitespace-nowrap">
            {[
              { id: "live", label: "LIVE FLEET CONTROL" },
              { id: "ambLogs", label: "BOOKING HISTORY" },
              { id: "patientLogs", label: "USER ALERTS" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 font-extrabold text-xs tracking-wider uppercase transition-all relative cursor-pointer ${
                  activeTab === tab.id ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ================= TAB 1: LIVE CONTROL ================= */}
          {activeTab === "live" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  Active Fleet Status
                </h2>
                {isLocationFiltered && <button onClick={() => setIsLocationFiltered(false)} className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white underline cursor-pointer">Clear Search</button>}
              </div>

              {/* 🕵️ HIDDEN AMBULANCE LOGIC */}
              {!isLocationFiltered ? (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-indigo-100 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-4xl">
                    <MdDirectionsCar />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-indigo-950 dark:text-white">Ambulances Hidden</h3>
                    <p className="text-sm font-medium text-indigo-600/70 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                      Click the "Search Ambulance" button on an active emergency request to reveal nearby available vehicles.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedAmbulances.map((amb) => {
                    const imgIndex = imgIndexes[amb.id] || 0;
                    const lastReqForAmb = sentRequests.find(req => req.ambId === amb.id);
                    const isDispatched = lastReqForAmb 
                       ? !lastReqForAmb.status.includes("Completed") && 
                         !lastReqForAmb.status.includes("Reject") && 
                         !lastReqForAmb.status.includes("Cancel")
                       : false;

                    return (
                      <div key={amb.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 relative group">
                        
                        <div className="h-48 w-full bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                          <img src={amb.images[imgIndex]} alt="Ambulance" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          
                          <div className="absolute bottom-3 left-4 z-20">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-white/30 tracking-wider">
                              {amb.vehicleNumber}
                            </span>
                          </div>

                          <button onClick={() => setDeleteTargetId(amb.id)} className="absolute top-3 right-3 z-20 bg-black/40 hover:bg-red-600 backdrop-blur-md text-white p-2 rounded-full transition-all cursor-pointer">
                            <RiDeleteBin6Line className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{amb.driver}</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold mt-1">{amb.type}</p>
                              </div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border ${isDispatched ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800/50" : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50"}`}>
                                {isDispatched ? "● Busy" : "● Free"}
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 border border-gray-100 dark:border-slate-700/50">
                              <p className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                                <MdPhone className="text-blue-500" /> {amb.phone}
                              </p>
                              <p className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                                <FaLocationDot className="text-blue-500" /> Distance: <span className="text-blue-600 dark:text-blue-400 font-black">{amb.distance}</span>
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 mt-auto">
                            {isDispatched ? (
                              // 📞 ASSIGN KI JAGAH "CALL NOW"
                              <div className="flex gap-2">
                                <a href={`tel:${formatPhoneNumber(amb.phone)}`} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                                  <IoCall className="text-lg" /> Call Driver
                                </a>
                                <button onClick={() => {
                                  if(window.confirm(`Force Free ${amb.driver}'s Ambulance?`)) {
                                    setSentRequests(prev => prev.map(req => req.ambId === amb.id && !req.status.includes("Completed") ? { ...req, status: "Completed! (Admin Freed)" } : req));
                                  }
                                }} className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 border border-red-100 dark:border-red-800/50 px-4 rounded-xl font-bold text-xl transition-all cursor-pointer">
                                  <IoCloseCircle />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => setOpenFormId(openFormId === amb.id ? null : amb.id)} className={`w-full text-white text-sm font-bold py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md ${openFormId === amb.id ? "bg-gray-800 dark:bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"}`}>
                                  {openFormId === amb.id ? "Cancel Assign" : "Assign & Dispatch"}
                                </button>
                                {openFormId === amb.id && (
                                  <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-3 animate-slide-down">
                                    <input type="text" placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 dark:text-white" />
                                    <input type="text" placeholder="Contact No" value={patientPhone} maxLength={10} onChange={(e) => setPatientPhone(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 dark:text-white" />
                                    <button onClick={() => sendAmbulanceRequest(amb.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer">Confirm Dispatch</button>
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
              )}
            </div>
          )}

          {/* ================= TAB 2: BOOKINGS LOG (NEW UNIQUE CARDS) ================= */}
          {activeTab === "ambLogs" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Booking History & Tracking</h2>
              
              {sentRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-500">
                  <MdDirectionsCar className="text-5xl mx-auto mb-3 opacity-50" />
                  <p className="font-bold">No ride history found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sentRequests.map((req) => {
                    const isCompleted = req.status.includes("Completed") || req.status.includes("Reject") || req.status.includes("Cancel");

                    return (
                      <div key={req.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden">
                        {/* Status Ribbon */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        
                        <div className="pl-4">
                          <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">Ride ID: {req.id}</p>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{req.vehicleNumber || "RJ-18-AMB"}</h3>
                            </div>
                            <div className="text-right">
                              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">{req.time}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Patient</p>
                              <p className="text-sm font-black text-gray-800 dark:text-slate-200">{req.patientName}</p>
                              <a href={`tel:${req.patientPhone}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 block hover:underline">📞 {req.patientPhone}</a>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[10px] uppercase font-bold text-blue-400 dark:text-blue-500 mb-1 flex items-center gap-1"><MdDirectionsCar className="w-3 h-3"/> Ambulance</p>
                              <p className="text-sm font-black text-blue-900 dark:text-blue-300">{req.driverName}</p>
                              <a href={`tel:${req.driverPhone}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 block hover:underline">📞 {req.driverPhone}</a>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <span className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 animate-pulse'}`}>
                              Status: {req.status}
                            </span>
                            
                            {isCompleted ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" /> COMPLETED
                              </div>
                            ) : (
                              <button onClick={() => setTrackingData(req)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 transform transition-all text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer">
                                <Navigation className="w-3.5 h-3.5" /> Track Ride
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER HISTORY */}
          {activeTab === "patientLogs" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">User Request History</h3>
              {incomingRequestsHistory.length === 0 ? (
                <p className="text-center py-8 text-gray-400 dark:text-slate-500 font-bold">No history available.</p>
              ) : (
                <div className="space-y-3">
                  {incomingRequestsHistory.map((req) => (
                    <div key={req.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:border-blue-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-[9px] px-2 py-0.5 rounded uppercase">{req.id}</span>
                          <span className="text-[10px] text-gray-500 font-bold">{req.time}</span>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{req.name} ({req.phone})</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px] md:max-w-md mt-0.5">{req.location}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${req.status.includes("Completed") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 🗺️ TRACKING MODAL */}
          {trackingData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-2xl w-full p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Navigation className="text-blue-500"/> Live Tracking
                  </h3>
                  <button onClick={() => setTrackingData(null)} className="text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-slate-800 rounded-full p-1.5 transition-colors cursor-pointer">
                    <IoCloseCircle className="text-2xl" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">Ambulance Details</p>
                    <p className="font-black text-gray-900 dark:text-white">{trackingData.driverName}</p>
                    <p className="text-gray-500 dark:text-slate-400 text-[10px] mt-0.5">{trackingData.vehicleNumber || "RJ-18-AMB"}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1">Patient Details</p>
                    <p className="font-black text-gray-900 dark:text-white">{trackingData.patientName}</p>
                    <p className="text-gray-500 dark:text-slate-400 text-[10px] mt-0.5 truncate">{trackingData.location}</p>
                  </div>
                </div>
                
                <div className="w-full h-96 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner">
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
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-down { transform-origin: top; animation: slideDown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}