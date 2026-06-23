import React from 'react'
import { FaFacebookF } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <>
      <div className="bg-[#0f172a] text-white pt-15 pb-8 px-5 sm:px-8 lg:px-16 overflow-hidden">

        <div className="max-w-7xl mx-auto">

          {/* Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Logo + About */}
            <div>
              <h2 className="text-3xl font-bold text-red-500">
                QuickAmbu
              </h2>

              <p className="text-gray-400 mt-5 leading-8 text-[15px]">
                QuickAmbu provides fast, reliable, and emergency ambulance booking services across India.
                We help patients connect with nearby ambulance providers instantly.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-6">

                <div className="w-11 h-11 rounded-full bg-slate-800 hover:bg-red-600 transition flex items-center justify-center cursor-pointer">
                  <FaFacebookF />
                </div>

                <div className="w-11 h-11 rounded-full bg-slate-800 hover:bg-red-600 transition flex items-center justify-center cursor-pointer">
                  <FaInstagram />
                </div>

                <div className="w-11 h-11 rounded-full bg-slate-800 hover:bg-red-600 transition flex items-center justify-center cursor-pointer">
                  <a href="https://www.youtube.com/@codechurue"><FaYoutube /></a>
                </div>

                <div className="w-11 h-11 rounded-full bg-slate-800 hover:bg-red-600 transition flex items-center justify-center cursor-pointer">
                  <FaLinkedinIn />
                </div>

              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Quick Links
              </h3>

              <ul className="space-y-4 text-gray-400 text-[15px]">

                <li className="hover:text-red-500 transition cursor-pointer">
                  Home
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  About Us
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Ambulance Services
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Contact Us
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Emergency Booking
                </li>
                <Link to="/admin"><li className="hover:text-red-500 transition cursor-pointer">
                  Emergency Booking
                </li></Link>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Our Services
              </h3>

              <ul className="space-y-4 text-gray-400 text-[15px]">

                <li className="hover:text-red-500 transition cursor-pointer">
                  ICU Ambulance
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Oxygen Ambulance
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Air Ambulance
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  Emergency Transport
                </li>

                <li className="hover:text-red-500 transition cursor-pointer">
                  24/7 Ambulance Service
                </li>

              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Contact Info
              </h3>

              <div className="space-y-5 text-gray-400 text-[15px]">

                <div className="flex gap-4">
                  <div className="text-red-500 text-xl mt-1">
                    <FaLocationDot />
                  </div>

                  <p>
                    New Delhi, India
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="text-red-500 text-xl mt-1">
                    <FaPhoneAlt />
                  </div>

                  <p>
                    +91 9876543210
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="text-red-500 text-xl mt-1">
                    <MdEmail />
                  </div>

                  <p>
                    support@quickambu.com
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="text-red-500 text-xl mt-1">
                    <FaClock />
                  </div>

                  <p>
                    24/7 Emergency Support
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 mt-14 pt-8">

            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

              <p className="text-gray-400 text-sm text-center">
                PowordBy <a className='hover:text-red-500 text-white' href="https://www.bing.com/images/search?view=detailV2&ccid=JO7R9hq6&id=034AA17F59B25E31D0298AD7BB7C1953D0129597&thid=OIP.JO7R9hq6VomFQuymHmgBeAHaEK&mediaurl=https%3a%2f%2fi.ytimg.com%2fvi%2fqP_xtxRAhXg%2fmaxresdefault.jpg&exph=720&expw=1280&q=code+churu&FORM=IRPRST&ck=04722C99426765C083A2B600DBA498D4&selectedIndex=0&itb=0">Code Churu</a>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">

                <p className="hover:text-red-500 transition cursor-pointer">
                  Privacy Policy
                </p>

                <p className="hover:text-red-500 transition cursor-pointer">
                  Terms & Conditions
                </p>

                <p className="hover:text-red-500 transition cursor-pointer">
                  Help Center
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  )
}

export default Footer;