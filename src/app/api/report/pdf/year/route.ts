/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import moment from "moment";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function GET(req: NextRequest) {
  let browser;

  try {
    const { searchParams } = new URL(req.url);
    const powerId = searchParams.get("powerId");
    const sYear = searchParams.get("sYear");

    // ✅ ดึง token จาก cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ สร้าง URL สำหรับเรียก NestJS API
    const apiUrl = powerId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/year?powerId=${powerId}&sYear=${sYear}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/year?sYear=${sYear}`;

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
      landscape: true,
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
        "Content-Disposition": `attachment; filename=Yearly_Report_${moment().format("DDMMYYYY_HHmmss")}.pdf`,
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
            size: A4 landscape; 
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
            margin: 3px 0;
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
            font-size: 7pt;
          }
          
          th, td { 
            border: 1px solid #000; 
            padding: 6px 2px;
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
            margin-top: 30px;
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

// Helper function สำหรับสร้างแต่ละหน้า
function generatePage(item: any) {
  const turbines = item.powerCurrent?.currentTurbines || [];

  return `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <h1>${item.power?.company?.name || "-"}</h1>
        <h2>Yearly Availability and Declaration</h2>
      </div>
      
      <!-- Declaration Info -->
      <div class="info-row">
        <div class="info-item">
          <strong>${item.power?.name || "-"} Power Plant</strong>
        </div>
        <div class="info-item" style="margin: 0 5px;">
          <strong>Declaration for Year:</strong> ${item.sYear || "-"}
        </div>
        <div class="info-item">
          <strong>Create Document:</strong> ${moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>

      <table>
        <thead>
          <!-- แถวที่ 1: Day -->
          <tr>
            <th rowspan="2">Month</th>
            ${turbines.map((t: any) => `<th>${t.thead}</th>`).join("")}
          </tr>
          <!-- แถวที่ 2: TIME (วันที่) -->
          <tr>
            ${turbines.map((t: any) => `<th>${t.unit}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${generateMonthlyRows(turbines)}
        </tbody>
      </table>

      
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
function generateMonthlyRows(turbines: any[]) {
  const rows: string[] = [];

  for (let i = 0; i < 12; i++) {
    rows.push(`
      <tr>
        <td class="left">${MONTHS[i]}</td>
        ${turbines
          .map((t: any) => `<td>${formatNumber(t.tbody?.[i])}</td>`)
          .join("")}
      </tr>
    `);
  }

  return rows.join("");
}
