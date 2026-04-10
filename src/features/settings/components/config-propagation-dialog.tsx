"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { getBrowserSupabaseClient } from "@/infrastructure/supabase/browser-client";
import type { ApplyMode, CompanyOption, ConfigPropagationPayload } from "@/features/settings/types/config-propagation.types";

type ConfigPropagationDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly sourceCompanyId?: string;
  readonly configKey: string;
  readonly newValue: Record<string, unknown>;
};

export function ConfigPropagationDialog({
  open,
  onClose,
  sourceCompanyId,
  configKey,
  newValue
}: ConfigPropagationDialogProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [applyMode, setApplyMode] = useState<ApplyMode>("current_only");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadCompanies = async () => {
      const supabase = getBrowserSupabaseClient();
      const { data } = await supabase.from("companies").select("id, name").order("name");
      setCompanies((data as CompanyOption[] | null) ?? []);
    };

    void loadCompanies();
  }, [open]);

  const impactedCompanies = useMemo(() => {
    if (applyMode === "current_only") {
      return companies.filter((company) => company.id === sourceCompanyId);
    }

    if (applyMode === "all") {
      return companies;
    }

    return companies.filter((company) => selectedIds.includes(company.id));
  }, [applyMode, companies, selectedIds, sourceCompanyId]);

  if (!open) {
    return null;
  }

  const submitPropagation = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const supabase = getBrowserSupabaseClient();
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      if (!token) {
        throw new Error("Session invalide. Veuillez vous reconnecter.");
      }

      const fallbackSourceCompanyId = sourceCompanyId ?? companies[0]?.id;

      if (!fallbackSourceCompanyId) {
        throw new Error("Aucune société source disponible.");
      }

      const payload: ConfigPropagationPayload = {
        sourceCompanyId: fallbackSourceCompanyId,
        configKey,
        newValue,
        applyMode,
        targetCompanyIds: applyMode === "selected" ? selectedIds : []
      };

      const response = await fetch("/api/admin/config-propagation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(body.message ?? "Erreur lors de la propagation");
      }

      setFeedback(`Succès : propagation appliquée à ${impactedCompanies.length} société(s).`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erreur inattendue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-5 shadow-xl">
        <CardTitle>Propagation inter-sociétés</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Souhaitez-vous appliquer cette modification aux autres sociétés du groupe ?
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={applyMode === "current_only"}
              onChange={() => setApplyMode("current_only")}
            />
            Appliquer uniquement à cette société
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={applyMode === "all"} onChange={() => setApplyMode("all")} />
            Appliquer à toutes les sociétés
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={applyMode === "selected"} onChange={() => setApplyMode("selected")} />
            Appliquer à certaines sociétés sélectionnées
          </label>

          {applyMode === "selected" ? (
            <div className="grid grid-cols-1 gap-2 rounded-lg border bg-muted/20 p-3 md:grid-cols-2">
              {companies.map((company) => (
                <label key={company.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(company.id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds((previous) => [...previous, company.id]);
                      } else {
                        setSelectedIds((previous) => previous.filter((id) => id !== company.id));
                      }
                    }}
                  />
                  {company.name}
                </label>
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Prévisualisation des sociétés impactées</p>
            <ul className="mt-2 space-y-1 text-sm">
              {impactedCompanies.map((company) => (
                <li key={company.id}>• {company.name}</li>
              ))}
            </ul>
          </div>

          {feedback ? (
            <p className="rounded-md bg-muted/30 px-3 py-2 text-sm text-foreground">{feedback}</p>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submitPropagation} disabled={isSubmitting || (applyMode === "selected" && selectedIds.length === 0)}>
            {isSubmitting ? "Propagation..." : "Confirmer la propagation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
