"use client";

import { useState } from "react";
import { AreaChart } from "@/components/AreaChart";
import { FilterTabs } from "@/components/FilterTabs";

const TRAFFIC_BY_PERIOD = {
  "3m": [
    { label: "S1 Fév", value: 2840 },
    { label: "S2 Fév", value: 3120 },
    { label: "S3 Fév", value: 2980 },
    { label: "S4 Fév", value: 3340 },
    { label: "S1 Mar", value: 3690 },
    { label: "S2 Mar", value: 3470 },
    { label: "S3 Mar", value: 3810 },
    { label: "S4 Mar", value: 3750 },
    { label: "S1 Avr", value: 4020 },
    { label: "S2 Avr", value: 4280 },
    { label: "S3 Avr", value: 3960 },
    { label: "S4 Avr", value: 4490 },
  ],
  "6m": [
    { label: "S1 Nov", value: 1820 },
    { label: "S2 Nov", value: 1950 },
    { label: "S3 Nov", value: 2080 },
    { label: "S4 Nov", value: 2010 },
    { label: "S1 Déc", value: 2140 },
    { label: "S2 Déc", value: 2280 },
    { label: "S3 Déc", value: 2190 },
    { label: "S4 Déc", value: 2350 },
    { label: "S1 Jan", value: 2420 },
    { label: "S2 Jan", value: 2580 },
    { label: "S3 Jan", value: 2510 },
    { label: "S4 Jan", value: 2680 },
    { label: "S1 Fév", value: 2840 },
    { label: "S2 Fév", value: 3120 },
    { label: "S3 Fév", value: 2980 },
    { label: "S4 Fév", value: 3340 },
    { label: "S1 Mar", value: 3690 },
    { label: "S2 Mar", value: 3470 },
    { label: "S3 Mar", value: 3810 },
    { label: "S4 Mar", value: 3750 },
    { label: "S1 Avr", value: 4020 },
    { label: "S2 Avr", value: 4280 },
    { label: "S3 Avr", value: 3960 },
    { label: "S4 Avr", value: 4490 },
  ],
  "1an": [
    { label: "Mai 25",  value: 1240 },
    { label: "Juin 25", value: 1380 },
    { label: "Juil 25", value: 1520 },
    { label: "Août 25", value: 1490 },
    { label: "Sept 25", value: 1680 },
    { label: "Oct 25",  value: 1840 },
    { label: "Nov 25",  value: 1960 },
    { label: "Déc 25",  value: 2190 },
    { label: "Jan 26",  value: 2540 },
    { label: "Fév 26",  value: 3070 },
    { label: "Mar 26",  value: 3680 },
    { label: "Avr 26",  value: 4190 },
  ],
};

export function TrafficChart() {
  const [period, setPeriod] = useState<"3m" | "6m" | "1an">("3m");
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution du trafic organique</p>
        <FilterTabs
          tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <AreaChart data={TRAFFIC_BY_PERIOD[period]} height={128} gradientId="traffic-organic-grad" />
    </div>
  );
}
