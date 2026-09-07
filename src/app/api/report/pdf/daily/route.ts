/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import moment from "moment";
import { getHoursByHourListId } from "@/utils/hoursHelper";

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
        top: "4mm",
        right: "6mm",
        bottom: "4mm",
        left: "6mm",
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
            margin: 0;
            padding: 0;
          }
          
          .page { 
            page-break-after: always;
            box-sizing: border-box;
          }

          .page:last-child {
            page-break-after: auto;
          }
          
          .header {
            text-align: center;
            border-bottom: 1.5px solid #000;
          }
          
          .header h1 {
            margin: 0;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 0;
            font-weight: normal;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
          }
          
          .info-item {
            flex: 1;
            border: 1px solid #666;
            background-color: #f5f5f5;
          }
          
          .info-item strong {
            font-weight: bold;
          }
          
          .section-title {
            background-color: #d0d0d0;
            font-weight: bold;
            border: 1px solid #000;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          th, td { 
            border: 1px solid #000; 
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
            gap: 6px;
          }
          
          .column {
            width: 48%;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 50px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .signature-box {
            width: 45%;
            text-align: center;
          }

          .signature-box strong {
            display: block;
            margin-bottom: 2px;
            text-decoration: underline;
          }
          
          .total-row {
            background-color: #e0e0e0;
            font-weight: bold;
          }

          /* ==================== SLOTS 24 (Maximized to fill single page) ==================== */
          .slots-24 {
            padding: 8px 10px;
            font-size: 9.5pt;
          }
          .slots-24 .header {
            margin-bottom: 6px;
            padding-bottom: 5px;
          }
          .slots-24 .header h1 { font-size: 14pt; }
          .slots-24 .header h2 { font-size: 11pt; }
          .slots-24 .info-row {
            margin: 5px 0;
            font-size: 8.5pt;
          }
          .slots-24 .info-item { padding: 4px 8px; }
          .slots-24 .section-title {
            padding: 4px 8px;
            margin-top: 6px;
            margin-bottom: 3px;
            font-size: 9pt;
          }
          .slots-24 .hourly-table {
            font-size: 9pt;
            line-height: 1.35;
          }
          .slots-24 .hourly-table th { padding: 5.5px 3px; }
          .slots-24 .hourly-table td { padding: 6.8px 3px; }
          .slots-24 .right-table {
            font-size: 8.5pt;
            line-height: 1.3;
          }
          .slots-24 .right-table th { padding: 5px 3px; }
          .slots-24 .right-table td { padding: 6px 3px; }
          .slots-24 .signature-section {
            margin-top: 25px;
            font-size: 9pt;
          }
          .slots-24 .signature-line { margin-top: 15px; }

          /* ==================== SLOTS 48 (Maximized to fill single page) ==================== */
          .slots-48 {
            padding: 6px 8px;
            font-size: 8.5pt;
          }
          .slots-48 .header {
            margin-bottom: 4px;
            padding-bottom: 3px;
          }
          .slots-48 .header h1 { font-size: 12.5pt; }
          .slots-48 .header h2 { font-size: 10pt; }
          .slots-48 .info-row {
            margin: 3px 0;
            font-size: 8pt;
          }
          .slots-48 .info-item { padding: 2.5px 5px; }
          .slots-48 .section-title {
            padding: 2.5px 6px;
            margin-top: 4px;
            margin-bottom: 2px;
            font-size: 8.5pt;
          }
          .slots-48 .hourly-table {
            font-size: 7.2pt;
            line-height: 1.2;
          }
          .slots-48 .hourly-table th { padding: 3px 2px; }
          .slots-48 .hourly-table td { padding: 2.8px 2px; }
          .slots-48 .right-table {
            font-size: 8pt;
            line-height: 1.25;
          }
          .slots-48 .right-table th { padding: 3.5px 2px; }
          .slots-48 .right-table td { padding: 3.6px 2px; }
          .slots-48 .signature-section {
            margin-top: 14px;
            font-size: 8.5pt;
          }
          .slots-48 .signature-line { margin-top: 12px; }

          /* ==================== SLOTS 96 (Maximized to fill single page) ==================== */
          .slots-96 {
            padding: 4px 6px;
            font-size: 7.5pt;
          }
          .slots-96 .header {
            margin-bottom: 2px;
            padding-bottom: 2px;
          }
          .slots-96 .header h1 { font-size: 11pt; }
          .slots-96 .header h2 { font-size: 9pt; }
          .slots-96 .info-row {
            margin: 2px 0;
            font-size: 7.2pt;
          }
          .slots-96 .info-item { padding: 1.5px 4px; }
          .slots-96 .section-title {
            padding: 1.5px 4px;
            margin-top: 2px;
            margin-bottom: 1px;
            font-size: 7.5pt;
          }
          .slots-96 .hourly-table {
            font-size: 5.4pt;
            line-height: 1.08;
          }
          .slots-96 .hourly-table th { padding: 1.5px 1px; }
          .slots-96 .hourly-table td { padding: 0.35px 1px; }
          .slots-96 .right-table {
            font-size: 7pt;
            line-height: 1.15;
          }
          .slots-96 .right-table th { padding: 2px 2px; }
          .slots-96 .right-table td { padding: 1.6px 2px; }
          .slots-96 .signature-section {
            margin-top: 6px;
            font-size: 7.5pt;
          }
          .slots-96 .signature-line { margin-top: 7px; }
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
  const hourlyLength = powerCurrent?.originalTurbines?.[0]?.hourly?.length;
  const activeHours = getHoursByHourListId(item.power?.hourListId, hourlyLength);
  const slotCount = activeHours.length || 24;

  return `
    <div class="page slots-${slotCount}">
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
        <div class="info-item" style="margin: 0 4px;">
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
          <table class="hourly-table">
            <thead>
              <tr>
                <th style="width: 35%;">Time Of Day</th>
                <th style="width: 30%;">Total (MWh)</th>
                <th style="width: 35%;">Remark</th>
              </tr>
            </thead>
            <tbody>
              ${generateHourlyRows(powerCurrent?.originalTurbines, powerCurrent?.remarks, item.power?.hourListId)}
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
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="section-title">Data Yesterday: ${moment(item.powerDate).format("DD/MM/YYYY")}</div>

          ${
            item.power?.fuelId === 1
              ? `
        <table class="right-table">
        <thead>
          <tr>
              <th style="width: 50%;">Descriptions</th>
              <th style="width: 25%;">Value</th>
              <th style="width: 25%;">Unit</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
        </table>
          `
              : `
        <table class="right-table">
        <thead>
          <tr>
              <th style="width: 50%;">Descriptions</th>
              <th style="width: 25%;">Value</th>
              <th style="width: 25%;">Unit</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
        </table>
        `
          }

        ${
          item.power?.fuelId === 1
            ? `
        <div class="section-title">Data Today: ${moment(item.powerDate).add(1, "day").format("DD/MM/YYYY")}</div>

        <table class="right-table">
        <thead>
          <tr>
              <th style="width: 50%;">Descriptions</th>
              <th style="width: 25%;">Value</th>
              <th style="width: 25%;">Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
              <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Active Storage:</td>
              <td>${formatNumber(item.dayReportCurrent?.activeStorageamount)}</td>
              <td>m³</td>
          </tr>
          <tr>
              <td>${formatNumber(item.dayReportCurrent?.activeStorageaverage)}</td>
              <td>%</td>
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
        </tbody>
        </table>
        `
            : ""
        }

        </div>
      </div>

      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box"></div>
        <div class="signature-box">
          <strong>Issued by ${item.power?.name || "-"}</strong>
          <div class="signature-line">
            <div>Name: ${item.dayReportHistory?.createdByUser ? `${item.dayReportHistory?.createdByUser.firstname} ${item.dayReportHistory?.createdByUser.lastname}` : "___________________"}</div>
            <div>Date: ${item.dayReportHistory?.createdAt ? moment(item.dayReportHistory?.createdAt).format("DD/MM/YYYY HH:mm:ss") : "___________________"}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ✅ Helper function สำหรับสร้างแถวข้อมูลรายชั่วโมง (รองรับ 24, 48, 96 slots ตาม hourListId)
function generateHourlyRows(
  turbines: any[],
  remarks: string[] = [],
  hourListId?: number | null,
) {
  if (!turbines || turbines.length === 0)
    return '<tr><td colspan="3">No data</td></tr>';

  const hourlyLength = turbines[0]?.hourly?.length;
  const activeHours = getHoursByHourListId(hourListId, hourlyLength);
  const slotCount = activeHours.length;

  const rows = [];
  for (let idx = 0; idx < slotCount; idx++) {
    const timeRange = activeHours[idx];

    // ✅ จัดการค่า null/undefined และแปลงเป็นตัวเลข
    const turbineValues = turbines.map((t) => {
      const hourlyData = t.hourly || [];
      const value = hourlyData[idx];
      return parseFloat(value) || 0;
    });

    const remark = remarks[idx] || "";

    rows.push(`
      <tr>
        <td>${timeRange}</td>
        ${turbineValues.map((val) => `<td>${formatNumber(val)}</td>`).join("")}
        <td style="white-space: normal; word-break: break-word;">${remark}</td>
      </tr>
    `);
  }

  return rows.join("");
}
