// src/app/page.js
import React from "react";

// สร้าง array 24 ค่า (ค่าสุ่มระหว่าง 40–100)
const generate24HourData = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 61) + 40);
};

// สร้าง label ชั่วโมง 0–23
const hourLabels = Array.from({ length: 24 }, (_, i) => `H${i}`);

const mockData = [
  {
    companyId: 1,
    companyName: "Energy Co. A",
    items: [
      {
        id: 101,
        power: { name: "Plant A1" },
        powerCurrent: {
          totalPower: 1500,
          combinedHourly: generate24HourData(),
        },
        decAcknow: true,
        decAcknowUser: { firstname: "John", lastname: "Doe" },
        disAcknow: false,
        disAcknowUser: null,
      },
      {
        id: 102,
        power: { name: "Plant A2" },
        powerCurrent: {
          totalPower: 1800,
          combinedHourly: generate24HourData(),
        },
        decAcknow: false,
        decAcknowUser: null,
        disAcknow: true,
        disAcknowUser: { firstname: "Jane", lastname: "Smith" },
      },
    ],
  },
  {
    companyId: 2,
    companyName: "Energy Co. B",
    items: [
      {
        id: 201,
        power: { name: "Plant B1" },
        powerCurrent: {
          totalPower: 2200,
          combinedHourly: generate24HourData(),
        },
        decAcknow: true,
        decAcknowUser: { firstname: "Sam", lastname: "Wilson" },
        disAcknow: true,
        disAcknowUser: { firstname: "Tom", lastname: "Brown" },
      },
    ],
  },
];

const TablePage = () => {
  const loading = false; // ตัวอย่าง ใช้ false เพื่อแสดงข้อมูลจริง

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto w-full max-w-full px-4">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Power Plant Status
        </h1>

        {/* Modern Blue Header Table */}
        <div className="overflow-x-auto rounded-2xl bg-white shadow-xl">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
              <tr>
                <th className="rounded-tl-2xl px-3 py-4 text-left text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  Power Plant
                </th>
                <th className="px-3 py-4 text-center text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  Total (MW)
                </th>

                {hourLabels.map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-4 text-center text-xs font-semibold tracking-wider whitespace-nowrap uppercase"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-3 py-4 text-center text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  STATUS (DAD)
                </th>
                <th className="rounded-tr-2xl px-3 py-4 text-center text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  STATUS (DD)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {loading && (
                <tr>
                  <td
                    colSpan={28}
                    className="p-6 text-center font-semibold text-blue-600"
                  >
                    Loading data...
                  </td>
                </tr>
              )}

              {!loading &&
                mockData.map((company) => (
                  <React.Fragment key={`company-${company.companyId}`}>
                    {/* Company Header Row */}
                    <tr className="bg-gray-200 font-bold text-blue-700">
                      <td colSpan={28} className="px-3 py-2">
                        {company.companyName}
                      </td>
                    </tr>

                    {/* Plant Rows */}
                    {company.items.map((item) => (
                      <tr
                        key={item.id}
                        className="transition even:bg-gray-50 hover:bg-blue-50"
                      >
                        <td className="border px-3 py-2 font-medium whitespace-nowrap">
                          {item.power.name}
                        </td>

                        <td className="border px-3 py-2 text-center font-bold text-green-700">
                          {new Intl.NumberFormat("en-US").format(
                            Number(item.powerCurrent.totalPower),
                          )}
                        </td>

                        {item.powerCurrent.combinedHourly.map((value, idx) => (
                          <td
                            key={idx}
                            className="border px-2 py-2 text-center text-sm"
                          >
                            {value}
                          </td>
                        ))}

                        {/* STATUS (DAD) with tooltip */}
                        <td className="border px-3 py-2 text-center">
                          <div className="group relative inline-block">
                            {item.decAcknow ? (
                              <CheckCircleIcon className="mx-auto h-5 w-5 text-green-700" />
                            ) : (
                              <XCircleIcon className="mx-auto h-5 w-5 text-red-700" />
                            )}
                            <TooltipText user={item.decAcknowUser} />
                          </div>
                        </td>

                        {/* STATUS (DD) with tooltip */}
                        <td className="border px-3 py-2 text-center">
                          <div className="group relative inline-block">
                            {item.disAcknow ? (
                              <CheckCircleIcon className="mx-auto h-5 w-5 text-green-700" />
                            ) : (
                              <XCircleIcon className="mx-auto h-5 w-5 text-red-700" />
                            )}
                            <TooltipText user={item.disAcknowUser} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

              {!loading && mockData.length === 0 && (
                <tr>
                  <td colSpan={28} className="p-6 text-center text-gray-400">
                    ❌ No Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ฟังก์ชันแสดง Tooltip
const TooltipText = ({ user }) => (
  <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    {user
      ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
      : "Not Acknowledge Yet"}
  </div>
);

// Icons จำลอง
const CheckCircleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default TablePage;
