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
    // Bordure en tirets : elle dit « emplacement a remplir » la ou une bordure
    // pleine dirait « bloc vide ». C'est la seule difference avec un panneau.
    <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="bg-surface-subtle text-muted-foreground border-border flex size-11 items-center justify-center rounded-xl border">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm text-pretty">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
