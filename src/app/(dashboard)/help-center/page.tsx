import { Card, CardTitle } from "@/components/ui/card";

const faq = [
  {
    question: "Comment faire une demande de congé ?",
    answer: "Cliquez sur “Je veux poser un congé”, suivez les étapes et validez le récapitulatif final."
  },
  {
    question: "Comment savoir qui valide ma demande ?",
    answer: "Le résumé de la demande affiche automatiquement la chaîne de validation concernée."
  },
  {
    question: "Que faire si mon solde semble incorrect ?",
    answer: "Contactez l’équipe RH via le bouton d’aide et joignez la demande concernée."
  }
];

export default function HelpCenterPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Centre d’aide</h2>
        <p className="page-subtitle">Réponses simples pour utiliser le logiciel sereinement au quotidien.</p>
      </div>

      <Card>
        <CardTitle>Questions fréquentes</CardTitle>
        <ul className="mt-4 space-y-3">
          {faq.map((item) => (
            <li key={item.question} className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-semibold">{item.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
