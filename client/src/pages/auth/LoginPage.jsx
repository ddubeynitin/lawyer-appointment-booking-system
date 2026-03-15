import { useState } from "react";
import { FaGavel, FaUser, FaUserTie } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
// import legalImg from "../../assets/images/legal.jpg";
// import legalImg1 from "../../assets/images/logo.png";
// import legalImg2 from "../../assets/images/registerpage.png";
// import legalImg3 from "../../assets/images/registerpage1.png";
import { CgLogIn } from "react-icons/cg";

import { RiLockPasswordFill } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../utils/api";

// const legalSlides = [
//   {
//     img: legalImg,
//     quote:
//       "Efficiency is doing things right; effectiveness is doing the right things.",
//     author: "Peter Drucker",
//   },
//   {
//     img: legalImg1,
//     quote: "Injustice anywhere is a threat to justice everywhere.",
//     author: "Martin Luther King Jr.",
//   },
//   {
//     img: legalImg2,
//     quote: "Justice delayed is justice denied.",
//     author: "William E. Gladstone",
//   },
//   {
//     img: legalImg3,
//     quote: "The good lawyer is the great salesman.",
//     author: "Janet Reno",
//   },
// ];

function LoginPage() {
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // const [slide] = useState(
  //   legalSlides[Math.floor(Math.random() * legalSlides.length)],
  // );
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (value) => {
    const re = /^\S+@\S+\.\S+$/;
    if (!value || !re.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value) => {
    if (!value || value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const emailOk = validateEmail(email);
      const passwordOk = validatePassword(password);

      if (!emailOk || !passwordOk) return;

      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role,
      });

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        login({ token: res.data.token, user: res.data.user });

        //check if lawyer profile isComplete false then redirect to complete-profile page
        const isProfileComplete =
          res.data.user.isProfileComplete ?? res.data.user.idProfileComplete;
        if (res.data.user.role === "lawyer" && !isProfileComplete) {
          navigate("/complete-profile");
        } else {
          navigate(
            res.data.user.role === "user"
              ? "/client/client-dashboard"
              : "/lawyer/lawyer-dashboard",
          );
        }
      }
    } catch (err) {
      alert(
        "Login failed: " +
          (err.response?.data?.message || "Invalid credentials"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[url('./assets/images/bg-white.jpg')] bg-cover bg-center flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">

        {/* Side/Promo Section (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 items-center justify-center p-10">
          <div className="text-white max-w-sm">
            <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
            <p className="text-sm opacity-90">
              Access your dashboard, manage your appointments, and connect with trusted legal professionals.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 gap-2 ">
            <div className="w-8 h-8 rounded flex items-center justify-center text-black font-bold">
              <FaGavel className="text-5xl" />
            </div>
            <span className="font-bold text-5xl">
              Justif<span className="text-blue-500">Ai</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold mb-1">Welcome Back</h1>
          <p className="text-gray-500 mb-6">
            Please enter your details to access your dashboard.
          </p>

          {/* Role Switch */}
          <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
            {/* sliding indicator */}
            <div
              className="absolute top-1 bottom-1 left-1 w-1/2 bg-blue-500 rounded-md transition-transform duration-400 ease-in-out"
              style={{
                transform:
                  role === "lawyer" ? "translateX(100%)" : "translateX(0%)",
              }}
            />

            <button
              onClick={() => setRole("user")}
              aria-pressed={role === "user"}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                role === "user" ? "text-white" : "text-gray-500"
              }`}
            >
              <FaUser />
              Client
            </button>

            <button
              onClick={() => setRole("lawyer")}
              aria-pressed={role === "lawyer"}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                role === "lawyer" ? "text-white" : "text-gray-500"
              }`}
            >
              <FaUserTie />
              Lawyer
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Email address</label>

              <div className="flex justify-around items-center w-full bg-gray-100 rounded-lg hover:ring-2 hover:ring-blue-500">
                <MdEmail className="text-2xl m-2 text-blue-900" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full bg-gray-100 rounded-tr-lg rounded-br-lg px-3 py-2 focus:outline-none border-l ${emailError ? "border-red-500" : "border-gray-300"}`}
                />
              </div>

              {emailError && (
                <p className="text-red-600 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm">Password</label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex items-center w-full bg-gray-100 rounded-lg hover:ring-2 hover:ring-blue-500">
                <RiLockPasswordFill className="text-2xl m-2 text-blue-900" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`flex-1 bg-gray-100 px-3 py-2 focus:outline-none border-l ${passwordError ? "border-red-500" : "border-gray-300"} rounded-tr-lg rounded-br-lg`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="p-2 m-2 text-blue-900"
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>

              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <CgLogIn className="inline mr-2 text-2xl mb-1" />
              Log In
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link to="/auth/register">
              <span className="text-blue-600 cursor-pointer hover:underline">
                Sign up
              </span>
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure & encrypted connection
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}

export default LoginPage;
