"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebarEDL from "@/layout/Sidebar/AppSidebarEDL";
import AppSidebarMinistry from "@/layout/Sidebar/AppSidebarMinistry";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLocalStorage } from "@/utils/storage";

type User = {
  roleId?: number;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getLocalStorage("user") as User | null;
    setUser(storedUser);
  }, []);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  const renderSidebar = () => {
    if (user?.roleId && [3, 4].includes(user.roleId)) {
      return <AppSidebarEDL />;
    } else if (user?.roleId && [9].includes(user.roleId)) {
      return <AppSidebarMinistry />;
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
