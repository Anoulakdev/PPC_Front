"use client";

import { useCreateReportStore } from "@/store/createReportStore";

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

const steps: Step[] = [
  { number: 1, title: "Power Source", subtitle: "Select Power Source" },
  {
    number: 2,
    title: "Daily Reservoir",
    subtitle: "Daily Reservoir Information",
  },
];

export const ProgressBar = () => {
  const { currentStep } = useCreateReportStore();

  return (
    <div className="my-5 flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex flex-1 items-center">
          <div className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                currentStep === step.number
                  ? "bg-blue-600 text-white"
                  : currentStep > step.number
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.subtitle}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-4 h-0.5 flex-1 ${
                currentStep > step.number ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
