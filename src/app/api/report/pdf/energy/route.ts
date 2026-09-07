/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import moment from "moment";
import { hours1, hours2, hours3 } from "@/utils/hoursHelper";

export async function POST(req: NextRequest) {
  return handleGeneratePDF(req, true);
}

export async function GET(req: NextRequest) {
  return handleGeneratePDF(req, false);
}

async function handleGeneratePDF(req: NextRequest, isPost: boolean) {
  let browser;

  try {
    let rawData: any[] = [];
    let powerDateStr = moment().format("YYYY-MM-DD");
    let regionId: string | undefined;
    let activeTab = "ALL";

    if (isPost) {
      const body = await req.json();
      rawData = body.data || [];
      powerDateStr = body.powerDate || body.selectedDate || powerDateStr;
      activeTab = body.activeTab || "ALL";
      regionId = body.regionId;
    } else {
      const { searchParams } = new URL(req.url);
      powerDateStr = searchParams.get("powerDate") || powerDateStr;
      regionId = searchParams.get("regionId") || undefined;
      activeTab = searchParams.get("activeTab") || "ALL";

      // ดึง token จาก cookie หรือ header
      const token =
        req.cookies.get("token")?.value ||
        req.headers.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      const apiUrl = regionId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/daypowers/nccdata?powerDate=${powerDateStr}&regionId=${regionId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/daypowers/nccdata?powerDate=${powerDateStr}`;

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      rawData = response.data || [];
    }

    const getItemSlotCount = (item: any): 24 | 48 | 96 => {
      const hourListId = Number(item.power?.hourListId ?? item.hourListId);
      if (hourListId === 3) return 96;
      if (hourListId === 2) return 48;
      if (hourListId === 1) return 24;

      const curLen =
        item.powerCurrent?.combinedHourlyCurrent?.length ??
        item.powerCurrent?.currentTurbines?.[0]?.hourly?.length;
      const origLen =
        item.powerOriginal?.combinedHourlyOriginal?.length ??
        item.powerOriginal?.originalTurbines?.[0]?.hourly?.length;

      if (curLen === 96 || origLen === 96) return 96;
      if (curLen === 48 || origLen === 48) return 48;
      return 24;
    };

    const configs = [
      {
        slots: 24,
        slotsName: "1 Hour",
        title: "1 Hour Interval Plants (24 Values)",
        subTitle: "Hourly Generation Telemetry",
        hours: hours1,
        headerBg: "#1d4ed8",
        badgeColor: "#2563eb",
      },
      {
        slots: 48,
        slotsName: "30 Minute",
        title: "30 Minute Interval Plants (48 Values)",
        subTitle: "Half-Hourly Generation Telemetry",
        hours: hours2,
        headerBg: "#0f766e",
        badgeColor: "#0d9488",
      },
      {
        slots: 96,
        slotsName: "15 Minute",
        title: "15 Minute Interval Plants (96 Values)",
        subTitle: "Quarter-Hourly Generation Telemetry",
        hours: hours3,
        headerBg: "#6b21a8",
        badgeColor: "#7e22ce",
      },
    ];

    const sections = configs
      .map((cfg) => {
        const companies = rawData
          .map((company: any) => ({
            ...company,
            items: (company.items || []).filter(
              (item: any) => getItemSlotCount(item) === cfg.slots,
            ),
          }))
          .filter((company: any) => company.items.length > 0);

        const plantCount = companies.reduce(
          (sum: number, c: any) => sum + c.items.length,
          0,
        );

        return { ...cfg, companies, plantCount };
      })
      .filter((sec) => sec.plantCount > 0);

    const html = generateEnergyHTML({
      sections,
      powerDateStr,
      activeTab,
      printDate: moment().format("DD/MM/YYYY HH:mm:ss"),
    });

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
        top: "4mm",
        right: "4mm",
        bottom: "4mm",
        left: "4mm",
      },
      timeout: 60000,
    });

    await browser.close();

    const filename = `NCC_Energy_${moment(powerDateStr).format("DDMMYYYY")}_${activeTab}_${moment().format("HHmmss")}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("❌ Error closing browser:", closeError);
      }
    }
    console.error("❌ PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 },
    );
  }
}

function formatNumber(value: any, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });
}

