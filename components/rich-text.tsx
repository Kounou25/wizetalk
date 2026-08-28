import { Fragment } from 'react';

/**
 * Rendu du balisage leger produit par l'assistant.
 *
 * Le modele ecrit spontanement en markdown : **offre premium**, *nuance*, des
 * puces. Affiche brut, cela donne « **offre premium** » avec les etoiles, ce
 * qui a l'air d'un bogue plutot que d'une mise en forme.
 *
 * ECRIT A LA MAIN, ET VOLONTAIREMENT INCOMPLET
 *
 * Une bibliotheque de markdown apporterait les titres, les tableaux, les blocs
 * de code, les images  tout ce qu'une bulle de discussion de 360 px ne peut
 * pas afficher correctement. On rend donc le vocabulaire exact que le modele
 * est autorise a employer (voir SYSTEM_INSTRUCTION dans lib/rag.ts), et rien
 * d'autre. Les deux listes doivent rester d'accord.
 *
 * AUCUN HTML N'EST INJECTE
 *
 * Le rendu passe par des elements React, jamais par dangerouslySetInnerHTML.
 * Ce texte melange la production du modele et le contenu du site indexe : s'il
 * pouvait porter du HTML, une page piegee ferait executer son script dans la
 * fenetre de discussion. Ici, un « <script> » ecrit dans la reponse s'affiche
 * comme du texte, ce qu'il est.
 */

/** Ordre important : `**` doit etre tente avant `*`, sinon le gras se lit italique. */
const INLINE = new RegExp(
  [
    '\\*\\*[^*\\n]+\\*\\*', // **gras**
    '`[^`\\n]+`', // `code`
    '\\[[^\\]\\n]+\\]\\((?:https?:\\/\\/|mailto:)[^)\\s]+\\)', // [texte](url)
    '\\*[^*\\n]+\\*', // *italique*
  ].join('|'),
  'g',
);

const BULLET = /^\s*[-*•]\s+(.+)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.+)$/;

/**
 * Retire un marqueur ouvert mais pas encore ferme, en fin de texte.
 *
 * La reponse arrive mot par mot : sans cela, le visiteur voit « Notre **offre »
 * pendant une fraction de seconde, puis les etoiles disparaissent. En retirant
 * le marqueur orphelin, le texte apparait sans decoration puis se met en gras
 * a la fermeture  il ne saute jamais.
 */
function trimDangling(text: string): string {
  let out = text;

  if ((out.match(/\*\*/g) ?? []).length % 2 === 1) {
    out = out.replace(/\*\*(?![\s\S]*\*\*)/, '');
  }
  if ((out.match(/`/g) ?? []).length % 2 === 1) {
    out = out.replace(/`(?![\s\S]*`)/, '');
  }

  return out;
}

/** Gras, italique, code et liens a l'interieur d'une ligne. */
function renderInline(line: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of line.matchAll(INLINE)) {
    const token = match[0];
    const start = match.index;

    if (start > last) out.push(line.slice(last, start));
    last = start + token.length;
    const id = `${key}-${index++}`;

    if (token.startsWith('**')) {
      out.push(<strong key={id}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      out.push(
        <code key={id} className="rounded bg-black/10 px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const split = token.indexOf('](');
      out.push(
        <a
          key={id}
          href={token.slice(split + 2, -1)}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2"
        >
          {token.slice(1, split)}
        </a>,
      );
    } else {
      out.push(<em key={id}>{token.slice(1, -1)}</em>);
    }
  }

  if (last < line.length) out.push(line.slice(last));
  return out;
}

type Block =
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; lines: string[] };

/**
 * Decoupe le texte en paragraphes et en listes.
 *
 * Les puces sont incluses bien que la demande portait sur le gras et
 * l'italique : le modele en produit dans presque toutes les enumerations, et
 * une reponse ou le gras s'affiche mais pas les puces aurait l'air a moitie
 * cassee.
 */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    const last = blocks[blocks.length - 1];

    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const item = (bullet ?? numbered)?.[1] ?? '';

      if (last?.kind === 'list' && last.ordered === ordered) last.items.push(item);
      else blocks.push({ kind: 'list', ordered, items: [item] });
      continue;
    }

    // Ligne vide : elle ferme le bloc courant plutot que d'en ouvrir un vide.
    if (!line.trim()) {
      if (last) blocks.push({ kind: 'paragraph', lines: [] });
      continue;
    }

    if (last?.kind === 'paragraph' && last.lines.length > 0) last.lines.push(line);
    else blocks.push({ kind: 'paragraph', lines: [line] });
  }

  return blocks.filter((b) => b.kind === 'list' || b.lines.length > 0);
}

export function RichText({ text }: { text: string }) {
  const blocks = toBlocks(trimDangling(text));

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) =>
        block.kind === 'list' ? (
          block.ordered ? (
            <ol key={index} className="flex list-decimal flex-col gap-1 pl-4">
              {block.items.map((item, i) => (
                <li key={i}>{renderInline(item, `${index}-${i}`)}</li>
              ))}
            </ol>
          ) : (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-4">
              {block.items.map((item, i) => (
                <li key={i}>{renderInline(item, `${index}-${i}`)}</li>
              ))}
            </ul>
          )
        ) : (
          <p key={index}>
            {block.lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {renderInline(line, `${index}-${i}`)}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
