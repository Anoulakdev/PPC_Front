/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import moment from "moment";

export async function GET(req: NextRequest) {
  let browser;

  try {
    const { searchParams } = new URL(req.url);
    const powerId = searchParams.get("powerId");
    const sYear = searchParams.get("sYear");
    const sWeek = searchParams.get("sWeek");

    // ✅ ดึง token จาก cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ สร้าง URL สำหรับเรียก NestJS API
    const apiUrl = powerId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/week?powerId=${powerId}&sYear=${sYear}&sWeek=${sWeek}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/week?sYear=${sYear}&sWeek=${sWeek}`;

    // ✅ ดึงข้อมูลจาก NestJS ด้วย token จาก cookie
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000, // 30 วินาที
    });

    const data = response.data;

    // สร้าง HTML สำหรับ PDF
    const html = generatePDF(data);

    // ✅ Generate PDF ด้วย Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-extensions",
      ],
      timeout: 30000,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      timeout: 60000,
    });

    await browser.close();

    // ✅ ส่ง PDF กลับ client
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Weekly_Report_${moment().format("DDMMYYYY_HHmmss")}.pdf`,
      },
    });
  } catch (error: any) {
    // ปิด browser ถ้ายังเปิดอยู่
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("❌ Error closing browser:", closeError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error.message,
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}

// ✅ Helper function สำหรับแปลงค่าเป็นตัวเลขและจัดการ null/undefined
function formatNumber(value: any, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);
  if (isNaN(num)) return "-";

  // ใช้ en-US เพื่อให้เลขเป็น 0-9 ไม่เป็นไทย/ลาว
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true, // comma หลักพัน
  });
}

