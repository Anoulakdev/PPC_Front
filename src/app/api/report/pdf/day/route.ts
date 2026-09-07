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
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/day?powerId=${powerId}&startDate=${startDate}&endDate=${endDate}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/day?startDate=${startDate}&endDate=${endDate}`;

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
        "Content-Disposition": `attachment; filename=Day_Report_${moment().format("DDMMYYYY_HHmmss")}.pdf`,
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
            flex: 1;
            min-width: 0;
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

          .time-col {
            white-space: nowrap;
          }
          .num-col {
            white-space: nowrap;
          }
          th.remark-col {
            white-space: nowrap;
          }
          td.remark-col {
            white-space: normal;
            word-break: break-word;
          }

          /* ==================== SLOTS 24 Base ==================== */
          .slots-24 {
            padding: 5px 8px;
            font-size: 8.5pt;
          }
          .slots-24 .header {
            margin-bottom: 4px;
            padding-bottom: 3px;
          }
          .slots-24 .header h1 { font-size: 13pt; }
          .slots-24 .header h2 { font-size: 10.5pt; }
          .slots-24 .info-row {
            margin: 3px 0;
            font-size: 8pt;
          }
          .slots-24 .info-item { padding: 3px 6px; }
          .slots-24 .section-title {
            padding: 3px 6px;
            margin-top: 4px;
            margin-bottom: 2px;
            font-size: 8.5pt;
          }
          .slots-24 .sub-table td, .slots-24 .sub-table th, .slots-24 .avail-table td, .slots-24 .avail-table th {
            padding: 2.5px 2px;
            font-size: 7.5pt;
          }
          .slots-24 .hourly-table {
            font-size: 8pt;
            line-height: 1.25;
          }
          .slots-24 .hourly-table th { padding: 4px 2px; }
          .slots-24 .hourly-table td { padding: 4.8px 2px; }
          .slots-24 .signature-section {
            margin-top: 18px;
            font-size: 8.5pt;
          }
          .slots-24 .signature-line { margin-top: 12px; }

          /* Tuning 24 slots by Unit Tier */
          /* 1-2 Units */
          .slots-24.u-few .time-col { width: 24%; }
          .slots-24.u-few .remark-col { width: 16%; }

          /* 3-4 Units */
          .slots-24.u-mid .hourly-table {
            font-size: 7.5pt;
            line-height: 1.22;
          }
          .slots-24.u-mid .hourly-table th { padding: 4px 1px; font-size: 7.2pt; }
          .slots-24.u-mid .hourly-table td { padding: 4.8px 1px; }
          .slots-24.u-mid .time-col { width: 20%; font-size: 7pt; }
          .slots-24.u-mid .remark-col { width: 12%; }
          .slots-24.u-mid .signature-section { margin-top: 20px; }

          /* 5-6 Units */
          .slots-24.u-many .header h1 { font-size: 13pt; }
          .slots-24.u-many .header h2 { font-size: 10.5pt; }
          .slots-24.u-many .section-title { padding: 3px 5px; margin-top: 3px; margin-bottom: 2px; font-size: 8.5pt; }
          .slots-24.u-many .sub-table td, .slots-24.u-many .sub-table th, .slots-24.u-many .avail-table td, .slots-24.u-many .avail-table th {
            padding: 2.5px 1.5px; font-size: 7.5pt;
          }
          .slots-24.u-many .hourly-table {
            font-size: 6.8pt;
            line-height: 1.2;
            letter-spacing: -0.1px;
          }
          .slots-24.u-many .hourly-table th { padding: 3.5px 0.5px; font-size: 6.5pt; }
          .slots-24.u-many .hourly-table td { padding: 4.6px 0.5px; }
          .slots-24.u-many .time-col { width: 17%; font-size: 6.5pt; }
          .slots-24.u-many .remark-col { width: 10%; }
          .slots-24.u-many .signature-section { margin-top: 22px; font-size: 8.5pt; }
          .slots-24.u-many .signature-line { margin-top: 12px; }

          /* 7+ Units */
          .slots-24.u-max .header h1 { font-size: 12.5pt; }
          .slots-24.u-max .header h2 { font-size: 10pt; }
          .slots-24.u-max .section-title { padding: 2.5px 4px; margin-top: 3px; margin-bottom: 2px; font-size: 8.2pt; }
          .slots-24.u-max .sub-table td, .slots-24.u-max .sub-table th, .slots-24.u-max .avail-table td, .slots-24.u-max .avail-table th {
            padding: 2.2px 1px; font-size: 7.2pt;
          }
          .slots-24.u-max .hourly-table {
            font-size: 6.0pt;
            line-height: 1.18;
            letter-spacing: -0.2px;
          }
          .slots-24.u-max .hourly-table th { padding: 3px 0.3px; font-size: 5.8pt; }
          .slots-24.u-max .hourly-table td { padding: 4.4px 0.3px; }
          .slots-24.u-max .time-col { width: 15%; font-size: 5.8pt; }
          .slots-24.u-max .remark-col { width: 8%; }
          .slots-24.u-max .signature-section { margin-top: 20px; font-size: 8.2pt; }
          .slots-24.u-max .signature-line { margin-top: 10px; }

          /* ==================== SLOTS 48 (Maximized to fill single page) ==================== */
          .slots-48 {
            padding: 4px 6px;
            font-size: 8pt;
          }
          .slots-48 .header {
            margin-bottom: 3px;
            padding-bottom: 2px;
          }
          .slots-48 .header h1 { font-size: 11.5pt; }
          .slots-48 .header h2 { font-size: 9.5pt; }
          .slots-48 .info-row {
            margin: 2px 0;
            font-size: 7.5pt;
          }
          .slots-48 .info-item { padding: 2px 4px; }
          .slots-48 .section-title {
            padding: 2px 4px;
            margin-top: 3px;
            margin-bottom: 1px;
            font-size: 7.8pt;
          }
          .slots-48 .sub-table td, .slots-48 .sub-table th, .slots-48 .avail-table td, .slots-48 .avail-table th {
            padding: 1.5px 1px;
            font-size: 7pt;
          }
          .slots-48 .hourly-table {
            font-size: 6.8pt;
            line-height: 1.15;
          }
          .slots-48 .hourly-table th { padding: 2.5px 1px; }
          .slots-48 .hourly-table td { padding: 1.8px 1px; }
          .slots-48 .signature-section {
            margin-top: 10px;
            font-size: 8pt;
          }
          .slots-48 .signature-line { margin-top: 8px; }
          .slots-48.u-many .hourly-table { font-size: 5.8pt; line-height: 1.1; letter-spacing: -0.15px; }
          .slots-48.u-many .hourly-table td { padding: 1.4px 0.5px; }
          .slots-48.u-max .hourly-table { font-size: 5.1pt; line-height: 1.05; letter-spacing: -0.25px; }
          .slots-48.u-max .hourly-table td { padding: 1.1px 0.3px; }

          /* ==================== SLOTS 96 (Maximized to fill single page) ==================== */
          .slots-96 {
            padding: 2px 4px;
            font-size: 7pt;
          }
          .slots-96 .header {
            margin-bottom: 1px;
            padding-bottom: 1px;
          }
          .slots-96 .header h1 { font-size: 10pt; }
          .slots-96 .header h2 { font-size: 8.5pt; }
          .slots-96 .info-row {
            margin: 1px 0;
            font-size: 6.5pt;
          }
          .slots-96 .info-item { padding: 1px 3px; }
          .slots-96 .section-title {
            padding: 1px 3px;
            margin-top: 1px;
            margin-bottom: 1px;
            font-size: 7pt;
          }
          .slots-96 .sub-table td, .slots-96 .sub-table th, .slots-96 .avail-table td, .slots-96 .avail-table th {
            padding: 0.8px 1px;
            font-size: 6.2pt;
          }
          .slots-96 .hourly-table {
            font-size: 4.8pt;
            line-height: 1.05;
          }
          .slots-96 .hourly-table th { padding: 1px 0.5px; }
          .slots-96 .hourly-table td { padding: 0.1px 0.5px; }
          .slots-96 .signature-section {
            margin-top: 4px;
            font-size: 7pt;
          }
          .slots-96 .signature-line { margin-top: 5px; }
          .slots-96.u-many .hourly-table { font-size: 4.5pt; line-height: 1.02; letter-spacing: -0.15px; }
          .slots-96.u-max .hourly-table { font-size: 4.2pt; line-height: 1.0; letter-spacing: -0.25px; }
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
  const powerOriginal = item.powerOriginal;
  const powerCurrent = item.powerCurrent;
  const hourlyLength = powerCurrent?.currentTurbines?.[0]?.hourly?.length;
  const activeHours = getHoursByHourListId(item.power?.hourListId, hourlyLength);
  const slotCount = activeHours.length || 24;

  const machineNames: Record<number, string[]> = {
    3: ["Solar (MW)", "Battery (MW)"],
    2: ["Unit 1", "Unit 2", "Unit 3", "Surplus"],
  };

  const headerNames =
    machineNames[item.power?.fuelId || 0] ??
    powerOriginal?.machinesAvailability?.map(
      (m: any) => `Unit ${m.turbine} (MW)`,
    ) ??
    [];

  const unitCount = Math.max(
    powerOriginal?.originalTurbines?.length || 0,
    powerCurrent?.currentTurbines?.length || 0,
    powerOriginal?.machinesAvailability?.length || 0,
    headerNames.length,
    1,
  );

  let unitTier = "u-few";
  if (unitCount >= 7) {
    unitTier = "u-max";
  } else if (unitCount >= 5) {
    unitTier = "u-many";
  } else if (unitCount >= 3) {
    unitTier = "u-mid";
  }

  return `
    <div class="page slots-${slotCount} units-${unitCount} ${unitTier}">
      <!-- Header -->
      <div class="header">
        <h1>${item.power?.company?.name || "-"}</h1>
        <h2>Daily Availability and Declaration</h2>
      </div>
      
      <!-- Declaration Info -->
      <div class="info-row">
        <div class="info-item">
          <strong>${item.power?.name || "-"} Power Plant</strong>
        </div>
        <div class="info-item" style="margin: 0 5px;">
          <strong>Declaration for Date:</strong> ${moment(item.powerDate).format("DD/MM/YYYY")}
        </div>
        <div class="info-item">
          <strong>Create Document:</strong> ${moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>
      
      ${
        item.power?.fuelId === 1
          ? `
    <!-- Reservoir Situation & Daily Water Discharge Plan (Two Column) -->
    <div class="two-column">
    <!-- Left Column: Reservoir Situation -->
    <div class="column">
        <div class="section-title">Reservoir Situation at 00:00 AM</div>
        <table class="sub-table">
        <tr>
            <td class="left-align" style="width: 60%; border-right: 2px solid #000;">Upstream Level:</td>
            <td style="width: 25%;">${formatNumber(powerCurrent?.upstreamLevel)}</td>
            <td style="width: 15%;">masl</td>
        </tr>
        <tr>
            <td class="left-align" style="border-right: 2px solid #000;">Downstream Level:</td>
            <td>${formatNumber(powerCurrent?.downstreamLevel)}</td>
            <td>masl</td>
        </tr>
        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Total Storage:</td>
            <td>${formatNumber(powerCurrent?.totalStorageamount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(powerCurrent?.totalStorageaverage)}</td>
            <td>%</td>
        </tr>
        <tr>
            <td class="left-align" style="border-right: 2px solid #000;" rowspan="2">Active Storage:</td>
            <td>${formatNumber(powerCurrent?.activeStorageamount)}</td>
            <td>m³</td>
        </tr>
        <tr>
            <td>${formatNumber(powerCurrent?.activeStorageaverage)}</td>
            <td>%</td>
        </tr>
        </table>
    </div>
    
    <!-- Right Column: Daily Water Discharge Plan -->
    <div class="column">
        <div class="section-title">Daily Water Discharge Plan</div>
        <table class="sub-table">
        <tr>
            <th style="width: 50%;">Descriptions</th>
            <th style="width: 25%;">Amount<br/>m³</th>
            <th style="width: 25%;">Average<br/>m³/s</th>
        </tr>
        <tr>
            <td class="left-align">Turbine Discharge:</td>
            <td>${formatNumber(powerCurrent?.turbineDischargeamount)}</td>
            <td>${formatNumber(powerCurrent?.turbineDischargeaverage)}</td>
        </tr>
        <tr>
            <td class="left-align">Spillway Discharge:</td>
            <td>${formatNumber(powerCurrent?.spillwayDischargeamount)}</td>
            <td>${formatNumber(powerCurrent?.spillwayDischargeaverage)}</td>
        </tr>
        <tr>
            <td class="left-align">Ecological Discharge:</td>
            <td>${formatNumber(powerCurrent?.ecologicalDischargeamount)}</td>
            <td>${formatNumber(powerCurrent?.ecologicalDischargeaverage)}</td>
        </tr>
        <tr class="total-row">
            <td class="left-align">Total Discharge:</td>
            <td>${formatNumber(powerCurrent?.totalDischargeamount)}</td>
            <td>${formatNumber(powerCurrent?.totalDischargeaverage)}</td>
        </tr>
        </table>
    </div>
    </div>
    `
          : ""
      }
      
      <!-- Machines Availability -->
      <div class="section-title">Machines Availability</div>
      <table class="avail-table">
        <tr>
          <th>Units</th>
          ${headerNames.map((name) => `<th>${name}</th>`).join("")}
        </tr>
        <tr>
          <td>Max</td>
          ${
            powerOriginal?.machinesAvailability
              ?.map((m: any) => `<td>${formatNumber(m.maxs)}</td>`)
              .join("") ?? ""
          }
        </tr>
        <tr>
          <td>Min</td>
          ${
            powerOriginal?.machinesAvailability
              ?.map((m: any) => `<td>${formatNumber(m.mins)}</td>`)
              .join("") ?? ""
          }
        </tr>
      </table>
      
      <!-- Declaration & Dispatch Programs (Side by Side) -->
      <div class="two-column">
        <div class="column">
          <div class="section-title">Declaration Program</div>
          <table class="hourly-table">
            <tr>
              <th class="time-col">Time</th>
              ${headerNames.map((name) => `<th>${name}</th>`).join("")}
              <th class="num-col total-col">Total</th>
              <th class="remark-col">Remark</th>
            </tr>
            ${generateHourlyRows(powerOriginal?.originalTurbines, powerOriginal?.remarks, item.power?.hourListId)}
            <tr class="total-row">
              <td class="time-col">Total (MWh)</td>
              ${
                powerOriginal?.originalTurbines
                  ?.map((t: any) => {
                    const total = (t.hourly || []).reduce(
                      (sum: number, val: any) => sum + (parseFloat(val) || 0),
                      0,
                    );
                    return `<td class="num-col">${formatNumber(total)}</td>`;
                  })
                  .join("") ?? ""
              }
              <td class="num-col total-col">${formatNumber(powerOriginal?.totalPower)}</td>
              <td class="remark-col"></td>
            </tr>
          </table>
        </div>
        
        <div class="column">
          <div class="section-title">PCD Dispatch Program</div>
          <table class="hourly-table">
            <tr>
              <th class="time-col">Time</th>
              ${headerNames.map((name) => `<th>${name}</th>`).join("")}
              <th class="num-col total-col">Total</th>
              <th class="remark-col">Remark</th>
            </tr>
            ${generateHourlyRows(powerCurrent?.currentTurbines, powerCurrent?.remarks, item.power?.hourListId)}
            <tr class="total-row">
              <td class="time-col">Total (MWh)</td>
              ${
                powerCurrent?.currentTurbines
                  ?.map((t: any) => {
                    const total = (t.hourly || []).reduce(
                      (sum: number, val: any) => sum + (parseFloat(val) || 0),
                      0,
                    );
                    return `<td class="num-col">${formatNumber(total)}</td>`;
                  })
                  .join("") ?? ""
              }
              <td class="num-col total-col">${formatNumber(powerCurrent?.totalPower)}</td>
              <td class="remark-col"></td>
            </tr>
          </table>
        </div>
      </div>
      
      <!-- Remark -->
        ${
          powerOriginal?.remark || powerCurrent?.remark
            ? `
        <div class="two-column" style="margin-top: 6px; font-size: 7.5pt;">
            <div class="column">
            ${powerOriginal?.remark ? `<strong>Remark:</strong> ${powerOriginal.remark}` : ""}
            </div>
            <div class="column">
            ${powerCurrent?.remark ? `<strong>Remark:</strong> ${powerCurrent.remark}` : ""}
            </div>
        </div>
        `
            : ""
        }

      
      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <strong>Issued by ${item.power?.name || "-"}</strong>
          <div class="signature-line">
            <div>Name: ${item.decAcknowUser ? `${item.decAcknowUser.firstname} ${item.decAcknowUser.lastname}` : "____________________"}</div>
            <div>Date: ${item.decAcknowAt ? moment(item.decAcknowAt).format("DD/MM/YYYY HH:mm:ss") : "____________________"}</div>
          </div>
        </div>
        
        <div class="signature-box">
          <strong>Acknowledged by PCD</strong>
          <div class="signature-line">
            <div>Name: ${item.disAcknowUser ? `${item.disAcknowUser.firstname} ${item.disAcknowUser.lastname}` : "____________________"}</div>
            <div>Date: ${item.disAcknowAt ? moment(item.disAcknowAt).format("DD/MM/YYYY HH:mm:ss") : "____________________"}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ✅ Helper function สำหรับสร้างแถวข้อมูลรายชั่วโมง (รองรับ 24, 48, 96 slots)
function generateHourlyRows(
  turbines: any[],
  remarks: string[] = [],
  hourListId?: number | null,
) {
  if (!turbines || turbines.length === 0)
    return '<tr><td colspan="6">No data</td></tr>';

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

    // ✅ คำนวณผลรวมและแสดงทศนิยม 2 ตำแหน่ง
    const total = turbineValues.reduce((sum, val) => sum + val, 0);
    const remark = remarks[idx] || "";

    rows.push(`
      <tr>
        <td class="time-col">${timeRange}</td>
        ${turbineValues.map((val) => `<td class="num-col">${formatNumber(val)}</td>`).join("")}
        <td class="num-col total-col">${formatNumber(total)}</td>
        <td class="remark-col">${remark}</td>
      </tr>
    `);
  }

  return rows.join("");
}
