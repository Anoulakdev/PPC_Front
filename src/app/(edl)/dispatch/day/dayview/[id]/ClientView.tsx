"use client";

import React, { useState } from "react";
import { CardDay } from "@/components/reportCard/cardDay";
import DayView from "@/components/day/dayview";

export default function ClientView() {
  const [powerId, setPowerId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <CardDay powerId={powerId} />
      <DayView onPowerIdChange={setPowerId} />
    </div>
  );
}
