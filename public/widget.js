/**
 * Widget Deezy — script d'integration.
 *
 *   <script src="https://www.deezy.chat/widget.js" data-bot="BOT_ID"></script>
 *
 * Volontairement en JavaScript nu, sans dependance ni etape de build : ce
 * fichier est charge sur le site d'un client, il doit rester minuscule.
 *
 * Le chat lui-meme vit dans une iframe. C'est ce qui garantit que le CSS du
 * site client ne peut rien casser, et reciproquement : aucune de nos regles ne
 * fuit chez lui. Seuls le bouton et le cadre de l'iframe sont poses ici, avec
 * des styles inline pour ne pas dependre de la feuille de style du site.
 */

(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var botId = script.getAttribute('data-bot');
  if (!botId) {
    console.error('[Deezy] attribut data-bot manquant.');
    return;
  }

  // Un seul widget par page, meme si le script est inclus deux fois.
  if (window.__deezyLoaded) return;
  window.__deezyLoaded = true;

  var origin = new URL(script.src).origin;

  fetch(origin + '/api/widget/' + encodeURIComponent(botId))
    .then(function (response) {
      if (!response.ok) throw new Error('assistant indisponible');
      return response.json();
    })
    .then(mount)
    .catch(function (error) {
      console.error('[Deezy]', error.message);
    });

  /*
   * Encombrement du widget chez le client.
   *
   * Regroupe ici parce que ces nombres etaient ecrits deux fois — dans le
   * style initial de l'iframe et dans applyViewport. Deux copies d'une meme
   * mesure finissent toujours par diverger, et la divergence ne se voit qu'au
   * redimensionnement de la fenetre, c'est-a-dire presque jamais pendant les
   * essais.
   *
   * LE BOUTON NE DESCEND PAS SOUS 44 px
   *
   * C'est la cible tactile minimale recommandee (WCAG 2.5.5). En dessous, on
   * gagne quelques pixels sur la page et on perd les visiteurs qui ratent le
   * bouton au doigt. 48 laisse une marge sans peser.
   */
  var LAUNCHER = 48;
  var EDGE = 16;
  var GAP = 12;
  var PANEL_W = 360;
  var PANEL_H = 520;

  // Bas du panneau : juste au-dessus du bouton.
  var PANEL_BOTTOM = EDGE + LAUNCHER + GAP;

  /*
   * Invitation posee a cote du bouton.
   *
   * Elle apparait apres un delai, s'efface d'elle-meme, et ne revient plus une
   * fois ecartee ou une fois la discussion ouverte. Ces trois regles sont ce
   * qui separe une invitation d'une publicite : elle propose, puis elle sort
   * du chemin.
   *
   * Elle n'ouvre JAMAIS le panneau toute seule. Un cadre de 360 par 520 qui
   * surgit sur la page qu'on est en train de lire est la raison pour laquelle
   * la plupart des visiteurs ferment ces widgets sans les avoir essayes.
   */
  var TEASER_DELAY = 4000;
  var TEASER_LIFETIME = 8000;

  /*
   * Langue du visiteur, dans cet ordre :
   *
   *   1. celle que la PAGE declare (<html lang>)
   *   2. celle du navigateur
   *   3. le francais
   *
   * La page passe avant le navigateur, et c'est le point important. Sur un
   * site bilingue, quelqu'un qui lit la version anglaise a fait un choix
   * explicite — il a cliqué sur « EN » — et ce choix doit l'emporter sur le
   * reglage de son navigateur, qui n'est souvent que celui d'usine. Sans cette
   * regle, la version anglaise d'un site affiche un widget francais a tous les
   * visiteurs dont le navigateur est reste en francais.
   *
   * Le navigateur reprend la main quand la page ne declare rien, ou declare
   * une langue que nous ne parlons pas : mieux vaut une langue que le visiteur
   * comprend qu'un repli aveugle.
   *
   * Cette meme valeur part dans l'adresse de l'iframe : la bulle et la fenetre
   * de discussion parlent ainsi forcement la meme langue. Deux detections
   * independantes finiraient par se contredire.
   */
  var STRINGS = {
    fr: {
      teaser: 'Une question ? Je vous réponds tout de suite.',
      open: 'Ouvrir le chat',
      close: 'Fermer le chat',
      hide: "Masquer l'invitation",
    },
    en: {
      teaser: 'A question? I answer right away.',
      open: 'Open chat',
      close: 'Close chat',
      hide: 'Hide this invitation',
    },
  };

  function detectLang() {
    var pageLang = (document.documentElement && document.documentElement.lang) || '';
    var tags = [pageLang].concat(navigator.languages || [navigator.language || '']);

    for (var i = 0; i < tags.length; i++) {
      var base = String(tags[i]).toLowerCase().split('-')[0];
      if (STRINGS[base]) return base;
    }
    return 'fr';
  }

  var lang = detectLang();
  var T = STRINGS[lang];

  /*
   * Les animations demandent des images-cles, qu'un style en ligne ne peut pas
   * porter. C'est la seule chose que l'on ecrit dans la page du client : une
   * balise unique, des noms prefixes, aucun selecteur qui deborde sur son
   * propre CSS.
   */
  function injectStyles() {
    if (document.getElementById('deezy-styles')) return;

    var style = document.createElement('style');
    style.id = 'deezy-styles';
    style.textContent = [
      '@keyframes deezy-teaser-in{',
      'from{opacity:0;transform:translateY(6px) scale(.96)}',
      'to{opacity:1;transform:none}}',
      '@keyframes deezy-teaser-out{',
      'from{opacity:1;transform:none}',
      'to{opacity:0;transform:translateY(4px) scale(.98)}}',
      '.deezy-teaser{animation:deezy-teaser-in .28s cubic-bezier(.16,1,.3,1) both}',
      '.deezy-teaser-leaving{animation:deezy-teaser-out .18s ease both}',
      /*
       * Mouvement reduit : le fondu reste, le deplacement disparait.
       *
       * Ce reglage est souvent active par des personnes sujettes au vertige ou
       * a la migraine. Une bulle qui jaillit d'un coin est exactement ce
       * qu'elles ont demande a ne plus voir — mais les faire disparaitre
       * entierement leur retirerait l'invitation, ce qui n'est pas ce qu'elles
       * ont demande non plus.
       */
      '@media (prefers-reduced-motion:reduce){',
      '.deezy-teaser{animation:none;opacity:1}',
      '.deezy-teaser-leaving{animation:none;opacity:0}}',
    ].join('');

    document.head.appendChild(style);
  }

  function mount(config) {
    injectStyles();

    var isLeft = config.position === 'bottom-left';
    var side = isLeft ? 'left' : 'right';
    var color = config.primaryColor || '#2563eb';

    // --- Bouton flottant --------------------------------------------------
    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', T.open);
    launcher.style.cssText = [
      'position:fixed',
      'bottom:' + EDGE + 'px',
      side + ':' + EDGE + 'px',
      'width:' + LAUNCHER + 'px',
      'height:' + LAUNCHER + 'px',
      'border-radius:9999px',
      'border:none',
      'cursor:pointer',
      'background:' + color,
      'box-shadow:0 4px 16px rgba(0,0,0,.16)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:0',
      'z-index:2147483000',
      'transition:transform .15s ease',
    ].join(';');

    launcher.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>';

    launcher.addEventListener('mouseenter', function () {
      launcher.style.transform = 'scale(1.05)';
    });
    launcher.addEventListener('mouseleave', function () {
      launcher.style.transform = 'scale(1)';
    });

    // --- Invitation -------------------------------------------------------
    var teaser = document.createElement('div');
    teaser.style.cssText = [
      'position:fixed',
      // Meme hauteur que le bouton : la bulle se centre dessus sans calcul.
      'bottom:' + EDGE + 'px',
      'height:' + LAUNCHER + 'px',
      side + ':' + (EDGE + LAUNCHER + 10) + 'px',
      'display:none',
      'align-items:center',
      'z-index:2147482999',
      'max-width:min(240px, calc(100vw - ' + (EDGE * 2 + LAUNCHER + 20) + 'px))',
    ].join(';');

    var invite = document.createElement('button');
    invite.type = 'button';
    invite.setAttribute('aria-label', T.teaser + ' ' + T.open + '.');
    invite.textContent = T.teaser;
    invite.style.cssText = [
      'position:relative',
      'margin:0',
      'padding:9px 12px',
      'border:none',
      'border-radius:12px',
      // Blanc et non la couleur de la marque : la bulle doit ressembler a un
      // message, pas a une banniere.
      'background:#fff',
      'color:#0f172a',
      'font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
      'text-align:' + (isLeft ? 'left' : 'right'),
      'box-shadow:0 4px 20px rgba(0,0,0,.14)',
      'cursor:pointer',
      'display:block',
    ].join(';');

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.setAttribute('aria-label', T.hide);
    dismiss.innerHTML =
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569"' +
      ' stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    dismiss.style.cssText = [
      'position:absolute',
      'top:-7px',
      'right:-7px',
      'width:20px',
      'height:20px',
      'padding:0',
      'border:none',
      'border-radius:9999px',
      'background:#e2e8f0',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-shadow:0 1px 4px rgba(0,0,0,.15)',
    ].join(';');

    var teaserTimer;

    function hideTeaser(remember) {
      clearTimeout(teaserTimer);
      if (teaser.style.display === 'none') return;

      teaser.className = 'deezy-teaser deezy-teaser-leaving';
      setTimeout(function () {
        teaser.style.display = 'none';
        teaser.className = '';
      }, 180);

      // Ecarte volontairement : on ne la represente pas de la visite.
      if (remember) {
        try {
          sessionStorage.setItem('deezy:teaser:' + botId, '1');
        } catch (e) {
          /* navigation privee : l'invitation reviendra, sans consequence. */
        }
      }
    }

    function showTeaser() {
      if (open) return;
      try {
        if (sessionStorage.getItem('deezy:teaser:' + botId)) return;
      } catch (e) {
        /* stockage indisponible : on affiche, c'est le comportement le plus sur. */
      }

      teaser.style.display = 'flex';
      teaser.className = 'deezy-teaser';
      teaserTimer = setTimeout(function () {
        hideTeaser(false);
      }, TEASER_LIFETIME);
    }

    invite.addEventListener('click', function () {
      hideTeaser(true);
      toggle(true);
    });

    dismiss.addEventListener('click', function (event) {
      event.stopPropagation();
      hideTeaser(true);
    });

    invite.appendChild(dismiss);
    teaser.appendChild(invite);

    // --- Iframe -----------------------------------------------------------
    var frame = document.createElement('iframe');
    frame.src = origin + '/chat/' + encodeURIComponent(botId) + '?lang=' + lang;
    frame.title = config.name || 'Assistant';
    frame.setAttribute('allow', 'clipboard-write');
    frame.style.cssText = [
      'position:fixed',
      'bottom:' + PANEL_BOTTOM + 'px',
      side + ':' + EDGE + 'px',
      'width:' + PANEL_W + 'px',
      'height:' + PANEL_H + 'px',
      'max-width:calc(100vw - ' + EDGE * 2 + 'px)',
      'max-height:calc(100vh - ' + (PANEL_BOTTOM + EDGE) + 'px)',
      'border:none',
      'border-radius:14px',
      'box-shadow:0 8px 32px rgba(0,0,0,.18)',
      'background:#fff',
      'z-index:2147483000',
      'display:none',
      'opacity:0',
      'transition:opacity .18s ease',
    ].join(';');

    // Plein ecran sur mobile : un panneau flottant n'y a pas de sens.
    function applyViewport() {
      if (window.innerWidth <= 480) {
        frame.style.width = '100vw';
        frame.style.height = '100dvh';
        frame.style.maxWidth = '100vw';
        frame.style.maxHeight = '100dvh';
        frame.style.bottom = '0';
        frame.style[side] = '0';
        frame.style.borderRadius = '0';
      } else {
        frame.style.width = PANEL_W + 'px';
        frame.style.height = PANEL_H + 'px';
        frame.style.maxWidth = 'calc(100vw - ' + EDGE * 2 + 'px)';
        frame.style.maxHeight = 'calc(100vh - ' + (PANEL_BOTTOM + EDGE) + 'px)';
        frame.style.bottom = PANEL_BOTTOM + 'px';
        frame.style[side] = EDGE + 'px';
        frame.style.borderRadius = '14px';
      }
    }
    window.addEventListener('resize', applyViewport);

    var open = false;

    function toggle(next) {
      open = next;
      launcher.setAttribute('aria-label', open ? T.close : T.open);
      if (open) hideTeaser(true);

      if (open) {
        applyViewport();
        frame.style.display = 'block';
        // Laisse un frame au navigateur avant la transition d'opacite.
        requestAnimationFrame(function () {
          frame.style.opacity = '1';
        });
        frame.contentWindow.postMessage({ type: 'deezy:opened' }, origin);
      } else {
        frame.style.opacity = '0';
        setTimeout(function () {
          if (!open) frame.style.display = 'none';
        }, 180);
      }
    }

    launcher.addEventListener('click', function () {
      toggle(!open);
    });

    // Fermeture demandee depuis l'interieur de l'iframe.
    window.addEventListener('message', function (event) {
      if (event.origin !== origin) return;
      if (event.data && event.data.type === 'deezy:close') toggle(false);
    });

    document.body.appendChild(launcher);
    document.body.appendChild(teaser);
    document.body.appendChild(frame);

    setTimeout(showTeaser, TEASER_DELAY);
  }
})();
