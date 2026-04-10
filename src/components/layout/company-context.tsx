export function CompanyContext() {
  return (
    <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 md:flex">
      <span className="h-2.5 w-2.5 rounded-full bg-chromatotec" />
      <p className="text-xs text-muted-foreground">
        Société de référence: <span className="font-semibold text-foreground">Chromatotec</span>
      </p>
    </div>
  );
}
