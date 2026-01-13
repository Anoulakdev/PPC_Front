/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import moment from "moment";

export async function GET(req: NextRequest) {
  let browser;

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const powerId = searchParams.get("powerId");

    // ✅ ดึง token จาก cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ สร้าง URL สำหรับเรียก NestJS API
    const apiUrl = powerId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dayreports?powerId=${powerId}&startDate=${startDate}&endDate=${endDate}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/dayreports?startDate=${startDate}&endDate=${endDate}`;

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
        "Content-Disposition": `attachment; filename=Daily_Report_${moment().format("DDMMYYYY_HHmmss")}.pdf`,
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
            margin-top: 3px;
            font-size: 8pt;
          }
          
          th, td { 
            border: 1px solid #000; 
            padding: 4px 2px;
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
            margin-top: 25px;
            font-size: 8.5pt;
          }
          
          .signature-box {
            width: 48%;
          }
          
          .signature-box strong {
            display: block;
            margin-bottom: 3px;
            text-decoration: underline;
          }
          
          .signature-line {
            margin-top: 20px;
            padding-top: 5px;
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
  const powerCurrent = item.dayReportCurrent?.powerCurrent;

  return `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <h1>${item.power?.company?.name || "-"}</h1>
        <h2>Daily Report</h2>
      </div>
      
      <!-- Declaration Info -->
      <div class="info-row">
        <div class="info-item">
          <strong>${item.power?.name || "-"} Power Plant</strong>
        </div>
        <div class="info-item" style="margin: 0 5px;">
          <strong>Daily Report for Date:</strong> ${moment(item.powerDate).format("DD/MM/YYYY")}
        </div>
        <div class="info-item">
          <strong>Create Document:</strong> ${moment(item.dayReportCurrent?.createdAt).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>
      
      
      <!-- Declaration & Dispatch Programs (Side by Side) -->
      <div class="two-column">
        <div class="column">
          <div class="section-title">Hourly Power Generation (MWh)</div>
          <table>
            <tr>
              <th style="width: 30%;">Time Of Day</th>
              <th style="width: 15%;">Total (MWh)</th>
              <th style="width: 15%;">Remark</th>
            </tr>
            ${generateHourlyRows(powerCurrent?.originalTurbines, powerCurrent?.remarks)}
            <tr class="total-row">
              <td>Total (MWh)</td>
              ${
                powerCurrent?.originalTurbines
                  ?.map((t: any) => {
                    const total = (t.hourly || []).reduce(
                      (sum: number, val: any) => sum + (parseFloat(val) || 0),
                      0,
                    );
                    return `<td>${formatNumber(total)}</td>`;
                  })
                  .join("") ?? ""
              }
              
              <td></td>
            </tr>
          </table>
        </div>

        <div class="column">
          <div class="section-title">Data Yesterday: ${moment(item.powerDate).format("DD/MM/YYYY")}</div>
        <table>
        <tr>
            <th style="width: 50%;">Descriptions</th>
            <th style="width: 25%;">Value</th>
            <th style="width: 25%;">Unit</th>
        </tr>
        
        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">InFlow:</td>
            <td>${formatNumber(item.dayReportCurrent?.inflowamount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(item.dayReportCurrent?.inflowaverage)}</td>
            <td>m³/s</td>
        </tr>

        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Turbine Dischard:</td>
            <td>${formatNumber(item.dayReportCurrent?.tdAmount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(item.dayReportCurrent?.tdAverage)}</td>
            <td>m³/s</td>
        </tr>

        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Spill Way:</td>
            <td>${formatNumber(item.dayReportCurrent?.spillwayamount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(item.dayReportCurrent?.spillwayaverage)}</td>
            <td>m³/s</td>
        </tr>

        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Other Water Released:</td>
            <td>${formatNumber(item.dayReportCurrent?.owramount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(item.dayReportCurrent?.owraverage)}</td>
            <td>m³/s</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Rain fall:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.rainFall)}</td>
            <td style="width: 15%;">mm</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Power Generation:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.powerGeneration)}</td>
            <td style="width: 15%;">kWh</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Net Energy Import:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.netEnergyImport)}</td>
            <td style="width: 15%;">kWh</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Net Energy Output:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.netEnergyOutput)}</td>
            <td style="width: 15%;">kWh</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Water Rate:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.waterRate)}</td>
            <td style="width: 15%;">m³/kWh</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Total Outflow:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.totalOutflow)}</td>
            <td style="width: 15%;">m³</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Average Outflow:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.averageOutflow)}</td>
            <td style="width: 15%;">m³/s</td>
        </tr>
        
        </table>

        <div class="section-title">Data Today: ${moment(item.powerDate).add(1, "day").format("DD/MM/YYYY")}</div>

        <table>
        <tr>
            <th style="width: 50%;">Descriptions</th>
            <th style="width: 25%;">Value</th>
            <th style="width: 25%;">Unit</th>
        </tr>
        
        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Active Storage:</td>
            <td>${formatNumber(item.dayReportCurrent?.activeStorageamount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(item.dayReportCurrent?.activeStorageaverage)}</td>
            <td>m³/s</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Water Level:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.waterLevel)}</td>
            <td style="width: 15%;">masl</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Diff with Yesterday:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.dwy)}</td>
            <td style="width: 15%;">m</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Diff with Full:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.dwf)}</td>
            <td style="width: 15%;">m</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Diff with Min:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.dwm)}</td>
            <td style="width: 15%;">m</td>
        </tr>

        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Potential Water Storage:</td>
            <td style="width: 25%;">${formatNumber(item.dayReportCurrent?.pws)}</td>
            <td style="width: 15%;">m³</td>
        </tr>
        </table>

        </div>
      </div>

      <!-- Signatures -->
            <div class="signature-section">
              <div class="signature-box">
                <strong>Issued by ${item.power?.name || "-"}</strong>
                <div class="signature-line">
                  <div>Name: ${item.dayReportHistory?.createdByUser ? `${item.dayReportHistory?.createdByUser.firstname} ${item.dayReportHistory?.createdByUser.lastname}` : "_______________________"}</div>
                  <div>Date: ${item.dayReportHistory?.createdAt ? moment(item.dayReportHistory?.createdAt).format("DD/MM/YYYY HH:mm:ss") : "_____________"}</div>
                </div>
              </div>
              
              
            </div>

    </div>
  `;
}

// ✅ Helper function สำหรับสร้างแถวข้อมูลรายชั่วโมง (แก้ไขแล้ว)
function generateHourlyRows(turbines: any[], remarks: string[] = []) {
  if (!turbines || turbines.length === 0)
    return '<tr><td colspan="6">No data</td></tr>';

  const rows = [];
  for (let hour = 0; hour < 24; hour++) {
    const timeRange = `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`;

    // ✅ แก้ไข: จัดการค่า null/undefined และแปลงเป็นตัวเลข
    const turbineValues = turbines.map((t) => {
      const hourlyData = t.hourly || [];
      const value = hourlyData[hour];
      return parseFloat(value) || 0;
    });

    // ✅ คำนวณผลรวมและแสดงทศนิยม 2 ตำแหน่ง
    // const total = turbineValues.reduce((sum, val) => sum + val, 0);
    const remark = remarks[hour] || "";

    rows.push(`
      <tr style="font-size:8pt;">
        <td>${timeRange}</td>
        ${turbineValues.map((val) => `<td>${formatNumber(val)}</td>`).join("")}
        <td style="white-space: normal; word-break: break-word;">${remark}</td>
      </tr>
    `);
  }

  return rows.join("");
}
