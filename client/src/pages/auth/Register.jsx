import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaGavel,
  FaUserTie,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoAlertOutline } from "react-icons/io5";
import { API_URL } from "../../utils/api";
import { isDisposableEmail } from "../../utils/emailValidation";
import LoadingFallback from "../../components/LoadingFallback";

const isValidAlphabeticName = (value) => /^[A-Za-z\s]+$/.test(String(value || "").trim());
const isValidTenDigitPhone = (value) => /^[0-9]{10}$/.test(String(value || "").trim());

const Registration = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [registrationVerificationToken, setRegistrationVerificationToken] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
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
      setOtp("");
      setOtpError("");
      setOtpInfo("");
    }
  };

  const normalizeRole = () => (role === "client" ? "user" : role);

  const getRegistrationPayload = () => ({
    name: formData.name.trim(),
    phone: formData.phone.trim(),
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
    setOtp("");
    setOtpError("");
    setOtpInfo("");
    setRegistrationVerificationToken("");
  };

  const requestRegistrationOtp = async () => {
    const payload = getRegistrationPayload();
    const response = await axios.post(`${API_URL}/auth/register/request-otp`, payload);
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
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
      setOtpError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
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
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setOtpError("");

    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setOtpLoading(true);
      const response = await axios.post(`${API_URL}/auth/register/verify-otp`, {
        ...getRegistrationPayload(),
        otp: otp.trim(),
      });
      const verificationToken = response.data?.verificationToken;
      if (!verificationToken) {
        throw new Error("Verification token missing");
      }

      setRegistrationVerificationToken(verificationToken);
      await completeRegistration(verificationToken);
    } catch (err) {
      setOtpError(err.response?.data?.error || err.response?.data?.message || err.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtpLoading(true);
      setOtpError("");
      setOtpInfo("");
      await requestRegistrationOtp();
    } catch (err) {
      setOtpError(err.response?.data?.error || err.response?.data?.message || "Failed to resend OTP");
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
      email: "",
      certNo: "",
      password: "",
      confirmPassword: "",
      agree: false,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[url('./assets/images/bg-white.jpg')] bg-cover bg-center font-barlow lg:overflow-hidden">
      <header className="w-full shadow-sm px-4 sm:px-10 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaGavel />
          <span className="text-xl font-bold text-black ">
            Justif<span className="text-blue-500">Ai</span>
          </span>
        </div>
        <Link to="/auth/login" className="flex items-center gap-2">
          <p className="text-blue-600 font-barlow lg:text-lg text-[10px]">Already have account?</p>
          <button className="text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg text-sm font-medium hover:underline border px-4 py-2  ">
            Login
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl mx-auto flex-1 lg:overflow-hidden">
        {/* Circular Loading */}
        {loading && (
          <div className="absolute w-full h-screen top-[50%] left-[50%] bg-white/30 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-20">
            <LoadingFallback />
          </div>
        )}
        <div className="flex flex-col justify-center items-center px-2 sm:px-12 lg:px-20 lg:py-10 py-3">
          <div className="bg-[url('./assets/images/professional-peoples.png')] lg:w-full lg:h-60 h-50 w-full drop-shadow-lg drop-shadow-black/80 mask-b-from-65% mask-b-to-100% p-5 flex justify-end items-end  bg-cover bg-no-repeat aspect-auto  rounded-lg"></div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4"> 
            Connect with top <br /> legal professionals
          </h1>

          <p className="text-blue-600 mb-6">
            Whehter you are looking for legal advice or growinng <br />
            you practice, Esue provides the tools you need <br />
            to succeed.
          </p>

          <ul className="space-y-3 text-black mb-6">
            <li className="flex items-center gap-2">
              <MdVerified
                className="w-5 h-5 rounded-full text-blue-500"
                alt=""
              />
              Verified lawyers and secure client matching.
            </li>
            <li className="flex items-center gap-2">
              <MdVerified
                className="w-5 h-5 rounded-full text-blue-500"
                alt=""
              />
              Effortless appointment scheduling & management.
            </li>
            <li className="flex items-center gap-2">
              <MdVerified
                className="w-5 h-5 rounded-full text-blue-500"
                alt=""
              />
              Secure document sharing and mesaaging.
            </li>
          </ul>
        </div>

        <div className=" flex items-center justify-center px-4 py-5">
          <div className="w-full bg-blue-600/80 rounded-xl shadow-lg pt-4 p-8 ">
            <h2 className="text-3xl text-white font-semibold mb-1">
              Create your account
            </h2>
            <p className="text-sm text-white/90 mb-6">
              Get started in less than a minute
            </p>

            <div className="flex gap-3 rounded-lg p-1  bg-white relative">
              <div
                className="absolute top-1 bottom-1 left-1 lg:w-59 sm:w-34 rounded-md transition-transform duration-400 ease-in-out"
                style={{
                  transform:
                    role === "lawyer" ? "translateX(100%)" : "translateX(0%)",
                }}
              />
              <button
                type="button"
                onClick={() => handleSelectRole("client")}
                // className={`w-1/2 py-1 rounded-lg border-2 border-gray-300 font-medium flex justify-center items-center gap-2 ${
                //   role === "client"
                //     ? "bg-blue-600 text-white"
                //     : "bg-gray-100 text-blue-500"
                // }`}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                  role === "client" ? "text-white bg-blue-500" : "text-black"
                }`}
              >
                <FaUser /> I am a Client
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("lawyer")}
                // className={`w-1/2 py-1 rounded-lg border-2  border-gray-300 font-medium flex justify-center items-center gap-2 ${
                //   role === "lawyer"
                //     ? "bg-blue-600 text-white"
                //     : "bg-gray-100 text-blue-500"
                // }`}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                  role === "lawyer" ? "text-white bg-blue-500" : "text-black"
                }`}
              >
                <FaUserTie /> I am a Lawyer
              </button>
            </div>

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
        {/* Help Links */}
        <div className="text-center mt-4 text-sm text-gray-500">
          <div className="flex justify-end  gap-6">
            {/* <Link
            to="/help-center"
          className="hover:text-blue-600 transition"
          >
          Help Center
        </Link>

        <Link
          to="/contact-support"
        className="hover:text-blue-600 transition"
        >
        Contact Support
        </Link> */}
          </div>
        </div>
      </div>

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
  <div
    className="
      h-10 flex items-center
      bg-gray-100 rounded-lg
      px-3 
      transition
      focus-within:ring-2 focus-within:ring-blue-600
    "
  >
    <span className="text-gray-500 mr-2 pointer-events-none">{icon}</span>

    <input
      {...props}
      required
      className="
        w-full
        outline-none
        bg-transparent
        placeholder:text-gray-400
      "
    />
    {isPassword && (
      <button
        type="button"
        onClick={onToggle}
        className="text-gray-500 hover:text-gray-700 ml-2"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    )}
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
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-white">Full Name</label>
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
          <label className="text-sm font-medium text-white">Phone Number</label>
          <Input
            icon={<FaPhone />}
            name="phone"
            placeholder="+91 98765 43210"
            onChange={handleChange}
            value={formData.phone}
            type="tel"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {/* Email (Full Width) */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-white">
            Email Address
          </label>
          <Input
            icon={<FaEnvelope />}
            name="email"
            placeholder="name@example.com"
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-white">Password</label>
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
          <label className="text-sm font-medium text-white">
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

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {/* Terms */}
      <div className="flex items-center gap-2 mt-5">
        <input
          type="checkbox"
          name="agree"
          onChange={handleChange}
          checked={formData.agree}
          className="accent-blue-600"
        />
        <p className="text-sm text-white">
          I agree to{" "}
          <span className="text-white underline font-medium cursor-pointer">
            Terms
          </span>{" "}
          &{" "}
          <span className="text-white underline font-medium cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-blue-800 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex justify-center items-center gap-2"
      >
        {loading ? "Creating Account..." : "Create Account"}
        <FaArrowRight />
      </button>
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
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-white">Full Name</label>
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
          <label className="text-sm font-medium text-white">Phone Number</label>
          <Input
            icon={<FaPhone />}
            name="phone"
            placeholder="+1 900 822 030"
            onChange={handleChange}
            value={formData.phone}
            type="tel"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-white">
            Email Address
          </label>
          <Input
            icon={<FaEnvelope />}
            name="email"
            placeholder="lawyer@example.com"
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        {/* License Number */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-white">
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
          <label className="text-sm font-medium text-white">Password</label>
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
          <label className="text-sm font-medium text-white">
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

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {/* Terms */}
      <div className="flex items-center gap-2 mt-5">
        <input
          type="checkbox"
          name="agree"
          onChange={handleChange}
          checked={formData.agree}
          className="accent-blue-600"
        />
        <p className="text-sm text-white">
          I agree to{" "}
          <span className="text-white underline font-medium cursor-pointer">
            Terms
          </span>{" "}
          &{" "}
          <span className="text-white underline font-medium cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-blue-800 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex justify-center items-center gap-2"
      >
        Create Account
        <FaArrowRight />
      </button>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Verify your email</h3>
            <p className="mt-1 text-sm text-slate-600">
              Enter the OTP sent to <span className="font-medium text-slate-900">{email || "your email"}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          {otpInfo || "We sent a 6-digit verification code to your inbox."}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">OTP</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {otpError && <p className="mt-3 text-sm text-red-600">{otpError}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onVerify}
            disabled={otpLoading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {otpLoading ? "Verifying..." : "Verify & Create Account"}
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={otpLoading}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
