"use client";

import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { ProgressBar } from "./ProgressBar";
import { useCreateReportStore } from "@/store/createReportStore";

export default function MultiStepFormPage() {
  const { currentStep } = useCreateReportStore();

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      {/* ✅ ProgressBar ตรงกลางและเต็มความกว้าง */}
      <div className="mb-3 flex justify-center">
        <div className="max-w-8xl w-full md:ms-20 lg:ms-25 xl:ms-40 2xl:ms-65">
          <ProgressBar />
        </div>
      </div>
      <hr />

      {/* ✅ ส่วนเนื้อหาของฟอร์ม */}
      <div className="mx-auto mt-8 w-full">
        <div>
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
        </div>
      </div>
    </div>
  );
}
