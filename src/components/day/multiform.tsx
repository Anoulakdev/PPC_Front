"use client";

import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { ProgressBar } from "./ProgressBar";
import { useDayPowerStore } from "@/store/dayPowerStore";

export default function MultiStepFormPage() {
  const { currentStep } = useDayPowerStore();

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      {/* ✅ ProgressBar ตรงกลางและเต็มความกว้าง */}
      <div className="mb-3 flex justify-center">
        <div className="max-w-8xl w-full md:ms-10 lg:ms-15 xl:ms-20 2xl:ms-35">
          <ProgressBar />
        </div>
      </div>
      <hr />

      {/* ✅ ส่วนเนื้อหาของฟอร์ม */}
      <div className="mx-auto mt-8 w-full">
        <div>
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </div>
      </div>
    </div>
  );
}
