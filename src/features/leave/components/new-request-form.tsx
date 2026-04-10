"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { getBrowserSupabaseClient } from "@/infrastructure/supabase/browser-client";

type LeaveTypeOption = {
  id: string;
  code: string;
  label: string;
};

type NewRequestFormProps = {
  leaveTypes: LeaveTypeOption[];
};

function enumerateDates(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return [];
  }

  const days: Array<{ leaveDate: string; dayPart: "FULL_DAY"; durationDays: number }> = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const iso = cursor.toISOString().slice(0, 10);
    days.push({ leaveDate: iso, dayPart: "FULL_DAY", durationDays: 1 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function NewRequestForm({ leaveTypes }: NewRequestFormProps) {
  const router = useRouter();
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const computedDays = useMemo(() => enumerateDates(startDate, endDate), [startDate, endDate]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);

    if (!leaveTypeId) {
      setServerError("Veuillez sélectionner un type d'absence.");
      return;
    }

    if (!computedDays.length) {
      setServerError("Veuillez renseigner une plage de dates valide.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Session expirée. Merci de vous reconnecter.");
      }

      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveTypeId,
          reason,
          days: computedDays
        })
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(body.message ?? "Erreur lors de la soumission de la demande");
      }

      router.push("/requests");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardTitle>Nouvelle demande de congé</CardTitle>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Type d'absence
          <select className="mt-1 w-full rounded-md border bg-card px-3 py-2" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
            {leaveTypes.map((leaveType) => (
              <option key={leaveType.id} value={leaveType.id}>
                {leaveType.label} ({leaveType.code})
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            Du
            <input type="date" className="mt-1 w-full rounded-md border bg-card px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="block text-sm">
            Au
            <input type="date" className="mt-1 w-full rounded-md border bg-card px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm">
          Motif (optionnel)
          <textarea className="mt-1 w-full rounded-md border bg-card px-3 py-2" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>

        <p className="text-xs text-muted-foreground">Jours demandés: {computedDays.length}</p>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || leaveTypes.length === 0}>
            {submitting ? "Envoi..." : "Envoyer la demande"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
