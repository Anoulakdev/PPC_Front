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

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/dayreports/sumnetenergy?powerId=${powerId}&startDate=${startDate}&endDate=${endDate}`;

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });

    const data = response.data.data ?? [];
    const totalNetEnergy = Number(response.data.totalNetEnergy ?? 0);
    const totalPowerGeneration = Number(
      response.data.totalPowerGeneration ?? 0,
    );
    const totalNetEnergyImport = Number(
      response.data.totalNetEnergyImport ?? 0,
    );

    const html = generatePDF(
      data,
      totalNetEnergy,
      totalPowerGeneration,
      totalNetEnergyImport,
      startDate,
      endDate,
    );

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Net_Energy_Output_Report_${moment().format("DDMMYYYY_HHmmss")}.pdf`,
      },
    });
  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatNumber(value: any, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  return isNaN(num)
    ? "-"
    : num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
}

function generatePDF(
  data: any[],
  totalNetEnergy: number,
  totalPowerGeneration: number,
  totalNetEnergyImport: number,
  startDate: string | null,
  endDate: string | null,
) {
  const firstItem = data[0] || {};
  const companyName = firstItem.power?.company?.name || "-";
  const plantName = firstItem.power?.name || "-";

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #334155;
          margin: 0;
          padding: 0;
          line-height: 1.5;
        }

        /* Header Section */
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .brand-info h1 {
          margin: 0;
          font-size: 18pt;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .report-title {
          text-transform: uppercase;
          font-size: 10pt;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 1px;
        }

        /* Summary Cards */
        .summary-grid {
          display: grid;
          grid-template-columns: 1.15fr 1.15fr 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 16px;
        }

        .card {
          padding: 6px 8px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          box-sizing: border-box;
        }

        .card-label {
          font-size: 6.5pt;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 3px;
          line-height: 1.2;
        }

        .card-value {
          font-size: 7.5pt;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          word-break: break-word;
        }

        .card-unit {
          font-size: 6.5pt;
          font-weight: 500;
          color: #64748b;
          margin-left: 2px;
          white-space: nowrap;
        }

        .highlight-card {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .highlight-card .card-label {
          color: #2563eb;
        }

        .highlight-card .card-value {
          color: #1d4ed8;
          font-size: 8pt;
        }

        .highlight-card .card-unit {
          color: #3b82f6;
        }

        /* Table Style */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 10px;
        }

        th {
          background: #1e293b;
          color: white;
          font-weight: 600;
          font-size: 8.5pt;
          padding: 10px 12px;
          text-align: left;
          letter-spacing: 0.5px;
        }

        th:first-child { border-radius: 8px 0 0 0; }
        th:last-child { border-radius: 0 8px 0 0; }

        td {
          padding: 8px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 8.5pt;
        }

        tr:nth-child(even) {
          background-color: #f8fafc;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .total-row td {
          background: #f1f5f9;
          font-weight: 700;
          font-size: 9pt;
          border-top: 2px solid #1e293b;
          color: #0f172a;
        }

        .footer {
          margin-top: 30px;
          font-size: 8pt;
          color: #94a3b8;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="brand-info">
          <div class="report-title">Net Energy Output Summary Report</div>
          <h1>${companyName}</h1>
        </div>
        <div style="text-align: right">
          <div style="font-size: 9pt; color: #64748b;">Printed on: ${moment().format("DD MMM YYYY, HH:mm")}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="card">
          <div class="card-label">Power Plant</div>
          <div class="card-value">${plantName}</div>
        </div>
        <div class="card">
          <div class="card-label">Date Range</div>
          <div class="card-value" style="font-size: 7pt; line-height: 1.2;">
            ${startDate ? moment(startDate).format("DD/MM/YYYY") : "-"} - ${endDate ? moment(endDate).format("DD/MM/YYYY") : "-"}
          </div>
        </div>
        <div class="card">
          <div class="card-label">Total Power Generation</div>
          <div class="card-value">${formatNumber(totalPowerGeneration, 2)} <span class="card-unit">kWh</span></div>
        </div>
        <div class="card">
          <div class="card-label">Total Net Energy Import</div>
          <div class="card-value">${formatNumber(totalNetEnergyImport, 2)} <span class="card-unit">kWh</span></div>
        </div>
        <div class="card highlight-card">
          <div class="card-label">Total Net Energy Output</div>
          <div class="card-value">${formatNumber(totalNetEnergy, 2)} <span class="card-unit">kWh</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="15%">Date</th>
            <th class="text-right">Power Generation (kWh)</th>
            <th class="text-right">Net Energy Import (kWh)</th>
            <th class="text-right">Net Energy Output (kWh)</th>
            <th class="text-center" width="20%">Created By</th>
          </tr>
        </thead>
        <tbody>
          ${
            data.length
              ? data
                  .map((item) => {
                    const powerGen = (item.dayReportCurrents || []).reduce(
                      (sum: number, c: any) =>
                        sum + Number(c.powerGeneration || 0),
                      0,
                    );
                    const netImport = (item.dayReportCurrents || []).reduce(
                      (sum: number, c: any) =>
                        sum + Number(c.netEnergyImport || 0),
                      0,
                    );
                    const netOutput = (item.dayReportCurrents || []).reduce(
                      (sum: number, c: any) =>
                        sum + Number(c.netEnergyOutput || 0),
                      0,
                    );
                    const createdBy = item.dayReportCurrents?.[0]?.createdByUser
                      ? `${item.dayReportCurrents[0].createdByUser.firstname ?? ""} ${item.dayReportCurrents[0].createdByUser.lastname ?? ""}`
                      : "-";

                    return `
              <tr>
                <td>${moment(item.powerDate).format("DD/MM/YYYY")}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 600;">${formatNumber(powerGen, 2)}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 600;">${formatNumber(netImport, 2)}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 600;">${formatNumber(netOutput, 2)}</td>
                <td class="text-center">${createdBy}</td>
              </tr>
            `;
                  })
                  .join("")
              : '<tr><td colspan="5" class="text-center">No data available for the selected period</td></tr>'
          }
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td>Total</td>
            <td class="text-right">${formatNumber(totalPowerGeneration, 2)}</td>
            <td class="text-right">${formatNumber(totalNetEnergyImport, 2)}</td>
            <td class="text-right">${formatNumber(totalNetEnergy, 2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </body>
  </html>
  `;
}
