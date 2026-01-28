"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";
import { decryptId } from "@/lib/cryptoId";
import moment from "moment";

type UserCreate = {
  firstname: string;
  lastname: string;
};

type Event = {
  id: number;
  eventName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  rootCause: string;
  preventive: string;
  remark: string;
  eventFile: string;
  partAdd: number;
  createdByUser: UserCreate | null;
  createdAt: string;
  power: Power;
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

export default function EventView() {
  const { id } = useParams();
  const [data, setData] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let decryptedId: string;
        try {
          decryptedId = decryptId(decodeURIComponent(id as string));
        } catch {
          router.replace("/unauthorized");
          return;
        }
        const response = await axiosInstance.get(`/events/${decryptedId}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-4 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push(`/eventreport`)}
          className="flex items-center gap-1 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-center text-xl font-bold text-red-600">
            {data?.partAdd === 1
              ? `EDL => ${data?.power.name}`
              : `${data?.power.name} => EDL`}
          </h1>
        </div>
      </div>
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full overflow-x-auto rounded-lg lg:w-1/2">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  Event Report
                </div>
                <div className="border">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {/* Event Name */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="w-1/4 bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Company
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.power?.company?.name}
                        </td>
                      </tr>

                      {/* Power / Company */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Power Plant
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.power.name}
                        </td>
                      </tr>

                      {/* Date */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Date
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {moment(data.startDate).format("DD/MM/YYYY")} -{" "}
                          {moment(data.endDate).format("DD/MM/YYYY")}
                        </td>
                      </tr>

                      {/* Time */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Time
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.startTime} - {data.endTime}
                        </td>
                      </tr>

                      {/* Root Cause */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Root Cause
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.rootCause}
                        </td>
                      </tr>

                      {/* Preventive */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Preventive
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.preventive}
                        </td>
                      </tr>

                      {/* Remark */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Remark
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.remark || "-"}
                        </td>
                      </tr>

                      {/* Created By */}
                      <tr className="border-b dark:border-gray-700">
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Created By
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {data.createdByUser
                            ? `${data.createdByUser.firstname} ${data.createdByUser.lastname}`
                            : "-"}
                        </td>
                      </tr>

                      <tr>
                        <th className="bg-gray-100 px-4 py-3 text-left font-medium dark:bg-gray-800">
                          Created At
                        </th>
                        <td className="max-w-xl px-4 py-3 break-words whitespace-pre-line">
                          {moment(data.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg lg:w-1/2">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  File Attachment
                </div>
                <div className="h-165 border p-2">
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL}/upload/event/${data.eventFile}`}
                    title="PDF Preview"
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500"></div>
      )}
    </div>
  );
}
