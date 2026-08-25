/**
 * Dictionnaire de reference. Toute nouvelle chaine part d'ici.
 *
 * La partie « landing » suit l'ordre du tunnel de vente, et non l'ordre
 * alphabetique ou historique : probleme -> consequence -> solution -> preuve
 * de fiabilite -> valeur recuperee -> simplicite -> prix -> objections ->
 * action. Chaque cle porte le nom de l'etape qu'elle sert, ce qui rend
 * immediatement visible qu'une section manque ou fait doublon.
 */
export const fr = {
  meta: {
    title: 'Deezy — le chatbot IA qui répond à vos clients 24 h/24',
    description:
      "Transformez votre site en assistant IA : il répond à vos visiteurs 24 h/24, récupère leurs coordonnées quand il n'a pas la réponse, et vous montre ce qui manque à votre site. 300 crédits offerts pour essayer.",
  },

  nav: {
    problem: 'Le problème',
    solution: 'Comment ça marche',
    pricing: 'Tarifs',
    faq: 'Questions',
    login: 'Se connecter',
    signup: 'Essayer gratuitement',
    dashboard: 'Mon espace',
  },

  hero: {
    /* Le positionnement, place en surtitre : c'est la phrase qui doit rester
       en tete si le visiteur ne lit rien d'autre. */
    badge: 'Transformez les questions sans réponse en clients',
    titleStart: 'Ne perdez plus un client',
    titleHighlight: 'faute de réponse',
    subtitle:
      "Deezy transforme votre site et vos documents en un assistant qui répond à vos visiteurs 24 h/24 — et récupère leur adresse quand il n'a pas la réponse.",
    ctaPrimary: 'Essayer Deezy gratuitement',
    ctaSecondary: 'Voir comment ça marche',
    microcopy: '300 crédits offerts · En ligne en 2 minutes · Sans engagement',
    installNote: 'Une seule ligne à coller sur votre site. Rien d’autre à faire.',
    liveBadge: 'Réponse tirée de votre site',
    mockup: {
      title: 'Assistant',
      online: 'En ligne',
      welcome: 'Bonjour ! Comment puis-je vous aider ?',
      question: 'Vous livrez le samedi ?',
      answer: 'Oui. Nous livrons tous les samedis, pour toute commande passée avant 18 h.',
      sourceLabel: 'D’après votre page',
      sourceName: 'Livraison et retours',
      placeholder: 'Écrivez votre message…',
    },
  },

  /*
   * Preuve produit, a la place d'un mur de logos.
   *
   * Le bandeau de marques qui occupait cette place affichait des entreprises
   * inventees. Tant qu'il n'y a pas de clients citables, la seule preuve
   * honnete est le fonctionnement du produit lui-meme.
   */
  proof: {
    title: 'Votre site. Votre contenu. Vos réponses. Vos clients.',
    items: [
      {
        title: 'Il répond avec vos informations',
        body: 'Vos pages et vos documents, jamais des généralités trouvées ailleurs.',
      },
      {
        title: 'Il dit quand il ne sait pas',
        body: 'Aucun prix ni délai improvisé. Le doute vaut mieux qu’une erreur.',
      },
      {
        title: 'Votre contenu reste le vôtre',
        body: 'Ce que vous lui apprenez ne sert jamais à répondre pour une autre entreprise.',
      },
    ],
  },

  problem: {
    eyebrow: 'Le vrai coût',
    title: 'Chaque question sans réponse est un client qui peut vous échapper.',
    lead: "Votre site contient déjà les réponses. Vos visiteurs, eux, ne les trouvent pas — et personne ne vous prévient quand ils s'en vont.",
    items: [
      {
        step: '01',
        title: 'Ils partent',
        body: "Une question sans réponse, et l'onglet se ferme. Vous ne saurez jamais qu'ils étaient là.",
      },
      {
        step: '02',
        title: 'Ils attendent',
        body: 'Ils remplissent votre formulaire, puis attendent des heures. Souvent jusqu’au lendemain.',
      },
      {
        step: '03',
        title: 'Ils vont voir ailleurs',
        body: 'Pendant que vous êtes fermé, ils comparent déjà chez vos concurrents.',
      },
      {
        step: '04',
        title: 'Vous ne le saurez jamais',
        body: 'Aucun compteur ne mesure les visiteurs partis faute d’avoir trouvé leur réponse.',
      },
    ],
    /* Le trajet du visiteur perdu. Le trajet inverse — celui ou Deezy
       rattrape — appartient a la section « recovery » : le montrer deux fois
       affaiblirait les deux. */
    flow: {
      label: 'Aujourd’hui, sur votre site',
      steps: ['Un visiteur', 'Il a une question', 'Pas de réponse', 'Il s’en va'],
    },
    cta: 'Ne plus perdre ces visiteurs',
  },

  change: {
    eyebrow: 'Le changement',
    title: 'Et si votre site répondait à chaque visiteur, tout de suite ?',
    lead: "Deezy est un assistant qui connaît votre entreprise, parle la langue de vos clients, et ne s'arrête jamais.",
    items: [
      {
        title: 'Il connaît votre site',
        body: 'Donnez-lui votre adresse : il lit vos pages et en retient ce qui compte pour vos clients.',
      },
      {
        title: 'Il lit vos documents',
        body: 'Tarifs, catalogue, conditions — tout ce que votre site ne dit pas encore.',
      },
      {
        title: 'Il répond immédiatement',
        body: 'Pas de file d’attente, pas de formulaire, pas de « nous reviendrons vers vous ».',
      },
      {
        title: 'Il parle la langue du client',
        body: 'Une question posée en anglais reçoit une réponse en anglais. Sans réglage.',
      },
      {
        title: 'Il travaille la nuit',
        body: 'Le soir, le week-end, les jours fériés : c’est là que vos visiteurs hésitent et décident.',
      },
      {
        title: 'Il récupère les prospects',
        body: 'Quand il ne sait pas, il demande une adresse plutôt que de laisser partir.',
      },
      {
        title: 'Il montre ses sources',
        body: 'Chaque réponse renvoie à la page dont elle vient. Vérifiable en un clic.',
      },
    ],
  },

  /*
   * Le differenciateur, en un seul bloc.
   *
   * Le refus de repondre et la capture du prospect sont la meme scene vue de
   * deux cotes : separes en deux sections, ils se repetaient et se diluaient.
   * Reunis, ils forment l'argument le plus fort de la page.
   */
  recovery: {
    eyebrow: 'La différence',
    title: 'Une IA qui sait quand elle ne sait pas.',
    lead: "Deezy répond à partir de votre contenu. Il n'invente ni un prix, ni un délai, ni une condition de vente — parce que c'est vous qui devriez ensuite les assumer.",
    conversation: {
      question: 'Quel est le tarif du pack Pro ?',
      refusal: 'Je ne trouve pas cette information dans ce que j’ai lu de votre site.',
      invite: 'Laissez-moi votre e-mail, l’équipe vous répond directement.',
      placeholder: 'vous@exemple.com',
      send: 'Envoyer ma question',
      sent: 'Votre question est partie. Vous serez recontacté.',
    },
    funnelLabel: 'Ce qui se passe ensuite',
    funnel: {
      start: 'Un visiteur a une question',
      branchAnswer: {
        label: 'Deezy a la réponse',
        steps: ['Il répond tout de suite', 'Le visiteur poursuit sa visite'],
        outcome: 'Client rassuré',
      },
      branchLead: {
        label: 'Deezy ne sait pas',
        steps: ['Il demande l’adresse e-mail', 'Vous recevez la question et le contact'],
        outcome: 'Prospect récupéré',
      },
    },
    payoff:
      "Quand Deezy ne sait pas, vous ne perdez pas le visiteur : vous récupérez sa question et son adresse, au moment précis où son envie d'acheter est la plus forte.",
    cta: 'Récupérer mes prospects',
  },

  insight: {
    eyebrow: 'Ce que vous apprenez',
    title: 'Découvrez ce que vos clients veulent savoir.',
    lead: 'Chaque question restée sans réponse vous montre exactement ce qui manque à votre site.',
    listTitle: 'Ce que vos clients demandent',
    items: [
      { question: 'Quel est le tarif du pack Pro ?', count: '7×' },
      { question: 'Livrez-vous le samedi ?', count: '4×' },
      { question: 'Reprenez-vous l’ancien matériel ?', count: '2×' },
    ],
    payoff: 'Ajoutez l’information une fois. Deezy s’occupe du reste.',
    note: 'Deezy ne fait pas que répondre à vos clients. Il vous montre ce qui bloque vos ventes.',
  },

  beforeAfter: {
    eyebrow: 'La différence, en cinq secondes',
    title: 'Le même visiteur. Deux issues.',
    without: {
      label: 'Sans Deezy',
      turns: [
        { question: 'Vous livrez dans ma ville ?', answer: 'Contactez-nous' },
        { question: 'Combien coûte la livraison ?', answer: 'Contactez-nous' },
      ],
      outcome: 'Le visiteur s’en va.',
    },
    with: {
      label: 'Avec Deezy',
      turns: [
        {
          question: 'Vous livrez dans ma ville ?',
          answer: 'Oui, sous 24 à 48 h. La livraison est offerte dès 60 € d’achat.',
        },
        {
          question: 'Parfait, je voudrais commander.',
          answer: 'Je vous mets en relation tout de suite.',
        },
      ],
      sourceLabel: 'D’après votre page',
      sourceName: 'Livraison et retours',
      outcome: 'Le visiteur devient client.',
    },
  },

  why: {
    eyebrow: 'Pourquoi Deezy',
    title: 'Pas un chatbot de plus. Une façon de transformer votre trafic en clients.',
    lead: 'Quatre choses que la plupart des assistants ne font pas.',
    cards: [
      {
        title: 'Il répond avec votre entreprise',
        body: 'Deezy s’appuie sur votre site et vos documents, pas sur des connaissances générales.',
      },
      {
        title: 'Il ne devine jamais',
        body: 'Quand l’information manque, il le dit — au lieu d’inventer une réponse plausible.',
      },
      {
        title: 'Il rattrape les prospects perdus',
        body: 'Faute de réponse, il récupère l’adresse et la question du visiteur.',
      },
      {
        title: 'Il vous apprend vos manques',
        body: 'Vous voyez ce qu’on vous demande, et ce que votre site ne dit pas encore.',
      },
    ],
  },

  comparison: {
    eyebrow: 'Comparaison',
    title: 'Ce que font les autres solutions.',
    lead: "Vous en avez sans doute déjà essayé une. Voilà exactement où chacune s'arrête.",
    columns: [
      'Répond tout de suite',
      'Utilise votre contenu',
      'N’invente rien',
      'Récupère les prospects',
      'Apprend des questions',
    ],
    /* `partial` existe pour rester juste : un robot a scenarios utilise bien
       votre contenu, mais seulement celui que vous avez saisi a la main. Tout
       ramener a oui/non forcerait a mentir dans un sens ou dans l'autre. */
    rows: [
      {
        label: 'Le formulaire de contact',
        values: [false, false, true, true, false],
        note: 'Vous répondez demain. Il a commandé ailleurs ce soir.',
      },
      {
        label: 'La page questions-réponses',
        values: [true, true, true, false, false],
        note: 'Périmée dès votre premier changement de tarif.',
      },
      {
        label: 'Le robot à scénarios',
        values: [true, 'partial', true, true, false],
        note: 'Bloqué à la première question que vous n’aviez pas prévue.',
      },
      {
        label: 'Un assistant IA générique',
        values: [true, false, false, false, false],
        note: 'Invente un prix, et c’est vous qui l’assumez.',
      },
      {
        label: 'Deezy',
        values: [true, true, true, true, true],
        note: 'Connaît votre entreprise, montre ses sources, et le dit quand il ne sait pas.',
      },
    ],
    highlightRow: 4,
    legend: { yes: 'Oui', partial: 'En partie', no: 'Non' },
  },

  install: {
    eyebrow: 'Mise en route',
    title: 'De zéro à en ligne en 2 minutes.',
    lead: 'Rien à rédiger, rien à configurer, aucun développeur à mobiliser.',
    steps: [
      {
        step: '01',
        title: 'Donnez l’adresse de votre site',
        body: 'Deezy le parcourt et retient ce qui compte pour vos clients.',
      },
      {
        step: '02',
        title: 'Ajoutez vos documents',
        body: 'Tarifs, catalogue, conditions : tout ce que votre site ne dit pas encore.',
      },
      {
        step: '03',
        title: 'Collez une ligne de code',
        body: 'L’assistant apparaît sur votre site. Vos visiteurs peuvent lui parler.',
      },
    ],
    codeLabel: 'La ligne à coller, avant la balise de fermeture',
    cta: 'Essayer Deezy gratuitement',
  },

  platforms: {
    eyebrow: 'Compatibilité',
    title: 'Fonctionne avec le site que vous avez déjà.',
    lead: "WordPress, Shopify, Wix, Squarespace ou un site sur mesure : aucune extension à installer, aucun développeur à mobiliser.",
    hints: {
      WordPress: 'Thème ou extension',
      Shopify: 'Éditeur de thème',
      Wix: 'Code personnalisé',
      Squarespace: 'Injection de code',
      Webflow: 'Paramètres du projet',
      Framer: 'Code personnalisé',
      'Next.js': 'Balise script',
      HTML: 'Site sur mesure',
    } as Record<string, string>,
    fallback: 'Si vous savez ajouter une ligne de code, vous savez installer Deezy.',
  },

  benefits: {
    eyebrow: 'Ce que vous y gagnez',
    title: 'Votre site continue de travailler, même quand vous vous arrêtez.',
    items: [
      {
        title: 'Ouvert 24 h/24',
        body: 'Vos visiteurs du soir, du week-end et des jours fériés obtiennent une réponse.',
      },
      {
        title: 'Dans la langue du visiteur',
        body: 'Une question posée en anglais reçoit une réponse en anglais. Sans réglage de votre part.',
      },
      {
        title: 'Aux couleurs de votre marque',
        body: 'Son nom, son message d’accueil, sa couleur, sa position : vous choisissez tout.',
      },
      {
        title: 'Sans toucher à votre site',
        body: 'Il s’ajoute par-dessus votre design, et disparaît en un clic si vous le souhaitez.',
      },
      {
        title: 'Toutes les conversations',
        body: 'Vous savez ce qu’on vous demande, ce qu’on répond, et ce qui reste sans réponse.',
      },
      {
        title: 'Vos données restent les vôtres',
        body: 'Le contenu de votre entreprise ne sert jamais à répondre pour une autre.',
      },
    ],
  },

  /*
   * Chiffres du produit, jamais de moyennes clients.
   *
   * Tant qu'aucune donnee reelle n'est mesuree, la note du bas dit exactement
   * ce que valent ces nombres. Une page qui annonce elle-meme la limite de sa
   * preuve inspire plus confiance qu'une page qui laisse croire a des
   * resultats qu'elle n'a pas.
   */
  results: {
    eyebrow: 'Concrètement',
    title: 'Ce sur quoi vous pouvez compter dès le premier jour.',
    items: [
      { value: '24 h/24', label: 'Vos visiteurs obtiennent une réponse' },
      { value: '2 min', label: 'Pour être en ligne' },
      { value: '1 ligne', label: 'À coller sur votre site' },
      { value: '100 %', label: 'Des réponses tirées de votre contenu' },
    ],
    note: 'Ce sont des caractéristiques du produit, pas des moyennes clients. Nous publierons de vrais résultats le jour où nous en aurons.',
  },

  pricing: {
    eyebrow: 'Tarifs',
    title: 'Un prix, trois tailles.',
    lead: 'Chaque plan vous donne un nombre de crédits par mois. Sans engagement, résiliable à tout moment.',
    roi: 'Si Deezy vous fait récupérer un seul client, il est déjà rentabilisé.',
    /* Le credit est une unite maison : elle doit etre expliquee AVANT les
       montants, sinon le visiteur ne peut pas juger le prix. */
    creditTitle: 'Ce qu’est un crédit',
    creditItems: [
      '1 crédit par réponse envoyée à un visiteur',
      '1 crédit par page de votre site analysée',
      '2 crédits par document traité',
    ],
    startingCredits: '300 crédits offerts à la création du compte, sans engagement',
    popular: 'Le plus choisi',
    notIncluded: 'Non inclus',
    perMonth: '/mois',
    creditsSuffix: 'crédits par mois',
    billing: {
      monthly: 'Mensuel',
      annual: 'Annuel',
      save: '2 mois offerts',
      annualNote: 'soit {total} $ par an',
    },
    plans: [
      {
        name: 'Essentiel',
        monthly: 19,
        annual: 16,
        annualTotal: 190,
        credits: 1000,
        description: 'Pour un site, une activité.',
        inherits: '',
        features: [
          '1 000 crédits par mois',
          '1 assistant',
          'Jusqu’à 100 pages de votre site',
          'Récupération des e-mails de vos visiteurs',
          'Aux couleurs de votre marque',
        ],
        excluded: [
          'Plusieurs assistants',
          'Rapport des questions sans réponse',
          'Retrait de la mention Deezy',
          'Support prioritaire',
        ],
        cta: 'Commencer',
      },
      {
        name: 'Croissance',
        monthly: 39,
        annual: 33,
        annualTotal: 390,
        credits: 5000,
        description: 'Pour un site qui reçoit du monde tous les jours.',
        inherits: 'Tout de l’Essentiel, plus :',
        features: [
          '5 000 crédits par mois',
          '3 assistants',
          'Jusqu’à 500 pages et 100 documents',
          'Rapport des questions sans réponse',
          'Réponse du support sous 24 h',
        ],
        excluded: ['Retrait de la mention Deezy', 'Support prioritaire'],
        cta: 'Commencer',
      },
      {
        name: 'Entreprise',
        monthly: 79,
        annual: 66,
        annualTotal: 790,
        credits: 20000,
        description: 'Pour plusieurs sites ou plusieurs marques.',
        inherits: 'Tout de Croissance, plus :',
        features: [
          '20 000 crédits par mois',
          '10 assistants',
          'Jusqu’à 2 000 pages, documents illimités',
          'Sans mention Deezy',
          'Support prioritaire',
        ],
        // Rien a exclure : c'est precisement l'argument de ce palier.
        excluded: [] as string[],
        cta: 'Commencer',
      },
    ],
    custom: {
      label: 'Au-delà ?',
      description:
        'Gros volumes, plusieurs équipes, besoins particuliers : on construit l’offre avec vous.',
      cta: 'Nous écrire',
    },
    footnote:
      'Les crédits se renouvellent chaque mois et ne se reportent pas. À court de crédits, votre assistant continue de récupérer les e-mails de vos visiteurs.',
  },

  /*
   * FAQ organisee par objection d'achat, et non par theme.
   *
   * L'ordre suit celui dans lequel les doutes arrivent : d'abord « est-ce que
   * ca marche vraiment avec MON contenu », puis « est-ce que ca peut me faire
   * dire n'importe quoi », puis « est-ce que c'est difficile », enfin
   * « qu'est-ce que ca devient chez moi ».
   */
  faq: {
    eyebrow: 'Vos questions',
    title: 'Ce qu’on nous demande avant de se lancer',
    items: [
      {
        question: 'Deezy utilise-t-il vraiment le contenu de mon site ?',
        answer:
          "Oui, et uniquement lui. Deezy lit vos pages et vos documents, puis construit ses réponses à partir de ce qu'il y a trouvé. Chaque réponse renvoie à la page dont elle vient, pour que vous puissiez le vérifier.",
      },
      {
        question: 'Dois-je rédiger des questions-réponses à la main ?',
        answer:
          "Non, et c'est tout l'intérêt. L'adresse de votre site suffit. Vous pouvez ensuite ajouter vos documents pour ce que votre site ne dit pas encore, mais vous n'écrivez aucun scénario.",
      },
      {
        question: 'Que se passe-t-il quand Deezy ne connaît pas la réponse ?',
        answer:
          "Il le dit franchement, et propose au visiteur de laisser son e-mail. Vous recevez sa question et son adresse, au moment où son intention d'achat est la plus forte. La question apparaît aussi dans votre rapport des questions sans réponse.",
      },
      {
        question: 'Deezy peut-il inventer une information ?',
        answer:
          "Il est construit pour ne pas le faire : quand rien dans votre contenu ne répond, il refuse plutôt que de deviner. Un prix ou un délai imaginé vous engagerait auprès de votre client — nous préférons une réponse prudente.",
      },
      {
        question: 'Comment fonctionnent les crédits ?',
        answer:
          "Chaque plan vous donne un nombre de crédits par mois. Une réponse envoyée à un visiteur coûte 1 crédit, une page de votre site analysée 1 crédit, un document traité 2 crédits. Les crédits se renouvellent chaque mois et ne se reportent pas.",
      },
      {
        question: 'Que se passe-t-il quand je n’ai plus de crédits ?',
        answer:
          "Votre assistant ne répond plus, mais il ne disparaît pas de votre site : il continue de proposer à vos visiteurs de laisser leur e-mail. Vous continuez donc de récupérer des prospects, et vous voyez dans votre espace ce que vous auriez pu répondre.",
      },
      {
        question: 'Faut-il un développeur ?',
        answer:
          'Non. Si vous savez ajouter un code de suivi ou une ligne dans les réglages de votre site, vous savez installer Deezy. WordPress, Shopify, Wix, Squarespace et les autres sont couverts.',
      },
      {
        question: 'Combien de temps pour le mettre en place ?',
        answer:
          'Quelques minutes. Vous donnez votre adresse, vous attendez que votre site soit lu, vous collez une ligne de code. C’est en ligne.',
      },
      {
        question: 'Et quand je change mes tarifs ou mes horaires ?',
        answer:
          'Vous mettez votre site à jour comme d’habitude, puis vous lancez une nouvelle analyse depuis votre espace. Deezy relit ce qui a changé.',
      },
      {
        question: 'Est-ce que ça va ralentir mon site ?',
        answer:
          'Non. Le script se charge après votre page et n’intervient pas dans son affichage. L’assistant s’ajoute par-dessus votre site, sans toucher à votre design.',
      },
      {
        question: 'Puis-je personnaliser l’assistant ?',
        answer:
          'Oui : son nom, son message d’accueil, sa couleur principale et sa position sur la page. Il peut aussi être désactivé en un clic, sans retirer le script.',
      },
      {
        question: 'Puis-je lire les conversations de mes visiteurs ?',
        answer:
          'Oui. Tous les échanges sont consultables depuis votre espace, avec les questions restées sans réponse regroupées et classées par fréquence.',
      },
      {
        question: 'Deezy récupère-t-il vraiment des prospects ?',
        answer:
          'Quand il ne trouve pas la réponse, il propose au visiteur de laisser son adresse. Vous récupérez le contact accompagné de sa question. Cette collecte peut être désactivée si vous avez déjà un formulaire.',
      },
      {
        question: 'Mes informations peuvent-elles servir à un concurrent ?',
        answer:
          'Non. Le contenu de votre entreprise ne nourrit que votre propre assistant, et ne sert jamais à répondre pour quelqu’un d’autre.',
      },
    ],
  },

  finalCta: {
    title: 'Combien de clients ont quitté votre site sans obtenir de réponse ?',
    lead: 'Vous ne rattraperez pas les visiteurs d’hier. Mais vous pouvez répondre au prochain.',
    cta: 'Créer mon compte',
    microcopy: '300 crédits offerts · En ligne en quelques minutes · Sans engagement',
  },

  footer: {
    tagline:
      'Vos clients obtiennent une réponse tout de suite. Vous récupérez ceux qui seraient partis.',
    productTitle: 'Produit',
    howItWorks: 'Comment ça marche',
    accountTitle: 'Compte',
    login: 'Se connecter',
    signup: 'Créer un compte',
    rights: 'Tous droits réservés.',
  },

  auth: {
    loginTitle: 'Content de vous revoir',
    loginLead: 'Connectez-vous pour retrouver vos assistants.',
    signupTitle: 'Créez votre assistant',
    signupLead: '300 crédits offerts pour essayer. Sans engagement.',
    googleLogin: 'Se connecter avec Google',
    googleSignup: "S'inscrire avec Google",
    redirecting: 'Redirection…',
    or: 'ou',
    fullName: 'Nom et prénom',
    fullNamePlaceholder: 'Marie Dupont',
    email: 'E-mail',
    emailPlaceholder: 'vous@entreprise.com',
    password: 'Mot de passe',
    passwordHint: '8 caractères minimum.',
    submitLogin: 'Se connecter',
    submitSignup: 'Créer mon compte',
    pending: 'Un instant…',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
    hasAccount: 'Déjà inscrit ?',
    signIn: 'Se connecter',
  },

  dashboard: {
    nav: {
      section: 'Pilotage',
      overview: "Vue d'ensemble",
      bots: 'Mes assistants',
      newBot: 'Nouvel assistant',
      help: 'Aide',
      logout: 'Se déconnecter',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      account: 'Compte',
      signedInAs: 'Connecté en tant que',
      settings: 'Paramètres',
    },

    credits: {
      title: 'Crédits',
      action: 'Choisir un plan',
      of: 'sur',
      remaining: 'restants',
      renews: 'Renouvellement le',
      trialNote: 'Crédits de départ, non renouvelés.',
      exhausted: 'Crédits épuisés',
      /* Ce que le client doit lire en priorite quand il tombe a zero : le
         service n'est pas mort, il est degrade — et il rapporte encore. */
      exhaustedHint:
        'Votre assistant ne répond plus, mais il continue de récupérer les e-mails de vos visiteurs.',
      costTitle: 'Ce qui consomme un crédit',
      costs: [
        '1 crédit par réponse envoyée à un visiteur',
        '1 crédit par page de votre site analysée',
        '2 crédits par document traité',
      ],
      plans: {
        trial: 'Essai',
        essential: 'Essentiel',
        growth: 'Croissance',
        business: 'Entreprise',
      },
    },

    status: {
      draft: 'Jamais analysé',
      crawling: 'Analyse en cours',
      ready: 'Prêt',
      error: 'Échec de l’analyse',
    },

    account: {
      title: 'Paramètres',
      lead: 'Votre profil, la langue de l’interface et votre mot de passe.',

      profileTitle: 'Profil',
      profileLead: 'Le nom qui apparaît dans les messages que nous vous envoyons.',
      fullName: 'Nom et prénom',
      fullNamePlaceholder: 'Marie Dupont',
      email: 'Adresse e-mail',
      emailHint: 'L’adresse de connexion ne se change pas depuis cette page.',
      signedInWith: 'Connexion par',
      providerPassword: 'Mot de passe',
      providerGoogle: 'Google',
      save: 'Enregistrer',
      saving: 'Enregistrement…',
      saved: 'Modifications enregistrées.',

      languageTitle: 'Langue',
      languageLead: 'S’applique au tableau de bord et aux messages que nous vous envoyons.',

      securityTitle: 'Mot de passe',
      securityLead: 'Choisissez un nouveau mot de passe pour votre compte.',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      passwordHint: '8 caractères minimum.',
      updatePassword: 'Mettre à jour',
      updating: 'Mise à jour…',
      passwordSaved: 'Mot de passe mis à jour.',
      googleOnly:
        'Votre compte se connecte avec Google. Le mot de passe se change depuis votre compte Google, pas ici.',

      usageTitle: 'Consommation',
      usageLead: 'Vos crédits, et ce qui les consomme.',

      errorName: 'Indiquez votre nom et prénom.',
      errorPassword: 'Le mot de passe doit faire au moins 8 caractères.',
      errorMismatch: 'Les deux mots de passe ne correspondent pas.',
      errorCurrentPassword: 'Le mot de passe actuel est incorrect.',
      errorGeneric: 'La modification n’a pas pu être enregistrée. Réessayez.',
    },

    help: {
      title: 'Aide',
      lead: 'Comment démarrer, ce qu’on nous demande le plus, et comment nous joindre.',
      startTitle: 'Démarrer en trois étapes',
      faqTitle: 'Questions fréquentes',
      contactTitle: 'Votre question n’est pas là ?',
      contactLead:
        'Écrivez-nous en décrivant ce que vous cherchez à faire. Nous répondons sous 24 h ouvrées.',
      contactCta: 'Nous écrire',
      newBotCta: 'Créer un assistant',
      siteCta: 'Voir la présentation',
    },

    overview: {
      title: "Vue d'ensemble",
      lead: "L'état de vos assistants en un coup d'œil.",
      assistants: 'Assistants',
      pages: 'Pages indexées',
      conversations: 'Conversations',
      leads: 'Prospects',
      leadsPending: 'à rappeler',
      vsPrevious: 'par rapport aux 7 jours précédents',
      yourBots: 'Vos assistants',
      seeAll: 'Tout voir',
      recentLeadsTitle: 'Derniers prospects',
      recentLeadsLead: 'Les visiteurs qui attendent une réponse.',
      recentLeadsEmpty: 'Aucun prospect pour l’instant.',
      recentLeadsNew: 'Nouveau',
      emptyTitle: 'Créez votre premier assistant',
      emptyBody:
        "Donnez-nous l'adresse de votre site. Nous lisons vos pages et votre assistant est prêt en quelques minutes.",
      emptyCta: 'Créer un assistant',
    },

    chart: {
      title: 'Activité',
      rangeLabel: 'Période affichée',
      range7: '7 j',
      range30: '30 j',
      range90: '90 j',
      empty: 'Aucune conversation sur la période.',
      totalOne: 'conversation au total.',
      totalMany: 'conversations au total.',
      conversations: 'Conversations',
      messages: 'Messages',
      showTable: 'Voir le tableau',
      hideTable: 'Masquer le tableau',
      day: 'Jour',
      aria: 'Conversations et messages par jour',
    },

    botCard: {
      neverAnalysed: 'Jamais analysé',
      analysedOn: 'Analysé le',
    },

    botsList: {
      title: 'Mes assistants',
      lead: 'Un assistant par site web.',
      emptyTitle: 'Aucun assistant pour l’instant',
    },

    newBot: {
      back: 'Mes assistants',
      title: 'Créer un assistant',
      lead: 'Deux informations suffisent. Le reste est automatique.',
      nameLabel: "Nom de l'assistant",
      namePlaceholder: 'Assistant de mon entreprise',
      nameHint:
        'Ce nom apparaît en haut de la fenêtre de discussion, sur votre site.',
      urlLabel: 'Adresse de votre site',
      urlPlaceholder: 'monentreprise.com',
      urlHint:
        "Nous explorerons ce site et ses pages internes. Aucun autre domaine n'est visité.",
      submit: 'Créer mon assistant',
      submitting: 'Création…',
      steps: [
        'Nous explorons votre site et en extrayons le contenu utile.',
        'Vous testez votre assistant directement depuis le tableau de bord.',
        'Vous collez une ligne de code sur votre site. C’est en ligne.',
      ],
    },

    botPage: {
      back: 'Mes assistants',
      deactivated: 'Désactivé',
      pages: 'Pages indexées',
      sections: 'Sections',
      conversations: 'Conversations',
      leadsTitle: 'Prospects',
      leadsDesc: 'Visiteurs à rappeler',
      gapsTitle: 'Questions sans réponse',
      gapsDesc: 'Ce qui manque sur votre site',
      conversationsDesc: 'Historique des échanges',
    },

    documents: {
      title: 'Vos documents',
      lead: "Tout ce que votre site ne dit pas : tarifs, catalogue, conditions. L'assistant s'en servira pour répondre.",
      drop: 'Glissez vos fichiers ici',
      browse: 'ou parcourez votre ordinateur',
      accepted: 'PDF, Word ou texte — 10 Mo maximum par fichier',
      uploading: 'Envoi…',
      reading: 'Lecture du document…',
      empty: 'Aucun document pour l’instant.',
      remove: 'Retirer ce document',
      truncated: 'Document très long : seul le début a été retenu.',
      addedOn: 'Ajouté le',
      errorTooLarge: 'Fichier trop volumineux (10 Mo maximum).',
      errorFormat: 'Format non pris en charge. PDF, Word ou texte uniquement.',
    },

    knowledge: {
      title: 'Base de connaissances',
      never: "Ce site n'a pas encore été analysé.",
      lastSync: 'Dernière analyse le',
      analyse: 'Lancer l’analyse',
      sync: 'Synchroniser maintenant',
      running: 'Analyse en cours…',
      hint: "L'analyse prend généralement une à deux minutes. Gardez cet onglet ouvert pendant ce temps.",
      pagesDoneOne: 'page traitée',
      pagesDoneMany: 'pages traitées',
      sections: 'sections',
      phases: {
        pending: 'Préparation…',
        crawling: 'Exploration de votre site…',
        embedding: 'Création de la base de connaissances…',
        done: 'Terminé',
        error: 'Erreur',
      },
    },

    test: {
      title: 'Tester votre assistant',
      lead: 'Posez une question comme le ferait un visiteur de votre site.',
      suggestions: [
        'Quels sont vos services ?',
        'Comment vous contacter ?',
        'Quels sont vos tarifs ?',
      ],
      placeholder: 'Quels sont vos services ?',
      send: 'Envoyer',
    },

    install: {
      title: 'Installation',
      lead: "Choisissez votre technologie, copiez le code, collez-le sur votre site. L'assistant apparaît automatiquement.",
      copy: 'Copier',
      copied: 'Copié',
    },

    settings: {
      activeTitle: 'Assistant actif',
      inactiveTitle: 'Assistant désactivé',
      activeBody: 'Il répond aux visiteurs de votre site.',
      inactiveBody:
        "Le widget n'apparaît plus sur votre site. Inutile de retirer le script : il suffira de réactiver ici.",
      title: 'Personnalisation',
      lead: "L'aperçu se met à jour pendant que vous tapez.",
      nameLabel: "Nom de l'assistant",
      welcomeLabel: "Message d'accueil",
      chars: 'caractères',
      colorLabel: 'Couleur principale',
      positionLabel: 'Position sur votre site',
      bottomLeft: 'En bas à gauche',
      bottomRight: 'En bas à droite',
      save: 'Enregistrer',
      saving: 'Enregistrement…',
      saved: 'Enregistré',
      preview: 'Aperçu',
      previewPlaceholder: 'Votre message d’accueil apparaîtra ici.',
      leadCaptureTitle: 'Récupérer les e-mails sur question sans réponse',
      leadCaptureBody:
        "Quand l'assistant ne sait pas, il propose au visiteur de laisser son adresse plutôt que de le laisser partir.",
      dangerTitle: 'Supprimer cet assistant',
      dangerBody:
        "Les pages indexées, les sections et l'historique des conversations seront supprimés définitivement. Cette action est irréversible.",
      delete: 'Supprimer',
      confirmPrefix: 'Supprimer',
      confirmSuffix: 'et toutes ses données ?',
      confirmYes: 'Oui, supprimer',
      cancel: 'Annuler',
    },

    conversations: {
      title: 'Conversations',
      lead: 'Les 50 derniers échanges avec vos visiteurs.',
      emptyTitle: 'Aucune conversation pour l’instant',
      emptyBody:
        "Elles apparaîtront ici dès que des visiteurs échangeront avec votre assistant sur votre site.",
      messageOne: 'message',
      messageMany: 'messages',
    },

    leads: {
      title: 'Prospects',
      lead: "Les visiteurs qui ont laissé leur e-mail parce que l'assistant n'avait pas la réponse.",
      pending: 'en attente.',
      disabled:
        'La collecte est désactivée pour cet assistant. Les nouveaux visiteurs ne verront plus le formulaire de rappel.',
      emptyTitle: 'Aucun prospect pour l’instant',
      emptyBody:
        "Dès qu'un visiteur posera une question sans réponse et laissera son e-mail, il apparaîtra ici avec sa question.",
      handled: 'Traité',
      reopen: 'Rouvrir',
      remove: 'Supprimer ce prospect',
      mailSubject: 'Votre question sur notre site',
      mailGreeting: 'Bonjour,',
      mailIntro: 'Vous nous avez demandé :',
    },

    gaps: {
      title: 'Questions sans réponse',
      lead: 'Ce que vos visiteurs demandent et que votre site ne dit pas. Les plus fréquentes en premier — ce sont celles qui méritent une page, ou un paragraphe de plus.',
      emptyTitle: 'Votre site répond à tout',
      emptyBody:
        "Aucune question n'est restée sans réponse sur les 200 dernières conversations. C'est bon signe.",
      lastTime: 'Dernière fois le',
      cta: "Ajoutez ces informations sur votre site, puis relancez une synchronisation : l'assistant les connaîtra.",
      ctaAction: 'Synchroniser',
    },
  },
};

/**
 * Le francais fait office de schema : la version anglaise est typee contre lui,
 * donc oublier une cle devient une erreur de compilation plutot qu'un trou
 * decouvert en production.
 */
export type Dictionary = typeof fr;
