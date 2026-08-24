export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border hero-sheen relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-16 text-center">
      {/* Halo derriere l'icone : il pose un centre a une zone par definition
          vide, sans y ajouter de contenu a lire. */}
      <span className="bg-brand-soft text-brand ring-brand/10 flex size-14 items-center justify-center rounded-2xl ring-8">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm text-pretty">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
