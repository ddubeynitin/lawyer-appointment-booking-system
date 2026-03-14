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

/* ================= FULL LANDING PAGE ================= */
const Home = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-800">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <FaBalanceScale />
            <span className="tracking-wide">LexLink</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              to="/client/lawyer-list"
              className="hover:text-blue-600 transition flex items-center gap-2"
            >
              <FaSearch /> Find Lawyer
            </Link>
            <Link
              to="/specializations"
              className="hover:text-blue-600 transition"
            >
              Specializations
            </Link>
            <Link
              to="/auth/register"
              className="hover:text-blue-600 transition"
            >
              Join as Lawyer
            </Link>
            <Link
              to="/about"
              className="hover:text-blue-600 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-blue-600 transition"
            >
              Contact Us
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-100 transition"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-105 transition"
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
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Legal Expert
            </span>{" "}
            Today
          </h1>

          <p className="text-slate-500 max-w-2xl mx-auto mb-12 text-lg">
            Connect with top-rated lawyers for expert legal advice and seamless
            appointment booking. Secure your future with professional counsel.
          </p>

          {/* Search Bar */}
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

            <button className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 text-sm font-semibold hover:scale-105 transition">
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

      {/* ================= TOP SPECIALIZATIONS ================= */}
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

      {/* ================= FEATURED LAWYERS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Featured Lawyers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <LawyerCard name="Alice Johnson" specialization="Family Law" rating={5} />
            <LawyerCard name="Michael Lee" specialization="Corporate Law" rating={4} />
            <LawyerCard name="Sophia Davis" specialization="Criminal Defense" rating={5} />
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE LEXLINK ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose LexLink</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard title="Verified Lawyers" desc="All lawyers are verified for credibility." icon={<FaBalanceScale />} />
            <FeatureCard title="Easy Booking" desc="Book consultations with just a few clicks." icon={<FaBriefcase />} />
            <FeatureCard title="Secure Payments" desc="Safe and secure payment methods." icon={<FaGavel />} />
            <FeatureCard title="24/7 Support" desc="Our team is here to help anytime." icon={<FaHome />} />
          </div>
        </div>
      </section>

      {/* ================= PLATFORM STATISTICS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Platform Statistics</h2>
          <div className="grid md:grid-cols-3 gap-8 text-slate-700">
            <StatCard value="10,000+" label="Clients Served" />
            <StatCard value="500+" label="Lawyers Available" />
            <StatCard value="95%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 bg-slate-50">
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

      {/* ================= FAQ ================= */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <FAQItem question="How do I book a lawyer?" answer="Search by specialization and location, then select a lawyer and schedule a consultation." />
            <FAQItem question="What payment methods are accepted?" answer="We accept credit cards, debit cards, and secure online payments." />
            <FAQItem question="Can I cancel or reschedule appointments?" answer="Yes, you can manage your appointments from your dashboard." />
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="mb-8">Find your lawyer today or join LexLink as a professional.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/auth/register"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:scale-105 transition"
          >
            Find a Lawyer
          </Link>
          <Link
            to="/auth/register"
            className="px-6 py-3 border border-white font-semibold rounded-xl hover:scale-105 transition"
          >
            Join as Lawyer
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">LexLink</h3>
            <p className="text-sm">
              Connecting people with world-class legal professionals.
            </p>
          </div>

          <FooterCol title="Platform" items={["Find Lawyer", "Specializations", "Pricing"]} />
          <FooterCol title="Company" items={["About", "Careers", "Blog"]} />
          <FooterCol title="Support" items={["Help Center", "Contact", "Privacy", "Terms"]} />
        </div>

        <p className="text-center text-xs mt-12 text-slate-500">
          © 2024 LexLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* ================= COMPONENTS ================= */
const PremiumCard = ({ icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 border border-slate-100 text-center">
    <div className="text-blue-600 text-3xl mb-4 flex justify-center">{icon}</div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const SpecCard = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl hover:scale-105 transition border border-slate-100">
    <h4 className="font-semibold text-lg">{title}</h4>
  </div>
);

const LawyerCard = ({ name, specialization, rating, photo, address }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
    
    {/* Lawyer Photo */}
    <div className="h-48 w-full overflow-hidden">
      <img 
        src={photo} 
        alt={name} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
    </div>

    <div className="p-6 text-center">
      {/* Name */}
      <h4 className="font-semibold text-lg mb-1">{name}</h4>

      {/* Specialization */}
      <p className="text-sm text-slate-500 mb-1">{specialization}</p>

      {/* Address */}
      <p className="text-xs text-slate-400 mb-2">{address}</p>

      {/* Rating */}
      <div className="flex justify-center gap-1 text-yellow-400">
        {[...Array(rating)].map((_, i) => <FaStar key={i} />)}
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100 text-center">
    <div className="text-blue-600 text-3xl mb-4 flex justify-center">{icon}</div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100">
    <h3 className="text-3xl font-bold mb-2">{value}</h3>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const Testimonial = ({ name }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl transition">
    <div className="flex justify-center gap-1 text-yellow-400 mb-4">
      {[...Array(5)].map((_, i) => <FaStar key={i} />)}
    </div>
    <p className="text-sm text-slate-500 mb-4">
      “LexLink made the entire process seamless and professional.”
    </p>
    <p className="font-semibold text-center">{name}</p>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer">
    <h4 className="font-semibold mb-2">{question}</h4>
    <p className="text-sm text-slate-500">{answer}</p>
  </div>
);

const FooterCol = ({ title, items }) => (
  <div>
    <h4 className="text-white font-semibold mb-4">{title}</h4>
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="hover:text-white cursor-pointer transition">{item}</li>
      ))}
    </ul>
  </div>
);

export default Home;