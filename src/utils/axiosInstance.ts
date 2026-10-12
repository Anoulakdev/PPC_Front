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

let isInitialized = false;
let currentRouter: any = null;

export const setupInterceptors = (router: any) => {
  currentRouter = router;
  if (isInitialized) return;
  isInitialized = true;

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
          removeLocalStorage("year-power-storage");
          removeLocalStorage("create-report-storage");
          removeLocalStorage("day-filter-page");
          removeLocalStorage("week-filter-page");
          removeLocalStorage("month-filter-page");
          removeLocalStorage("year-filter-page");
          removeLocalStorage("dayreport-filter-page");

          // ลบ token จาก cookie
          document.cookie = "token=; path=/; max-age=0";

          if (currentRouter) {
            currentRouter.push("/");
          } else if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        } else if (status === 403) {
          if (currentRouter) {
            currentRouter.push("/unauthorized");
          } else if (typeof window !== "undefined") {
            window.location.href = "/unauthorized";
          }
        } else if (status >= 500) {
          console.error("Server error");
        }
      }
      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
