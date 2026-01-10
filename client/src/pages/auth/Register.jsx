import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaArrowRight, FaGavel, FaUserTie, FaEye, FaGraduationCap } from "react-icons/fa";
import { MdCategory, MdDescription, MdVerified } from "react-icons/md";
import { IoAlertOutline } from "react-icons/io5";
import Logo from "../../assets/images/logo.png";
import Feature1 from "../../assets/images/registerpage.png";
import Feature2 from "../../assets/images/registerpage1.png";

const Registration = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
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
      await axios.post("http://localhost:5000/api/user/register", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role,
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
      password: "",
      confirmPassword: "",
      agree: false,
      certNo: "",
      specialization: "",
      experience: "",
      bio: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full  bg-white shadow-sm px-10 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaGavel/>
          <span className="text-xl font-bold text-black">
            Esue
          </span>
        </div>
        <Link
          to="/auth/login"
          className="flex items-center gap-2"
          >
            <p className="text-blue-500">Already have account?</p>
            <button className="text-white bg-blue-600 rounded-lg text-sm font-medium hover:underline border px-4 py-2  ">Login</button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        <div className="flex flex-col justify-baseline px-6 sm:px-12 lg:px-20 py-10 bg-gray-200">
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
            <MdVerified className="w-5 h-5 rounded-full" alt="" />
              Verified lawyers and secure client matching.
            </li>
            <li className="flex items-center gap-2">
              <MdVerified className="w-5 h-5 rounded-full" alt="" />
              Effortless appointment scheduling & management.
            </li>
            <li className="flex items-center gap-2">
             <MdVerified className="w-5 h-5 rounded-full" alt="" />
              Secure document sharing and mesaaging.
            </li>
          </ul>
            <div className="bg-[url('./assets/images/logo.png')] p-5 flex justify-end items-end  bg-cover bg-no-repeat aspect-auto w-100 h-60 rounded-lg" >
              <div className="bg-white w-full h-12 rounded-lg p-3">
                <div className="relative "> 
            <img src={Logo} className="w-6 h-6 rounded-full float-left absolute border-gray-500 " alt="" />
            <img src={Feature1} className="w-6 h-6 rounded-full float-left absolute left-4 border-gray-500" alt="" />
            <img src={Feature2} className="w-6 h-6 rounded-full float-left absolute left-7 border-gray-500" alt="" />
            
                </div>
          <p className="text-sm text-black flex justify-center items-end">
            Trusted by 12,000+ users
          </p>
              </div>
            </div>
        </div>

        <div className=" flex items-center justify-center px-4 py-5 bg-gray-200">
          <div
            className="w-full   bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-1">
              Create your account
            </h2>
            <p className="text-sm text-blue-600 mb-6">
              Get started in less than a minute
            </p>

            <div className="flex gap-3 mb-3 md:md-0">
              <button
                type="button"
                onClick={() => handleSelectRole("client")}
                className={`w-1/2 py-1 rounded-lg border border-gray-300 font-medium flex justify-center items-center gap-2 ${
                  role === "client"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-blue-500"
                }`}
              >
                <FaUser/> I am a Client
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("lawyer")}
                className={`w-1/2 py-1 rounded-lg border border-gray-300 font-medium flex justify-center items-center gap-2 ${
                  role === "lawyer"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-blue-500"
                }`}
              >
                <FaUserTie/> I am a Lawyer
              </button>
            </div>

            {role === "client" ? (
              <ClientRegform
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
                loading={loading}
              />
            ) : (
              <LawyerRegform
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
                loading={loading}
              />
            )}
          
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ icon, ...props }) => (
  <div
    className="
      h-10 flex items-center
      bg-gray-100 rounded-lg
      px-3 
      transition
      focus-within:ring-2 focus-within:ring-blue-600
    "
  >
    <span className="text-gray-500 mr-2 pointer-events-none">
      {icon}
    </span>

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
  </div>
);

const ClientRegform = ({ formData, handleChange, handleSubmit, error, loading }) => {
  return (
    <div>
      <form
            onSubmit={handleSubmit}
            className="w-full bg-white  rounded-xl p-8 "
          >
            <div className="space-y-4">
              <label>Full Name</label>
              <Input icon={<FaUser />} name="name" placeholder="e.g.Jane Doe" onChange={handleChange} value={formData.name} />
              <label>Phone Number</label>
              <Input icon={<FaPhone />} name="phone" placeholder="(+91)1800 030 020" onChange={handleChange} value={formData.phone} />
              <label>Email Address</label>
              <Input icon={<FaEnvelope />} name="email" placeholder="name@example.com" onChange={handleChange} value={formData.email} />
              <label>Password</label>
              <Input icon={<FaLock />} name="password" type="password" placeholder="Create a Password" onChange={handleChange} value={formData.password} />
              <label>Confirm Password</label>
              <Input icon={<FaLock />} name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="agree"
                onChange={handleChange}
                checked={formData.agree}
                className="mr-2"
              />
              <p className="text-sm text-black">
                I agree to  <span className="text-blue-700">Terms</span> & <span className="text-blue-700">Privacy Policy</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <FaArrowRight className="inline mr-2 m-2" />
            </button>

          </form>
    </div>
  );
}
const LawyerRegform = ({ formData, handleChange, handleSubmit, error, loading }) => {
  return (
    <div>
      <form
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-xl  p-8"
          >

            <div className="space-y-4">
              <label>Full Name</label>
              <Input icon={<FaUser />} name="name" placeholder="e.g.Jake Doe" onChange={handleChange} value={formData.name} />
              <label>Phone Number</label>
              <Input icon={<FaPhone />} name="phone" placeholder="+1(900)822 030 0210" onChange={handleChange} value={formData.phone} />
              <label>Email Address</label>
              <Input icon={<FaEnvelope />} name="email" placeholder="Lawyerexample.com" onChange={handleChange} value={formData.email} />
              <label>Liecence Number</label>
              <Input icon={<IoAlertOutline/>} name="certNo" type="text" placeholder="Add LC number" onChange={handleChange} value={formData.certNo || ""} />
              <label>Type of Lawyer</label>
              <Input icon={<MdCategory />} name="specialization" type="text" placeholder="e.g.Criminal Lawyer" onChange={handleChange} value={formData.specialization || ""} />
              <label>Year of Experience</label>
              <Input icon={<FaGraduationCap />} name="experience" type="number" placeholder="Exprerience Year" onChange={handleChange} value={formData.experience || ""} />
              <label>Description</label>
              <Input icon={<MdDescription />} name="bio" type="text" placeholder="Description" onChange={handleChange} value={formData.bio || ""} />
              <label>Password</label>
              <Input icon={<FaLock />} name="password" type="password" placeholder="Create a Password" onChange={handleChange} value={formData.password} />
              <label>Confirm Password</label>
              <Input icon={<FaLock />} name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="agree"
                onChange={handleChange}
                checked={formData.agree}
                className="mr-2"
              />
              <p className="text-sm text-black">
                I agree to <span className="text-blue-700">Terms</span> & <span className="text-blue-700">Privacy Policy</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <FaArrowRight className="inline mr-2 m-2" />
            </button>
          </form>
    </div>
  );
}

export default Registration;
