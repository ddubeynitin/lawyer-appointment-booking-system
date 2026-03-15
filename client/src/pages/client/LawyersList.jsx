import React from "react";
import { FaGavel, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Pagination } from "@heroui/pagination";
import useFetch from "../../hooks/useFetch";
import LawyerCard from "../../components/common/LawyerCard";
import LawyerCardSkeleton from "../../components/layout/LawyerCardSkeleton";
import { API_URL } from "../../utils/api";

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
  const [searchTerm, setSearchTerm] = React.useState("");
  const [practiceFilters, setPracticeFilters] = React.useState([]); // e.g. ['Family Law']
  const [availabilityFilters, setAvailabilityFilters] = React.useState([]); // e.g. ['today','next3']
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 9;

  const { data, loading, error } = useFetch(`${API_URL}/lawyers`);
  console.log("Data:", data);
  console.log("Loading:", loading);
  console.log("Error:", error);
  React.useEffect(() => {
    if (data) {

      setLawyers(data);
    }
  }, [data]);

  // derive filtered list whenever any of the inputs change
  const filteredLawyers = React.useMemo(() => {
    return lawyers.filter((lawyer) => {
      // compute tags or specializations text
      const tagsArray = lawyer.tags || lawyer.specializations || [];
      const tagsText = tagsArray.join(" ").toLowerCase();

      // search term filter (name or tags)
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const nameMatch = lawyer.name?.toLowerCase().includes(term);
        const tagsMatch = tagsText.includes(term);
        if (!nameMatch && !tagsMatch) return false;
      }

      // practice area filters
      if (practiceFilters.length) {
        const match = practiceFilters.some((opt) =>
          tagsText.includes(opt.toLowerCase())
        );
        if (!match) return false;
      }

      // availability filters - for now both options require availability:true
      if (availabilityFilters.length) {
        if (!lawyer.availability) return false;
      }

      return true;
    });
  }, [lawyers, searchTerm, practiceFilters, availabilityFilters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, practiceFilters, availabilityFilters]);

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 font-barlow">

    {/* HEADER */}
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-4 flex justify-between items-center sticky top-0 z-50">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center ">
      <FaGavel className="text-blue-700 lg:text-2xl sm:text-sm" />
        Justif<span className="text-blue-700">Ai</span>
      </h2>

      <nav className="flex items-center gap-6">
        <span className="text-slate-600 hover:text-blue-700 font-medium cursor-pointer transition">
          For Lawyers
        </span>

        <Link to="/auth/login">
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-100 transition">
            Login
          </button>
        </Link>

        <Link to="/auth/register">
          <button className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-105 transition">
            Sign Up
          </button>
        </Link>
      </nav>
    </header>

    {/* HERO SEARCH */}
    <section className="px-10 py-5">
      <div className="max-w-6xl mx-auto bg-linear-to-r from-blue-700 to-blue-800 rounded-3xl p-3 text-white shadow-2xl">

        <div className="flex flex-col lg:flex-row justify-between gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Find the Right Legal Representation
            </h1>
            <p className="text-blue-100 max-w-xl">
              Connect with verified attorneys across multiple practice areas.
              Transparent pricing. Immediate availability.
            </p>
          </div>

          <div className="flex w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or practice area..."
              className="flex-1 px-5 py-3 outline-none text-slate-700"
            />
            <button className="flex justify-center items-center gap-2  bg-blue-700 hover:bg-blue-800 text-white px-8 font-semibold transition">
              <FaSearch className="text-lg" />
              Search
            </button>
          </div>
        </div>

      </div>
    </section>

    {/* CONTENT */}
    <div className="px-10 pb-16 flex flex-col lg:flex-row gap-10">

      {/* FILTERS */}
      <aside className="w-full lg:w-72 bg-white rounded-3xl shadow-xl p-6 h-fit border border-slate-100">

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-slate-800">
            Filters
          </h3>
          <button
            className="text-sm text-blue-700 hover:underline"
            onClick={() => {
              setSearchTerm("");
              setPracticeFilters([]);
              setAvailabilityFilters([]);
            }}
          >
            Clear
          </button>
        </div>

        <div className="mb-8">
          <p className="font-medium mb-3 text-slate-700">
            Specializations
          </p>

          {["Criminal", "Civil", "Corporate", "Family", "Property"].map(
            (item) => (
              <label
                key={item}
                className="flex items-center gap-3 mb-3 text-slate-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={practiceFilters.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPracticeFilters((prev) => [...prev, item]);
                    } else {
                      setPracticeFilters((prev) =>
                        prev.filter((x) => x !== item)
                      );
                    }
                  }}
                  className="accent-blue-700 w-4 h-4"
                />
                {item}
              </label>
            )
          )}
        </div>

        <div>
          <p className="font-medium mb-3 text-slate-700">
            Availability
          </p>

          <label className="flex items-center gap-3 mb-3 text-slate-600">
            <input
              type="checkbox"
              checked={availabilityFilters.includes("today")}
              onChange={(e) => {
                if (e.target.checked) {
                  setAvailabilityFilters((prev) => [...prev, "today"]);
                } else {
                  setAvailabilityFilters((prev) =>
                    prev.filter((x) => x !== "today")
                  );
                }
              }}
              className="accent-blue-700 w-4 h-4"
            />
            Available Today
          </label>

          <label className="flex items-center gap-3 text-slate-600">
            <input
              type="checkbox"
              checked={availabilityFilters.includes("next3")}
              onChange={(e) => {
                if (e.target.checked) {
                  setAvailabilityFilters((prev) => [...prev, "next3"]);
                } else {
                  setAvailabilityFilters((prev) =>
                    prev.filter((x) => x !== "next3")
                  );
                }
              }}
              className="accent-blue-700 w-4 h-4"
            />
            Next 3 Days
          </label>
        </div>
      </aside>

      {/* LAWYERS */}
      <main className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-100">

        <p className="mb-4 text-slate-600 text-lg">
          {loading ? (
            "Loading legal professionals..."
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {paginatedLawyers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {filteredLawyers.length}
              </span>{" "}
              legal professionals
            </>
          )}
        </p>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 9 }).map((_, index) => (
              <LawyerCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : paginatedLawyers.length ? (
            paginatedLawyers.map((lawyer) => (
              <LawyerCard key={lawyer._id} lawyer={lawyer} />
            ))
          ) : (
            <p className="text-center col-span-full text-slate-500">
              No lawyers match the selected filters.
            </p>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredLawyers.length > itemsPerPage && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              showShadow
              color="primary"
              size="lg"
            />
          </div>
        )}

      </main>
    </div>
  </div>
);}

export default LawyerList;
