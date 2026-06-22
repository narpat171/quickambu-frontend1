import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import axios from "axios"; // ➔ API कॉल के लिए
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 👇 1. AOS इम्पोर्ट किया
import AOS from 'aos';
import 'aos/dist/aos.css';

function AmbuRegister(){
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "", mobile: "", whatsapp: "", email: "", password: "",
        aadhar: "", plateNo: "", city: "", address: "", licenceNo: "", rcNo: "",
    });

    // ➔ 1. असली फाइल (Backend के लिए)
    const [ownerFile, setOwnerFile] = useState(null);
    const [insideFile, setInsideFile] = useState(null);
    const [outsideFile, setOutsideFile] = useState(null);

    // ➔ 2. प्रिव्यू लिंक (दिखाने के लिए)
    const [ownerPreview, setOwnerPreview] = useState(null);
    const [insidePreview, setInsidePreview] = useState(null);
    const [outsidePreview, setOutsidePreview] = useState(null);

    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // 👇 2. पेज लोड होते ही एनिमेशन चालू करने के लिए useEffect
    useEffect(() => {
        AOS.init({
            duration: 600, // 0.6 सेकंड का स्मूथ एनिमेशन
            easing: 'ease-out-cubic',
            once: true,
        });
    }, []);

    const formatAadhar = (value) => {
        return value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    };

    const ambulanceFacilities = [
        "Oxygen Cylinder", "Ventilator", "ICU Setup", "Cardiac Monitor",
        "Stretcher", "Wheelchair", "First Aid Kit", "Defibrillator",
        "Neonatal Care", "Air Conditioning", "Emergency Medicines", "Trained Paramedic",
    ];

    const handleClearForm = () => {
        setFormData({
            name: "", mobile: "", whatsapp: "", email: "", password: "",
            aadhar: "", plateNo: "", city: "", address: "", licenceNo: "", rcNo: "",
        });
        setSelectedFacilities([]);
        setOwnerFile(null); setInsideFile(null); setOutsideFile(null);
        setOwnerPreview(null); setInsidePreview(null); setOutsidePreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "aadhar") {
            setFormData({ ...formData, [name]: formatAadhar(value) });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleImage = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file); 
            setPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitData = new FormData();
        
        submitData.append("name", formData.name);
        submitData.append("mobile", formData.mobile);
        submitData.append("whatsapp", formData.whatsapp);
        submitData.append("email", formData.email);
        submitData.append("password", formData.password);
        submitData.append("aadhar", formData.aadhar);
        submitData.append("plateNo", formData.plateNo);
        submitData.append("city", formData.city);
        submitData.append("address", formData.address);
        submitData.append("licenceNo", formData.licenceNo);
        submitData.append("rcNo", formData.rcNo);
        submitData.append("facilities", JSON.stringify(selectedFacilities));

        if (ownerFile) submitData.append("ownerPhoto", ownerFile);
        if (insideFile) submitData.append("insidePhoto", insideFile);
        if (outsideFile) submitData.append("outsidePhoto", outsideFile);

        try {
            const response = await axios.post("https://quickambu-backend-1.onrender.com/api/driver/register", submitData);

            if (response.data.success) {
                alert("🎉 Success: " + response.data.message);
                navigate("/DriverLogin"); 
            }
        } catch (error) {
            alert("❌ Error: " + (error.response?.data?.message || "Registration fail ho gaya!"));
        }
    };

    const handleFacilityChange = (facility) => {
        if (selectedFacilities.includes(facility)) {
            setSelectedFacilities(selectedFacilities.filter((item) => item !== facility));
        } else {
            setSelectedFacilities([...selectedFacilities, facility]);
        }
    };

    return (
        <>
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/Role">
                        <button className="text-gray-600 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-100">
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

        {/* 👇 overflow-hidden लगाया है */}
        <div className="min-h-screen py-10 px-4 overflow-hidden bg-slate-50">
            
            {/* 👇 3. यहाँ data-aos="fade-up" लगाया है */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-lg p-8" data-aos="fade-up">
                
                <div className="flex flex-col items-center mb-6">
                    <div className="p-4 rounded-full text-white">
                        <img src={Logo} alt="Logo" className="w-20" />
                    </div>
                    <h1 className="text-3xl font-bold mt-4 text-gray-800">
                        <span className="text-red-600">Quick</span>Ambu
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Your Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input required type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="tel" name="mobile" maxLength={10} placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="tel" name="whatsapp" maxLength={10} placeholder="WhatsApp Number" value={formData.whatsapp} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="email" name="email" placeholder="Gmail ID" value={formData.email} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="text" name="aadhar" maxLength={14} placeholder="Aadhar No." value={formData.aadhar} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2 md:col-span-2" />
                        </div>

                        <div className="mt-6">
                            <label className="font-medium block mb-2">Your Photo</label>
                            <input required type="file" accept="image/*" className="w-full border-2 border-dashed border-gray-300 p-3 rounded-md hover:border-red-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-red-600 file:text-white cursor-pointer" 
                                onChange={(e) => handleImage(e, setOwnerFile, setOwnerPreview)} />
                            {ownerPreview && <img src={ownerPreview} alt="Owner" className="w-32 h-32 mt-3 rounded-md border object-cover" />}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Ambulance Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input required type="text" name="plateNo" placeholder="RJ 27 AB XXXX" value={formData.plateNo} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="text" name="city" placeholder="Village / City" value={formData.city} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <textarea required name="address" rows="3" placeholder="Full Address" value={formData.address} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2 md:col-span-2" />
                            <input required type="text" name="licenceNo" placeholder="Driving Licence Number" value={formData.licenceNo} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                            <input required type="text" name="rcNo" placeholder="Ambulance RC Number" value={formData.rcNo} onChange={handleChange} className="border p-2 rounded-md outline-none hover:border-b-red-600 hover:border-b-2" />
                        </div>
                        
                        <div className="md:col-span-2 mt-4">
                            <label className="block font-semibold mb-3">Available Facilities</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {ambulanceFacilities.map((facility) => (
                                    <label key={facility} className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:border-red-500">
                                        <input type="checkbox" checked={selectedFacilities.includes(facility)} onChange={() => handleFacilityChange(facility)} className="accent-red-600" />
                                        <span>{facility}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="font-medium block mb-2">Ambulance Inside Photo</label>
                                <input required type="file" accept="image/*" className="w-full border-2 border-dashed border-gray-300 p-3 rounded-md hover:border-red-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-red-600 file:text-white cursor-pointer" 
                                    onChange={(e) => handleImage(e, setInsideFile, setInsidePreview)} />
                                {insidePreview && <img src={insidePreview} alt="Inside" className="w-full h-48 mt-3 rounded-md border object-cover" />}
                            </div>

                            <div>
                                <label className="font-medium block mb-2">Ambulance Outside Photo</label>
                                <input required type="file" accept="image/*" className="w-full border-2 border-dashed border-gray-300 p-3 rounded-md hover:border-red-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-red-600 file:text-white cursor-pointer" 
                                    onChange={(e) => handleImage(e, setOutsideFile, setOutsidePreview)} />
                                {outsidePreview && <img src={outsidePreview} alt="Outside" className="w-full h-48 mt-3 rounded-md border object-cover" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-semibold transition">
                            Submit Registration
                        </button>
                        <button type="button" onClick={handleClearForm} className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-md font-semibold transition">
                            Clear Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AmbuRegister;