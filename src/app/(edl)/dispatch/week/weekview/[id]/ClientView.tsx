"use client";

import React, { useState } from "react";
import { CardWeek } from "@/components/reportCard/cardWeek";
import WeekView from "@/components/week/weekview";

export default function ClientView() {
  const [powerId, setPowerId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <CardWeek powerId={powerId} />
      <WeekView onPowerIdChange={setPowerId} />
    </div>
  );
}
