import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Code2, User, Briefcase, Award } from 'lucide-react'; 

// 👇 1. आपके Assets फोल्डर से तस्वीरें इम्पोर्ट की हैं (नाम एकदम वही रखे हैं जो आपने बताए)
import FounderImg from '../assets/Founder.png';
import CoFounderImg from '../assets/Co-Founder.jpeg';
import CFOImg from '../assets/CFO.jpeg';

import AOS from 'aos';
import 'aos/dist/aos.css';

function Developers() {
  // 👇 2. पॉप-अप में किसका डेटा दिखाना है, उसके लिए State
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800, 
      easing: 'ease-out-cubic',
      once: true,
    });
  }, []);

  // 👇 3. टीम का पूरा डेटा (यहाँ आपकी दी गई सारी डिटेल्स सेट कर दी हैं)
  const teamData = [
    {
      id: 1,
      name: "Narpat Singh",
      fatherName: "Shivdan Singh",
      role: "Founder",
      image: FounderImg,
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Content Creator", "Good Spoken English"],
      color: "red"
    },
    {
      id: 2,
      name: "Himesh Singh",
      fatherName: "Shivdan Singh",
      role: "Co-Founder & Backend Developer",
      image: CoFounderImg,
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Backend Developer", "Good Spoken English"],
      color: "blue"
    },
    {
      id: 3,
      name: "Sarwar Singh",
      fatherName: "Pawan Singh",
      role: "CFO, UI Designer & Researcher",
      image: CFOImg,
      skills: ["HTML", "CSS", "JavaScript", "React", "UI Designer", "Researcher", "Good Spoken English"],
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* 🔴 HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <button className="text-gray-600 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-1.5">
              <Link to="/"><img src={Logo} alt="logo" className="w-15" /></Link>
              <div className="flex flex-col leading-none">
                <span className="text-red-600 font-extrabold text-lg tracking-wide">QuickAmbu</span>
                <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ambulance</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🔴 MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Title Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-4 inline-block flex items-center gap-2 w-max mx-auto">
            <Code2 size={16} /> CORE TEAM
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">
            The Minds Behind <span className="text-red-600">QuickAmbu</span>
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Meet our dedicated team of developers, designers, and visionaries working tirelessly to save lives through technology.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamData.map((member, index) => (
            <div 
              key={member.id} 
              data-aos="fade-up" 
              data-aos-delay={index * 150} // 👈 एक-एक करके कार्ड आएंगे
              onClick={() => setSelectedMember(member)} // 👈 क्लिक करते ही पॉप-अप खुलेगा
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 group"
            >
              {/* Photo */}
              <div className="relative w-full h-72 mb-6 overflow-hidden rounded-2xl bg-gray-200">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium text-sm flex items-center gap-1">
                    Click to view profile ➔
                  </span>
                </div>
              </div>
              
              {/* Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">{member.name}</h3>
                <p className={`text-${member.color}-600 font-bold text-sm uppercase tracking-wide mt-1`}>
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔴 POPUP MODAL (INFO CARD) - जब किसी कार्ड पर क्लिक होगा तब दिखेगा */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row transform scale-100 animate-in zoom-in duration-300"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 bg-white/50 hover:bg-red-100 text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Left Side: Big Image */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 relative">
              <img 
                src={selectedMember.image} 
                alt={selectedMember.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
                <h3 className="text-white text-2xl font-bold">{selectedMember.name}</h3>
                <p className={`text-${selectedMember.color}-400 font-semibold text-sm`}>{selectedMember.role}</p>
              </div>
            </div>

            {/* Right Side: Details & Skills */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center bg-slate-50">
              
              <div className="mb-6 space-y-3">
                {/* Father's Name */}
                <div className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">S/O (Father's Name)</p>
                    <p className="font-semibold text-slate-800">{selectedMember.fatherName}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <Briefcase className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Position</p>
                    <p className="font-semibold text-slate-800">{selectedMember.role}</p>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Award size={16} /> Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className={`bg-${selectedMember.color}-100 text-${selectedMember.color}-700 border border-${selectedMember.color}-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Developers;