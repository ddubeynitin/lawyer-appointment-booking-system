import { Link } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaBriefcase,
  FaBalanceScale,
  FaGavel,
  FaHome,
} from "react-icons/fa";

const Home = () => {
  return (
    <div className="w-full bg-white text-gray-900">
      {/* ================= HEADER ================= */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <FaBalanceScale />
            LexLink
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/find-lawyer" className="hover:text-blue-600">
              Find a Lawyer
            </Link>
            <Link to="/for-lawyers" className="hover:text-blue-600">
              For Lawyers
            </Link>
            <Link to="/specializations" className="hover:text-blue-600">
              Specializations
            </Link>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <span className="inline-block mb-4 px-4 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
            TRUSTED BY OVER 10,000 CLIENTS
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find the Right{" "}
            <span className="text-blue-600">Legal Expert</span>
            <br /> Today
          </h1>

          <p className="max-w-2xl mx-auto text-gray-500 mb-10">
            Connect with top-rated lawyers for expert legal advice and seamless
            appointment booking. Secure your future with professional counsel.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl flex flex-col md:flex-row items-center overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 w-full border-b md:border-b-0 md:border-r">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Specialization (e.g. Family Law)"
                className="w-full outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 w-full border-b md:border-b-0 md:border-r">
              <FaMapMarkerAlt className="text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                className="w-full outline-none text-sm"
              />
            </div>

            <button className="bg-blue-600 text-white px-8 py-3 text-sm font-medium hover:bg-blue-700 w-full md:w-auto">
              Search Now
            </button>
          </div>
        </div>
      </section>

      {/* ================= IMAGE SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
            alt="office"
            className="w-full h-[350px] object-cover"
          />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Our platform streamlines the legal consultation process from start
            to finish.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Clients */}
            <div>
              <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                For Clients
              </span>

              <div className="mt-6 space-y-4">
                <InfoCard
                  icon={<FaSearch />}
                  title="Search Experts"
                  desc="Find top lawyers by specialization, experience, and location."
                />
                <InfoCard
                  icon={<FaBriefcase />}
                  title="Book Instantly"
                  desc="Choose a time that works for you and book a consultation."
                />
                <InfoCard
                  icon={<FaGavel />}
                  title="Secure Consultation"
                  desc="Consult via video call or in-person securely."
                />
              </div>
            </div>

            {/* For Lawyers */}
            <div>
              <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
                For Lawyers
              </span>

              <div className="mt-6 space-y-4">
                <InfoCard
                  icon={<FaHome />}
                  title="List Your Practice"
                  desc="Create a professional profile and showcase expertise."
                />
                <InfoCard
                  icon={<FaBriefcase />}
                  title="Manage Schedule"
                  desc="Control availability and manage appointments easily."
                />
                <InfoCard
                  icon={<FaBalanceScale />}
                  title="Grow Revenue"
                  desc="Reach more clients and grow your legal practice."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SPECIALIZATIONS ================= */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">Top Specializations</h2>
            <Link to="/specializations" className="text-blue-600 text-sm">
              View All Categories →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <SpecCard title="Family Law" desc="Divorce, Custody, Mediation" />
            <SpecCard title="Corporate Law" desc="M&A, Contracts, Startups" />
            <SpecCard title="Criminal Defense" desc="Felonies, Misdemeanors" />
            <SpecCard title="Real Estate" desc="Property, Leasing, Zoning" />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Join thousands of satisfied clients who found their legal partner.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              name="Sarah Jenkins"
              role="Small Business Owner"
              text="LexLink made finding a reliable lawyer incredibly easy."
            />
            <Testimonial
              name="Robert Chen"
              role="Corporate Attorney"
              text="A great platform to connect with serious clients."
            />
            <Testimonial
              name="David Thompson"
              role="Real Estate Developer"
              text="The consultation process was seamless and efficient."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">
            Ready to find your legal partner?
          </h2>
          <p className="mb-8">
            Whether you're a client or a lawyer, we have the tools you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find-lawyer"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium"
            >
              Book a Consultation
            </Link>
            <Link
              to="/signup"
              className="border border-white px-6 py-3 rounded-lg font-medium"
            >
              Join as a Lawyer
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">LexLink</h3>
            <p className="text-sm">
              Connecting people with world-class legal professionals.
            </p>
          </div>

          <FooterCol title="Platform" items={["Find a Lawyer", "Pricing Plans", "Consultation Guide"]} />
          <FooterCol title="Company" items={["About Us", "Careers", "Press"]} />
          <FooterCol title="Support" items={["Help Center", "Privacy Policy", "Terms of Service"]} />
        </div>

        <p className="text-center text-xs mt-10">
          © 2024 LexLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const InfoCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 p-5 rounded-xl flex gap-4">
    <div className="text-blue-600 text-xl">{icon}</div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </div>
);

const SpecCard = ({ title, desc }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const Testimonial = ({ name, role, text }) => (
  <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
    <div className="flex gap-1 text-yellow-400 mb-2">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} />
      ))}
    </div>
    <p className="text-sm text-gray-600 mb-4">"{text}"</p>
    <p className="font-semibold">{name}</p>
    <p className="text-xs text-gray-500">{role}</p>
  </div>
);

const FooterCol = ({ title, items }) => (
  <div>
    <h4 className="text-white font-semibold mb-3">{title}</h4>
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="hover:text-white cursor-pointer">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Home;
