import { motion } from "framer-motion";

const AboutUs = () => {
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
          <h1 className="text-4xl font-bold mb-4">
            Lawyer Appointment Booking System
          </h1>
          <p className="text-lg opacity-90">
            Connecting Clients with Professional Legal Experts Easily
          </p>
        </motion.div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          <motion.img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
            alt="lawyer"
            className="rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              About Our Platform
            </h2>

            <p className="text-gray-600 mb-4">
              The Lawyer Appointment Booking System is a modern web-based 
              application designed to simplify the process of connecting 
              clients with professional lawyers. Users can search for lawyers 
              based on specialization, location, and experience, and schedule 
              appointments online.
            </p>

            <p className="text-gray-600">
              This platform eliminates manual booking processes and improves 
              communication between lawyers and clients. It provides a secure 
              and efficient environment for managing legal appointments.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "User Registration & Login",
              "Search Lawyers by Specialization",
              "Online Appointment Booking",
              "Lawyer Accept / Reject Requests",
              "Admin Dashboard Management",
              "Real-time Notifications"
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg text-blue-500">
                  {feature}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Vision */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-8 rounded-2xl shadow"
          >
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Our Mission
            </h3>
            <p className="text-gray-600">
              Our mission is to provide a reliable and user-friendly platform 
              that connects clients with legal professionals quickly and 
              efficiently while improving accessibility to legal services.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-8 rounded-2xl shadow"
          >
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600">
              We aim to build a digital ecosystem where legal services become 
              more transparent, accessible, and efficient for both clients 
              and lawyers.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;