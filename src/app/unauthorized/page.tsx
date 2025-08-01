"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-100 to-red-300 p-4 dark:from-red-900 dark:to-red-700">
      <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl dark:bg-gray-900">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4 text-red-500 shadow-lg dark:bg-red-500/20">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-gray-800 dark:text-white">
          Access Denied
        </h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          You do not have permission to access this page.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-gradient-to-r from-red-500 to-red-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
