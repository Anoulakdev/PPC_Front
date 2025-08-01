/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { setLocalStorage, getLocalStorage } from "@/utils/storage";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
        router.push("/dashboard");
      } else {
        toast.error("Invalid User Role");
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
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        { email, password },
      );
      const { token, user } = response.data;

      // Save token and user using the utility function
      setLocalStorage("token", token);
      setLocalStorage("user", user);

      document.cookie = `token=${token}; path=/; max-age=3600; secure; samesite=strict`;

      // Redirect to the dashboard
      toast.success("Login Success");
      redirectUser(user);
    } catch (err: any) {
      toast.error("Login Fail");
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-2"
      style={{ backgroundImage: "url('/_MG_1557.jpg')" }}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-5 flex flex-col items-center text-center">
          <Image src={`/edl.png`} alt="nophoto" width={100} height={100} />
          <h2 className="mt-3 text-3xl font-bold text-blue-600">
            EDL Power Purchase
          </h2>
        </div>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="text-md mb-2 block font-bold text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="relative mb-6">
            <label
              className="text-md mb-2 block font-bold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center pb-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeIcon className="h-6 w-6" />
                ) : (
                  <EyeSlashIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          <div>
            <button
              className="focus:shadow-outline w-full rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
