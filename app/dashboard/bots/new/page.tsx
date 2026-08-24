import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { CreateBotForm } from './create-bot-form';
import { PageHeader, BackLink } from '@/components/dashboard/panel';

export default async function NewBotPage() {
  const dict = getDictionary(await getRequestLocale());
  const t = dict.dashboard.newBot;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href="/dashboard/bots">{t.back}</BackLink>
        <PageHeader title={t.title} description={t.lead} />
      </div>

      <CreateBotForm dict={dict} />

      <ol className="text-muted-foreground flex flex-col gap-3 text-sm">
        {t.steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
