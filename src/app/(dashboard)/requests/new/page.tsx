"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const steps = ["Type d'absence", "Dates", "Impact sur le solde", "Validation", "Confirmation"] as const;

export default function NewRequestPage() {
  const [step, setStep] = useState(0);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Assistant : je veux poser un congé</h2>
        <p className="page-subtitle">Parcours guidé étape par étape pour éviter les erreurs.</p>
      </div>

      <Card>
        <CardTitle>Étape {step + 1} — {steps[step]}</CardTitle>
        <div className="mt-4 space-y-3 text-sm">
          {step === 0 ? (
            <select className="w-full rounded-md border bg-card px-3 py-2">
              <option>Congés payés N</option>
              <option>RTT</option>
              <option>Congé exceptionnel</option>
            </select>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input type="date" className="rounded-md border bg-card px-3 py-2" />
              <input type="date" className="rounded-md border bg-card px-3 py-2" />
            </div>
          ) : null}

          {step === 2 ? <p>Impact estimé : -2 jours. Solde restant après demande : 8 jours.</p> : null}
          {step === 3 ? <p>Validation prévue : Manager équipe → RH.</p> : null}
          {step === 4 ? <p>Vérifiez les informations puis confirmez l’envoi de votre demande.</p> : null}
        </div>

        <div className="mt-5 flex justify-between">
          <Button variant="outline" onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
            Précédent
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}>Suivant</Button>
          ) : (
            <Button>Envoyer la demande</Button>
          )}
        </div>
      </Card>
    </section>
  );
}