function generateEnergyHTML(params: {
  sections: any[];
  powerDateStr: string;
  activeTab: string;
  printDate: string;
}) {
  const { sections, powerDateStr, activeTab, printDate } = params;
  const formattedDate = moment(powerDateStr).format("DD/MM/YYYY");

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>NCC Energy Report - ${formattedDate}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 4mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #111827;
          background: #fff;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 5px;
          margin-bottom: 8px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .edl-badge {
          background: linear-gradient(135deg, #1e40af, #2563eb);
          color: white;
          font-size: 14pt;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 5px;
          letter-spacing: 1px;
        }
        .header-titles h1 {
          margin: 0;
          font-size: 12pt;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-titles h2 {
          margin: 1px 0 0 0;
          font-size: 8.5pt;
          font-weight: 600;
          color: #4b5563;
        }
        .header-meta {
          text-align: right;
          font-size: 7.5pt;
          color: #374151;
          display: flex;
          gap: 10px;
        }
        .meta-pill {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .meta-pill strong {
          color: #111827;
        }

        .section-card {
          margin-bottom: 10px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          overflow: hidden;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .section-banner {
          color: white;
          padding: 4px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .section-title {
          font-size: 9pt;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .section-sub {
          font-size: 7.5pt;
          font-weight: 500;
          opacity: 0.9;
        }
        .section-badge {
          background: rgba(255, 255, 255, 0.25);
          font-size: 7pt;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 9999px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 0.5px solid #d1d5db;
          text-align: center;
          vertical-align: middle;
          overflow: hidden;
        }
        th {
          font-weight: 700;
          color: white;
        }
        .company-row {
          background: #f3f4f6;
          color: #1e3a8a;
          font-weight: 700;
          text-align: left;
          padding: 2.5px 6px;
          font-size: 7pt;
        }
        .plant-name {
          text-align: left;
          font-weight: 600;
          padding-left: 4px !important;
          color: #111827;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .cap-val {
          font-weight: 700;
          color: #15803d;
          white-space: nowrap;
        }
        .status-badge {
          display: inline-block;
          font-weight: 700;
          border-radius: 2px;
          white-space: nowrap;
          line-height: 1;
        }
        .status-yes {
          background: #dcfce7;
          color: #166534;
        }
        .status-no {
          background: #fee2e2;
          color: #991b1b;
        }

        /* ---------------- SLOTS 24 (1 HOUR) ---------------- */
        .table-24 { font-size: 6.5pt; }
        .table-24 th.th-fixed { font-size: 6.5pt; line-height: 1.1; padding: 2px 1px; }
        .table-24 th.th-vertical-24 {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          height: 68px;
          font-size: 6pt;
          padding: 2px 1px;
        }
        .table-24 td { padding: 1.5px 1px; }
        .table-24 .plant-name { font-size: 6.5pt; }
        .table-24 .num-val-24 {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 6.2pt;
          white-space: nowrap;
        }
        .table-24 .status-badge { font-size: 5.5pt; padding: 1px 3px; }

        /* ---------------- SLOTS 48 (30 MINUTE) ---------------- */
        .table-48 { font-size: 5.2pt; }
        .table-48 th.th-fixed { font-size: 5.2pt; line-height: 1.05; padding: 2px 0.5px; }
        .table-48 th.th-vertical-48 {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          height: 62px;
          font-size: 4.8pt;
          padding: 2px 0.2px;
          letter-spacing: -0.2px;
        }
        .table-48 td { padding: 1px 0.5px; }
        .table-48 .plant-name { font-size: 5.5pt; }
        .table-48 .num-val-48 {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 4.6pt;
          white-space: nowrap;
          letter-spacing: -0.2px;
        }
        .table-48 .status-badge { font-size: 4.5pt; padding: 0.5px 2px; }

        /* ---------------- SLOTS 96 (15 MINUTE) ---------------- */
        .table-96 { font-size: 4.2pt; }
        .table-96 th.th-fixed { font-size: 4.2pt; line-height: 1.0; padding: 1px 0.2px; }
        .table-96 th.th-vertical-96 {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          height: 56px;
          font-size: 3.8pt;
          padding: 1px 0.1px;
          letter-spacing: -0.3px;
        }
        .table-96 td { padding: 0.5px 0.1px; }
        .table-96 .plant-name { font-size: 4.8pt; }
        .table-96 .num-val-96 {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          height: 28px;
          font-size: 4.2pt;
          padding: 1px 0.1px;
          white-space: nowrap;
          line-height: 1;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .table-96 .status-badge { font-size: 4pt; padding: 0.5px 1px; }

        .no-data {
          text-align: center;
          padding: 24px;
          color: #6b7280;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-left">
          <div class="edl-badge">EDL</div>
          <div class="header-titles">
            <h1>Electricité Du Laos - (NCC)</h1>
            <h2>Daily Declaration & Dispatch</h2>
          </div>
        </div>
        <div class="header-meta">
          <div class="meta-pill"><strong>Date:</strong> ${formattedDate}</div>
          <div class="meta-pill"><strong>Region:</strong> ${activeTab}</div>
          <div class="meta-pill"><strong>Printed:</strong> ${printDate}</div>
        </div>
      </div>

      ${
        sections.length === 0
          ? `
          <div class="no-data">
            <p><strong>⚡ No Data Available</strong></p>
            <p>No power generation telemetry data found for the selected date (${formattedDate}) and region (${activeTab}).</p>
          </div>
        `
          : sections
              .map((sec) => {
                const colConfig = {
                  24: {
                    tableClass: "table-24",
                    nameWidth: "105px",
                    capWidth: "44px",
                    totalWidth: "44px",
                    statusWidth: "24px",
                    thVerticalClass: "th-vertical-24",
                    numClass: "num-val-24",
                  },
                  48: {
                    tableClass: "table-48",
                    nameWidth: "82px",
                    capWidth: "38px",
                    totalWidth: "38px",
                    statusWidth: "20px",
                    thVerticalClass: "th-vertical-48",
                    numClass: "num-val-48",
                  },
                  96: {
                    tableClass: "table-96",
                    nameWidth: "68px",
                    capWidth: "32px",
                    totalWidth: "32px",
                    statusWidth: "16px",
                    thVerticalClass: "th-vertical-96",
                    numClass: "num-val-96",
                  },
                }[sec.slots as 24 | 48 | 96] || {
                  tableClass: "table-24",
                  nameWidth: "105px",
                  capWidth: "44px",
                  totalWidth: "44px",
                  statusWidth: "24px",
                  thVerticalClass: "th-vertical-24",
                  numClass: "num-val-24",
                };

                return `
            <div class="section-card">
              <div class="section-banner" style="background-color: ${sec.headerBg};">
                <div>
                  <span class="section-title">${sec.title}</span>
                  <span class="section-sub"> — ${sec.subTitle}</span>
                </div>
                <span class="section-badge">${sec.plantCount} ${sec.plantCount === 1 ? "Plant" : "Plants"}</span>
              </div>

              <table class="${colConfig.tableClass}">
                <thead style="background-color: ${sec.headerBg};">
                  <tr>
                    <th style="width: ${colConfig.nameWidth}; text-align: left; padding-left: 4px;">Power Plant</th>
                    <th class="th-fixed" style="width: ${colConfig.capWidth};">Install<br/>Capacity<br/>(MW)</th>
                    <th class="th-fixed" style="width: ${colConfig.totalWidth};">Total<br/>Energy<br/>(MWh)</th>
                    ${sec.hours
                      .map(
                        (h: string) => `
                      <th class="${colConfig.thVerticalClass}">${h}</th>
                    `,
                      )
                      .join("")}
                    <th class="th-fixed" style="width: ${colConfig.statusWidth};">DAD</th>
                    <th class="th-fixed" style="width: ${colConfig.statusWidth};">DD</th>
                  </tr>
                </thead>
                <tbody>
                  ${sec.companies
                    .map(
                      (comp: any) => `
                    <tr>
                      <td colspan="${sec.hours.length + 5}" class="company-row">
                        🏢 ${comp.companyName} (${comp.items.length} ${comp.items.length === 1 ? "Plant" : "Plants"})
                      </td>
                    </tr>
                    ${comp.items
                      .map((item: any) => {
                        const hourlyData =
                          item.powerCurrent?.combinedHourlyCurrent ??
                          item.powerCurrent?.currentTurbines?.[0]?.hourly ??
                          [];
                        const cap = formatNumber(
                          item.power?.installCapacity,
                          2,
                        );
                        const total = formatNumber(
                          item.powerCurrent?.totalPower,
                          2,
                        );

                        return `
                        <tr>
                          <td class="plant-name">${item.power?.name ?? "-"}</td>
                          <td class="cap-val">${cap}</td>
                          <td class="cap-val">${total}</td>
                          ${sec.hours
                            .map((_: any, i: number) => {
                              const val = hourlyData[i];
                              const displayVal =
                                val !== undefined &&
                                val !== null &&
                                !isNaN(Number(val))
                                  ? formatNumber(val, 2)
                                  : "-";
                              return `<td class="${colConfig.numClass}">${displayVal}</td>`;
                            })
                            .join("")}
                          <td>
                            ${
                              item.decAcknow
                                ? `<span class="status-badge status-yes">&#10004;</span>`
                                : `<span class="status-badge status-no">&#10006;</span>`
                            }
                          </td>
                          <td>
                            ${
                              item.disAcknow
                                ? `<span class="status-badge status-yes">&#10004;</span>`
                                : `<span class="status-badge status-no">&#10006;</span>`
                            }
                          </td>
                        </tr>
                      `;
                      })
                      .join("")}
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `;
              })
              .join("")
      }
    </body>
  </html>
  `;
}
