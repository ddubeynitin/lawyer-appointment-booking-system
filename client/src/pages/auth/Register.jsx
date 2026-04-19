import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaVenusMars,
  FaArrowRight,
  FaGavel,
  FaUserTie,
  FaEye,
  FaEyeSlash,
  FaHome,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoAlertOutline } from "react-icons/io5";
import { API_URL } from "../../utils/api";
import { isDisposableEmail } from "../../utils/emailValidation";
import LoadingFallback from "../../components/LoadingFallback";

const isValidAlphabeticName = (value) =>
  /^[A-Za-z\s]+$/.test(String(value || "").trim());
const isValidTenDigitPhone = (value) =>
  /^[0-9]{10}$/.test(String(value || "").trim());

const Registration = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [registrationVerificationToken, setRegistrationVerificationToken] =
    useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    city: "",
    state: "",
    email: "",
    certNo: "", // For lawyers, this will be filled; for clients, it can be ignored
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "email") {
      setRegistrationVerificationToken("");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setOtpInfo("");
    }
  };

  const normalizeRole = () => (role === "client" ? "user" : role);

  const getRegistrationPayload = () => ({
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    gender: formData.gender,
    city: role === "client" ? formData.city.trim() : "",
    state: role === "client" ? formData.state.trim() : "",
    email: formData.email.trim(),
    licenseNo: formData.certNo.trim(),
    password: formData.password,
    role: normalizeRole(),
  });

  const validateForm = () => {
    if (!formData.name.trim()) return "Full name is required";
    if (!isValidAlphabeticName(formData.name)) {
      return "Name can contain only alphabets and spaces.";
    }
    if (!formData.phone.trim()) return "Phone number is required";
    if (!isValidTenDigitPhone(formData.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }
    if (!formData.gender) {
      return "Gender is required";
    }
    if (role === "client") {
      if (!formData.city.trim()) return "City is required";
      if (!formData.state.trim()) return "State is required";
    }
    if (!formData.email.trim()) return "Email address is required";
    if (isDisposableEmail(formData.email)) {
      return "Temporary or disposable email addresses are not allowed. Please use a permanent email address.";
    }
    if (!formData.password || formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (role === "lawyer" && !formData.certNo.trim()) {
      return "License number is required for lawyer registration";
    }
    if (!formData.agree) {
      return "Please accept Terms & Privacy Policy";
    }
    return "";
  };

  const resetOtpFlow = () => {
    setOtpModalOpen(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpInfo("");
    setRegistrationVerificationToken("");
  };

  const requestRegistrationOtp = async () => {
    const payload = getRegistrationPayload();
    const response = await axios.post(
      `${API_URL}/auth/register/request-otp`,
      payload,
    );
    setOtpInfo(response.data?.message || "OTP sent to your email");
    setOtpModalOpen(true);
    return response;
  };

  const completeRegistration = async (verificationToken) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/register`, {
        ...getRegistrationPayload(),
        registrationVerificationToken: verificationToken,
      });
      resetOtpFlow();
      navigate("/auth/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed",
      );
      setOtpError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      return setError(validationError);
    }

    if (registrationVerificationToken) {
      try {
        await completeRegistration(registrationVerificationToken);
      } catch {
        // Error state is already set inside completeRegistration.
      }
      return;
    }

    try {
      setLoading(true);
      setOtpError("");
      await requestRegistrationOtp();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setOtpError("");

    const otpString = otp.join("");
    if (!otpString || otpString.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    try {
      setOtpLoading(true);
      const response = await axios.post(`${API_URL}/auth/register/verify-otp`, {
        ...getRegistrationPayload(),
        otp: otpString,
      });
      const verificationToken = response.data?.verificationToken;
      if (!verificationToken) {
        throw new Error("Verification token missing");
      }

      setRegistrationVerificationToken(verificationToken);
      await completeRegistration(verificationToken);
    } catch (err) {
      setOtpError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "OTP verification failed",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtpLoading(true);
      setOtpError("");
      setOtpInfo("");
      setOtp(["", "", "", "", "", ""]);
      await requestRegistrationOtp();
    } catch (err) {
      setOtpError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to resend OTP",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSelectRole = (r) => {
    setRole(r);
    setError("");
    resetOtpFlow();
    setFormData({
      name: "",
      phone: "",
      gender: "",
      city: "",
      state: "",
      email: "",
      certNo: "",
      password: "",
      confirmPassword: "",
      agree: false,
    });
  };

  return (
    <div className="lg:h-screen lg:overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50 font-barlow">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm px-4 sm:px-10 py-1 flex justify-between items-center border-b border-gray-100 overflow-hidden">
          <Link to="/" className="font-bold text-gray-900 overflow-hidden h-15 w-23 hover:scale-105 transition-transform duration-300 flex items-center gap-2">
            <img src="/assets/images/justifai_logo_blue_1.png" alt="logo" className="w-full h-full" />
          </Link>
        <div className="flex gap-3">
          <Link
            to="/"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Home"
          >
            <FaHome className="text-lg" />
          </Link>
          <Link to="/auth/login" title="Login" className="flex items-center gap-2">
            <button className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors">
              Login
            </button>
          </Link>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Left Side - Hero */}
        <div className="hidden lg:h-screen lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-indigo-700 p-12  flex-col justify-start text-white relative overflow-hidden ">
          <div className="relative z-10">
            <div className="animate-float w-full max-w-sm mx-auto mb-10 ">
              <img
                src="/assets/images/cover_banner_3.png"
                alt="Professional people"
                className="w-full max-w-md mx-auto mask-b-from-70% mask-b-to-85% rounded-2xl scale-160"
              />
            </div>
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Connect with top legal professionals
            </h1>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Whether you're seeking legal advice or growing your practice,
              Justifai provides the tools you need to succeed.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MdVerified className="w-6 h-6 text-green-400 shrink-0" />
                <span>Verified lawyers and secure client matching</span>
              </li>
              <li className="flex items-center gap-3">
                <MdVerified className="w-6 h-6 text-green-400 shrink-0" />
                <span>Effortless appointment scheduling & management</span>
              </li>
              <li className="flex items-center gap-3">
                <MdVerified className="w-6 h-6 text-green-400 shrink-0" />
                <span>Secure document sharing and messaging</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:h-screen flex-1 lg:flex items-center justify-center lg:p-12 overflow-y-auto">
          <div className="w-full max-w-2xl">
            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <LoadingFallback />
              </div>
            )}

            <div className=" bg-white lg:rounded-3xl shadow-2xl lg:mt-80 mb-10 p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create your account
                </h2>
                <p className="text-gray-600">
                  Join thousands of satisfied clients and lawyers
                </p>
              </div>

              {/* Role Selection */}
              <div className="mb-8">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSelectRole("client")}
                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      role === "client"
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaUser className="text-lg" />
                    <span className="hidden sm:inline">I am a Client</span>
                    <span className="sm:hidden">Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole("lawyer")}
                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      role === "lawyer"
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaUserTie className="text-lg" />
                    <span className="hidden sm:inline">I am a Lawyer</span>
                    <span className="sm:hidden">Lawyer</span>
                  </button>
                </div>
              </div>

              {/* Forms */}
              {role === "client" ? (
                <ClientRegform
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  error={error}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              ) : (
                <LawyerRegform
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  error={error}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <EmailOtpModal
          email={formData.email}
          otp={otp}
          setOtp={setOtp}
          otpInfo={otpInfo}
          otpError={otpError}
          otpLoading={otpLoading}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onClose={resetOtpFlow}
        />
      )}
    </div>
  );
};

const Input = ({ icon, isPassword, onToggle, showPassword, ...props }) => (
  <div className="relative">
    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <span className="text-gray-400 mr-3 shrink-0">{icon}</span>
      <input
        {...props}
        required
        className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
      />
      {isPassword && (
        <button
          type="button"
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      )}
    </div>
  </div>
);

const ClientRegform = ({
  formData,
  handleChange,
  handleSubmit,
  error,
  loading,
  showPassword,
  setShowPassword,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <Input
            icon={<FaUser />}
            name="name"
            placeholder="e.g. Jane Doe"
            onChange={handleChange}
            value={formData.name}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <Input
            icon={<FaPhone />}
            name="phone"
            placeholder="9876543210"
            onChange={handleChange}
            value={formData.phone}
            type="tel"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender
          </label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="text-gray-400 mr-3 shrink-0">
              <FaVenusMars />
            </span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-900"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Email (Full Width) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            icon={<FaEnvelope />}
            name="email"
            placeholder="name@example.com"
            onChange={handleChange}
            value={formData.email}
            type="email"
          />
        </div>


        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>
          <Input
            icon={<FaUser />}
            name="city"
            placeholder="e.g. Surat"
            onChange={handleChange}
            value={formData.city}
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State
          </label>
          <Input
            icon={<FaUser />}
            name="state"
            placeholder="e.g. Gujarat"
            onChange={handleChange}
            value={formData.state}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <Input
            icon={<FaLock />}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            onChange={handleChange}
            value={formData.password}
            minLength={8}
            isPassword
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <Input
            icon={<FaLock />}
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            onChange={handleChange}
            value={formData.confirmPassword}
            minLength={8}
            isPassword
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Terms */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="agree"
          onChange={handleChange}
          checked={formData.agree}
          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600 leading-relaxed">
          I agree to the{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? "Creating Account..." : "Create Account"}
        <FaArrowRight />
      </button>

      <p className="text-sm text-gray-600 text-center">
        Already have an account?{" "}
        <Link to={'/auth/login' } className="text-blue-600 font-medium cursor-pointer hover:underline">
          Login
        </Link>
      </p>

    </form>
  );
};

const LawyerRegform = ({
  formData,
  handleChange,
  handleSubmit,
  error,
  loading,
  showPassword,
  setShowPassword,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <Input
            icon={<FaUser />}
            name="name"
            placeholder="e.g. John Smith"
            onChange={handleChange}
            value={formData.name}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <Input
            icon={<FaPhone />}
            name="phone"
            placeholder="9876543210"
            onChange={handleChange}
            value={formData.phone}
            type="tel"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender
          </label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="text-gray-400 mr-3 shrink-0">
              <FaVenusMars />
            </span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-900"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            icon={<FaEnvelope />}
            name="email"
            placeholder="lawyer@example.com"
            onChange={handleChange}
            value={formData.email}
            type="email"
          />
        </div>

        {/* License Number */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            License Number
          </label>
          <Input
            icon={<IoAlertOutline />}
            name="certNo"
            type="text"
            placeholder="Enter license number"
            onChange={handleChange}
            value={formData.certNo || ""}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <Input
            icon={<FaLock />}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            onChange={handleChange}
            value={formData.password}
            minLength={8}
            isPassword
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <Input
            icon={<FaLock />}
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            onChange={handleChange}
            value={formData.confirmPassword}
            minLength={8}
            isPassword
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Terms */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="agree"
          onChange={handleChange}
          checked={formData.agree}
          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600 leading-relaxed">
          I agree to the{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? "Creating Account..." : "Create Account"}
        <FaArrowRight />
      </button>

      <p className="text-sm text-gray-600 text-center">
        Already have an account?{" "}
        <Link to={'/auth/login' } className="text-blue-600 font-medium cursor-pointer hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
};

const EmailOtpModal = ({
  email,
  otp,
  setOtp,
  otpInfo,
  otpError,
  otpLoading,
  onVerify,
  onResend,
  onClose,
}) => {
  const handleOtpChange = (index, value) => {
    // Only allow single digit
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Move to previous input on backspace
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Verify your email
            </h3>
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to{" "}
              <span className="font-semibold text-gray-900">
                {email || "your email"}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-blue-800 text-sm">
            {otpInfo || "We sent a 6-digit verification code to your inbox."}
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Enter OTP Code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="tel"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                placeholder=""
              />
            ))}
          </div>
        </div>

        {otpError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{otpError}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onVerify}
            disabled={otpLoading || !isOtpComplete}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {otpLoading ? "Verifying..." : "Verify & Create Account"}
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={otpLoading}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
