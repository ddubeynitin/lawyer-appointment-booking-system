import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaGavel, FaShieldAlt } from "react-icons/fa";
import { RiLoginBoxLine } from "react-icons/ri";
import { MdEmail, MdLock } from "react-icons/md";
import { API_URL } from "../../utils/api";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    axios
      .post(`${API_URL}/admin/login`, { email, password })
      .then(() => {
        alert("Login successful");
        navigate("/admin/admin-dashboard");
      })
      .catch(() => {
        alert("Invalid email or password");
      });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#e5eefc_42%,_#f8fbff_100%)] flex items-center justify-center px-4 py-8 font-barlow">
      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.25)] backdrop-blur">
        <div className="grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-slate-950 via-slate-900 to-blue-900 p-10 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <FaGavel className="text-2xl" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-blue-200">
                  Admin Portal
                </p>
                <h1 className="text-3xl font-semibold">JustifAi</h1>
              </div>
            </div>

            <div className="max-w-md">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100 ring-1 ring-white/10">
                <FaShieldAlt />
                Secure access for administrators
              </p>
              <h2 className="text-4xl font-bold leading-tight">
                Manage the legal platform from one clean dashboard.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Review appointments, oversee users, and keep the system running
                smoothly with a focused admin workspace.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              Protected login area for authorized staff only.
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                    <FaGavel />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-blue-600">
                      Admin Portal
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                      JustifAi
                    </h1>
                  </div>
                </div>
                <Link
                  to="/"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Home
                </Link>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 sm:p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Welcome back
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    Admin Login
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to access the administrative dashboard.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleAdminLogin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <MdEmail className="text-xl text-blue-600" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <MdLock className="text-xl text-blue-600" />
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700"
                  >
                    <RiLoginBoxLine className="text-xl" />
                    Sign in
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage
