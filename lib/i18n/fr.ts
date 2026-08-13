/** Dictionnaire de reference. Toute nouvelle chaine part d'ici. */
export const fr = {
  meta: {
    title: 'Wizetalk — le chatbot IA qui connaît votre site par cœur',
    description:
      "Wizetalk lit votre site web et répond à vos visiteurs 24 h/24 avec vos vraies informations. Une ligne de code à coller, aucune FAQ à rédiger.",
  },

  nav: {
    problem: 'Le problème',
    solution: 'La solution',
    pricing: 'Tarifs',
    faq: 'FAQ',
    login: 'Se connecter',
    signup: 'Commencer gratuitement',
    dashboard: 'Tableau de bord',
  },

  hero: {
    badge: 'Il ne répond que ce que dit votre site',
    titleStart: 'Le chatbot IA qui connaît',
    titleHighlight: 'votre site par cœur',
    subtitleStart: 'Wizetalk lit vos pages et répond à vos visiteurs 24 h/24, avec ',
    subtitleStrong: 'vos vraies informations',
    subtitleEnd: ". Vous collez une ligne de code, c'est tout.",
    ctaPrimary: 'Créer mon assistant',
    ctaSecondary: 'Voir comment ça marche',
    proofs: ['Aucune FAQ à rédiger', 'Aucun scénario', 'Gratuit pour commencer'],
    liveBadge: 'Réponse tirée de votre site',
    mockup: {
      title: 'Assistant',
      online: 'En ligne',
      welcome: 'Bonjour ! Comment puis-je vous aider ?',
      question: 'Vous livrez en Belgique ?',
      answer:
        "Oui, nous livrons en Belgique sous 48 h. La livraison est offerte dès 60 € d'achat.",
      placeholder: 'Écrivez votre message…',
    },
  },

  logos: {
    label: 'Rejoignez les entreprises qui font parler leur site',
  },

  problem: {
    eyebrow: 'Le problème',
    title: 'Ça vous parle ?',
    lead: "Votre site est en ligne, il est soigné, il contient tout ce qu'il faut. Et pourtant les mêmes questions continuent d'arriver dans votre boîte mail.",
    items: [
      {
        title: 'On ne trouve pas la réponse',
        body: 'Vos horaires, vos délais, votre zone de livraison : tout est écrit quelque part sur votre site. Encore faut-il tomber sur la bonne page.',
      },
      {
        title: 'Le formulaire reste vide',
        body: "Remplir trois champs et attendre une réponse le lendemain demande un effort. Fermer l'onglet n'en demande aucun.",
      },
      {
        title: 'Vous répondez aux mêmes questions',
        body: '« Vous livrez en Belgique ? » pour la quinzième fois cette semaine. Du temps que vous ne passez pas à vendre.',
      },
      {
        title: 'Le chatbot devient un second métier',
        body: 'Rédiger des scénarios, maintenir une FAQ, tout reprendre à chaque changement de tarif. Le chantier ne finit jamais.',
      },
    ],
  },

  frustration: {
    eyebrow: 'La frustration',
    title: 'Le visiteur, lui, ne repasse pas.',
    lead: "Vous avez déjà essayé de régler le problème. Voilà ce qui se passe vraiment à chaque fois.",
    attempts: [
      {
        label: 'Le formulaire de contact',
        reality: 'Vous répondez le lendemain. Il a commandé ailleurs le soir même.',
      },
      {
        label: 'Le chatbot à scénarios',
        reality:
          "Il ne comprend que ce que vous aviez prévu. La première question inattendue le bloque.",
      },
      {
        label: 'La page FAQ',
        reality:
          'Elle vieillit dès que vous changez un tarif. Et personne ne la lit jusqu’au bout.',
      },
      {
        label: 'Un chatbot IA générique',
        reality:
          "Il invente un délai, un prix, une garantie. Et c'est vous qui devrez l'assumer.",
      },
    ],
    pivotStart: "Le problème n'est pas le manque d'information.",
    pivotEnd: "C'est qu'elle n'arrive jamais au bon moment.",
  },

  solution: {
    eyebrow: 'La solution',
    title: 'Une ligne. Deux minutes. Terminé.',
    lead: 'Vous ne rédigez rien, vous ne configurez rien. Vous donnez une adresse, nous faisons le reste.',
    steps: [
      {
        title: 'Donnez votre adresse',
        body: 'Le nom de votre site suffit. Aucun fichier à téléverser, aucun contenu à préparer.',
      },
      {
        title: 'Nous lisons votre site',
        body: 'Nous parcourons vos pages, gardons le contenu utile et écartons menus, bandeaux et pieds de page.',
      },
      {
        title: 'Vous collez une ligne',
        body: "Le script se glisse avant la fermeture du corps de page. L'assistant apparaît immédiatement.",
      },
    ],
    analysis: ['24 pages trouvées', '18 pages pertinentes', '342 sections extraites'],
    dashboard: {
      status: 'Prêt',
      botName: 'Assistant de mon entreprise',
      stats: [
        { value: '18', label: 'pages indexées' },
        { value: '342', label: 'sections' },
        { value: '57', label: 'conversations' },
      ],
      recentTitle: 'Dernières questions de vos visiteurs',
      recent: [
        'Vous livrez en Belgique ?',
        'Quels sont vos horaires le samedi ?',
        'Proposez-vous une garantie ?',
      ],
      answered: 'répondu',
      caption: 'Vous découvrez ce que vos visiteurs cherchent vraiment.',
    },
  },

  platforms: {
    eyebrow: 'Compatibilité',
    title: 'Code ou no-code, ça marche pareil.',
    leadStart: 'Si vous pouvez coller une ligne avant la balise ',
    leadEnd: ", Wizetalk fonctionne. Aucune extension à installer, aucun accès à votre code source.",
    hints: {
      WordPress: 'Thème ou extension',
      Shopify: 'theme.liquid',
      Wix: 'Code personnalisé',
      Squarespace: 'Injection de code',
      Webflow: 'Paramètres du projet',
      Framer: 'Balise personnalisée',
      'Next.js': 'Composant Script',
      HTML: 'Avant </body>',
    } as Record<string, string>,
    fallback:
      "Votre plateforme n'est pas listée ? Elle fonctionne probablement quand même — le script est du HTML standard.",
  },

  features: {
    eyebrow: 'Ce qui compte vraiment',
    title: 'Un assistant à qui vous pouvez confier vos clients.',
    items: [
      {
        title: 'Il ne raconte rien',
        body: "Si la réponse n'est pas sur votre site, l'assistant le dit et renvoie vers vous. Il n'improvise jamais un prix ni un délai.",
      },
      {
        title: 'Chaque réponse est sourcée',
        body: 'La page qui a servi à répondre est citée. Vos visiteurs peuvent vérifier — vous aussi.',
      },
      {
        title: 'Il suit votre site',
        body: 'Une synchronisation relit vos pages. Seules celles qui ont changé sont retraitées.',
      },
      {
        title: 'Il respecte votre design',
        body: "L'assistant vit dans un cadre isolé : aucun style ne fuit dans un sens ni dans l'autre.",
      },
      {
        title: 'Vous lisez les conversations',
        body: 'Chaque échange est consultable. Vous découvrez ce que vos visiteurs cherchent vraiment.',
      },
      {
        title: 'Vos données restent les vôtres',
        body: "Chaque assistant est cloisonné. Le contenu d'un site ne peut jamais alimenter celui d'un autre.",
      },
    ],
  },

  pricing: {
    eyebrow: 'Tarifs',
    title: 'Commencez gratuitement, payez quand ça marche.',
    lead: "Pas d'engagement, résiliable à tout moment.",
    popular: 'Le plus choisi',
    perMonth: '/mois',
    plans: [
      {
        name: 'Découverte',
        price: '0 €',
        description: 'Pour essayer sur un premier site.',
        features: [
          '1 assistant',
          '50 pages analysées',
          '100 messages par mois',
          'Widget personnalisable',
        ],
        cta: 'Commencer gratuitement',
      },
      {
        name: 'Pro',
        price: '29 €',
        description: 'Pour un site d’entreprise actif.',
        features: [
          '3 assistants',
          '300 pages analysées',
          '2 000 messages par mois',
          'Historique des conversations',
          'Synchronisation illimitée',
        ],
        cta: 'Choisir Pro',
      },
      {
        name: 'Business',
        price: '79 €',
        description: 'Pour plusieurs sites ou marques.',
        features: [
          '10 assistants',
          '1 000 pages analysées',
          '10 000 messages par mois',
          'Retrait de la mention Wizetalk',
          'Support prioritaire',
        ],
        cta: 'Choisir Business',
      },
      {
        name: 'Sur mesure',
        price: 'Nous consulter',
        description: 'Volumes importants, besoins spécifiques.',
        features: [
          'Assistants illimités',
          'Volume négocié',
          'Accompagnement à la mise en place',
        ],
        cta: 'Nous écrire',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Questions fréquentes',
    items: [
      {
        question: 'Faut-il préparer une FAQ ou des documents ?',
        answer:
          "Non. L'adresse de votre site suffit. Nous lisons vos pages et en tirons directement les réponses.",
      },
      {
        question: "Que se passe-t-il si l'assistant ne connaît pas la réponse ?",
        answer:
          "Il le dit et invite le visiteur à vous contacter. Nous préférons une réponse prudente à une réponse inventée : un prix ou un délai imaginé vous engagerait auprès de votre client.",
      },
      {
        question: 'Combien de temps prend la mise en place ?',
        answer:
          "L'analyse d'un site vitrine prend quelques minutes. L'installation elle-même se résume à coller une ligne de code sur votre site.",
      },
      {
        question: 'Faut-il des compétences techniques ?',
        answer:
          "Savoir coller une ligne avant la balise </body> suffit. C'est possible depuis WordPress, Shopify, Webflow, Wix, Squarespace ou n'importe quel site sur mesure.",
      },
      {
        question: 'Et quand mon site change ?',
        answer:
          "Vous lancez une synchronisation depuis votre tableau de bord. Seules les pages modifiées sont retraitées, le reste est conservé.",
      },
      {
        question: 'Le widget va-t-il abîmer le design de mon site ?',
        answer:
          "Non. L'assistant vit dans un cadre isolé : aucun de vos styles ne l'atteint, et aucun des siens ne s'échappe.",
      },
      {
        question: 'Mes données peuvent-elles servir à un autre client ?',
        answer:
          "Non. Chaque assistant est cloisonné et ne peut interroger que le contenu du site auquel il est rattaché.",
      },
    ],
  },

  finalCta: {
    titleStart: 'Votre site sait déjà répondre.',
    titleHighlight: 'Faites-le parler.',
    lead: 'Créez votre assistant en quelques minutes. Aucune carte bancaire, aucune FAQ à rédiger.',
    primary: 'Créer mon assistant',
    secondary: "J'ai déjà un compte",
  },

  footer: {
    tagline: 'Donnez-nous votre site, nous créons votre assistant IA. Une ligne de code.',
    productTitle: 'Produit',
    howItWorks: 'Fonctionnement',
    accountTitle: 'Compte',
    login: 'Se connecter',
    signup: 'Créer un compte',
    rights: 'Tous droits réservés.',
  },

  auth: {
    loginTitle: 'Content de vous revoir',
    loginLead: 'Connectez-vous pour retrouver vos assistants.',
    signupTitle: 'Créez votre assistant',
    signupLead: 'Gratuit pour commencer, aucune carte bancaire.',
    googleLogin: 'Se connecter avec Google',
    googleSignup: "S'inscrire avec Google",
    redirecting: 'Redirection…',
    or: 'ou',
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
      usageTitle: 'Messages ce mois-ci',
      usageAction: 'Augmenter',
      usageOf: 'sur',
    },

    status: {
      draft: 'Jamais analysé',
      crawling: 'Analyse en cours',
      ready: 'Prêt',
      error: 'Échec de l’analyse',
    },

    overview: {
      title: "Vue d'ensemble",
      lead: "L'état de vos assistants en un coup d'œil.",
      assistants: 'Assistants',
      pages: 'Pages indexées',
      conversations: 'Conversations',
      yourBots: 'Vos assistants',
      seeAll: 'Tout voir',
      emptyTitle: 'Créez votre premier assistant',
      emptyBody:
        "Donnez-nous l'adresse de votre site. Nous lisons vos pages et votre assistant est prêt en quelques minutes.",
      emptyCta: 'Créer un assistant',
    },

    chart: {
      title: 'Activité des 30 derniers jours',
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
