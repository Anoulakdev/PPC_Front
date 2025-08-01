/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getLocalStorage, removeLocalStorage } from "@/utils/storage";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupInterceptors = (router: any) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getLocalStorage("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          removeLocalStorage("token");
          removeLocalStorage("user");
          removeLocalStorage("day-power-storage");
          removeLocalStorage("week-power-storage");
          removeLocalStorage("month-power-storage");
          removeLocalStorage("create-report-storage");

          // ลบ token จาก cookie
          document.cookie = "token=; path=/; max-age=0";

          router.push("/");
        } else if (status === 403) {
          router.push("/unauthorized");
        } else if (status >= 500) {
          console.error("Server error");
        }
      }
      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
