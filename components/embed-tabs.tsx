'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/** L'origine ne change jamais pendant la vie de la page : rien a souscrire. */
const noopSubscribe = () => () => {};

interface Snippet {
  id: string;
  label: string;
  file: string;
  /** Certaines plateformes se pilotent a la souris : on donne le chemin. */
  steps?: string[];
  code: string;
}

function buildSnippets(origin: string, botId: string): Snippet[] {
  const scriptTag = `<script src="${origin}/widget.js" data-bot="${botId}" async></script>`;

  return [
    {
      id: 'html',
      label: 'HTML',
      file: 'index.html',
      code: `<body>
  <!-- le contenu de votre page -->

  ${scriptTag}
</body>`,
    },
    {
      id: 'nextjs',
      label: 'Next.js',
      file: 'app/layout.tsx',
      code: `import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Script
          src="${origin}/widget.js"
          data-bot="${botId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
    },
    {
      id: 'react',
      label: 'React',
      file: 'App.jsx',
      code: `import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${origin}/widget.js';
    script.dataset.bot = '${botId}';
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <>{/* votre application */}</>;
}`,
    },
    {
      id: 'vue',
      label: 'Vue',
      file: 'App.vue',
      code: `<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = '${origin}/widget.js';
  script.dataset.bot = '${botId}';
  script.async = true;
  document.body.appendChild(script);
});
</script>

<template>
  <!-- votre application -->
</template>`,
    },
    {
      id: 'wordpress',
      label: 'WordPress',
      file: 'functions.php',
      steps: [
        'Apparence → Éditeur de fichiers du thème → functions.php',
        'Ou une extension d’insertion de code, si vous préférez ne pas toucher au thème',
      ],
      code: `add_action('wp_footer', function () {
  echo '${scriptTag.replace(/'/g, "\\'")}';
});`,
    },
    {
      id: 'nocode',
      label: 'No-code',
      file: 'Wix · Shopify · Squarespace · Webflow · Framer',
      steps: [
        'Wix — Paramètres → Code personnalisé → Ajouter du code, dans le corps de page',
        'Shopify — Boutique en ligne → Thèmes → Modifier le code → theme.liquid',
        'Squarespace — Paramètres → Avancé → Injection de code → Pied de page',
        'Webflow — Paramètres du projet → Custom Code → Footer Code',
        'Framer — Site Settings → General → Custom Code → End of <body>',
      ],
      code: scriptTag,
    },
  ];
}

export function EmbedTabs({
  botId,
  fallbackOrigin,
  className,
  copyLabel = 'Copier',
  copiedLabel = 'Copié',
}: {
  botId: string;
  /** Origine de repli pour le rendu serveur, avant hydratation. */
  fallbackOrigin: string;
  className?: string;
  copyLabel?: string;
  copiedLabel?: string;
}) {
  /**
   * L'origine reelle du navigateur fait autorite : le script pointe donc
   * toujours vers le domaine depuis lequel la page est consultee. Sans cela,
   * un NEXT_PUBLIC_APP_URL oublie en production livrerait a vos clients un
   * script pointant vers http://localhost:3000.
   */
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => fallbackOrigin,
  );

  const snippets = buildSnippets(origin, botId);
  const [activeId, setActiveId] = useState(snippets[0]?.id ?? 'html');
  const [copied, setCopied] = useState(false);

  const active = snippets.find((snippet) => snippet.id === activeId) ?? snippets[0];
  if (!active) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active!.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-slate-950 ring-1 ring-white/10',
        className,
      )}
    >
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 pt-2">
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => {
              setActiveId(snippet.id);
              setCopied(false);
            }}
            className={cn(
              'cursor-pointer rounded-t-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors',
              snippet.id === activeId
                ? 'bg-white/10 text-white'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {snippet.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2">
        <span className="truncate font-mono text-[11px] text-slate-500">{active.file}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-3 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              {copiedLabel}
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              {copyLabel}
            </>
          )}
        </button>
      </div>

      {active.steps && active.steps.length > 0 && (
        <ol className="space-y-1 border-b border-white/10 px-4 py-3 text-xs text-slate-400">
          {active.steps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-slate-600" aria-hidden>
                →
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      <pre
        key={active.id}
        className="animate-slide-up-fade overflow-x-auto p-4 text-[13px] leading-relaxed"
      >
        <code className="font-mono text-slate-100">{active.code}</code>
      </pre>
    </div>
  );
}
