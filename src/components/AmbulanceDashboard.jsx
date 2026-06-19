import React, { useState, useEffect } from 'react';
import { IoCall } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { ArrowLeft, User, Mail, Phone, X, Edit, LogOut } from 'lucide-react'; 
import Logo from '../assets/logo.png';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// 👇 1. Socket.io Client
import { io } from 'socket.io-client';

// 👇 2. बैकएंड से कनेक्ट
const socket = io("https://quickambu-backend-1.onrender.com");

export default function AmbulanceDashboard() {
  const CHARGE_PER_BOOKING = 29;
  const navigate = useNavigate();

  // --- App States ---
  const [driverData, setDriverData] = useState(null); 
  
  const [hasRequest, setHasRequest] = useState(false);
  const [requestData, setRequestData] = useState(null); 
  
  const [isAccepted, setIsAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'alert', onConfirm: () => {} });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });

  const [bookingsHistory, setBookingsHistory] = useState([]);

  // --- 🔄 बैकएंड से प्रोफाइल लाना ---
  const fetchDriverProfile = async () => {
    const token = localStorage.getItem("driverToken");
    if (!token) {
      navigate("/DriverLogin"); 
      return;
    }
    try {
      const response = await axios.get("https://quickambu-backend-1.onrender.com/api/driver/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDriverData(response.data.data); 
      }
    } catch (error) {
      console.error("Dashboard profile fetch error:", error);
      navigate("/DriverLogin");
    }
  };

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  // ➔ 4. 🚨 SOCKET.IO LISTENER (एडमिन के 'incoming-duty' को सुनेगा)
  useEffect(() => {
    if (!driverData) return;

    const handleIncomingDuty = (data) => {
      // 🚨 TARGET LOCK: क्या ये राइड मेरी ID या मेरे नाम के लिए है?
      if (data.driverId === driverData._id || data.driverName === driverData.name) {
        setRequestData({
          reqId: data.reqId, // 🚀 एडमिन से आई हुई रिक्वेस्ट ID सेव की
          name: data.patientName,
          phone: data.patientMobile,
          emergency: data.emergency || "Emergency Assigned by Admin", 
          location: data.location || "Live GPS Location",
          coords: data.coords 
        });
        
        setHasRequest(true); 
        setIsAccepted(false); 
        setCurrentStep(0);

        triggerModal(
          "🚨 NEW EMERGENCY ASSIGNED!",
          `Admin has dispatched you for a patient named ${data.patientName}. Please ACCEPT to view exact location and contact details!`,
          "alert",
          () => {}
        );
      }
    };

    socket.on("incoming-duty", handleIncomingDuty);
    return () => socket.off("incoming-duty", handleIncomingDuty);
  }, [driverData]); 

  // 👇 🔥 5. MASTER TRICK: LocalStorage Fallback 👇
  useEffect(() => {
    const checkOfflineRide = () => {
      const savedRide = localStorage.getItem("newEmergencyRide");
      if (savedRide && driverData) {
        const data = JSON.parse(savedRide);
        
        if (data.driverId === driverData._id || data.driverName === driverData.name) {
          setRequestData({
            reqId: data.reqId, // 🚀 यहाँ भी ID सेव की
            name: data.patientName,
            phone: data.patientMobile,
            emergency: data.emergency || "Emergency Assigned by Admin", 
            location: data.location || "Live GPS Location",
            coords: data.coords
          });
          
          setHasRequest(true);
          setIsAccepted(false);
          setCurrentStep(0);
          localStorage.removeItem("newEmergencyRide");

          triggerModal(
            "🚨 NEW EMERGENCY ASSIGNED!",
            `Admin has dispatched you for a patient named ${data.patientName}. Please accept immediately!`,
            "alert",
            () => {}
          );
        }
      }
    };

    checkOfflineRide();
    window.addEventListener("storage", checkOfflineRide);
    return () => window.removeEventListener("storage", checkOfflineRide);
  }, [driverData]); 

  // 🚀 6. LIVE GPS TRACKING (सीधा एडमिन और यूज़र को लोकेशन भेजना)
  useEffect(() => {
    let watchId;

    // अगर रिक्वेस्ट एक्सेप्ट हो चुकी है और अभी पूरी नहीं हुई है (Step 6 से कम)
    if (isAccepted && requestData && requestData.reqId && currentStep < 6) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            // हर बार लोकेशन बदलते ही एडमिन को बैकएंड के ज़रिए भेजो
            socket.emit("driver-location-update", {
              reqId: requestData.reqId,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("GPS Tracking Error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000, 
            timeout: 10000 
          }
        );
      }
    }

    // जब राइड ख़त्म हो जाए, तो GPS Tracking बंद कर दो
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isAccepted, requestData, currentStep]);


  const handleEditClick = () => {
    setEditForm({ name: driverData.name, email: driverData.email, mobile: driverData.mobile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("driverToken");
    try {
      const response = await axios.put("https://quickambu-backend-1.onrender.com/api/driver/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        triggerModal("✅ Success", response.data.message, "alert"); 
        setIsEditing(false);
        fetchDriverProfile(); 
      }
    } catch (error) {
      triggerModal("⚠️ Error", "प्रोफाइल अपडेट फेल हो गई!", "alert"); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    navigate("/DriverLogin");
  };

  const totalBookings = bookingsHistory.length;
  const totalAmount = totalBookings * CHARGE_PER_BOOKING;

  const triggerModal = (title, message, type, onConfirmAction) => {
    setModalConfig({ title, message, type, onConfirm: onConfirmAction });
    setShowModal(true);
  };

  // 🚀 ACCEPT करते ही एडमिन/यूज़र को सिग्नल भेजें
  const handleAccept = () => {
    setIsAccepted(true);
    setCurrentStep(1); 
    if (requestData && requestData.reqId) {
      socket.emit("update-journey-status", { reqId: requestData.reqId, step: 1 });
    }
  };

  const handleReject = () => {
    triggerModal(
      "⚠️ Warning!",
      "क्या आप वाकई इस आपातकालीन अनुरोध (Emergency Request) को अस्वीकार (Reject) करना चाहते हैं?",
      "confirm",
      () => {
        setHasRequest(false);
        setIsAccepted(false);
        setCurrentStep(0);
        setRequestData(null);
      }
    );
  };

  // ➔ 🚀 गूगल मैप्स नेविगेशन (यहाँ $$ को $ कर दिया गया है)
  const handleLocationClick = () => {
    if(requestData && requestData.coords && requestData.coords[0] !== null) {
      // यहाँ $${} को हटाकर ${} कर दिया गया है 
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${requestData.coords[0]},${requestData.coords[1]}`, '_blank');
    } else if (requestData && requestData.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(requestData.location)}`, '_blank');
    } else {
      triggerModal("⚠️ Location Error", "मरीज़ की लोकेशन उपलब्ध नहीं है!", "alert"); 
    }
  };

  // 🚀 जर्नी के हर बटन (स्टेप) पर एडमिन और यूज़र को लाइव अपडेट भेजना
  const handleStepClick = (stepNumber) => {
    if (stepNumber === currentStep) {
      if (stepNumber < 6) {
        const nextStep = stepNumber + 1;
        setCurrentStep(nextStep);
        
        // लाइव ट्रैकिंग सिग्नल भेजो
        if (requestData && requestData.reqId) {
          socket.emit("update-journey-status", { reqId: requestData.reqId, step: nextStep });
        }
        
      } else if (stepNumber === 6) {
        
        // ट्रिप पूरी होने का सिग्नल (Step 7)
        if (requestData && requestData.reqId) {
          socket.emit("update-journey-status", { reqId: requestData.reqId, step: 7 });
        }

        const newTrip = {
          id: Date.now(),
          name: requestData.name,
          location: requestData.location || "Live GPS Tracking",
          charge: CHARGE_PER_BOOKING,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setBookingsHistory(prev => [...prev, newTrip]);
        setHasRequest(false);
        setIsAccepted(false);
        setCurrentStep(0);
        setRequestData(null); 
        
        triggerModal(
          "🎉 Trip Completed!",
          "Trip successfully complete ho gayi hai! Card niche history me add kar diya gaya hai aur ₹29 total amount me jud gaye hain.",
          "alert",
          () => {}
        );
      }
    }
  };

  const handlePayment = () => {
    triggerModal(
      "💳 Payment Gateway",
      `Secure UPI/Razorpay Gateway open ho raha hai. Total Amount to Pay: ₹${totalAmount}`,
      "alert",
      () => {}
    );
  };

  const journeySteps = [
    { id: 1, label: "1. Start Ambulance", icon: "fa-key" },
    { id: 2, label: "2. On The Way", icon: "fa-road" },
    { id: 3, label: "3. Reached Patient", icon: "fa-house-medical-flag" },
    { id: 4, label: "4. Patient On Board", icon: "fa-wheelchair" },
    { id: 5, label: "5. Reached Hospital", icon: "fa-hospital" },
    { id: 6, label: "6. Trip Completed", icon: "fa-circle-check" },
  ];

  if (!driverData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold text-gray-500">Loading Ambulance Dashboard...</div>;
  }

  const profileImageSrc = driverData.profilePhoto 
    ? `https://quickambu-backend-1.onrender.com/${driverData.profilePhoto}` 
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className=" min-h-screen text-gray-800 antialiased font-sans relative bg-slate-50">
      
      {/* ================= CUSTOM CENTER MODAL SCREEN ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center transform transition-all scale-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner ${modalConfig.title.includes('EMERGENCY') ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-600'}`}>
              <i className={modalConfig.type === 'confirm' ? "fa-solid fa-circle-question" : "fa-solid fa-bell text-3xl"}></i>
            </div>
            <h3 className={`text-xl font-black mb-2 ${modalConfig.title.includes('EMERGENCY') ? 'text-red-600' : 'text-gray-900'}`}>{modalConfig.title}</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">{modalConfig.message}</p>
            <div className="flex justify-center space-x-3">
              {modalConfig.type === 'confirm' && (
                <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer w-full">
                  Cancel
                </button>
              )}
              <button onClick={() => { modalConfig.onConfirm(); setShowModal(false); }} className={`px-6 py-3 font-bold rounded-xl text-sm shadow-md cursor-pointer w-full text-white transition-colors ${modalConfig.title.includes('EMERGENCY') ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                OK, I Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INLINE HEADER ================= */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <button className="text-gray-600 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-1.5">
              <Link to="/"><img src={Logo} alt="logo" className="w-15"/></Link>
              <div className="flex flex-col leading-none">
                <span className="text-red-600 font-extrabold text-lg tracking-wide">QuickAmbu</span>
                <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Driver Panel</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-2xl border border-transparent transition-all cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-800 leading-tight">{driverData.name}</p>
                <p className="text-[10px] text-green-600 font-bold">● Waiting for ride</p>
              </div>
              <img src={profileImageSrc} alt="Profile" className="w-10 h-10 rounded-xl object-cover ring-2 ring-red-500/20" />
            </div>

            {showProfileDropdown && (
              <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-[100]">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                  <img src={profileImageSrc} alt="Profile" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{driverData.name}</h3>
                    <p className="text-xs text-gray-400">{driverData.mobile}</p>
                  </div>
                </div>
                <button onClick={() => { setShowProfileModal(true); setShowProfileDropdown(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer mb-2 flex items-center justify-center gap-2">
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button onClick={handleLogout} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= PROFILE MODAL ================= */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 relative">
            <div className="bg-gradient-to-b from-gray-900 to-slate-800 p-6 text-white relative">
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              <div className="flex flex-col items-center mt-2">
                <img src={profileImageSrc} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg mb-3" />
                <h2 className="text-xl font-black">{driverData.name}</h2>
                <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Verified Driver</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!isEditing ? (
                <>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Full Name</p><p className="text-sm font-bold text-gray-800">{driverData.name}</p></div>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number</p><p className="text-sm font-bold text-gray-800">{driverData.mobile}</p></div>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p><p className="text-sm font-bold text-gray-800">{driverData.email}</p></div>
                  </div>
                  <button onClick={handleEditClick} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Full Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white border border-gray-300 text-sm font-semibold p-2.5 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Mobile Number</label>
                    <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({...editForm, mobile: e.target.value})} className="w-full bg-white border border-gray-300 text-sm font-semibold p-2.5 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Email Address</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white border border-gray-300 text-sm font-semibold p-2.5 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleSaveProfile} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* SECTION 1: REQUEST CARD */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Emergency Request</h2>
          
          {hasRequest && requestData ? (
            <div className="bg-white border-2 border-red-500 rounded-2xl shadow-xl overflow-hidden relative animate-[pulse_2s_infinite]">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 inline-flex items-center uppercase tracking-wide">
                    ⚠️ Emergency: <span className="ml-1 font-black">{requestData.emergency}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Patient Name</p>
                    <p className="text-base font-bold text-gray-800">{requestData.name}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                      {isAccepted ? (
                        <p className="text-base font-bold text-gray-800">{requestData.phone}</p>
                      ) : (
                        <p className="text-sm font-semibold text-amber-600 italic">🔒 Hidden until accepted</p>
                      )}
                    </div>
                    {isAccepted && (
                      <a href={`tel:${requestData.phone}`} className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-lg transition-transform hover:scale-110">
                        <IoCall/>
                      </a>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center md:col-span-2">
                    <div className="flex-1 pr-2 truncate">
                      <p className="text-xs text-gray-400 font-medium">Pickup Location</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 break-words whitespace-normal">{requestData.location}</p>
                    </div>
                    {isAccepted && (
                      <button onClick={handleLocationClick} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all hover:scale-110 shrink-0 cursor-pointer">
                        <FaLocationDot className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>

                {!isAccepted ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-colors border flex items-center justify-center gap-2 cursor-pointer uppercase text-sm">
                      Accept Request
                    </button>
                    <button onClick={handleReject} className="w-full hover:bg-red-50 text-red-600 font-extrabold py-3.5 px-3 rounded-xl border-red-200 border-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-sm">
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-600 text-white p-3.5 rounded-xl text-center font-bold text-sm shadow-md">
                    ✓ Request Accepted & Journey Active
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center justify-center shadow-sm">
              <span className="relative flex h-6 w-6 mb-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-green-500"></span>
              </span>
              <p className="font-bold text-lg text-slate-600">Online & Ready</p>
              <p className="font-medium text-sm mt-1">Waiting for Admin to dispatch emergency requests...</p>
            </div>
          )}
        </section>

        {/* SECTION 2: AMBULANCE JOURNEY CONTROLS */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ambulance Journey Flow</h2>
          
          {!isAccepted ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl mb-4 text-xs font-medium">
              🔒 Please ACCEPT a request above to unlock the journey sequence buttons.
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl mb-4 text-xs font-medium">
              🔓 Control sequence unlocked. Progress step-by-step.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {journeySteps.map((step) => {
              const isActive = isAccepted && step.id === currentStep;
              const isCompleted = isAccepted && step.id < currentStep;
              
              let btnClass = "w-full font-bold py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-200 ";
              if (isActive) {
                btnClass += "bg-red-600 border-red-600 text-white shadow-md hover:bg-red-700 scale-[1.01] cursor-pointer";
              } else if (isCompleted) {
                btnClass += "bg-green-50 border-green-200 text-green-600 cursor-not-allowed opacity-80";
              } else {
                btnClass += "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed";
              }

              return (
                <button key={step.id} disabled={!isActive} onClick={() => handleStepClick(step.id)} className={btnClass}>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: EARNINGS & TOTAL BOOKING HISTORY */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Earnings & Wallet Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Bookings</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{totalBookings}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Charge</p>
                <p className="text-2xl font-black text-gray-900 mt-1">₹29</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Net Payable</p>
                <p className="text-2xl font-black text-green-600 mt-1">₹{totalAmount}</p>
              </div>
            </div>
            <button onClick={handlePayment} className="w-full bg-gradient-to-b from-green-600 to-green-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-sm cursor-pointer hover:shadow-lg transition-shadow">
              Pay Outstanding Balance
            </button>
          </div>

          {/* DYNAMIC BOOKING HISTORY CARDS */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Booking History Details</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {bookingsHistory.slice().reverse().map((booking) => (
                <div key={booking.id} className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex justify-between items-center shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex-1 pr-3 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-800">{booking.name}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded">{booking.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{booking.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                      +₹{booking.charge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}