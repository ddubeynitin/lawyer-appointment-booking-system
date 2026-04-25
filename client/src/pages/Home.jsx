import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaBriefcase,
  FaBalanceScale,
  FaGavel,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaUserTie,
  FaPowerOff,
  FaComments,
  FaRobot,
  FaCheckCircle,
  FaCalendarCheck,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../utils/api";
import CountUp from "react-countup";
import { TfiMenuAlt } from "react-icons/tfi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

// ScrollReveal component using framer-motion
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
};

/* ================= FULL LANDING PAGE ================= */
const Home = () => {
  const { data, loading, error } = useFetch(`${API_URL}/lawyers/featured`);
  const [featuredLawyers, setFeaturedLawyers] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const typewriterPhrases = [
    "AI-powered legal guidance in seconds",
    "Verified lawyers for every case",
    "Schedule consultations instantly",
    "Manage your appointments with confidence",
  ];
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [heroSearchTerm, setHeroSearchTerm] = useState("");
  const [heroLocation, setHeroLocation] = useState("");

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    const trimmedSearch = heroSearchTerm.trim();
    const trimmedLocation = heroLocation.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (trimmedLocation) {
      params.set("location", trimmedLocation);
    }

    const queryString = params.toString();
    navigate(
      queryString
        ? `/client/lawyer-list?${queryString}`
        : "/client/lawyer-list",
    );
  };

  const { data: statsData } = useFetch(`${API_URL}/stats`);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  useEffect(() => {
    const typingSpeed = 10;
    const pauseTime = 1500;
    let timeout;

    const handleType = () => {
      const currentPhrase = typewriterPhrases[typewriterIndex];
      const nextText = isDeleting
        ? currentPhrase.slice(0, typewriterText.length - 1)
        : currentPhrase.slice(0, typewriterText.length + 1);

      setTypewriterText(nextText);

      if (!isDeleting && nextText === currentPhrase) {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && nextText === "") {
        setIsDeleting(false);
        setTypewriterIndex((prev) => (prev + 1) % typewriterPhrases.length);
      } else {
        timeout = setTimeout(
          handleType,
          isDeleting ? typingSpeed / 2 : typingSpeed,
        );
      }
    };

    timeout = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, typewriterIndex]);

  const featuredLawyersOffline = [
    {
      name: "Alice Johnson",
      specialization: "Family Law",
      experience: 10,
      profileImage: "/assets/images/professional-peoples.png",
      averageRating: 5,
    },
    {
      name: "Michael Lee",
      specialization: "Corporate Law",
      experience: 15,
      profileImage: "/assets/images/professional-peoples.png",
      averageRating: 4,
    },
    {
      name: "Sophia Davis",
      specialization: "Criminal Defense",
      experience: 12,
      profileImage: "/assets/images/professional-peoples.png",
      averageRating: 5,
    },
  ];

  const getFeaturedLawyers = () => {
    // Avoid showing fallback while the request is still in progress
    if (loading) return;
    console.log(data);

    if (error || !data || !Array.isArray(data.lawyers)) {
      console.error("Error fetching featured lawyers:", error);
      setFeaturedLawyers(featuredLawyersOffline);
      return;
    }

    const normalized = data.lawyers.map((lawyer) => ({
      name: lawyer.name,
      specialization: Array.isArray(lawyer.specializations)
        ? lawyer.specializations[0]
        : "Lawyer",
      experience: lawyer.experience,
      profileImage:
        lawyer.profileImage?.url || "/assets/images/professional-peoples.png",
      averageRating: lawyer.rating || 0,
    }));

    setFeaturedLawyers(normalized);
  };

  useEffect(() => {
    getFeaturedLawyers();
  }, [loading, error, data]);

  const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };

  const handleLogout = () => {
    logout();
  };

  const navLinkClass =
    "group inline-flex items-center gap-2 transition hover:text-blue-600";
  const navIconClass = "text-slate-400 transition group-hover:text-blue-600";
  return (
    <div className="min-h-screen bg-white bg-linear-to-r from-white to-blue-200 text-slate-800 font-barlow">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div onClick={showMenu} className="sm:hidden">
            <TfiMenuAlt />
            {isMenuVisible && (
              <div className="absolute top-17 left-0 w-50 rounded-br-2xl rounded-tr-2xl bg-white pt-5 pb-5">
                {/* Navigation */}
                <nav className="flex flex-col md:hidden items-center gap-8 text-sm font-medium text-slate-600">
                  {user && user.role === "lawyer" ? (
                    ""
                  ) : (
                    <Link to="/client/lawyer-list" className={navLinkClass}>
                      <FaSearch className={navIconClass} /> Find Lawyer
                    </Link>
                  )}
                  {user ? (
                    <Link
                      to={
                        user.role == "lawyer"
                          ? "/lawyer/lawyer-dashboard"
                          : "/client/client-dashboard"
                      }
                      className={navLinkClass}
                    >
                      <FaHome className={navIconClass} /> Your Dashboard
                    </Link>
                  ) : (
                    ""
                  )}
                  <Link to="/about" className={navLinkClass}>
                    <FaInfoCircle className={navIconClass} /> About
                  </Link>
                  <Link to="/contact" className={navLinkClass}>
                    <FaEnvelope className={navIconClass} /> Contact Us
                  </Link>
                </nav>
              </div>
            )}
          </div>
          {/* Logo */}
          <Link to="/">
            <div className="w-23 h-15 flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/images/justifai_logo_blue_1.png"
                alt="logo"
                className="w-full h-full"
              />
            </div>
          </Link>
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {user && user.role === "lawyer" ? (
              ""
            ) : (
              <Link to="/client/lawyer-list" className={navLinkClass}>
                <FaSearch className={navIconClass} /> Find Lawyer
              </Link>
            )}
            {user ? (
              <Link
                to={
                  user.role == "lawyer"
                    ? "/lawyer/lawyer-dashboard"
                    : "/client/client-dashboard"
                }
                className={navLinkClass}
              >
                <FaHome className={navIconClass} /> Your Dashboard
              </Link>
            ) : (
              ""
            )}
            {user ? (
              ""
            ) : (
              <Link to="/auth/register" className={navLinkClass}>
                <FaUserTie className={navIconClass} /> Join as Lawyer
              </Link>
            )}
            <Link to="/about" className={navLinkClass}>
              <FaInfoCircle className={navIconClass} /> About
            </Link>
            <Link to="/contact" className={navLinkClass}>
              <FaEnvelope className={navIconClass} /> Contact Us
            </Link>
          </nav>

          {user ? (
            (user.profileImage?.url || user.profilePicture) ? (
              <>
                <div className=" w-40 flex justify-center items-center gap-5 ">
                  <button
                    onClick={handleLogout}
                    className="border flex gap-2 justify-center items-center px-2 py-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    {" "}
                    <FaPowerOff /> Logout
                  </button>
                  <img
                    src={user.profileImage?.url || user.profilePicture}
                    alt={user.name || "User profile"}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div className=" w-40 flex justify-center items-center gap-5 ">
                  <button
                    onClick={handleLogout}
                    className="border flex gap-2 justify-center items-center px-2 py-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    {" "}
                    <FaPowerOff /> Logout
                  </button>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold uppercase text-blue-600 ring-2 ring-blue-500">
                    {user.name?.charAt(0) || "U"}
                  </div>
                </div>
              </>
            )
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="py-14 text-center">
        <ScrollReveal className="max-w-5xl mx-auto px-6">
          <span className="inline-block mb-2 px-4 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full text-uppercase tracking-wide">
            Trusted by 100% Genuine Clients
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Find the Right{" "}
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Legal Expert
            </span>{" "}
            Today
          </h1>
          <div className="h-20 w-full rounded-2xl flex justify-center items-center">
            <h1 className="lg:text-4xl md:text-2xl font-mono font-bold leading-tight mb-12 text-blue-600/80 uppercase tracking-wide">
              {typewriterText}
              <span className="inline-block w-1 h-4 bg-gray-300 animate-pulse ml-1" />
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-lg">
            Connect with verified lawyers, secure payments, and AI-powered legal
            support — all in one secure platform.
          </p>

          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4 text-sm text-slate-600 mb-10">
            <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 flex items-center gap-3 shadow-sm">
              <FaCheckCircle className="text-blue-600 text-xl" />
              <div>
                <p className="font-semibold">Verified Lawyers</p>
                <p className="text-slate-500">
                  Trusted legal experts with approval checks.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 flex items-center gap-3 shadow-sm">
              <FaCalendarCheck className="text-blue-600 text-xl" />
              <div>
                <p className="font-semibold">Instant Booking</p>
                <p className="text-slate-500">
                  Schedule consultations in just a few clicks.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 flex items-center gap-3 shadow-sm">
              <FaComments className="text-blue-600 text-xl" />
              <div>
                <p className="font-semibold">Secure Messaging</p>
                <p className="text-slate-500">
                  Chat directly with your lawyer on the platform.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 flex items-center gap-3 shadow-sm">
              <FaRobot className="text-blue-600 text-xl" />
              <div>
                <p className="font-semibold">AI Guidance</p>
                <p className="text-slate-500">
                  Get smart legal assistance and booking help.
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl flex flex-col md:flex-row items-center overflow-hidden border border-slate-200 hover:shadow-2xl transition">
            <div className="flex items-center gap-3 px-6 py-4 w-full border-b border-gray-200 md:border-b-0 md:border-r">
              <FaSearch className="text-slate-400" />
              <input
                type="text"
                value={heroSearchTerm}
                onChange={(event) => setHeroSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleHeroSearch();
                  }
                }}
                placeholder="Specialization (e.g. Family Law)"
                className="w-full outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3 px-6 py-4 w-full border-b border-gray-200 md:border-b-0 md:border-r">
              <FaMapMarkerAlt className="text-slate-400" />
              <input
                type="text"
                value={heroLocation}
                onChange={(event) => setHeroLocation(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleHeroSearch();
                  }
                }}
                placeholder="Location"
                className="w-full outline-none text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleHeroSearch}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white w-full px-10 py-4 text-sm font-semibold hover:scale-105 transition"
            >
              Search Now
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-center text-slate-500 mb-16">
              Quickly discover verified lawyers, book a consultation, and manage
              your case from one dashboard.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <PremiumCard
                icon={<FaSearch />}
                title="Find Verified Lawyers"
                desc="Search by practice area, ratings, and availability."
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <PremiumCard
                icon={<FaCalendarCheck />}
                title="Book Appointments"
                desc="Pick a date and secure your consultation instantly."
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <PremiumCard
                icon={<FaComments />}
                title="Chat & Follow Up"
                desc="Keep conversations and appointment details in one place."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= TOP SPECIALIZATIONS ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-16">
              Popular Practice Areas
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Family Law",
              "Corporate Law",
              "Criminal Defense",
              "Real Estate",
              "Immigration",
              "Employment Law",
              "Personal Injury",
              "Intellectual Property",
            ].map((title, index) => (
              <ScrollReveal key={title} delay={index * 80}>
                <SpecCard title={title} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED LAWYERS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-16">
              Featured Lawyers
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredLawyers.map((lawyer, index) => (
              <ScrollReveal key={lawyer.name} delay={index * 140}>
                <LawyerCard
                  name={lawyer.name}
                  specialization={lawyer.specialization}
                  rating={lawyer.averageRating || 5}
                  photo={lawyer.profileImage}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE JUSTIFAI ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-12">Why Choose JustifAi</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-8">
            <ScrollReveal delay={0}>
              <FeatureCard
                title="Verified Lawyers"
                desc="Professionals approved and verified for quality service."
                icon={<FaCheckCircle />}
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <FeatureCard
                title="Fast Booking"
                desc="Find availability and confirm appointments instantly."
                icon={<FaCalendarCheck />}
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <FeatureCard
                title="AI Guidance"
                desc="Get smart legal suggestions and booking help from AI."
                icon={<FaRobot />}
              />
            </ScrollReveal>
            <ScrollReveal delay={360}>
              <FeatureCard
                title="Secure Messaging"
                desc="Keep your conversations and case notes in one secure place."
                icon={<FaComments />}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM STATISTICS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-12">Platform Statistics</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 text-slate-700">
            <ScrollReveal delay={0}>
              <StatCard
                value={stats.totalClients || "10,000+"}
                label="Clients Served"
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <StatCard
                value={stats.activeLawyers || "500+"}
                label="Lawyers Available"
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <StatCard
                value={
                  stats.satisfactionRate ? `${stats.satisfactionRate}%` : "95%"
                }
                label="Satisfaction Rate"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-16">
              Trusted by Thousands
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {["Aditya Singh", "Vinit Sahu", "Gaurav Malhotra"].map(
              (name, index) => (
                <ScrollReveal key={name} delay={index * 120}>
                  <Testimonial name={name} />
                </ScrollReveal>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            <ScrollReveal delay={0}>
              <FAQItem
                question="How do I book a lawyer?"
                answer="Search by specialization and location, then select a lawyer and schedule a consultation."
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <FAQItem
                question="Can I ask for legal guidance before booking?"
                answer="Yes, use our AI assistant to get quick guidance and next-step recommendations."
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <FAQItem
                question="Can I cancel or reschedule appointments?"
                answer="Yes, you can manage your appointments from your dashboard."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="py-24 bg-white  text-center">
        <ScrollReveal className="px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to take the next step?
          </h2>
          <p className="mb-8">
            Connect with top lawyers, book secure consultations, and manage your
            legal journey with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/client/lawyer-list"
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:scale-105 transition"
            >
              Find a Lawyer
            </Link>
            <Link
              to="/auth/register"
              className="px-6 py-3 border border-blue-500 text-blue-500 font-semibold rounded-xl hover:scale-105 transition"
            >
              Join as Lawyer
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black/90 text-slate-400 py-16  overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 justify-center items-center ">
          <div className=" flex flex-col justify-center items-center ">
            <Link to="/">
              <div className="w-63 h-45 flex items-center gap-2 hover:scale-105 transition-transform duration-300">
                <img src="/assets/images/justifai_logo_blue_1.png" alt="logo" className="drop-shadow-2xl drop-shadow-blue-500 w-full h-full" />
              </div>
            </Link>
            <p className="text-sm w-full lg:w-3/4 text-center text-slate-500">
              Empowering clients with AI-backed legal support and trusted lawyer
              connections.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 justify-center px-10 md:justify-start">
            <FooterCol title="Platform" items={["Find Lawyer"]} />
            <FooterCol title="Company" items={["About"]} />
            <FooterCol title="Support" items={["Contact"]} />
          </div>
          <div className=" flex items-center justify-center">
            <img
              src="/assets/images/qr-code.png"
              alt="qr-code"
              className="lg:w-80 w-60 lg:h-80 h-60 hover:scale-140 transition-transform duration-300 hover:animate-pulse animate-none"
            />
          </div>
        </div>

        <p className="text-center text-xs mt-12 text-slate-500">
          © 2026 JustifAi. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* ================= COMPONENTS ================= */
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

const LawyerCard = ({ name, specialization, rating, photo }) => {
  const numericRating = Number(rating) || 0;
  const starCount = Math.max(0, Math.min(5, Math.round(numericRating)));

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
      {/* Lawyer Photo */}
      <div className=" w-full h-80 overflow-hidden">
        <img
          src={photo}
          alt={name}
          className="w-full h-fit object-fit bg-linear-to-br from-blue-400 via-sky-300 to-indigo-500 transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-6 text-center">
        {/* Name */}
        <h4 className="font-semibold text-lg mb-1">{name}</h4>

        {/* Specialization */}
        <p className="text-sm text-slate-500 mb-1">{specialization}</p>

        {/* Rating */}
        <div className="flex justify-center gap-1 text-yellow-400">
          {Array.from({ length: starCount }).map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {numericRating.toFixed(1)} / 5
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100 text-center">
    <div className="text-blue-600 text-3xl mb-4 flex justify-center">
      {icon}
    </div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100">
    <h3 className="text-3xl font-bold mb-2">
      <CountUp end={value} duration={2} separator="," />
    </h3>
    <p className="text-sm text-slate-500">{label}</p>
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
      “JustifAi made the entire process seamless and professional.”
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
        <li key={i} className="hover:text-white cursor-pointer transition">
          <Link
            to={
              item === "About"
                ? "/about"
                : item === "Find Lawyer"
                  ? "/client/lawyer-list"
                  : item === "Contact"
                    ? "/contact"
                    : ""
            }
          >
            {item}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Home;
