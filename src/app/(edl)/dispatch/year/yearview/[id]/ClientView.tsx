"use client";

import React, { useState } from "react";
import { CardMonth } from "@/components/reportCard/cardMonth";
import MonthView from "@/components/month/monthview";

export default function ClientView() {
  const [powerId, setPowerId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <CardMonth powerId={powerId} />
      <MonthView onPowerIdChange={setPowerId} />
    </div>
  );
}
