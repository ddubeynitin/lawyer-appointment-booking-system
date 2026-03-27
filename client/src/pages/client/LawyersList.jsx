import React from "react";
import { FaGavel, FaSearch } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { Pagination } from "@heroui/pagination";
import useFetch from "../../hooks/useFetch";
import LawyerCard from "../../components/common/LawyerCard";
import LawyerCardSkeleton from "../../components/layout/LawyerCardSkeleton";
import { API_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ClientHeader from "../../components/common/ClientHeader";
import LawyerHeader from "../../components/common/LawyerHeader";

function LawyerList() {
  const [lawyers, setLawyers] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [practiceFilters, setPracticeFilters] = React.useState([]); // e.g. ['Family Law']
  const [availabilityFilters, setAvailabilityFilters] = React.useState([]); // e.g. ['today','next3']
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const { data, loading, error } = useFetch(`${API_URL}/lawyers`);
  console.log("Data:", data);
  console.log("Loading:", loading);
  console.log("Error:", error);
  React.useEffect(() => {
    if (data) {
      setLawyers(data);
    }
  }, [data]);

  React.useEffect(() => {
    const searchFromQuery = searchParams.get("search") || "";
    const locationFromQuery = searchParams.get("location") || "";
    const combinedSearch = [searchFromQuery, locationFromQuery]
      .filter(Boolean)
      .join(" ")
      .trim();

    setSearchTerm(combinedSearch);
  }, [searchParams]);

  // derive filtered list whenever any of the inputs change
  const filteredLawyers = React.useMemo(() => {
    return lawyers.filter((lawyer) => {
      // compute tags or specializations text
      const tagsArray = lawyer.tags || lawyer.specializations || [];
      const tagsText = tagsArray.join(" ").toLowerCase();
      const locationText =
        typeof lawyer.location === "object"
          ? [
              lawyer.location?.address,
              lawyer.location?.city,
              lawyer.location?.state,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          : `${lawyer.location || ""}`.toLowerCase();

      // search term filter (name, tags, or location)
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const searchableText = [
          lawyer.name,
          tagsText,
          locationText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const searchTokens = term.split(/\s+/).filter(Boolean);
        const matchesAllTokens = searchTokens.every((token) =>
          searchableText.includes(token),
        );

        if (!matchesAllTokens) return false;
      }

      // practice area filters
      if (practiceFilters.length) {
        const match = practiceFilters.some((opt) =>
          tagsText.includes(opt.toLowerCase()),
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

      {user ? (
        user.role == "lawyer" ? (
          <LawyerHeader />
        ) : (
          <ClientHeader />
        )
      ) : (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
          <h2 className="flex items-center text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            <FaGavel className="text-blue-700 text-lg sm:text-xl lg:text-2xl" />
            Justif<span className="text-blue-700">Ai</span>
          </h2>

          <nav className="flex items-center gap-3 sm:gap-6">
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
      )}

      {/* HERO SEARCH */}
      <section className="px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-linear-to-r from-blue-700 to-blue-800 p-5 text-white shadow-2xl sm:p-6">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-10">
            <div>
              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">
                Find the Right Legal Representation
              </h1>
              <p className="text-blue-100 max-w-xl">
                Connect with verified attorneys across multiple practice areas.
                Transparent pricing. Immediate availability.
              </p>
            </div>

            <div className="flex w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or practice area..."
                className="min-w-0 flex-1 px-4 py-3 text-slate-700 outline-none sm:px-5"
              />
              <button className="flex items-center justify-center gap-2 bg-blue-700 px-4 font-semibold text-white transition hover:bg-blue-800 sm:px-8">
                <FaSearch className="text-base sm:text-lg" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="flex flex-col gap-6 px-4 pb-16 sm:px-6 lg:flex-row lg:gap-10 lg:px-10">
        {/* FILTERS */}
        <aside className="h-fit w-full rounded-3xl border border-slate-100 bg-white p-5 shadow-xl sm:p-6 lg:w-72">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-slate-800">Filters</h3>
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
            <p className="font-medium mb-3 text-slate-700">Specializations</p>

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
                          prev.filter((x) => x !== item),
                        );
                      }
                    }}
                    className="accent-blue-700 w-4 h-4"
                  />
                  {item}
                </label>
              ),
            )}
          </div>

          <div>
            <p className="font-medium mb-3 text-slate-700">Availability</p>

            <label className="flex items-center gap-3 mb-3 text-slate-600">
              <input
                type="checkbox"
                checked={availabilityFilters.includes("today")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAvailabilityFilters((prev) => [...prev, "today"]);
                  } else {
                    setAvailabilityFilters((prev) =>
                      prev.filter((x) => x !== "today"),
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
                      prev.filter((x) => x !== "next3"),
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
        <main className="flex-1 rounded-3xl border border-slate-100 bg-white/70 p-4 shadow-xl backdrop-blur-md sm:p-6">
          <p className="mb-4 text-base text-slate-600 sm:text-lg">
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
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
                className="cursor-pointer border border-gray-300 hover:bg-blue-500 hover:font-bold hover:text-white rounded-2xl"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default LawyerList;
