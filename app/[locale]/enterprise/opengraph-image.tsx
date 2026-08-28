import { ImageResponse } from 'next/og';

import { getDictionary, isLocale } from '@/lib/i18n';

/**
 * Image de partage de la page Enterprise, dans la langue de la page.
 *
 * PROPRE AU SEGMENT, COMME CELLE DE LA LANDING
 *
 * Une page qui declare son propre bloc `openGraph` n'herite pas de l'image du
 * segment parent : sans ce fichier, un lien vers /fr/enterprise partage sur
 * LinkedIn afficherait le visuel de la page de presentation, avec sa promesse
 * grand public  exactement le contresens que cette offre cherche a eviter.
 *
 * Le badge « Enterprise » et les secteurs vises font toute la difference avec
 * l'image de la landing : un lien partage dans une conversation professionnelle
 * doit dire en un coup d'oeil a qui il s'adresse.
 *
 * 1200 × 630 est le format attendu par Facebook, LinkedIn, WhatsApp et X.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export const alt = 'Deezy Enterprise';

export default async function EnterpriseOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : 'fr').enterprise;

  // Les quatre premiers secteurs : au-dela, les etiquettes deviennent trop
  // petites pour etre lues dans une vignette de fil d'actualite.
  const sectors = t.useCases.items.slice(0, 4).map((item) => item.title);

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
          <div
            style={{ color: '#ffffff', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}
          >
            deezy
          </div>
          <div
            style={{
              color: '#93A9C9',
              fontSize: 26,
              fontWeight: 500,
              paddingLeft: 14,
              marginLeft: 14,
              borderLeft: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            Enterprise
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 960,
            }}
          >
            {t.hero.title}
          </div>
          <div
            style={{
              color: '#93A9C9',
              fontSize: 26,
              lineHeight: 1.35,
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            {t.hero.reassurance}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {sectors.map((item) => (
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
