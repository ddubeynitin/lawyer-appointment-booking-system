import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 text-center"
        >
          <button onClick={ () => navigate(-1) } className="flex gap-2 justify-center items-center bg-white text-blue-600 hover:bg-gray-200 font-bold py-2 px-4 rounded-full">
                      <FaArrowLeft/> Back
                    </button>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg opacity-90">
            We'd love to hear from you. Get in touch with us.
          </p>
        </motion.div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-10">
        
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Send Message
          </h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
              type="text"
              placeholder="Subject"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            ></textarea>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Address
            </h3>
            <p className="text-gray-600">
              Surat, Gujarat, India
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Phone
            </h3>
            <p className="text-gray-600">+91 98765 43210</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Email
            </h3>
            <p className="text-gray-600">support@lawyerbooking.com</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Working Hours
            </h3>
            <p className="text-gray-600">
              Monday - Saturday: 9 AM - 7 PM
            </p>
          </div>
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          <iframe
            title="map"
            src="https://maps.google.com/maps?q=Surat&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-80 border-0"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </motion.div>
      </div>

    </div>
  );
};

export default ContactUs;