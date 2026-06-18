import React from 'react';
import { ArrowLeft, User, Truck, PhoneCall, LogIn, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

function Role() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      
      {/* HEADER: QuickAmbu Branding */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex gap-2 items-center">
          <button className="text-gray-600 flex items-center">
            <Link to="/">
              <ArrowLeft className="w-7 h-7 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-100" />
            </Link>
          </button>
          
          <div className="flex items-center gap-1.5">
            <Link to="/">
              <img src={Logo} alt="QuickAmbu Logo" className="w-12 h-auto" />
            </Link>
            <div className="flex flex-col leading-none">
              <span className="text-red-600 font-extrabold text-lg tracking-wide">QuickAmbu</span>
              <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ambulance</span>
            </div>
          </div>
        </div>

        {/* Helpline Support */}
        <a 
          href="tel:+919876543210" 
          className="bg-red-50 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:bg-red-100 transition"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Helpline</span>
        </a>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center gap-8">
        
        {/* Welcome Text */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">QuickAmbu Gateway</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Select an option below to secure your access</p>
        </div>

        {/* 2x2 GRID SYSTEM FOR REGISTRATION & LOGIN */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          
          {/* ================= SECTION 1: REGISTRATION ================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">New to QuickAmbu? (Register)</h3>
            
            {/* CARD 1: USER REGISTER */}
            <Link to="/UserRegister" className="block no-underline">
              <div className="cursor-pointer rounded-2xl p-5 border-2 bg-white border-gray-100 hover:border-red-500 hover:bg-red-50/20 transition-all flex items-center gap-4 shadow-xs active:scale-[0.98] min-h-[110px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-600 text-white shadow-md shadow-red-500/10">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base">User / Patient Register</h4>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium leading-tight">
                    Create an account to book rapid emergency transport.
                  </p>
                </div>
              </div>
            </Link>

            {/* CARD 2: AMBULANCE DRIVER REGISTER */}
            <Link to="/AmbuRegister" className="block no-underline">
              <div className="cursor-pointer rounded-2xl p-5 border-2 bg-white border-gray-100 hover:border-red-500 hover:bg-red-50/20 transition-all flex items-center gap-4 shadow-xs active:scale-[0.98] min-h-[110px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-900 text-white shadow-md">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base">Ambulance Driver Register</h4>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium leading-tight">
                    Register your commercial emergency vehicle online.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* ================= SECTION 2: LOGIN ================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Existing User? (Sign In)</h3>
            
            {/* CARD 3: USER LOGIN */}
            <Link to="/UserLogin" className="block no-underline">
              <div className="cursor-pointer rounded-2xl p-5 border-2 bg-white border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex items-center gap-4 shadow-xs active:scale-[0.98] min-h-[110px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-md shadow-emerald-500/10">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base">Patient / User Login</h4>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium leading-tight">
                    Sign in to track orders, manage history, or request help.
                  </p>
                </div>
              </div>
            </Link>

            {/* CARD 4: DRIVER LOGIN */}
            <Link to="/DriverLogin" className="block no-underline">
              <div className="cursor-pointer rounded-2xl p-5 border-2 bg-white border-gray-100 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex items-center gap-4 shadow-xs active:scale-[0.98] min-h-[110px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-600 text-white shadow-md shadow-indigo-500/10">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 text-base">Driver Duty Login</h4>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium leading-tight">
                    Go online to receive nearby active rescue alerts.
                  </p>
                </div>
              </div>
            </Link>
          </div>

        </div>

        {/* ================= SECTION 3: ADMIN CONTROL ROOM ================= */}
        <div className="w-full mt-2">
          <Link to="/AdminLogin" className="block no-underline">
            <div className="cursor-pointer rounded-2xl p-5 border-2 bg-slate-900 border-slate-800 hover:border-red-500 transition-all flex items-center gap-4 shadow-xl active:scale-[0.98] min-h-[110px] relative overflow-hidden group">
              
              {/* Top Red Glow Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-slate-800 text-red-500 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="w-7 h-7" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-extrabold text-white text-lg tracking-wide">Master Control Room</h4>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Admin Only
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1.5 font-medium leading-tight">
                  Secure access for system administrators to dispatch and track emergency vehicles live on the map.
                </p>
              </div>

            </div>
          </Link>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-4 text-center text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
        QuickAmbu Secure Gateway © 2026
      </footer>
    </div>
  );
}

export default Role;