import { ImageResponse } from 'next/og';

import { getDictionary, isLocale } from '@/lib/i18n';

/**
 * Image de partage, generee a la demande, dans la langue de la page.
 *
 * PLACEE DANS LE SEGMENT DE LANGUE, PAS A LA RACINE
 *
 * A la racine, elle etait bien compilee mais n'apparaissait pas dans le HTML
 * de /fr : la page y declare son propre bloc `openGraph`, et l'heritage ne se
 * faisait pas. Ici, l'image appartient au meme segment que la page  plus
 * d'ambiguite  et elle gagne au passage de pouvoir etre traduite.
 *
 * 1200 × 630 est le format attendu par Facebook, LinkedIn, WhatsApp et X. Une
 * image plus petite est recadree ou ignoree selon les plateformes.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export const alt = 'Deezy';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');

  const headline = `${dict.hero.titleStart} ${dict.hero.titleHighlight}`;
  const badges = dict.proof.items.map((item) => item.title);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0B1220 0%, #14243F 55%, #0B1220 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* La marque est redessinee en texte : le logotype est un PNG a fond
            transparent, mal rendu sur un fond sombre. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            d
          </div>
          <div style={{ color: '#ffffff', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            deezy
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              color: '#93A9C9',
              fontSize: 28,
              lineHeight: 1.35,
              marginTop: 26,
              maxWidth: 900,
            }}
          >
            {dict.hero.subtitle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {badges.map((item) => (
            <div
              key={item}
              style={{
                color: '#C7D6EC',
                fontSize: 21,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
