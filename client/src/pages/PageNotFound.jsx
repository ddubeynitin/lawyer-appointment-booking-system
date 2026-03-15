import React from "react";
import { Link } from "react-router-dom";
import "./PageNotFound.css";
const PageNotFound = () => {

    const bookStyles = { fontFamily: "var(--font-bebas)", fontSize: "1.5rem", color: "#333" , backgroundColor: "#f0f0f0", padding: "10px 20px", marginBottom: "10px", borderRadius: "5px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s ease-in-out" };
  return (
    <>
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-white">

      <nav className="shelf">
        <Link className="book m-38 animate-bounce hover:scale-105" to="/" style={bookStyles}>
          Home page
        </Link>
        <Link className="book ml-2 mt-35 animate-bounce hover:scale-105" to="/about" style={bookStyles}>
          About us
        </Link>
        <Link className="book contact animate-bounce hover:scale-105" to="/contact" style={bookStyles}>
          Contact
        </Link>

        <span className="book not-found"></span>

        <span className="door left"></span>
        <span className="door right"></span>
      </nav>
      <h1 className="font-barlow text-4xl font-bold text-gray-800">Error 404</h1>
      <p className="text-gray-600 font-barlow">The page you're looking for can't be found</p>
    </div>
    </>
  );
};

export default PageNotFound;
