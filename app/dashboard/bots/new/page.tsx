import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { CreateBotForm } from './create-bot-form';
import { PageHeader, BackLink } from '@/components/dashboard/panel';

export default async function NewBotPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.newBot;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href="/dashboard/bots">{t.back}</BackLink>
        <PageHeader title={t.title} description={t.lead} />
      </div>

      <CreateBotForm locale={locale} dict={dict} />

      {/*
        Les etapes restent sous le formulaire, pas au-dessus : elles rassurent
        celui qui hesite, sans retarder celui qui sait deja quoi taper.
      */}
      <section className="border-border rounded-xl border border-dashed p-5">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {t.stepsTitle}
        </h2>

        <ol className="mt-4 flex flex-col gap-4 text-sm">
          {t.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="bg-brand-soft text-brand flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums">
                {index + 1}
              </span>
              <span className="text-muted-foreground pt-0.5 text-pretty">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
