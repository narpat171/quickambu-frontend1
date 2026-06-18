import React, { useState } from 'react';
import { Phone, Check, AlertCircle, Shield, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

export default function BookDetails() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    dateTime: '',
    condition: '',
    ambulanceType: 'Advanced Life Support (ALS)'
  });

  // Additional Features State (Price aur Selection status)
  const [features, setFeatures] = useState([
    { id: 'oxygen', name: 'Oxygen Support', desc: 'Oxygen cylinder with flow meter', price: 300, checked: true },
    { id: 'cardiac', name: 'Cardiac Monitor', desc: 'Heart rate & vital signs monitoring', price: 500, checked: true },
    { id: 'ventilator', name: 'Ventilator', desc: 'Portable ventilator support', price: 1000, checked: false },
    { id: 'suction', name: 'Suction Machine', desc: 'For emergency suction support', price: 300, checked: true },
    { id: 'infusion', name: 'Infusion Pump', desc: 'IV fluid administration', price: 300, checked: false },
    { id: 'paramedic', name: 'Trained Paramedic', desc: 'Professional medical staff', price: 500, checked: true },
    { id: 'attendant', name: 'Extra Attendant', desc: 'Additional support staff', price: 400, checked: false },
  ]);

  // Base Price for ALS Ambulance
  const basePrice = 1999;

  // --- LIVE CALCULATIONS ---
  // 1. Sirf selected features ka total
  const featuresTotal = features
    .filter(f => f.checked)
    .reduce((sum, f) => sum + f.price, 0);

  // 2. Subtotal (Base Price + Selected Features)
  const subtotal = basePrice + featuresTotal;

  // 3. Taxes & Charges (Design ke mutabik fixed ya percentage base kar sakte hain, yahan approx 6% kiya hai match karne ke liye)
  const taxes = 216; 

  // 4. Final Payable Amount
  const totalAmount = subtotal + taxes;

  // Toggle Features Checkbox
  const handleFeatureChange = (id) => {
    setFeatures(features.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
  };

  return (
    <div className="font-sans bg-slate-50 text-slate-800 min-h-screen">
      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="text-red-600 font-bold text-2xl flex items-center gap-2"> 
            <div>
              <img src={Logo} alt="logo"/>
              <div>
                <span className="block leading-none tracking-tight">QuickAmbu</span>
              <span className="block text-xs uppercase tracking-widest text-slate-500 font-semibold">Ambulance</span>
              </div>
            </div>
          </div>

          {/* Stepper Steps (Desktop Only) */}
          <div className="hidden md:flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              <span className="text-red-600">Booking Details</span>
            </div>
            <div className="w-12 h-[1px] bg-slate-200 border-dashed border-t"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px]">2</span>
              <span>Select Features</span>
            </div>
            <div className="w-12 h-[1px] bg-slate-200 border-dashed border-t"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px]">3</span>
              <span>Confirm & Pay</span>
            </div>
          </div>

          <a href="tel:+919876543210" className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full border border-red-200 font-semibold text-sm">
            <Phone size={14} className="fill-current" />
            <span className="hidden sm:inline">+91 98765 43210</span>
          </a>
        </div>
      </header>

      {/* --- MAIN BOOKING SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div>
           <Link to="/"><ArrowLeft size={25} className="shrink-0" /></Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Book Ambulance</h1>
          <p className="text-slate-500 text-sm mt-1">Fill the details and choose the required features.</p>
        </div>

        {/* 2 Column Layout (Form + Features | Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Booking Form & Additional Features */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              <h2 className="font-bold text-slate-900 text-base border-b border-slate-50 pb-3">Pickup & Drop Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pickup Location</label>
                  <input 
                    type="text" 
                    placeholder="Enter pickup location" 
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Drop */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Drop Location</label>
                  <input 
                    type="text" 
                    placeholder="Enter drop location" 
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500 text-slate-600"
                  />
                </div>

                {/* Patient Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Patient Condition</label>
                  <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500 text-slate-600 appearance-none">
                    <option>Select condition</option>
                    <option>Critical / Unconscious</option>
                    <option>Stable / Semi-conscious</option>
                    <option>Minor Injury / Normal Transport</option>
                  </select>
                </div>
              </div>

              {/* Ambulance Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ambulance Type</label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-sm font-semibold text-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚑</span>
                    <span>Advanced Life Support (ALS)</span>
                  </div>
                  <span className="text-slate-400 text-xs">▼</span>
                </div>
              </div>

              {/* Info Notification */}
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-100/50">
                <AlertCircle size={14} className="shrink-0" />
                <span>You can add or remove features in the next step</span>
              </div>
            </div>

            {/* Additional Features List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 text-base">Select Additional Features</h2>
              <p className="text-slate-400 text-xs mt-0.5 mb-6">Choose the required medical features. You will be charged only for what you select.</p>

              <div className="space-y-3">
                {features.map((feature) => (
                  <div 
                    key={feature.id}
                    onClick={() => handleFeatureChange(feature.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      feature.checked ? 'border-red-200 bg-red-50/20 shadow-sm' : 'border-slate-100 bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Feature Icon Indicator */}
                      <div className={`p-2.5 rounded-xl shrink-0 ${feature.checked ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {feature.id === 'oxygen' && '💨'}
                        {feature.id === 'cardiac' && '❤️'}
                        {feature.id === 'ventilator' && '🌬️'}
                        {feature.id === 'suction' && '🧪'}
                        {feature.id === 'infusion' && '💧'}
                        {feature.id === 'paramedic' && '🧑‍⚕️'}
                        {feature.id === 'attendant' && '🧑'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{feature.name}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">{feature.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 text-sm">₹{feature.price}</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                        feature.checked ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {feature.checked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h2 className="font-bold text-slate-900 text-base border-b border-slate-50 pb-3">Order Summary</h2>
              
              {/* Ambulance Mini Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl bg-white p-2 rounded-lg shadow-sm border border-slate-100">🚑</div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ambulance Type</span>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">{formData.ambulanceType}</h4>
                </div>
                <span className="font-extrabold text-slate-900 text-sm">₹{basePrice}</span>
              </div>

              {/* Dynamic Selected Features Breakdowns */}
              <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
                {features.filter(f => f.checked).map(f => (
                  <div key={f.id} className="flex justify-between items-center text-slate-600">
                    <span>{f.name}</span>
                    <span className="font-semibold text-slate-900">₹{f.price}</span>
                  </div>
                ))}
              </div>

              {/* Final Calculations Breakdowns */}
              <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Taxes & Charges</span>
                  <span className="font-semibold text-slate-900">₹{taxes}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Total Amount</span>
                <span className="font-extrabold text-red-600 text-xl">₹{totalAmount}</span>
              </div>

              {/* Green Guarantee Tag */}
              <div className="bg-green-50/50 border border-green-100 text-green-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                No hidden charges. Pay only for the features you select.
              </div>
            </div>

            {/* Bottom Final Pay Action Button */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Amount</span>
                <span className="font-extrabold text-slate-900 text-lg">₹{totalAmount}</span>
              </div>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/10 transition-all flex items-center justify-center gap-2 text-sm">
                Continue to Confirm & Pay <ArrowRight size={16} />
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Shield size={14} />
              <span>Safe. Fast. Reliable. We are here to save lives.</span>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}