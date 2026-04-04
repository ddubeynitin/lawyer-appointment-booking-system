import { useMemo, useState } from "react";
import { FaGavel, FaUser, FaUserTie } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { CgLogIn } from "react-icons/cg";
import { RiLockPasswordFill } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../utils/api";
import LoadingFallback from "../../components/LoadingFallback";

function LoginPage() {
  const [role, setRole] = useState("user");
  const [authMode, setAuthMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStage, setForgotStage] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const authTitle = useMemo(
    () => (authMode === "otp" ? "Login with Email OTP" : "Welcome Back"),
    [authMode],
  );

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

  const validateOtp = (value) => {
    if (!value || String(value).trim().length < 4) {
      setOtpError("Enter the OTP sent to your email");
      return false;
    }
    setOtpError("");
    return true;
  };

  const resetOtpState = () => {
    setOtp("");
    setOtpRequested(false);
    setOtpError("");
    setOtpInfo("");
  };

  const handlePasswordLogin = async () => {
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
  };

  const requestLoginOtp = async () => {
    const emailOk = validateEmail(email);
    if (!emailOk) return;

    setLoading(true);
    setOtpError("");
    setOtpInfo("");

    try {
      const response = await axios.post(`${API_URL}/auth/login/request-otp`, {
        email: email.trim(),
        role,
      });
      setOtpRequested(true);
      setOtpInfo(response.data?.message || "OTP sent to your email");
    } catch (err) {
      setOtpRequested(false);
      setOtpInfo("");
      setOtpError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    const emailOk = validateEmail(email);
    const otpOk = validateOtp(otp);
    if (!emailOk || !otpOk) return;

    setLoading(true);
    setOtpError("");
    setOtpInfo("");

    try {
      const response = await axios.post(`${API_URL}/auth/login/verify-otp`, {
        email: email.trim(),
        role,
        otp: otp.trim(),
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      login({ token: response.data.token, user: response.data.user });

      const isProfileComplete =
        response.data.user.isProfileComplete ?? response.data.user.idProfileComplete;
      if (response.data.user.role === "lawyer" && !isProfileComplete) {
        navigate("/complete-profile");
      } else {
        navigate(
          response.data.user.role === "user"
            ? "/client/client-dashboard"
            : "/lawyer/lawyer-dashboard",
        );
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (authMode === "otp") {
        if (!otpRequested) {
          await requestLoginOtp();
        } else {
          await verifyLoginOtp();
        }
      } else {
        await handlePasswordLogin();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials";
      alert(`Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    const emailOk = /^\S+@\S+\.\S+$/.test(forgotEmail.trim());
    if (!emailOk) {
      setForgotError("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");

    try {
      const response = await axios.post(`${API_URL}/auth/password/request-otp`, {
        email: forgotEmail.trim(),
        role,
      });
      setForgotStage("reset");
      setForgotMessage(response.data?.message || "OTP sent to your email");
    } catch (err) {
      setForgotError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (!forgotOtp.trim()) {
      setForgotError("Enter the OTP sent to your email");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setForgotError("Password must be at least 8 characters");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");

    try {
      const response = await axios.post(`${API_URL}/auth/password/reset-with-otp`, {
        email: forgotEmail.trim(),
        role,
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });
      setForgotMessage(response.data?.message || "Password updated successfully");
      setTimeout(() => {
        setForgotOpen(false);
        setForgotStage("request");
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
      }, 900);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Unable to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSelectRole = (nextRole) => {
    setRole(nextRole);
    setEmail("");
    setPassword("");
    resetOtpState();
    setErrorStates();
  };

  const setErrorStates = () => {
    setEmailError("");
    setPasswordError("");
    setOtpError("");
    setOtpInfo("");
  };

  return (
    <div className="min-h-screen bg-[url('./assets/images/bg-white.jpg')] bg-cover bg-center flex items-center justify-center py-10 px-4 font-barlow">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
        {loading && (
          <div className="absolute w-full h-screen top-[50%] left-[50%] bg-white/30 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-20">
            <LoadingFallback />
          </div>
        )}

        <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 items-center justify-center p-10">
          <div className="text-white max-w-sm">
            <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
            <p className="text-sm opacity-90">
              Access your dashboard, manage your appointments, and connect with
              trusted legal professionals.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-6 gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center text-black font-bold">
                <FaGavel className="text-5xl" />
              </div>
              <span className="font-bold text-5xl">
                Justif<span className="text-blue-500">Ai</span>
              </span>
            </div>

            <h1 className="text-2xl font-semibold mb-1">{authTitle}</h1>
            <p className="text-gray-500 mb-6">
              {authMode === "otp"
                ? "We will send a one-time code to your email."
                : "Please enter your details to access your dashboard."}
            </p>

            <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
              <div
                className="absolute top-1 bottom-1 left-1 w-1/2 bg-blue-500 rounded-md transition-transform duration-400 ease-in-out"
                style={{
                  transform:
                    role === "lawyer" ? "translateX(100%)" : "translateX(0%)",
                }}
              />

              <button
                type="button"
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
                type="button"
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

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  resetOtpState();
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  authMode === "password"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setPassword("");
                  setPasswordError("");
                  setOtp("");
                  setOtpError("");
                  setOtpRequested(false);
                  setOtpInfo("");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  authMode === "otp"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Email OTP
              </button>
            </div>

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
                {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
              </div>

              {authMode === "password" ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm">Password</label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => {
                        setForgotOpen(true);
                        setForgotStage("request");
                        setForgotEmail(email);
                        setForgotOtp("");
                        setForgotNewPassword("");
                        setForgotConfirmPassword("");
                        setForgotMessage("");
                        setForgotError("");
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="flex items-center w-full bg-gray-100 rounded-lg hover:ring-2 hover:ring-blue-500">
                    <RiLockPasswordFill className="text-2xl m-2 text-blue-900 " />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => validatePassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`flex-1 w-8 bg-gray-100 px-3 py-2 focus:outline-none border-l ${passwordError ? "border-red-500" : "border-gray-300"} rounded-tr-lg rounded-br-lg`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="p-2  m-2 text-blue-900"
                    >
                      {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-1">OTP</label>
                  <div className="flex items-center w-full bg-gray-100 rounded-lg hover:ring-2 hover:ring-blue-500">
                    <RiLockPasswordFill className="text-2xl m-2 text-blue-900 " />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={otpRequested ? "Enter the OTP sent to your email" : "Click Continue to send OTP"}
                      className="flex-1 w-8 bg-gray-100 px-3 py-2 focus:outline-none border-l border-gray-300 rounded-tr-lg rounded-br-lg"
                    />
                  </div>
                  {otpError && <p className="text-red-600 text-sm mt-1">{otpError}</p>}
                  {otpInfo && <p className="text-green-700 text-sm mt-1">{otpInfo}</p>}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <CgLogIn className="inline mr-2 text-2xl mb-1" />
                {authMode === "otp" ? (otpRequested ? "Verify OTP" : "Send OTP") : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
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

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Forgot Password
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-800">
                  Reset password with email OTP
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setForgotStage("request")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  forgotStage === "request"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Request OTP
              </button>
              <button
                type="button"
                onClick={() => setForgotStage("reset")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  forgotStage === "reset"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Reset Password
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="user">Client</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>

              {forgotStage === "reset" && (
                <>
                  <div>
                    <label className="block text-sm mb-1">OTP</label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">New Password</label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {forgotError && <p className="text-sm text-red-600">{forgotError}</p>}
              {forgotMessage && <p className="text-sm text-green-700">{forgotMessage}</p>}

              <button
                type="button"
                disabled={forgotLoading}
                onClick={forgotStage === "request" ? handleForgotRequest : handleForgotReset}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {forgotLoading ? "Please wait..." : forgotStage === "request" ? "Send OTP" : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
