"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupInterceptors } from "@/utils/axiosInstance";

export const AppInitializer = () => {
  const router = useRouter();

  useEffect(() => {
    setupInterceptors(router);
  }, [router]);

  return null;
};
