"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfigPropagationDialog } from "@/features/settings/components/config-propagation-dialog";

export default function CompanySettingsPage() {
  const [openPropagation, setOpenPropagation] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Paramètres société</h2>
          <p className="page-subtitle">Configuration multi-entité: Chromatotec, Airmotec, JPA Technologies.</p>
        </div>
        <div className="flex gap-2">
          <Badge>Valeur spécifique société</Badge>
          <Button variant="outline" onClick={() => setOpenPropagation(true)}>
            Propager aux autres sociétés
          </Button>
        </div>
      </div>
      <Card>
        <CardTitle>Informations légales</CardTitle>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Chromatotec" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="3248" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Europe/Paris" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="FR" />
          <div className="md:col-span-2 flex justify-end">
            <Button type="button" onClick={() => setOpenPropagation(true)}>
              Sauvegarder et choisir propagation
            </Button>
          </div>
        </form>
      </Card>

      <ConfigPropagationDialog
        open={openPropagation}
        onClose={() => setOpenPropagation(false)}
        configKey="company.general_settings"
        newValue={{ idcc_code: "3248", timezone: "Europe/Paris", country_code: "FR" }}
      />
    </section>
  );
}
