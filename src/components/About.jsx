import React, { useEffect } from 'react';
import { FaAmbulance } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { FcLike } from "react-icons/fc";
import { Link } from 'react-router-dom';
// import { IoIosArrowRoundBack } from "react-icons/io"; // अगर इस्तेमाल नहीं हो रहा तो इसे हटा सकते हैं
import Footer from './Footer';
import Logo from '../assets/logo.png';

// 👇 1. AOS और उसकी CSS को इम्पोर्ट करें
import AOS from 'aos';
import 'aos/dist/aos.css';

function About() {
  
  // 👇 2. पेज लोड होते ही एनिमेशन चालू करने के लिए useEffect
  useEffect(() => {
    AOS.init({
      duration: 800, // एनिमेशन कितनी देर चलेगा (800ms = 0.8 seconds)
      easing: 'ease-in-out', // स्मूथ इफ़ेक्ट के लिए
      once: true, // स्क्रॉल करने पर एनिमेशन सिर्फ एक बार हो
    });
  }, []);

  return (
    <>
      {/* About Section */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-red-600 font-bold text-2xl flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Link to="/"><img src={Logo} alt="logo" className="w-15" /></Link>
                <div>
                  <span className="block leading-none tracking-tight">QuickAmbu</span>
                  <span className="block text-xs uppercase tracking-widest text-slate-500 font-semibold">Ambulance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#faf7f7] py-8 px-6 lg:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">

          {/* Top Heading */}
          {/* 👇 3. यहाँ fade-up लगाया है */}
          <div className="text-center mb-15" data-aos="fade-up">
            <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-semibold">
              ABOUT QUICKAMBU
            </span>

            <h2 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900 leading-tight">
              India’s Trusted <span className="text-red-600">Ambulance Booking</span> Platform
            </h2>

            <p className="text-gray-500 max-w-3xl mx-auto mt-5 text-lg leading-8">
              QuickAmbu helps patients and families book ambulances quickly during emergencies.
              We connect users with nearby ambulance providers for fast, safe, and reliable medical transport.
            </p>
          </div>

          {/* Main About Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Image */}
            {/* 👇 इमेज को दाईं तरफ से उभरने का इफ़ेक्ट दिया है */}
            <div className="relative" data-aos="fade-right" data-aos-delay="200">
              <div className="bg-red-100 absolute -top-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-60"></div>

              <img
                src="https://img.mathrubhumi.com/view/acePublic/alias/contentid/1i4id69iprkvtz1xpvr/1/ambulance.webp?f=3:2&q=0.75&w=900"
                alt="QuickAmbu Ambulance"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>

            {/* Right Content */}
            <div data-aos="fade-left" data-aos-delay="200">
              <h3 className="text-3xl font-bold text-gray-900 leading-snug">
                Fast Ambulance Booking With Advanced Medical Support
              </h3>

              <p className="text-gray-600 mt-6 leading-8 text-lg">
                QuickAmbu is designed to reduce ambulance waiting time and make emergency transportation easier.
                Users can instantly book ambulances according to their medical needs and select additional life-saving features.
              </p>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-5 mt-8">

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="300">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4">
                    <FaAmbulance />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">Instant Booking</h4>
                  <p className="text-gray-500 mt-2 text-sm">Book nearby ambulances within seconds anytime, anywhere.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="400">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4">
                    <FcLike />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">Emergency Support</h4>
                  <p className="text-gray-500 mt-2 text-sm">Advanced life support and emergency medical facilities available.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="500">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4">
                    <FaLocationDot />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">Live Tracking</h4>
                  <p className="text-gray-500 mt-2 text-sm">Track ambulance location and estimated arrival time live.</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="600">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4">
                    <VscWorkspaceTrusted />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">Trusted Service</h4>
                  <p className="text-gray-500 mt-2 text-sm">Verified ambulance partners with trained medical staff.</p>
                </div>

              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-10" data-aos="zoom-in" data-aos-delay="700">
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

          {/* Bottom CTA */}
          <div className="mt-15 bg-white rounded-xl p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md" data-aos="fade-up" data-aos-offset="50">
            <div>
              <h3 className="text-3xl font-bold">
                Need Emergency Ambulance Service?
              </h3>
              <p className="text-gray-500 mt-3 text-lg">
                Book an ambulance quickly with QuickAmbu and get fast medical transportation support.
              </p>
            </div>

            <button className="bg-red-500 text-white font-semibold px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg">
              Book Ambulance Now
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default About;