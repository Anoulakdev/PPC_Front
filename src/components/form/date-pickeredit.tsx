"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id: string;
  name?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: flatpickr.Options.Hook | flatpickr.Options.Hook[];
  defaultDate?: string; // ค่าที่ได้จาก backend เช่น "2026-01-15"
  label?: string;
  placeholder?: string;
};

export default function DatePickerOne({
  id,
  name,
  mode = "single",
  onChange,
  defaultDate,
  label,
  placeholder,
}: PropsType) {
  const fpRef = useRef<flatpickr.Instance | null>(null);

  // Init flatpickr ครั้งเดียว
  useEffect(() => {
    fpRef.current = flatpickr(`#${id}`, {
      mode,
      static: true,
      monthSelectorType: "static",

      dateFormat: "d-m-Y",

      onChange,
    }) as flatpickr.Instance;

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [id, mode, onChange]);

  // Set defaultDate ตอน edit
  useEffect(() => {
    if (fpRef.current && defaultDate) {
      // แปลงจาก YYYY-MM-DD → Date object
      const parts = defaultDate.split("-");
      const jsDate = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
      );
      fpRef.current.setDate(jsDate, false); // false = ไม่ trigger onChange
    }
  }, [defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          name={name}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border px-4 text-sm"
          readOnly // ให้ผู้ใช้เลือกผ่าน datepicker เท่านั้น
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
