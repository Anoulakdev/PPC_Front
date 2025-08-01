"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/Sidebar/AppSidebarSuperAdmin";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

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
        <AppSidebar />
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
