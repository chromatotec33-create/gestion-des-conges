"use client";

import { useMemo, useState } from "react";

type Company = {
  readonly id: string;
  readonly name: string;
  readonly tone: "chromatotec" | "airmotec" | "jpa";
};

const companies: Company[] = [
  { id: "chromatotec", name: "Chromatotec", tone: "chromatotec" },
  { id: "airmotec", name: "Airmotec", tone: "airmotec" },
  { id: "jpa", name: "JPA Technologies", tone: "jpa" }
];

export function CompanySwitcher() {
  const [companyId, setCompanyId] = useState(companies[0].id);

  const current = useMemo(() => companies.find((company) => company.id === companyId) ?? companies[0], [companyId]);
  const toneClass =
    current.tone === "chromatotec" ? "bg-chromatotec" : current.tone === "airmotec" ? "bg-airmotec" : "bg-jpa";

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className={`h-2.5 w-2.5 rounded-full ${toneClass}`} />
      <select
        className="bg-transparent text-sm font-medium outline-none"
        value={companyId}
        onChange={(event) => setCompanyId(event.target.value)}
        aria-label="Sélection société"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
