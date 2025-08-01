/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebarSuperAdmin from "@/layout/Sidebar/AppSidebarSuperAdmin";
import AppSidebarAdmin from "@/layout/Sidebar/AppSidebarAdmin";
import AppSidebarEDL from "@/layout/Sidebar/AppSidebarEDL";
import AppSidebarPower from "@/layout/Sidebar/AppSidebarPower";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLocalStorage } from "@/utils/storage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser);
  }, []);
  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  const renderSidebar = () => {
    if ([1].includes(user?.roleId)) {
      return <AppSidebarSuperAdmin />;
    } else if ([2].includes(user?.roleId)) {
      return <AppSidebarAdmin />;
    } else if ([3, 4].includes(user?.roleId)) {
      return <AppSidebarEDL />;
    } else if ([5, 6].includes(user?.roleId)) {
      return <AppSidebarPower />;
    }
  };

  return (
    <>
      <ToastContainer
        autoClose={3000} // เวลาแสดงผล 5 วินาที (หน่วยเป็นมิลลิวินาที)
        hideProgressBar={false} // แสดงแถบความคืบหน้า
        position="top-right" // ตำแหน่งข้อความแจ้งเตือน
        pauseOnHover={false} // หยุดการนับถอยหลังเมื่อเอาเมาส์ไปวาง
      />
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        {renderSidebar()}
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="mx-auto max-w-screen-2xl p-2 md:py-6">{children}</div>
        </div>
      </div>
    </>
  );
}
