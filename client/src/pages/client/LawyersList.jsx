import React from "react";
import { FaGavel } from "react-icons/fa";
import { Link } from "react-router-dom";
import  useFetch  from "../../hooks/useFetch";
import LawyerCard from "../../components/common/LawyerCard";
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// const lawyers = [
//   {
//     name: "Sarah Jenkins, Esq.",
//     role: "Senior Family Attorney",
//     location: "San Francisco, CA",
//     rating: "4.9 (84)",
//     tags: ["Family Law", "Divorce", "Custody"],
//     price: "$250/hr",
//     availability: "Today",
//     img: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     name: "James Carter",
//     role: "Corporate & Startups",
//     location: "Oakland, CA",
//     rating: "5.0 (120)",
//     tags: ["Corporate", "IP Law"],
//     price: "$400/hr",
//     availability: "Mon, Oct 24",
//     img: "https://randomuser.me/api/portraits/men/32.jpg",
//   },
//   {
//     name: "Elena Rodriguez",
//     role: "Criminal Defense Expert",
//     location: "San Francisco, CA",
//     rating: "4.8 (45)",
//     tags: ["Criminal", "DUI", "Litigation"],
//     price: "$300/hr",
//     availability: "Tomorrow",
//     img: "https://randomuser.me/api/portraits/women/65.jpg",
//   },
//   {
//     name: "Michael Chang",
//     role: "Immigration Specialist",
//     location: "San Jose, CA",
//     rating: "4.7 (210)",
//     tags: ["Immigration", "Visas"],
//     price: "$200/hr",
//     availability: "Video Available",
//     img: "https://randomuser.me/api/portraits/men/54.jpg",
//   },
//   {
//     name: "Linda Silva",
//     role: "Tax Law Expert",
//     location: "San Francisco, CA",
//     rating: "5.0 (15)",
//     tags: ["Tax Law", "Audits"],
//     price: "$350/hr",
//     availability: "Today",
//     img: "https://randomuser.me/api/portraits/women/12.jpg",
//   },
//   {
//     name: "David Rossi",
//     role: "Real Estate Attorney",
//     location: "Berkeley, CA",
//     rating: "4.6 (72)",
//     tags: ["Property", "Contracts"],
//     price: "$275/hr",
//     availability: "Video Available",
//     img: "https://randomuser.me/api/portraits/men/76.jpg",
//   },
//   {
//     name: "Amit Verma",
//     role: "Corporate Lawyer",
//     location: "San Francisco, CA",
//     rating: "4.8 (98)",
//     tags: ["Corporate", "Compliance"],
//     price: "$320/hr",
//     availability: "Tomorrow",
//     img: "https://randomuser.me/api/portraits/men/85.jpg",
//   },
//   {
//     name: "Sophia Lee",
//     role: "Employment Lawyer",
//     location: "San Francisco, CA",
//     rating: "4.7 (88)",
//     tags: ["Employment", "HR Law"],
//     price: "$280/hr",
//     availability: "Tomorrow",
//     img: "https://randomuser.me/api/portraits/women/56.jpg",
//   },
// ];



function LawyerList() {
  const [lawyers, setLawyers] = React.useState([]);
  const { data, loading, error } = useFetch(`${API_URL}/api/lawyers`);
  console.log("Data:", data);
  console.log("Loading:", loading);
  console.log("Error:", error);
  React.useEffect(() => {
    if (data) {
      setLawyers(data);
    }
  }, [data]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-9 py-3 flex justify-between items-center">
        {/* <FaGavel className="text-black text-3xl" /> */}
        <h2 className="text-black font-bold text-xl">Esue</h2>

        <nav className="flex items-center gap-4">
          <span className="text-gray-700 cursor-pointer font-bold">Find a Lawyer</span>
          <span className="text-gray-700 cursor-pointer font-bold">For Lawyers</span>
          <Link to="/auth/login">
          <button className="border border-gray-200 bg-gray-100 text-black px-4 py-2 rounded-lg font-bold">
          Login
          </button>
          </Link>

          <Link to="/auth/register">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
            Sign Up
          </button>
          </Link>
        </nav>
      </header>

      {/* TITLE + SEARCH */}
      <section className="px-9 py-6 bg-white border-b border-gray-200 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">
              Find the Right Legal Help
            </h1>
            <p className="text-gray-500">
              Search top-rated attorneys by practice area, location, and price.
            </p>
          </div>

          <div className="flex w-full max-w-xl">
            <input
              type="text"
              placeholder="Search by name or practice area..."
              className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg focus:outline-none"
            />
            <button className="bg-blue-600 text-white px-6 rounded-r-lg">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="px-10 pb-10 flex flex-col lg:flex-row gap-8 md: mt-6">
        {/* FILTERS */}
        <aside className="w-full lg:w-64 bg-white p-8 rounded-xl border border-gray-200 md:h-fit">
          <h3 className="font-semibold mb-4">Filters</h3>

          <div className="mb-5">
            <p className="font-medium mb-2">Practice Area</p>
            {[
              "Family Law",
              "Criminal Defense",
              "Corporate Law",
              "Immigration",
              "Personal Injury",
            ].map((item) => (
              <label key={item} className="flex items-center gap-2 mb-2 text-gray-700">
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>

          <div>
            <p className="font-medium mb-2">Availability</p>
            <label className="flex items-center gap-2 mb-2 text-gray-700">
              <input type="checkbox" /> Available Today
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" /> Next 3 Days
            </label>
          </div>
        </aside>

        {/* LAWYER GRID */}
        <main className="flex-1 border border-gray-50 rounded-xl bg-gray-50 p-8">
          <p className="mb-4 text-gray-700">
            Showing <span className="font-semibold">{lawyers.length}</span> 
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* lawyer card with image , name, role, location, rating, tags, price, availability */}
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer._id} lawyer={lawyer} />
            ))}

          </div>
        </main>
      </div>
    </div>
  );
}

export default LawyerList;
