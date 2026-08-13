/**
 * Widget Wizetalk — script d'integration.
 *
 *   <script src="https://votre-app.com/widget.js" data-bot="BOT_ID"></script>
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
    console.error('[Wizetalk] attribut data-bot manquant.');
    return;
  }

  // Un seul widget par page, meme si le script est inclus deux fois.
  if (window.__wizetalkLoaded) return;
  window.__wizetalkLoaded = true;

  var origin = new URL(script.src).origin;

  fetch(origin + '/api/widget/' + encodeURIComponent(botId))
    .then(function (response) {
      if (!response.ok) throw new Error('assistant indisponible');
      return response.json();
    })
    .then(mount)
    .catch(function (error) {
      console.error('[Wizetalk]', error.message);
    });

  function mount(config) {
    var isLeft = config.position === 'bottom-left';
    var side = isLeft ? 'left' : 'right';
    var color = config.primaryColor || '#2563eb';

    // --- Bouton flottant --------------------------------------------------
    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Ouvrir le chat');
    launcher.style.cssText = [
      'position:fixed',
      'bottom:20px',
      side + ':20px',
      'width:56px',
      'height:56px',
      'border-radius:9999px',
      'border:none',
      'cursor:pointer',
      'background:' + color,
      'box-shadow:0 6px 24px rgba(0,0,0,.18)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:0',
      'z-index:2147483000',
      'transition:transform .15s ease',
    ].join(';');

    launcher.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>';

    launcher.addEventListener('mouseenter', function () {
      launcher.style.transform = 'scale(1.05)';
    });
    launcher.addEventListener('mouseleave', function () {
      launcher.style.transform = 'scale(1)';
    });

    // --- Iframe -----------------------------------------------------------
    var frame = document.createElement('iframe');
    frame.src = origin + '/chat/' + encodeURIComponent(botId);
    frame.title = config.name || 'Assistant';
    frame.setAttribute('allow', 'clipboard-write');
    frame.style.cssText = [
      'position:fixed',
      'bottom:88px',
      side + ':20px',
      'width:400px',
      'height:600px',
      'max-width:calc(100vw - 40px)',
      'max-height:calc(100vh - 120px)',
      'border:none',
      'border-radius:16px',
      'box-shadow:0 12px 48px rgba(0,0,0,.22)',
      'background:#fff',
      'z-index:2147483000',
      'display:none',
      'opacity:0',
      'transition:opacity .18s ease',
    ].join(';');

    // Plein ecran sur mobile : un panneau de 400px n'y a pas de sens.
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
        frame.style.width = '400px';
        frame.style.height = '600px';
        frame.style.maxWidth = 'calc(100vw - 40px)';
        frame.style.maxHeight = 'calc(100vh - 120px)';
        frame.style.bottom = '88px';
        frame.style[side] = '20px';
        frame.style.borderRadius = '16px';
      }
    }
    window.addEventListener('resize', applyViewport);

    var open = false;

    function toggle(next) {
      open = next;
      launcher.setAttribute('aria-label', open ? 'Fermer le chat' : 'Ouvrir le chat');

      if (open) {
        applyViewport();
        frame.style.display = 'block';
        // Laisse un frame au navigateur avant la transition d'opacite.
        requestAnimationFrame(function () {
          frame.style.opacity = '1';
        });
        frame.contentWindow.postMessage({ type: 'wizetalk:opened' }, origin);
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
      if (event.data && event.data.type === 'wizetalk:close') toggle(false);
    });

    document.body.appendChild(launcher);
    document.body.appendChild(frame);
  }
})();
