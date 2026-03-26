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
import LoadingFallback from "../../components/LoadingFallback";

const Registration = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.agree) {
      return setError("Please accept Terms & Privacy Policy");
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        licenseNo: formData.certNo, // For lawyers, this will be filled; for clients, it can be ignored
        password: formData.password,
        role: role === "client" ? "user" : role,
      });
      navigate("/auth/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (r) => {
    setRole(r);
    setError("");
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
        {showPassword ? <FaEye /> : <FaEyeSlash />  }
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

export default Registration;
