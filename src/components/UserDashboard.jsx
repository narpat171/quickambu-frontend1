import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Loader2, User, Mail, X, Edit, LogOut, AlertTriangle, HeartPulse, BellRing, CheckCircle2, Navigation } from 'lucide-react';
import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("https://quickambu-backend-1.onrender.com");

function UserDashboard() {
  const [isRequested, setIsRequested] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [emergencyType, setEmergencyType] = useState("Not Sure / Other");
  const [contactNumber, setContactNumber] = useState("");
  
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("Detecting Exact GPS Location...");
  const [exactAddress, setExactAddress] = useState("Locating your exact address..."); 

  const [userData, setUserData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });
  
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'alert', onConfirm: () => {} });

  // 🚀 1. SMART SELF-CLEANING STATE: अगर पुरानी ट्रिप 7 (Complete) या -1 (Reject) पर अटकी है, तो उसे तुरंत उड़ा दो!
  const [journeyStep, setJourneyStep] = useState(() => {
    const step = parseInt(localStorage.getItem("journeyStep"));
    return (step === 7 || step === -1 || isNaN(step)) ? 0 : step;
  });

  const [myReqId, setMyReqId] = useState(() => {
    const step = parseInt(localStorage.getItem("journeyStep"));
    if (step === 7 || step === -1) {
      localStorage.removeItem("myReqId");
      localStorage.removeItem("assignedDriver");
      localStorage.removeItem("journeyStep");
      return null;
    }
    return localStorage.getItem("myReqId") || null;
  }); 

  const [assignedDriver, setAssignedDriver] = useState(() => {
    const step = parseInt(localStorage.getItem("journeyStep"));
    if (step === 7 || step === -1) return null;
    const saved = localStorage.getItem("assignedDriver");
    return saved ? JSON.parse(saved) : null;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (myReqId) localStorage.setItem("myReqId", myReqId);
    else localStorage.removeItem("myReqId");

    localStorage.setItem("journeyStep", journeyStep);

    if (assignedDriver) localStorage.setItem("assignedDriver", JSON.stringify(assignedDriver));
    else localStorage.removeItem("assignedDriver");
  }, [myReqId, journeyStep, assignedDriver]);

  const triggerModal = (title, message, type = "alert", onConfirmAction = () => {}) => {
    setModalConfig({ title, message, type, onConfirm: onConfirmAction });
    setShowModal(true);
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) { navigate("/UserLogin"); return; }
    try {
      const response = await axios.get("https://quickambu-backend-1.onrender.com/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setUserData(response.data.data);
        setContactNumber(response.data.data.mobile);
        setPatientName(response.data.data.name);
      } else {
        handleLogout();
      }
    } catch (error) { 
      console.error("Backend Error: ", error); 
      setUserData({
        name: "Narpat Rathore",
        mobile: "9876543210",
        email: "narpat@example.com",
        profilePhoto: ""
      });
      setContactNumber("9876543210");
      setPatientName("Narpat Rathore");
    }
  };

  const fetchLiveLocation = () => {
    setLocationStatus("Fetching Exact Location...");
    setExactAddress("Detecting via Satellite...");
    
    if (!navigator.geolocation) {
      setLocationStatus("GPS Not Supported"); 
      setExactAddress("Please enter location manually");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if(res.data && res.data.display_name) {
             setExactAddress(res.data.display_name); 
             setLocationStatus("GPS + Address Acquired ✅");
          } else {
             setExactAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
             setLocationStatus("Live GPS Location Acquired ✅");
          }
        } catch(e) {
          setExactAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          setLocationStatus("Live GPS Location Acquired ✅");
        }
      },
      (error) => { 
        setLocationStatus("Please Turn ON Location / GPS ❌"); 
        setExactAddress("GPS Error! Cannot detect location.");
        triggerModal("Location Error", "लोकेशन नहीं मिल रही है! कृपया मोबाइल का GPS ऑन करें।", "alert");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  useEffect(() => { fetchUserProfile(); fetchLiveLocation(); }, []);

  // 🚀 2. INSTANT CLEAR ON SOCKET EVENT
  useEffect(() => {
    socket.on("journey-status-updated", (data) => {
      if (data.reqId === myReqId || data.reqId === localStorage.getItem("myReqId")) {
        
        if (data.step === 7) {
          // ट्रिप पूरी होते ही तुरंत क्लियर कर दो! कोई वेट नहीं!
          triggerModal("🎉 Trip Completed", "आप सुरक्षित रूप से पहुँच गए हैं! QuickAmbu का उपयोग करने के लिए धन्यवाद।", "alert");
          setMyReqId(null);
          setJourneyStep(0);
          setAssignedDriver(null);
        } else if (data.step === -1) {
          // अगर ड्राइवर ने रिजेक्ट किया, तो भी तुरंत क्लियर कर दो!
          triggerModal("❌ Ride Cancelled", "ड्राइवर ने किसी कारणवश रिक्वेस्ट अस्वीकार कर दी है। कृपया नई एम्बुलेंस बुक करें।", "alert");
          setMyReqId(null);
          setJourneyStep(0);
          setAssignedDriver(null);
        } else {
          setJourneyStep(data.step);
          if (data.driverName && data.driverMobile) {
            setAssignedDriver({ name: data.driverName, mobile: data.driverMobile });
          }
        }
      }
    });
    return () => socket.off("journey-status-updated");
  }, [myReqId]);

  const handleEditClick = () => {
    setEditForm({ name: userData.name, email: userData.email, mobile: userData.mobile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.put("https://quickambu-backend-1.onrender.com/api/user/profile", editForm, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        triggerModal("Success!", "प्रोफाइल सफलतापूर्वक अपडेट हो गई!", "alert");
        setIsEditing(false);
        fetchUserProfile(); 
      }
    } catch (error) { triggerModal("Error", "अपडेट फेल हो गया! कृपया दोबारा प्रयास करें।", "alert"); }
  };

  const handleLogout = () => { 
    localStorage.removeItem("userToken"); 
    localStorage.removeItem("myReqId");
    localStorage.removeItem("journeyStep");
    localStorage.removeItem("assignedDriver");
    navigate("/UserLogin"); 
  };

  const handleEmergencyRequest = () => {
    if (!patientName.trim()) return triggerModal("Warning", "कृपया मरीज़ का नाम डालें!", "alert");
    if (contactNumber.length !== 10) return triggerModal("Warning", "कृपया 10 अंकों का सही मोबाइल नंबर डालें!", "alert");
    if (!location.lat) { 
      triggerModal("Warning", "आपकी सटीक लोकेशन अभी तक नहीं मिली है। कृपया रिफ्रेश करें या GPS ऑन करें!", "alert"); 
      fetchLiveLocation(); return; 
    }
    
    setIsRequested(true);
    
    const newReqId = "REQ-" + Date.now();
    setMyReqId(newReqId); 
    setJourneyStep(0); 
    setAssignedDriver(null); 

    const emergencyDetails = {
      id: newReqId, 
      name: patientName, 
      mobile: contactNumber, 
      emergency: emergencyType,
      message: "Urgent Dispatch Requested", 
      location: exactAddress, 
      coords: [location.lat, location.lng], 
      time: new Date().toLocaleTimeString(), 
      isCritical: emergencyType === "Heart Attack" || emergencyType === "Accident"
    };

    socket.emit("new-ambulance-request", emergencyDetails);
    
    localStorage.setItem("global_pending_request", JSON.stringify(emergencyDetails));

    setTimeout(() => {
      triggerModal("🚨 Request Sent!", `आपकी रिक्वेस्ट भेज दी गई है! कृपया नीचे अपनी एम्बुलेंस ट्रैक करें।`, "alert");
      setIsRequested(false);
    }, 2000);
  };

  if (!userData) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500"><Loader2 className="w-8 h-8 animate-spin text-red-500 mr-2"/> Loading QuickAmbu...</div>;
  const profileImageSrc = userData.profilePhoto ? `https://quickambu-backend-1.onrender.com/${userData.profilePhoto}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const journeyLabels = ["Waiting for Driver to Accept", "Ambulance Started", "On The Way", "Reached Patient", "Patient On Board", "Reached Hospital", "Trip Completed!"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased relative">
      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center transform transition-all scale-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${modalConfig.title.includes('Error') || modalConfig.title.includes('Warning') || modalConfig.title.includes('🚨') ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
              {modalConfig.title.includes('Completed') || modalConfig.title.includes('Success') ? <CheckCircle2 className="w-8 h-8"/> : <BellRing className="w-8 h-8"/>}
            </div>
            <h3 className={`text-xl font-black mb-2 ${modalConfig.title.includes('Error') || modalConfig.title.includes('🚨') ? 'text-red-600' : 'text-gray-900'}`}>{modalConfig.title}</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">{modalConfig.message}</p>
            <div className="flex justify-center space-x-3">
              {modalConfig.type === 'confirm' && (
                <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl w-full">Cancel</button>
              )}
              <button onClick={() => { modalConfig.onConfirm(); setShowModal(false); }} className={`px-6 py-3 font-bold rounded-xl text-white w-full shadow-md ${modalConfig.title.includes('🚨') || modalConfig.title.includes('Error') || modalConfig.title.includes('Cancel') ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><button className="text-gray-600 hover:bg-gray-100 p-1 rounded-full"><ArrowLeft className="w-5 h-5" /></button></Link>
            <div className="flex items-center gap-1.5">
              <Link to="/"><img src={Logo} alt="logo" className="w-12"/></Link>
              <div className="flex flex-col leading-none">
                <span className="text-red-600 font-extrabold text-lg">QuickAmbu</span>
                <span className="text-gray-400 text-[9px] uppercase font-bold">Ambulance</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-2xl cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-800">{userData.name}</p>
                <p className="text-[10px] text-green-600 font-bold">● Active</p>
              </div>
              <img src={profileImageSrc} alt="Profile" className="w-10 h-10 rounded-xl object-cover ring-2 ring-red-500/20" />
            </div>

            {showProfileDropdown && (
              <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
                <button onClick={() => { setShowProfileModal(true); setShowProfileDropdown(false); }} className="w-full bg-red-600 text-white font-bold py-2 rounded-xl text-xs mb-2 flex items-center justify-center gap-2"><User className="w-4 h-4" /> My Profile</button>
                <button onClick={handleLogout} className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            <div className="bg-linear-to-b from-gray-900 to-slate-800 p-6 text-white relative">
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="flex flex-col items-center mt-2">
                <img src={profileImageSrc} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg mb-3" />
                <h2 className="text-xl font-black">{userData.name}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {!isEditing ? (
                <button onClick={handleEditClick} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Edit Profile</button>
              ) : (
                <div className="space-y-3">
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white border p-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" placeholder="Name" />
                  <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({...editForm, mobile: e.target.value})} className="w-full bg-white border p-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" placeholder="Mobile" />
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white border p-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" placeholder="Email" />
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleSaveProfile} className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl">Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        
        {/* COLUMN 1: Location & Status */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${location.lat ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                <MapPin className={`w-5 h-5 ${!location.lat && 'animate-bounce'}`} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase flex justify-between">Auto GPS Location <button onClick={fetchLiveLocation} className="text-blue-500">Refresh</button></p>
                <p className={`text-sm mt-0.5 font-bold ${location.lat ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {exactAddress}
                </p>
              </div>
            </div>
          </div>

          {/* 🚀 LIVE TRACKING UI */}
          {myReqId && (
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-500">
              
              {/* 🚀 3. MANUAL CANCEL RIDE BUTTON */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-extrabold text-emerald-700 flex items-center gap-2">
                  <Navigation className="w-5 h-5"/> Live Ambulance Status
                </h2>
                <button 
                  onClick={() => {
                    triggerModal("Cancel Ride?", "क्या आप वाकई इस रिक्वेस्ट को कैंसिल करना चाहते हैं?", "confirm", () => {
                       setMyReqId(null);
                       setJourneyStep(0);
                       setAssignedDriver(null);
                    });
                  }} 
                  className="text-[10px] font-bold bg-red-50 border border-red-100 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Cancel Ride
                </button>
              </div>
              
              {/* DRIVER CONTACT CARD */}
              {assignedDriver && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Ambulance Assigned</p>
                    <p className="text-lg font-black text-gray-900 leading-none">{assignedDriver.name || "Ambulance Driver"}</p>
                  </div>
                  
                  <a 
                    href={`tel:${assignedDriver.mobile}`} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-current" /> Call Driver
                  </a>
                </div>
              )}

              <div className="space-y-4">
                {journeyLabels.map((label, idx) => {
                   const isActive = journeyStep >= idx;
                   return (
                     <div key={idx} className={`flex items-center gap-4 font-bold text-sm transition-all duration-300 ${isActive ? 'text-emerald-600 scale-105' : 'text-gray-300'}`}>
                       <CheckCircle2 className={`w-6 h-6 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-200'}`}/>
                       {label}
                     </div>
                   );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: EMERGENCY FORM */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-100 relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500 to-red-700"></div>
          <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2"><HeartPulse className="w-5 h-5 text-red-500" /> Emergency Details</h2>
          
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Patient Name</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"><div className="pl-3 pr-2 text-gray-400 bg-gray-100 py-3.5"><User className="w-4 h-4" /></div><input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-transparent text-sm font-bold p-3.5 outline-none" placeholder="Enter Patient Name" disabled={myReqId !== null} /></div>
          </div>
          
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Nature of Emergency</label>
            <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} disabled={myReqId !== null} className="w-full bg-gray-50 border border-gray-200 font-bold p-3.5 rounded-xl outline-none text-sm"><option value="Not Sure / Other">🤷‍♂️ Not Sure</option><option value="Accident">🚗 Road Accident / Trauma</option><option value="Heart Attack">💔 Heart Attack / Chest Pain</option><option value="Pregnancy">👶 Pregnancy / Maternity</option><option value="General Medical">🩺 General Medical Issue</option></select>
          </div>
          
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Contact Number</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"><div className="pl-3 pr-2 text-gray-400 bg-gray-100 py-3.5 flex items-center"><Phone className="w-4 h-4" /><span className="font-bold text-gray-600 ml-1">+91</span></div><input type="text" maxLength={10} value={contactNumber} onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ""))} disabled={myReqId !== null} className="w-full bg-transparent font-bold p-3.5 outline-none text-base" /></div>
          </div>
          
          <button onClick={handleEmergencyRequest} disabled={isRequested || myReqId !== null} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl text-white font-extrabold text-lg uppercase transition-all ${myReqId !== null ? 'bg-emerald-600 cursor-not-allowed shadow-emerald-500/30' : isRequested ? 'bg-amber-600' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}>
            {myReqId !== null ? <><CheckCircle2 className="w-6 h-6"/> Request Active</> : isRequested ? <><Loader2 className="w-6 h-6 animate-spin" /> Dispatching...</> : <><AlertTriangle className="w-6 h-6 animate-pulse" /> Request Ambulance</>}
          </button>
        </div>
      </main>
    </div>
  );
}
export default UserDashboard;