import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppInitializer } from "@/components/AppInitializer";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSansLao.className} dark:bg-gray-900`}>
        <AppInitializer />
        <ThemeProvider>
          <SidebarProvider>
            <ToastContainer
              autoClose={3000} // เวลาแสดงผล 5 วินาที (หน่วยเป็นมิลลิวินาที)
              hideProgressBar={false} // แสดงแถบความคืบหน้า
              position="top-right" // ตำแหน่งข้อความแจ้งเตือน
              pauseOnHover={false} // หยุดการนับถอยหลังเมื่อเอาเมาส์ไปวาง
            />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
