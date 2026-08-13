import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { CreateBotForm } from './create-bot-form';

export default async function NewBotPage() {
  const dict = getDictionary(await getRequestLocale());
  const t = dict.dashboard.newBot;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <Link
          href="/dashboard/bots"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          {t.back}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
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
