"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { FiMail, FiLock, FiShield } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!Email || !Password) {
        toast.error("Email and Password are required!");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email, Password }),
        });

        const result = await response.json();

        if (response.ok && result.userId) {
          toast.success("Login successful!");
          setTimeout(() => {
            router.push(
              `/Shifts/Reservation/Room?id=${encodeURIComponent(result.userId)}`
            );
          }, 800);
        } else {
          toast.error(result.message || "Login failed!");
        }
      } catch {
        toast.error("An error occurred while logging in!");
      } finally {
        setLoading(false);
      }
    },
    [Email, Password, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <ToastContainer className="text-xs" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-700">
        {/* Security Icon */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-600 shadow-lg mb-4">
            <FiShield className="text-white text-3xl" />
          </div>
          <p className="text-sm text-gray-300 font-medium tracking-wide">
            Secure Admin Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-600 shadow-sm">
            <FiMail className="text-cyan-400" />
            <input
              type="email"
              placeholder="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-600 shadow-sm">
            <FiLock className="text-cyan-400" />
            <input
              type="password"
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-lg hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Sign In Securely"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-[11px] text-center text-gray-500 font-medium">
          🔒 Shifts Security Portal © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
