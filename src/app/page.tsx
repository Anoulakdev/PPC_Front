/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from "@/utils/storage";
// import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const router = useRouter();

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const redirectUser = useCallback(
    (user: any) => {
      if (user.roleId === 1) {
        router.push("/role");
      } else if (user.roleId === 2) {
        router.push("/company");
      } else if (
        user.roleId === 3 ||
        user.roleId === 4 ||
        user.roleId === 5 ||
        user.roleId === 6
      ) {
        router.push("/dashboard/day");
      } else if (user.roleId === 8) {
        router.push("/energy");
      } else {
        showAlert("error", "Invalid User Role");
        // toast.error("Invalid User Role");
      }
    },
    [router], // ใช้ router เป็น dependency
  );

  useEffect(() => {
    const user = getLocalStorage("user");
    if (user) {
      redirectUser(user);
    }
  }, [redirectUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // เริ่มโหลด

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        { email, password },
      );
      const { token, user } = response.data;

      // Save token and user using the utility function
      setLocalStorage("token", token);
      setLocalStorage("user", user);

      const maxAge = user.roleId === 8 ? 108000 : 3600;
      document.cookie = `token=${token}; path=/; max-age=${maxAge}; secure; samesite=strict`;

      removeLocalStorage("day-filter-page");
      removeLocalStorage("week-filter-page");
      removeLocalStorage("month-filter-page");
      removeLocalStorage("year-filter-page");
      removeLocalStorage("dayreport-filter-page");

      showAlert("success", "Login Success");

      setTimeout(() => {
        redirectUser(user);
      }, 1500);

      // Redirect to the dashboard
      // toast.success("Login Success");
      // redirectUser(user);
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Login Fail");
      // toast.error("Login Fail");
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false); // จบการโหลด
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12 font-outfit overflow-hidden select-none"
      style={{ backgroundImage: "url('/_MG_1557.jpg')" }}
    >



      {/* Mesmerizing Ambient Aurora Backlights behind the card */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-500/38 blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 20, -35, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[20%] right-[25%] translate-x-1/2 translate-y-1/2 w-[320px] h-[320px] rounded-full bg-orange-500/28 blur-[100px]"
        />
      </div>

      {/* Sliding Glassmorphic Toast Notifications */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -50, x: "-50%", scale: 0.95 }}
            className="fixed top-6 left-1/2 z-50 pointer-events-none"
          >
            <div className={`flex items-center gap-4 px-6 py-4.5 rounded-2xl shadow-theme-xl backdrop-blur-xl border ${alert.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
              {alert.type === "success" ? (
                <CheckCircleIcon className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-rose-400 shrink-0" />
              )}
              <div className="flex flex-col text-left">
                {/* <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {alert.type === "success" ? "Access Granted" : "Security Alert"}
                </span> */}
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{alert.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] rounded-[2.5rem] border border-white/25 bg-white/70 p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.22)] backdrop-blur-2xl dark:bg-gray-950/70 dark:border-white/10 dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)]"
      >
        {/* Branding & Header Section */}
        <div className="mb-8 flex flex-col items-center text-center">

          {/* Transparent Logo Container with Gentle Float Animation */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.96 }}
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              type: "spring",
              stiffness: 400,
              damping: 15
            }}
            className="relative flex items-center justify-center mb-2"
          >
            <Image src="/edl.png" alt="EDL Logo" width={90} height={90} className="object-contain filter drop-shadow-md" />
          </motion.div>

          <h2 
            className="mt-4.5 text-3xl font-extrabold tracking-tight select-none dark:brightness-110"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #2563eb, #2563eb 2px, #0086c9 2px, #0086c9 4px, #60a5fa 4px, #60a5fa 6px)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 2px 10px rgba(37, 99, 235, 0.05)",
            }}
          >
            EDL Power Purchase
          </h2>

          {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Please log in to manage power purchase credentials.
          </p> */}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex gap-3 rounded-2xl bg-error-50/50 border border-error-100/50 p-4 text-sm text-error-700 backdrop-blur-md dark:bg-error-950/20 dark:border-error-900/30 dark:text-error-400"
          >
            <XCircleIcon className="h-5 w-5 shrink-0 text-error-600 dark:text-error-500" />
            <div className="flex flex-col text-left">
              {/* <span className="font-semibold text-xs uppercase tracking-wider text-error-800 dark:text-error-300">Security Alert</span> */}
              <span className="mt-0.5 text-xs text-error-600 dark:text-error-400">{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300">
              Email
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                <EnvelopeIcon className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gmail.com"
                className="block w-full rounded-2xl border border-gray-200/80 bg-white/40 py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400/80 focus:border-brand-500 focus:bg-white/80 focus:ring-[3px] focus:ring-brand-500/15 dark:border-gray-800/80 dark:bg-black/30 dark:text-white dark:focus:border-brand-500 dark:focus:bg-black/60"
                required
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label htmlFor="password" className="block text-xs font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300">
              Password
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                <LockClosedIcon className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full rounded-2xl border border-gray-200/80 bg-white/40 py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400/80 focus:border-brand-500 focus:bg-white/80 focus:ring-[3px] focus:ring-brand-500/15 dark:border-gray-800/80 dark:bg-black/30 dark:text-white dark:focus:border-brand-500 dark:focus:bg-black/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Luxury Radiant Blue Brand Button */}
          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-light-500 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 outline-none transition-all hover:from-brand-700 hover:to-blue-light-600 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
            >
              {loading && (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? "Login..." : "Login"}</span>
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </motion.button>
          </div>
        </form>


      </motion.div>
    </div>
  );


}
