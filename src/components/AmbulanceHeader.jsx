import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { ArrowLeft, X, User, Phone, Mail, MapPin, IdCard, FileText, Truck, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AmbulanceHeader({ driverData, refreshProfile }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // एडिट मोड और फॉर्म स्टेट्स
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setIsEditing(false); // एडिट मोड बंद करें
    }, 300);
  };

  // एडिट मोड चालू करने पर फॉर्म में पुराना डेटा भरना
  const handleEditClick = () => {
    setEditForm({
      name: driverData.name || "",
      whatsapp: driverData.whatsapp || "",
      email: driverData.email || "",
      city: driverData.city || "",
      address: driverData.address || "",
      licenceNo: driverData.licenceNo || "",
      rcNo: driverData.rcNo || "",
      plateNo: driverData.plateNo || "",
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // बैकएंड को अपडेटेड डेटा भेजना
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("driverToken");
    try {
      const response = await axios.put("https://quickambu-backend-1.onrender.com/api/driver/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setIsEditing(false);
        refreshProfile(); // डैशबोर्ड का डेटा री-लोड करें
      }
    } catch (error) {
      alert("Profile update fail ho gayi!");
      console.error(error);
    }
  };

  // लॉगआउट फंक्शन
  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    navigate("/DriverLogin");
  };

  if (!driverData) return null;

  // प्रोफाइल फोटो पाथ सेटअप
  const profileImageSrc = driverData.photos?.ownerPhoto 
    ? `https://quickambu-backend-1.onrender.com/${driverData.photos.ownerPhoto}` 
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <>
      <header className="bg-white/20 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link to="/"><button className="text-gray-600 hover:text-black cursor-pointer"><ArrowLeft className="w-5 h-5" /></button></Link>
            <div className="flex items-center gap-2">
              <img src={Logo} alt="logo" className="w-14 rounded-full" />
              <div className="flex flex-col leading-none">
                <span className="text-red-600 font-extrabold text-lg">Quick<span className="text-blue-950">Ambu</span></span>
                <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ambulance</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
              <img src={profileImageSrc} alt="Profile" className="w-10 h-10 rounded-xl object-cover ring-2 ring-red-500/20 group-hover:ring-red-500/50 transition-all" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-gray-800 leading-tight">{driverData.name}</p>
                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>

            {/* MINI DROPDOWN */}
            {showProfile && (
              <div className="absolute right-0 top-14 w-76 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                  <img src={profileImageSrc} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{driverData.name}</h3>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">{driverData.mobile}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center gap-2 px-1 py-1 truncate"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {driverData.city || "No City"}</p>
                  <p className="flex items-center gap-2 px-1 py-1"><Truck className="w-3.5 h-3.5 text-red-500" /> {driverData.plateNo || "N/A"}</p>
                </div>
                <button onClick={() => { setShowModal(true); setShowProfile(false); }} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center">
                  View Full Profile
                </button>
                <button onClick={handleLogout} className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs cursor-pointer text-center">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FULL PROFILE DETAILS MODAL */}
      {showModal && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            <div className="bg-linear-to-b from-gray-900 to-blue-950 p-6 text-white relative border-b border-gray-800">
              <button onClick={handleCloseModal} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white cursor-pointer"><X className="w-4 h-4" /></button>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mt-2">
                <img src={profileImageSrc} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">{driverData.name}</h2>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mt-1">Emergency Ambulance Pilot</p>
                </div>
              </div>
            </div>

            {/* Modal Body with inputs for editing */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              <EditableInfoBox icon={<User />} title="Full Name" name="name" value={driverData.name} isEditing={isEditing} editValue={editForm.name} onChange={handleInputChange} />
              <InfoBox icon={<Phone />} title="Mobile Number (Cannot Change)" value={driverData.mobile} />
              <EditableInfoBox icon={<Phone />} title="WhatsApp Number" name="whatsapp" value={driverData.whatsapp} isEditing={isEditing} editValue={editForm.whatsapp} onChange={handleInputChange} />
              <EditableInfoBox icon={<Mail />} title="Email Address" name="email" value={driverData.email} isEditing={isEditing} editValue={editForm.email} onChange={handleInputChange} />
              <EditableInfoBox icon={<MapPin />} title="Village / City" name="city" value={driverData.city} isEditing={isEditing} editValue={editForm.city} onChange={handleInputChange} />
              <EditableInfoBox icon={<MapPin />} title="Full Address" name="address" value={driverData.address} isEditing={isEditing} editValue={editForm.address} onChange={handleInputChange} />
              <InfoBox icon={<IdCard />} title="Aadhaar Verification" value={driverData.aadhar || "Verified"} />
              <EditableInfoBox icon={<FileText />} title="Driving License (DL)" name="licenceNo" value={driverData.licenceNo} isEditing={isEditing} editValue={editForm.licenceNo} onChange={handleInputChange} />
              <EditableInfoBox icon={<Truck />} title="Ambulance Plate No." name="plateNo" value={driverData.plateNo} isEditing={isEditing} editValue={editForm.plateNo} onChange={handleInputChange} highlight />
              <EditableInfoBox icon={<FileText />} title="Ambulance RC Number" name="rcNo" value={driverData.rcNo} isEditing={isEditing} editValue={editForm.rcNo} onChange={handleInputChange} />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between rounded-b-2xl">
              {!isEditing ? (
                <button onClick={handleEditClick} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">Edit Profile</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl cursor-pointer">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                </div>
              )}
              <button onClick={handleCloseModal} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">Close</button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// फिक्स इन्फो बॉक्स
function InfoBox({ icon, title, value, highlight = false }) {
  return (
    <div className={`p-3.5 rounded-xl border ${highlight ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/60 border-gray-200/70'}`}>
      <div className="flex items-center gap-2 mb-1 text-gray-400 text-[11px] font-bold uppercase">{icon} {title}</div>
      <p className={`text-sm font-extrabold ${highlight ? 'text-red-700' : 'text-gray-800'}`}>{value || "N/A"}</p>
    </div>
  );
}

// एडिट करने योग्य इन्फो बॉक्स
function EditableInfoBox({ icon, title, name, value, isEditing, editValue, onChange, highlight = false }) {
  return (
    <div className={`p-3.5 rounded-xl border ${highlight ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/60 border-gray-200/70'}`}>
      <div className="flex items-center gap-2 mb-1 text-gray-400 text-[11px] font-bold uppercase">{icon} {title}</div>
      {isEditing ? (
        <input type="text" name={name} value={editValue} onChange={onChange} className="w-full bg-white border border-gray-300 text-sm font-semibold p-1.5 rounded-lg outline-none focus:border-red-500" />
      ) : (
        <p className={`text-sm font-extrabold ${highlight ? 'text-red-700' : 'text-gray-800'}`}>{value || "N/A"}</p>
      )}
    </div>
  );
}

export default AmbulanceHeader;