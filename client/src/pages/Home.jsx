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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">

      {/* ================= PREMIUM HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <FaBalanceScale />
            <span className="tracking-wide">LexLink</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">
              Find a Lawyer
            </Link>
            <Link to="/for-lawyers" className="hover:text-blue-600 transition">
              For Lawyers
            </Link>
            <Link to="/specializations" className="hover:text-blue-600 transition">
              Specializations
            </Link>
            <Link to="/about" className="hover:text-blue-600 transition">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-100 transition"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="py-24 text-center">
        <div className="max-w-5xl mx-auto px-6">

          <span className="inline-block mb-6 px-4 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
            TRUSTED BY 10,000+ CLIENTS
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Find the Right{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Legal Expert
            </span>{" "}
            Today
          </h1>

          <p className="text-slate-500 max-w-2xl mx-auto mb-12 text-lg">
            Connect with top-rated lawyers for expert legal advice and seamless
            appointment booking. Secure your future with professional counsel.
          </p>

          {/* Premium Search */}
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl flex flex-col md:flex-row items-center overflow-hidden border border-slate-200 hover:shadow-2xl transition">

            <div className="flex items-center gap-3 px-6 py-4 w-full border-b md:border-b-0 md:border-r">
              <FaSearch className="text-slate-400" />
              <input
                type="text"
                placeholder="Specialization (e.g. Family Law)"
                className="w-full outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3 px-6 py-4 w-full border-b md:border-b-0 md:border-r">
              <FaMapMarkerAlt className="text-slate-400" />
              <input
                type="text"
                placeholder="Location"
                className="w-full outline-none text-sm"
              />
            </div>

            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 text-sm font-semibold hover:scale-105 transition">
              Search Now
            </button>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-slate-500 mb-16">
            Simple. Secure. Professional.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <PremiumCard
              icon={<FaSearch />}
              title="Search Experts"
              desc="Find top lawyers by specialization and location."
            />
            <PremiumCard
              icon={<FaBriefcase />}
              title="Book Instantly"
              desc="Choose a time that works for you."
            />
            <PremiumCard
              icon={<FaGavel />}
              title="Secure Consultation"
              desc="Video or in-person consultations."
            />
          </div>
        </div>
      </section>

      {/* ================= SPECIALIZATIONS ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Top Specializations
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <SpecCard title="Family Law" />
            <SpecCard title="Corporate Law" />
            <SpecCard title="Criminal Defense" />
            <SpecCard title="Real Estate" />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Trusted by Thousands
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Testimonial name="Sarah Jenkins" />
            <Testimonial name="Robert Chen" />
            <Testimonial name="David Thompson" />
          </div>
        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">LexLink</h3>
            <p className="text-sm">
              Connecting people with world-class legal professionals.
            </p>
          </div>

          <FooterCol title="Platform" items={["Find Lawyer", "Pricing", "Guide"]} />
          <FooterCol title="Company" items={["About", "Careers", "Press"]} />
          <FooterCol title="Support" items={["Help Center", "Privacy", "Terms"]} />
        </div>

        <p className="text-center text-xs mt-12 text-slate-500">
          © 2024 LexLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* ================= PREMIUM COMPONENTS ================= */

const PremiumCard = ({ icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 border border-slate-100 text-center">
    <div className="text-blue-600 text-3xl mb-4 flex justify-center">
      {icon}
    </div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const SpecCard = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl hover:scale-105 transition border border-slate-100">
    <h4 className="font-semibold text-lg">{title}</h4>
  </div>
);

const Testimonial = ({ name }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl transition">
    <div className="flex justify-center gap-1 text-yellow-400 mb-4">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} />
      ))}
    </div>
    <p className="text-sm text-slate-500 mb-4">
      “LexLink made the entire process seamless and professional.”
    </p>
    <p className="font-semibold text-center">{name}</p>
  </div>
);

const FooterCol = ({ title, items }) => (
  <div>
    <h4 className="text-white font-semibold mb-4">{title}</h4>
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="hover:text-white cursor-pointer transition">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Home;
