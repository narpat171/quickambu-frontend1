import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Clock,
  Zap,
  Shield,
  IndianRupee,
  Menu,
  X,
} from "lucide-react";
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import Logo from './assets/logo.png';
import { FaAmbulance } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { FcLike } from "react-icons/fc";

// ➔ AOS लाइब्रेरी
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardLink, setDashboardLink] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });

    const userToken = localStorage.getItem("userToken");
    const driverToken = localStorage.getItem("driverToken");

    if (userToken) {
      setIsLoggedIn(true);
      setDashboardLink("/UserDashboard");
    } else if (driverToken) {
      setIsLoggedIn(true);
      setDashboardLink("/AmbulanceDashboard");
    }
  }, []);
  const navigate = useNavigate();

  const handleBookAmbulanceClick = () => {
    // ➔ सही टोकन का नाम इस्तेमाल करें
    const userToken = localStorage.getItem('userToken');
    const driverToken = localStorage.getItem('driverToken');

    if (userToken) {
      navigate('/UserDashboard');
    } else if (driverToken) {
      navigate('/AmbulanceDashboard');
    } else {
      navigate('/UserLogin');
    }
  };
  return (
    <div className="font-sans bg-slate-50 text-slate-800 min-h-screen overflow-x-hidden">

      {/* ➔ 1. सुपर-प्रीमियम 3D एम्बुलेंस और सड़क का CSS */}
      <style>
        {`
          /* एम्बुलेंस के उछलने का एनीमेशन (ज़िंदा इफ़ेक्ट) */
          @keyframes driveBounce {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(-0.5deg); }
          }
          /* नीचे की परछाई का एनीमेशन */
          @keyframes shadowBounce {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(0.8); opacity: 0.4; }
          }
          /* अलॉय व्हील्स (Alloy Wheels) के तेज़ घूमने का एनीमेशन */
          @keyframes fastSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          /* सड़क की पट्टियों के भागने का एनीमेशन (रफ़्तार) */
          @keyframes roadMove {
            0% { background-position: 0px 0; }
            100% { background-position: -150px 0; }
          }
          /* पीछे वाले शहर/बिल्डिंग्स का एनीमेशन */
          @keyframes bgMove {
            0% { background-position: 0px 0; }
            100% { background-position: -300px 0; }
          }
          /* हवा की तेज़ लाइनें (Speed Lines) */
          @keyframes fastWind {
            0% { transform: translateX(100px); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(-500px); opacity: 0; }
          }
          /* सायरन की चमक - लाल (Red Glow) */
          @keyframes sirenPulseRed {
            0%, 100% { opacity: 0.3; box-shadow: 0 0 0 rgba(239,68,68,0); }
            50% { opacity: 1; box-shadow: -20px -20px 50px rgba(239,68,68,0.9); }
          }
          /* सायरन की चमक - नीली (Blue Glow) */
          @keyframes sirenPulseBlue {
            0%, 100% { opacity: 0.3; box-shadow: 0 0 0 rgba(59,130,246,0); }
            50% { opacity: 1; box-shadow: 20px -20px 50px rgba(59,130,246,0.9); }
          }
          /* हेडलाइट बीम (Headlight Ray) */
          @keyframes headlightFlicker {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.6; }
          }
          /* 👇 Book Ambulance बटन के कूदने (Jump) का एनीमेशन */
          @keyframes buttonJump {
            0%, 100% { 
              transform: translateY(0) scale(1); 
              box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3); 
            }
            50% { 
              transform: translateY(-6px) scale(1.02); 
              box-shadow: 0 15px 20px -3px rgba(220, 38, 38, 0.4); 
            }
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-red-600 font-bold text-2xl flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="logo" className="w-15" />
                <div>
                  <span className="block leading-none tracking-tight">QuickAmbu</span>
                  <span className="block text-xs uppercase tracking-widest text-slate-500 font-semibold">Ambulance</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600 items-center">
            <p className="text-red-500 border-b-2 border-red-500 pb-1 cursor-pointer">Home</p>
            <Link to="/About"><p className="hover:text-red-500 transition-colors cursor-pointer">About Us</p></Link>
            <p className="hover:text-red-500 transition-colors cursor-pointer">Services</p>

            {isLoggedIn ? (
              <Link to={dashboardLink}>
                <p className="text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full font-bold transition-colors shadow-md cursor-pointer">
                  Go to Dashboard
                </p>
              </Link>
            ) : (
              <Link to="/Role">
                <p className="hover:text-red-500 transition-colors cursor-pointer">Register/Login</p>
              </Link>
            )}
            <Link to="/developers"><p className="hover:text-red-500 transition-colors cursor-pointer">Developers</p></Link>
            <p className="hover:text-red-500 transition-colors cursor-pointer">Contact Us</p>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDE DRAWER --- */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />

      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 p-6 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <span className="font-bold text-lg text-slate-900">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X size={20} /></button>
          </div>
          <nav className="flex flex-col gap-4 mt-6">
            <p onClick={() => setIsMenuOpen(false)} className="text-red-500 font-semibold bg-red-50/50 px-3 py-2 rounded-lg cursor-pointer">Home</p>
            <Link to="/About" onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">About Us</Link>
            <p onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Services</p>
            {isLoggedIn ? (
              <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="text-white bg-red-600 font-medium px-3 py-2 rounded-lg text-center shadow-md cursor-pointer">My Dashboard</Link>
            ) : (
              <Link to="/Role" onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Register/Login</Link>
            )}
            <Link to="/developers" onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Developers</Link>
            <p onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Contact Us</p>
          </nav>
        </div>
        <div className="border-t border-slate-100 pt-6">
          <a href="tel:+919876543210" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-red-700 transition-all text-sm">
            <Phone size={16} className="fill-current" /> Call Emergency Now
          </a>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative bg-linear-to-r from-red-50 via-white to-red-50/30 overflow-hidden py-12 lg:py-20 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-6 z-10 text-center lg:text-left" data-aos="fade-right">
            <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 mx-auto lg:mx-0">
              <Clock size={12} /> 24/7 Emergency Service
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 leading-tight mb-4">
              Fast, Safe & Reliable <br />
              <span className="text-red-600">Ambulance Service</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Book an ambulance in just a few clicks. We provide fast and advanced healthcare facilities at your door.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/About">
                <button className="w-full sm:w-auto bg-white border-2 border-red-600 hover:bg-red-50 text-red-600 font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-red-600/10 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                  Learn More
                </button>
              </Link>

              {/* 👇 पहला स्मार्ट और कूदने वाला बटन */}
              <button
                onClick={handleBookAmbulanceClick}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-8 rounded-xl transition-colors cursor-pointer shadow-lg border-2 border-red-600"
                style={{ animation: 'buttonJump 1.5s ease-in-out infinite' }}
              >
                Book Ambulance Now
              </button>

            </div>
          </div>

          {/* ➔ 2. असली 'लगातार चलती हुई प्रीमियम कार्टून एम्बुलेंस' (NIGHT MODE) */}
          <div className="lg:col-span-6 relative flex justify-center items-center h-[350px] sm:h-[450px] mt-6 w-full" data-aos="zoom-in" data-aos-delay="200">

            {/* पूरा सीन (Night Highway Box) */}
            <div className="absolute inset-0 bg-slate-900 rounded-[40px] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] border-[6px] border-slate-200">

              {/* पीछे भागते हुए शहर की बिल्डिंग्स (City Skyline) */}
              <div className="absolute bottom-[20%] left-0 w-full h-[60%] opacity-40" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, #334155 40px, #334155 80px, transparent 80px, transparent 100px, #1e293b 100px, #1e293b 160px)',
                backgroundSize: '300px 100%',
                animation: 'bgMove 2s linear infinite'
              }}></div>

              {/* भागती हुई डार्क सड़क और पट्टियां */}
              <div className="absolute bottom-0 left-0 w-full h-[25%] bg-slate-800 z-0 border-t-[4px] border-slate-700 shadow-inner">
                <div className="w-full h-2.5 mt-4" style={{
                  backgroundImage: 'linear-gradient(90deg, #f8fafc 50%, transparent 50%)',
                  backgroundSize: '150px 100%',
                  animation: 'roadMove 0.2s linear infinite'
                }}></div>
              </div>

              {/* हवा की रफ़्तार (Wind Lines) */}
              <div className="absolute top-[20%] left-0 w-full h-full pointer-events-none z-20 overflow-hidden opacity-50">
                <div className="absolute top-10 right-0 w-40 h-1 bg-white blur-[1px] rounded-full" style={{ animation: 'fastWind 0.5s linear infinite' }}></div>
                <div className="absolute top-32 right-0 w-64 h-1.5 bg-white/70 blur-[1.5px] rounded-full" style={{ animation: 'fastWind 0.7s linear infinite 0.2s' }}></div>
                <div className="absolute top-48 right-0 w-24 h-1 bg-white/90 blur-[1px] rounded-full" style={{ animation: 'fastWind 0.4s linear infinite 0.4s' }}></div>
              </div>
            </div>

            {/* ➔ 3. PREMIUM 3D HTML/CSS CARTOON AMBULANCE */}
            <div className="relative flex flex-col items-center z-10 mt-10">

              {/* उछलती हुई एम्बुलेंस बॉडी */}
              <div className="relative w-[320px] sm:w-[350px] h-[170px] sm:h-[190px] z-10" style={{ animation: 'driveBounce 0.35s ease-in-out infinite' }}>

                {/* ➔ टॉप लाइटबार (Glowing Police Light Bar) */}
                <div className="absolute -top-5 left-[35%] w-24 h-5 bg-slate-800 rounded-t-lg flex overflow-hidden border-2 border-slate-800 z-0 shadow-lg">
                  <div className="w-1/2 h-full bg-red-500" style={{ animation: 'sirenPulseRed 0.4s infinite alternate' }}></div>
                  <div className="w-1/2 h-full bg-blue-500" style={{ animation: 'sirenPulseBlue 0.4s infinite alternate-reverse' }}></div>
                </div>

                {/* एम्बुलेंस का मुख्य डिब्बा (Aerodynamic Van Body) */}
                <div className="absolute bottom-3 left-0 w-[95%] h-[90%] bg-linear-to-b from-white to-gray-200 rounded-l-xl rounded-tr-[60px] shadow-2xl border-[3px] border-slate-300 overflow-hidden flex flex-col justify-between z-10 relative">

                  {/* खिड़कियाँ (Dark Tinted Windows with Glare) */}
                  <div className="flex justify-end gap-2 p-3 pb-0">
                    <div className="w-16 h-14 bg-slate-800 rounded-md border-4 border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 -left-4 w-10 h-20 bg-white/20 rotate-45"></div>
                    </div>
                    {/* आगे वाला बड़ा शीशा (Windshield) */}
                    <div className="w-28 h-14 bg-slate-800 rounded-md rounded-tr-[30px] border-4 border-slate-700 mr-1 relative overflow-hidden">
                      <div className="absolute top-0 left-4 w-12 h-20 bg-white/20 rotate-45"></div>
                    </div>
                  </div>

                  {/* ➔ QuickAmbu टेक्स्ट और रेड डिज़ाइन */}
                  <div className="w-full h-14 bg-linear-to-r from-red-600 to-red-500 mt-1 flex items-center relative border-y-2 border-red-700">
                    <div className="w-12 h-12 bg-white text-red-600 flex items-center justify-center font-black text-3xl rounded-full absolute -top-5 left-6 border-[4px] border-red-600 shadow-md">
                      +
                    </div>
                    <span className="text-white font-black italic text-[28px] tracking-widest pl-24 drop-shadow-md">
                      QuickAmbu
                    </span>
                  </div>

                  {/* डार्क बम्पर */}
                  <div className="w-full h-4 bg-slate-800 mt-auto border-t border-slate-600"></div>

                  {/* ➔ हेडलाइट और लेज़र बीम (Headlight Beam) */}
                  <div className="absolute bottom-5 right-0 w-3 h-6 bg-yellow-100 rounded-l-md shadow-[0_0_15px_#fef08a] z-20"></div>
                  {/* सड़क पर पड़ने वाली रोशनी की किरण */}
                  <div className="absolute bottom-0 right-[-140px] w-[140px] h-[35px] bg-yellow-300/40 rounded-full blur-md z-0 pointer-events-none" style={{ animation: 'headlightFlicker 0.2s infinite' }}></div>

                  {/* टेल-लाइट (लाल रंग) */}
                  <div className="absolute bottom-5 left-0 w-2 h-8 bg-red-600 rounded-r-md shadow-[0_0_15px_#dc2626]"></div>
                </div>

                {/* ➔ अलॉय व्हील्स (Spinning Alloy Rims) */}
                {/* पीछे का पहिया */}
                <div className="absolute -bottom-1 left-[15%] w-[60px] h-[60px] bg-slate-900 rounded-full border-4 border-slate-300 flex items-center justify-center shadow-xl z-20" style={{ animation: 'fastSpin 0.25s linear infinite' }}>
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center relative border-[3px] border-slate-700 border-dashed">
                    <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                  </div>
                </div>

                {/* आगे का पहिया */}
                <div className="absolute -bottom-1 right-[18%] w-[60px] h-[60px] bg-slate-900 rounded-full border-4 border-slate-300 flex items-center justify-center shadow-xl z-20" style={{ animation: 'fastSpin 0.25s linear infinite' }}>
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center relative border-[3px] border-slate-700 border-dashed">
                    <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                  </div>
                </div>

              </div>

              {/* ➔ नीचे की परछाई (Shadow Bouncing) */}
              <div className="w-[280px] sm:w-[310px] h-4 bg-black/60 rounded-[100%] blur-md mt-2 z-0" style={{ animation: 'shadowBounce 0.35s ease-in-out infinite' }}></div>

            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES STRIP --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="100">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 shrink-0"><Clock size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">24/7 Availability</h3>
              <p className="text-slate-500 text-xs leading-normal">Ambulance available anytime, anywhere</p>
            </div>
          </div>
          <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="200">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 shrink-0"><Zap size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Quick Response</h3>
              <p className="text-slate-500 text-xs leading-normal">On-time pickup with fastest route</p>
            </div>
          </div>
          <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="300">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 shrink-0"><Shield size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Safe & Secure</h3>
              <p className="text-slate-500 text-xs leading-normal">Trained staff and advanced life support</p>
            </div>
          </div>
          <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="400">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 shrink-0"><IndianRupee size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Transparent Pricing</h3>
              <p className="text-slate-500 text-xs leading-normal">Pay for features you choose</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT STRIP --- */}
      <div className="bg-[#faf7f7] py-8 px-6 lg:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-15" data-aos="fade-up">
            <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-semibold">ABOUT QUICKAMBU</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900 leading-tight">India’s Trusted <span className="text-red-600">Ambulance Booking</span> Platform</h2>
            <p className="text-gray-500 max-w-3xl mx-auto mt-5 text-lg leading-8">QuickAmbu helps patients and families book ambulances quickly during emergencies. We connect users with nearby ambulance providers for fast, safe, and reliable medical transport.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative" data-aos="zoom-in" data-aos-delay="100">
              <div className="bg-red-100 absolute -top-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-60"></div>
              <img src="https://img.mathrubhumi.com/view/acePublic/alias/contentid/1i4id69iprkvtz1xpvr/1/ambulance.webp?f=3:2&q=0.75&w=900" alt="QuickAmbu Ambulance" className="relative rounded-2xl shadow-2xl w-full object-cover" />
            </div>

            <div data-aos="fade-left" data-aos-delay="200">
              <h3 className="text-3xl font-bold text-gray-900 leading-snug">Fast Ambulance Booking With Advanced Medical Support</h3>
              <p className="text-gray-600 mt-6 leading-8 text-lg">QuickAmbu is designed to reduce ambulance waiting time and make emergency transportation easier. Users can instantly book ambulances according to their medical needs and select additional life-saving features.</p>

              <div className="grid sm:grid-cols-2 gap-5 mt-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4"><FaAmbulance /></div>
                  <h4 className="font-semibold text-lg text-gray-900">Instant Booking</h4>
                  <p className="text-gray-500 mt-2 text-sm">Book nearby ambulances within seconds anytime, anywhere.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4"><FcLike /></div>
                  <h4 className="font-semibold text-lg text-gray-900">Emergency Support</h4>
                  <p className="text-gray-500 mt-2 text-sm">Advanced life support and emergency medical facilities available.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4"><FaLocationDot /></div>
                  <h4 className="font-semibold text-lg text-gray-900">Live Tracking</h4>
                  <p className="text-gray-500 mt-2 text-sm">Track ambulance location and estimated arrival time live.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4"><VscWorkspaceTrusted /></div>
                  <h4 className="font-semibold text-lg text-gray-900">Trusted Service</h4>
                  <p className="text-gray-500 mt-2 text-sm">Verified ambulance partners with trained medical staff.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10">
                <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
                  <h4 className="text-3xl font-bold text-red-600">{30}</h4>
                  <p className="text-gray-500 mt-1 text-sm">Bookings</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
                  <h4 className="text-3xl font-bold text-red-600">{29}</h4>
                  <p className="text-gray-500 mt-1 text-sm">Ambulances</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
                  <h4 className="text-3xl font-bold text-red-600">{`24/7`}</h4>
                  <p className="text-gray-500 mt-1 text-sm">Support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-15 bg-white rounded-xl p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md" data-aos="fade-up">
            <div>
              <h3 className="text-3xl font-bold">Need Emergency Ambulance Service?</h3>
              <p className="text-gray-500 mt-3 text-lg">Book an ambulance quickly with QuickAmbu and get fast medical transportation support.</p>
            </div>

            {/* 👇 दूसरा स्मार्ट और कूदने वाला बटन */}
            <button
              onClick={handleBookAmbulanceClick}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-10 py-4 rounded-xl cursor-pointer shadow-lg"
              style={{ animation: 'buttonJump 1.5s ease-in-out infinite' }}
            >
              Book Ambulance Now
            </button>

          </div>
        </div>
      </div>

      {/* --- FOOTER CALL TO ACTION --- */}
      <footer className="bg-red-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="bg-white/10 p-3 rounded-full hidden sm:block"><Phone size={24} className="text-white" /></div>
            <div>
              <h4 className="font-bold text-lg">Need immediate help?</h4>
              <p className="text-red-100 text-xs">Call us now for the fastest response</p>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 hover:bg-red-50 transition-all w-full sm:w-auto justify-center text-base cursor-pointer"
          >
            <Phone size={18} className="fill-current" />
            Emergency Call
          </a>
        </div>
      </footer>
      <Footer />
    </div>
  );
}