// Helper function สำหรับสร้าง HTML
function generatePDF(data: any[]) {
  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4; 
            margin: 0;
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            font-size: 9pt;
            margin: 0;
            padding: 0;
          }
          
          .page { 
            page-break-after: always;
            padding: 15px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          
          .header h1 {
            margin: 3px 0;
            font-size: 14pt;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 2px 0;
            font-size: 11pt;
            font-weight: normal;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 8.5pt;
          }
          
          .info-item {
            flex: 1;
            padding: 3px 8px;
            border: 1px solid #666;
            background-color: #f5f5f5;
          }
          
          .info-item strong {
            font-weight: bold;
          }
          
          .section-title {
            background-color: #d0d0d0;
            padding: 4px 8px;
            font-weight: bold;
            border: 1px solid #000;
            margin-top: 8px;
            font-size: 9pt;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin-top: 9px;
            font-size: 9pt;
          }
          
          th, td { 
            border: 1px solid #000; 
            padding: 5px 3px;
            text-align: center;
          }
          
          th { 
            background-color: #e0e0e0;
            font-weight: bold;
          }
          
          .left-align { text-align: left; }
          .right-align { text-align: right; }
          
          .two-column {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            gap: 5px;
          }
          
          .column {
            width: 48%;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 25px;
            font-size: 9pt;
            gap: 50px;
          }

          .signature-box {
            width: 45%;
            text-align: center;
          }

          .signature-box strong {
            display: block;
            margin-bottom: 3px;
            text-decoration: underline;
          }

          .signature-line {
            margin-top: 20px;
          }
          
          .total-row {
            background-color: #e0e0e0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        ${data.map((item) => generatePage(item)).join("")}
      </body>
    </html>
  `;
}

// Helper function สำหรับคำนวณวันที่ในสัปดาห์
function getWeekDates(startDate: string, endDate: string) {
  const start = moment(startDate);
  const dates = [];
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  for (let i = 0; i < 7; i++) {
    const date = start.clone().add(i, "days");
    dates.push({
      dayName: dayNames[i],
      date: date.format("DD/MM/YYYY"),
    });
  }

  return dates;
}

// Helper function สำหรับสร้างแต่ละหน้า
function generatePage(item: any) {
  const powerCurrent = item.powerCurrent;
  const weekDates = getWeekDates(
    moment(item.startDate).format("YYYY-MM-DD"),
    moment(item.endDate).format("YYYY-MM-DD"),
  );

  return `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <h1>${item.power?.company?.name || "-"}</h1>
        <h2>Weekly Availability and Declaration</h2>
      </div>
      
      <!-- Declaration Info -->
      <div class="info-row">
        <div class="info-item">
          <strong>${item.power?.name || "-"} Power Plant</strong>
        </div>
        <div class="info-item" style="margin: 0 5px;">
          <strong>Declaration for Week:</strong> ${item.sWeek || "-"} / ${item.sYear || "-"}
        </div>
        <div class="info-item">
          <strong>Create Document:</strong> ${moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>

      <table>
        <thead>
          <!-- แถวที่ 1: Day -->
          <tr>
            <th style="width: 15%;">Day</th>
            ${weekDates.map((d) => `<th>${d.dayName}</th>`).join("")}
            <th rowspan="2">Total</th>
            <th rowspan="2" style="width: 15%;">Remark</th>
          </tr>
          <!-- แถวที่ 2: TIME (วันที่) -->
          <tr>
            <th style="width: 15%;">TIME</th>
            ${weekDates.map((d) => `<th style="font-size: 8pt;">${d.date}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${generateHourlyRows(powerCurrent?.currentTurbines, powerCurrent?.remarks)}
          <tr class="total-row">
            <td>Total (MWh)</td>
            ${
              powerCurrent?.currentTurbines
                ?.map((t: any) => {
                  const total = (t.hourly || []).reduce(
                    (sum: number, val: any) => sum + (parseFloat(val) || 0),
                    0,
                  );
                  return `<td>${formatNumber(total)}</td>`;
                })
                .join("") ?? ""
            }
            <td>${formatNumber(powerCurrent?.totalPower)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Remark -->
        ${
          powerCurrent?.remark
            ? `
            <div style="margin-top: 15px;">
            ${powerCurrent?.remark ? `<strong>Remark:</strong><br/>${powerCurrent.remark}` : ""}
            </div>
        `
            : ""
        }

      
      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <strong>Issued by ${item.power?.name || "-"}</strong>
          <div class="signature-line">
            <div>Name: ${item.decAcknowUser ? `${item.decAcknowUser.firstname} ${item.decAcknowUser.lastname}` : "_______________________"}</div>
            <div>Date: ${item.decAcknowAt ? moment(item.decAcknowAt).format("DD/MM/YYYY HH:mm:ss") : "_______________________"}</div>
          </div>
        </div>
        
        <div class="signature-box">
          <strong>Acknowledged by PCD</strong>
          <div class="signature-line">
            <div>Name: ${item.disAcknowUser ? `${item.disAcknowUser.firstname} ${item.disAcknowUser.lastname}` : "_______________________"}</div>
            <div>Date: ${item.disAcknowAt ? moment(item.disAcknowAt).format("DD/MM/YYYY HH:mm:ss") : "_______________________"}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ✅ Helper function สำหรับสร้างแถวข้อมูลรายชั่วโมง (แก้ไขแล้ว)
function generateHourlyRows(turbines: any[], remarks: string[] = []) {
  if (!turbines || turbines.length === 0)
    return '<tr><td colspan="10">No data</td></tr>';

  const rows = [];
  for (let hour = 0; hour < 24; hour++) {
    const timeRange = `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`;

    const turbineValues = turbines.map((t) => {
      const hourlyData = t.hourly || [];
      const value = hourlyData[hour];
      return parseFloat(value) || 0;
    });

    const total = turbineValues.reduce((sum, val) => sum + val, 0);
    const remark = remarks[hour] || "";

    rows.push(`
      <tr>
        <td>${timeRange}</td>
        ${turbineValues.map((val) => `<td>${formatNumber(val)}</td>`).join("")}
        <td>${formatNumber(total)}</td>
        <td style="white-space: normal; word-break: break-word;">${remark}</td>
      </tr>
    `);
  }

  return rows.join("");
}
