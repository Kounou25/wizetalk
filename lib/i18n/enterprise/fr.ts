/**
 * Offre Enterprise — dictionnaire de reference.
 *
 * SEPARE DU DICTIONNAIRE PRINCIPAL, ET POURQUOI
 *
 * fr.ts depassait deja mille lignes. Y verser une page de dix-huit sections
 * l'aurait rendu illisible, alors que les deux contenus ne bougent jamais
 * ensemble : la landing suit le produit en libre-service, celle-ci suit un
 * discours commercial. Le type continue de decouler du francais, donc rien
 * n'est perdu — l'anglais reste verifie contre lui a la compilation.
 *
 * REGLE DE REDACTION, VALABLE POUR TOUTE MODIFICATION
 *
 * Cette page s'adresse a des organisations qui verifient. On n'y ecrit donc
 * que ce que le produit fait AUJOURD'HUI, et ce qui n'est pas livre est
 * annonce comme se decidant pendant l'implementation — jamais comme une case
 * cochee. A ce jour :
 *
 *   livre        ingestion site + documents, reponses sourcees, refus quand
 *                l'information manque, capture de contacts, rapport des
 *                questions sans reponse, multilingue, plusieurs assistants
 *   non livre    ton parametrable, sujets autorises/exclus, regles
 *                d'escalade, transfert vers un agent en direct, API publique,
 *                webhooks, connecteurs CRM, comptes multi-equipes
 *
 * Aucune certification n'est revendiquee. Aucun gain chiffre n'est avance.
 * Les valeurs du tableau de bord sont des donnees de demonstration, et la page
 * le dit a l'ecran.
 */

export const enterpriseFr = {
  meta: {
    title: 'Deezy Enterprise — assistant IA de relation client pour les organisations',
    description:
      'Deezy Enterprise donne à vos visiteurs une réponse immédiate, tirée des informations officielles de votre organisation, 24 h/24 et dans leur langue. Banques, assurances, télécoms, universités, santé.',
  },

  nav: {
    label: 'Enterprise',
    solution: 'La solution',
    useCases: 'Cas d’usage',
    security: 'Sécurité',
    pricing: 'Tarifs',
    faq: 'Questions',
    cta: 'Demander une démo',
  },

  hero: {
    badge: 'Deezy Enterprise',
    title: 'L’assistant IA de relation client de votre organisation.',
    subtitle:
      'Donnez à vos clients une réponse immédiate, tirée des informations officielles de votre organisation — 24 h/24, dans leur langue, à chaque visite.',
    ctaPrimary: 'Demander une démo',
    ctaSecondary: 'Parler à notre équipe',
    reassurance: 'Construit autour de vos connaissances. Piloté par vos équipes.',
    mockup: {
      title: 'Assistant',
      online: 'En ligne',
      question: 'Quels documents faut-il pour ouvrir un compte ?',
      answer:
        'Une pièce d’identité en cours de validité, un justificatif de domicile de moins de trois mois et un justificatif de revenus. Le dossier se dépose en agence ou en ligne.',
      sourceLabel: 'D’après votre page',
      sourceName: 'Ouverture de compte — pièces à fournir',
      placeholder: 'Écrivez votre message…',
      languages: 'FR · EN · AR',
    },
  },

  /* Bandeau de positionnement, juste sous le heros : il repond a « c'est quoi,
     au juste » avant que le visiteur ne commence a faire defiler. */
  positioning: {
    title: 'Une assistance client propulsée par l’IA, pas un chatbot de plus.',
    items: [
      {
        title: 'Vos informations, pas des généralités',
        body: 'L’assistant répond à partir de vos pages, vos documents et vos contenus approuvés.',
      },
      {
        title: 'Il se tait quand il ne sait pas',
        body: 'Sans information fiable, il le dit et oriente — plutôt que d’improviser une réponse.',
      },
      {
        title: 'Vos équipes gardent la main',
        body: 'Vous décidez des sources, du périmètre, et du moment où un humain reprend la conversation.',
      },
    ],
  },

  problem: {
    eyebrow: 'Le point de départ',
    title: 'Vos clients ont déjà des questions.',
    lead: 'Les réponses existent sur votre site. Le visiteur, lui, doit les chercher — et il ne cherche pas longtemps.',
    steps: [
      'Parcourir plusieurs pages',
      'Ouvrir des documents',
      'Fouiller la FAQ',
      'Contacter le support',
      'Attendre une réponse',
    ],
    costsTitle: 'Ce que cela produit',
    costs: [
      {
        title: 'De la frustration',
        body: 'L’information existe, mais elle reste introuvable.',
      },
      {
        title: 'Des abandons',
        body: 'Le visiteur part, et personne ne sait qu’il est parti.',
      },
      {
        title: 'Des demandes répétitives',
        body: 'Les mêmes questions simples occupent vos équipes toute la journée.',
      },
      {
        title: 'Des opportunités perdues',
        body: 'Un prospect sans réponse ne revient pas la demander ailleurs chez vous.',
      },
    ],
    payoff:
      'Deezy donne au visiteur l’information dont il a besoin, sans lui demander de la chercher.',
    /* Décrit une scène, jamais une identité — voir public/enterprise/SOURCES.md. */
    photoAlt: 'Une personne consulte son téléphone, à l’extérieur d’un bâtiment',
  },

  solution: {
    eyebrow: 'Le fonctionnement',
    title: 'Un assistant. Les connaissances de votre organisation.',
    lead: 'Trois étapes, et aucune base de connaissances à rédiger de zéro : Deezy part de ce que vous publiez déjà.',
    steps: [
      {
        index: '01',
        title: 'Vous connectez vos connaissances',
        body: 'Site web, documentation, PDF, FAQ, fiches produits, procédures, contenus approuvés.',
      },
      {
        index: '02',
        title: 'Deezy apprend vos informations',
        body: 'Les sources fournies sont analysées et indexées pour former la base de connaissances propre à votre organisation.',
      },
      {
        index: '03',
        title: 'Vos visiteurs obtiennent une réponse immédiate',
        body: 'La question est posée directement sur votre site, et la réponse arrive dans la seconde, avec sa source.',
      },
    ],
    flow: {
      sourceTitle: 'Vos sources',
      sourceItems: ['Site web', 'Documents', 'FAQ', 'Procédures'],
      engineTitle: 'Deezy',
      engineBody: 'Cherche dans vos contenus, puis rédige la réponse',
      visitorTitle: 'Votre visiteur',
      visitorBody: 'Une réponse immédiate, avec sa source',
    },
  },

  grounded: {
    eyebrow: 'Fiabilité',
    title: 'Des réponses ancrées dans les connaissances de votre organisation.',
    lead: 'Deezy est conçu pour répondre à partir des informations que vous lui fournissez, et pour reconnaître les limites de ce qu’il sait.',
    points: [
      {
        title: 'Des sources que vous contrôlez',
        body: 'Vous choisissez ce qui entre dans la base : pages, documents, contenus approuvés.',
      },
      {
        title: 'Des connaissances actualisables',
        body: 'Une page corrigée, un document remplacé : la resynchronisation met la réponse à jour.',
      },
      {
        title: 'La source affichée avec la réponse',
        body: 'Le visiteur voit d’où vient l’information, et peut ouvrir la page d’origine.',
      },
      {
        title: 'Le droit de ne pas répondre',
        body: 'Quand aucun contenu pertinent ne ressort, l’assistant le dit et oriente vers le bon interlocuteur.',
      },
    ],
    note: 'Nous n’annonçons ni « zéro hallucination » ni exactitude garantie : aucune IA ne peut le promettre honnêtement. Ce que nous concevons, c’est un assistant aligné sur vos sources approuvées, qui préfère se taire plutôt que d’inventer.',
  },

  control: {
    eyebrow: 'Gouvernance',
    title: 'De l’assistance IA, sans renoncer au contrôle.',
    lead: 'Votre organisation définit ce que Deezy sait, comment il répond, et quand la conversation doit passer à un humain.',
    nowTitle: 'Ce que vos équipes règlent depuis l’interface',
    now: [
      'Les sources de connaissance',
      'Les contenus indexés et leur mise à jour',
      'Le message d’accueil',
      'Les domaines autorisés à afficher l’assistant',
      'La collecte des coordonnées et ses alertes',
      'L’activation ou la mise en pause de l’assistant',
    ],
    setupTitle: 'Ce qui se définit avec nous pendant l’implémentation',
    setup: [
      'Le ton et la formulation des réponses',
      'Les sujets autorisés et les sujets exclus',
      'Les règles d’escalade',
      'Le passage vers un canal humain',
    ],
    setupNote:
      'Ces réglages sont établis lors du cadrage, puis appliqués à votre déploiement. Nous préférons l’annoncer ainsi plutôt que de laisser croire à une console en libre-service qui n’existe pas encore.',
  },

  handoff: {
    eyebrow: 'Relais humain',
    title: 'L’IA quand c’est possible. L’humain quand il le faut.',
    lead: 'Un assistant qui tente de tout traiter finit par mal traiter l’essentiel. Deezy est conçu pour reconnaître ce qui le dépasse.',
    simpleLabel: 'Question simple',
    simpleSteps: [
      'Le visiteur pose sa question',
      'Deezy répond, avec sa source',
      'Le visiteur poursuit sa visite',
    ],
    complexLabel: 'Demande complexe',
    complexSteps: [
      'Le visiteur expose sa situation',
      'Deezy reconnaît la limite et propose un contact',
      'Vos équipes sont alertées et reprennent la main',
    ],
    points: [
      {
        title: 'Orienter',
        body: 'Vers le bon service, plutôt qu’une réponse approximative.',
      },
      {
        title: 'Proposer un contact',
        body: 'Au moment précis où l’intention du visiteur est la plus forte.',
      },
      {
        title: 'Collecter les coordonnées',
        body: 'Avec la question restée sans réponse, pour un rappel utile.',
      },
      {
        title: 'Transférer',
        body: 'Vers un canal humain, selon les intégrations mises en place.',
      },
    ],
    note: 'La collecte des coordonnées et l’alerte à vos équipes fonctionnent aujourd’hui. Le transfert vers un agent en direct dépend des outils de votre organisation, et se traite pendant l’implémentation.',

    /* La question et la réponse affichées dans la maquette du chemin simple :
       volontairement banales, ce sont celles qui occupent le plus les équipes. */
    simplePreview: {
      question: 'Vous êtes ouverts le samedi ?',
      answer: 'Oui, de 9 h à 13 h dans toutes nos agences.',
      sourceLabel: 'D’après votre page « Horaires »',
    },

    /* Textes alternatifs : ils décrivent une scène, jamais une identité. Voir
       public/enterprise/SOURCES.md — ces visages illustrent les équipes du
       CLIENT, et ne peuvent ni être nommés ni se voir prêter une citation. */
    photoAlt:
      'Deux conseillers équipés d’un casque, en conversation depuis leur bureau',
    teamLabel: 'Votre équipe prend le relais',
    agentAlt: 'Portrait d’un conseiller au support',
  },

  analytics: {
    eyebrow: 'Analyse',
    title: 'Transformez les questions de vos clients en information utile.',
    lead: 'Chaque conversation dit quelque chose de votre offre, de vos contenus et de vos clients. Encore faut-il les lire.',
    items: [
      'Les questions les plus fréquentes',
      'Les sujets les plus recherchés',
      'Les questions restées sans réponse',
      'Les informations difficiles à trouver sur votre site',
      'Les besoins qui émergent',
      'Les opportunités commerciales',
      'La performance de l’assistant',
    ],
    payoff:
      'Chaque question sans réponse est une occasion d’améliorer l’expérience de vos clients.',
    dashboard: {
      title: 'Vue d’ensemble',
      demoBadge: 'Données de démonstration',
      period: '30 derniers jours',
      metrics: [
        { label: 'Conversations', value: '12 480' },
        { label: 'Taux de réponse', value: '87 %' },
        { label: 'Questions sans réponse', value: '214' },
        { label: 'Contacts collectés', value: '1 260' },
      ],
      topTitle: 'Questions les plus posées',
      top: [
        { question: 'Quels documents pour ouvrir un compte ?', count: '1 204' },
        { question: 'Quels sont les frais de tenue de compte ?', count: '948' },
        { question: 'Où se trouve l’agence la plus proche ?', count: '731' },
        { question: 'Comment refaire une carte perdue ?', count: '612' },
      ],
      caption:
        'Illustration de l’interface. Ces valeurs sont fictives et ne représentent la performance d’aucun client.',
    },
  },

  multilingual: {
    eyebrow: 'Multilingue',
    title: 'Servez vos clients dans leur langue.',
    lead: 'Deezy répond dans la langue employée par le visiteur, à partir de la même base de connaissances — sans dupliquer vos contenus.',
    payoff: 'Une seule base de connaissances. Une expérience client multilingue.',
    audienceTitle: 'Particulièrement utile pour',
    audience: [
      'Les banques internationales',
      'Les opérateurs télécoms',
      'L’hôtellerie',
      'Les universités',
      'Les organisations présentes dans plusieurs pays',
    ],
    note: 'La précision dépend de la langue de vos sources : un contenu publié dans une seule langue reste répondu dans les autres, avec la précision de l’original.',
  },

  useCases: {
    eyebrow: 'Secteurs',
    title: 'Conçu pour les organisations où chaque question compte.',
    lead: 'Le même assistant, adapté au vocabulaire, aux contenus et aux procédures de votre secteur.',
    items: [
      {
        key: 'banking',
        title: 'Banque',
        body: 'Aidez vos visiteurs à comprendre vos produits, vos procédures, vos frais et les conditions d’ouverture de compte.',
      },
      {
        key: 'insurance',
        title: 'Assurance',
        body: 'Rendez vos contrats, vos garanties et vos démarches plus faciles à comprendre.',
      },
      {
        key: 'telecom',
        title: 'Télécoms',
        body: 'Permettez à vos clients de trouver instantanément forfaits, services, tarifs et informations de support.',
      },
      {
        key: 'education',
        title: 'Éducation',
        body: 'Répondez aux questions sur les admissions, les programmes, les frais de scolarité et la vie étudiante.',
      },
      {
        key: 'healthcare',
        title: 'Santé',
        body: 'Aidez vos visiteurs à trouver plus vite vos services, vos horaires et vos informations générales.',
      },
      {
        key: 'enterprise',
        title: 'Grandes entreprises',
        body: 'Rendez un site complexe plus simple à parcourir, et vos informations plus simples à comprendre.',
      },
    ],
    disclaimers: [
      'Banque : l’assistant public répond aux questions générales du site. Il n’accède ni aux comptes ni aux systèmes transactionnels.',
      'Santé : l’assistant donne des informations générales. Il ne pose aucun diagnostic et ne fournit aucun conseil médical personnalisé.',
    ],
  },

  value: {
    eyebrow: 'Ce que cela change',
    title: 'Plus que de l’automatisation. Une meilleure expérience client.',
    lead: 'L’objectif n’est pas de retirer des humains de la boucle, mais de leur retirer ce qui ne demande pas d’humain.',
    items: [
      {
        title: 'Moins de questions répétitives',
        body: 'Les demandes simples et récurrentes trouvent leur réponse sans mobiliser vos équipes.',
      },
      {
        title: 'Une meilleure expérience client',
        body: 'Le visiteur obtient sa réponse au moment où il se pose la question, pas le lendemain.',
      },
      {
        title: 'Plus d’opportunités saisies',
        body: 'Les visiteurs intéressés sont identifiés et rappelés, au lieu de quitter le site en silence.',
      },
      {
        title: 'Une meilleure connaissance de vos clients',
        body: 'Leurs questions montrent ce qui manque à vos contenus et à vos services.',
      },
    ],
    cta: 'Parler à notre équipe',
    note: 'Nous n’affichons pas de gain chiffré tant que nous ne pouvons pas le prouver sur votre périmètre. Le pilote sert exactement à cela.',
  },

  integrations: {
    eyebrow: 'Écosystème',
    title: 'S’intègre à votre environnement numérique.',
    lead: 'Le point de départ est toujours le même : votre site. Le reste se décide selon votre déploiement.',
    availableTitle: 'Disponible aujourd’hui',
    available: [
      {
        title: 'Site web',
        body: 'Une ligne à ajouter, sur n’importe quelle technologie de site.',
      },
      {
        title: 'Documents',
        body: 'PDF et documents bureautiques versés à la base de connaissances.',
      },
      {
        title: 'Alertes e-mail',
        body: 'Vos équipes prévenues dès qu’un visiteur laisse ses coordonnées.',
      },
    ],
    onRequestTitle: 'Selon votre déploiement',
    onRequest: [
      'API',
      'Webhooks',
      'CRM',
      'Outils de support client',
      'Analytics',
      'Intégrations sur mesure',
    ],
    note: 'Disponible selon votre déploiement et vos besoins d’intégration. Nous préférons en discuter à partir de votre environnement réel plutôt que d’afficher une liste de connecteurs.',
  },

  security: {
    eyebrow: 'Sécurité et confidentialité',
    title: 'Pensé pour le contrôle et la confidentialité.',
    lead: 'L’assistant public de votre site n’a besoin d’aucun accès à vos systèmes sensibles pour répondre aux questions de vos visiteurs.',
    points: [
      {
        title: 'Il ne connaît que ce que vous lui donnez',
        body: 'Deezy fonctionne exclusivement sur les informations que votre organisation choisit de fournir.',
      },
      {
        title: 'Aucun accès aux comptes clients',
        body: 'Répondre aux questions générales d’un site public ne demande ni compte client, ni système transactionnel.',
      },
      {
        title: 'Les informations sensibles restent dehors',
        body: 'Ce qui ne doit pas être exposé n’entre pas dans la base de connaissances.',
      },
      {
        title: 'Les sources restent les vôtres',
        body: 'Vous décidez de ce qui est indexé, de ce qui est retiré, et du moment où l’assistant est actif.',
      },
      {
        title: 'Les accès dépendent du déploiement',
        body: 'Le périmètre des données et les permissions sont arrêtés avec vous, selon votre configuration.',
      },
    ],
    note: 'Nous ne revendiquons aucune certification que nous ne détenons pas. Les exigences de conformité propres à votre organisation sont examinées pendant le cadrage, et ce qui relève encore de l’implémentation vous est présenté comme tel.',
  },

  scale: {
    eyebrow: 'Passage à l’échelle',
    title: 'D’un site web à toute votre présence numérique.',
    lead: 'Le déploiement commence sur un périmètre maîtrisé, puis s’étend au rythme de vos résultats.',
    items: [
      'Plusieurs sites',
      'Plusieurs marques',
      'Plusieurs langues',
      'Plusieurs assistants',
      'Plusieurs équipes',
      'Plusieurs sources de connaissance',
    ],
    payoff:
      'Deezy suit l’organisation telle qu’elle est, pas telle qu’un outil voudrait qu’elle soit.',
  },

  workflow: {
    eyebrow: 'Notre méthode',
    title: 'Un déploiement en cinq étapes.',
    lead: 'La même trame pour une banque, un assureur ou une université : comprendre, connecter, éprouver, ajuster, étendre.',
    steps: [
      {
        index: '01',
        title: 'Cadrage',
        body: 'Nous comprenons les besoins de votre organisation et le périmètre à couvrir.',
      },
      {
        index: '02',
        title: 'Connexion des connaissances',
        body: 'Nous connectons les sources d’information pertinentes, et vérifions ce qui en ressort.',
      },
      {
        index: '03',
        title: 'Pilote',
        body: 'Nous déployons Deezy sur un périmètre contrôlé, avec des critères d’évaluation définis à l’avance.',
      },
      {
        index: '04',
        title: 'Optimisation',
        body: 'Nous analysons les conversations, comblons les manques et ajustons le comportement de l’assistant.',
      },
      {
        index: '05',
        title: 'Extension',
        body: 'Nous élargissons le déploiement une fois les résultats validés.',
      },
    ],
    cta: 'Parler à notre équipe',
    photoAlt:
      'Deux personnes en séance de travail, l’une au paperboard, l’autre devant un ordinateur portable',
  },

  pricing: {
    eyebrow: 'Tarifs',
    title: 'Tarification Enterprise',
    lead: 'Chaque organisation a des besoins différents. Nous construisons une offre à partir de votre trafic, du nombre d’assistants, des intégrations et du niveau d’accompagnement attendu.',
    includesTitle: 'Ce que nous cadrons ensemble',
    includes: [
      'Le volume de conversations attendu',
      'Le nombre d’assistants et de sites',
      'Les sources de connaissance à connecter',
      'Les intégrations nécessaires',
      'Le niveau de support et d’accompagnement',
    ],
    cta: 'Parler à notre équipe',
    note: 'Pas de grille publique, et pas de prix d’appel : une offre Enterprise chiffrée sans connaître votre périmètre serait fausse dans les deux sens.',
  },

  editions: {
    title: 'Deezy pour les entreprises de toutes tailles.',
    lead: 'Le même produit, deux façons de le déployer.',
    business: {
      name: 'Deezy Business',
      body: 'Lancez votre assistant IA en quelques minutes, en autonomie.',
      cta: 'Commencer gratuitement',
      items: [
        'Mise en ligne immédiate',
        'Tarifs publics',
        'Configuration en libre-service',
      ],
    },
    enterprise: {
      name: 'Deezy Enterprise',
      body: 'Un assistant de relation client sur mesure pour les grandes organisations.',
      cta: 'Parler à notre équipe',
      items: [
        'Cadrage et pilote accompagnés',
        'Intégrations sur mesure',
        'Offre construite sur votre périmètre',
      ],
    },
  },

  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Ce que les organisations nous demandent.',
    items: [
      {
        question: 'Deezy peut-il accéder aux comptes de nos clients ?',
        answer:
          'Non. L’assistant public de votre site n’a besoin d’aucun accès aux comptes clients ni aux systèmes transactionnels pour répondre aux questions générales des visiteurs.',
      },
      {
        question: 'Quelles informations Deezy peut-il utiliser ?',
        answer:
          'Vos pages web, vos documents, vos FAQ, vos informations produits et les autres sources approuvées prises en charge par votre déploiement.',
      },
      {
        question: 'Pouvons-nous contrôler ce que Deezy répond ?',
        answer:
          'Deezy est conçu pour fonctionner à partir des connaissances de votre organisation et d’un comportement défini avec vous, avec un relais vers un humain lorsque la demande le nécessite. Les sources, les contenus et l’activation se pilotent depuis l’interface ; le ton, les sujets couverts et les règles d’escalade sont arrêtés pendant l’implémentation.',
      },
      {
        question: 'Deezy gère-t-il plusieurs langues ?',
        answer:
          'Oui. Deezy répond dans la langue employée par le visiteur, selon les langues prises en charge par votre déploiement et la couverture linguistique de vos sources.',
      },
      {
        question: 'Deezy peut-il s’intégrer à nos systèmes ?',
        answer:
          'Des intégrations sur mesure peuvent être étudiées selon les besoins de votre organisation. Le site web et les alertes e-mail fonctionnent dès la mise en ligne ; le reste se cadre avec vous.',
      },
      {
        question: 'Comment fonctionne la tarification Enterprise ?',
        answer:
          'Les offres Enterprise sont construites sur mesure, en fonction de l’usage, des exigences de déploiement, des intégrations et du niveau d’accompagnement attendu.',
      },
      {
        question: 'Où nos données sont-elles conservées ?',
        answer:
          'Les contenus que vous indexez et les conversations sont stockés dans une base PostgreSQL gérée. La localisation, la durée de conservation et les accès sont précisés pendant le cadrage, selon les exigences de votre organisation.',
      },
    ],
  },

  finalCta: {
    title: 'Prêt à offrir de meilleures réponses à vos clients ?',
    lead: 'Construisons un assistant IA autour des connaissances de votre organisation.',
    ctaPrimary: 'Demander une démo',
    ctaSecondary: 'Parler à notre équipe',
  },

  /**
   * Formulaire de contact commercial.
   *
   * Six champs, pas quinze : c'est une prise de contact, pas une
   * qualification. Tout ce qui manque se demande pendant l'echange.
   */
  form: {
    eyebrow: 'Prise de contact',
    title: 'Parlons de votre organisation.',
    lead: 'Décrivez-nous votre besoin en quelques lignes. Nous revenons vers vous avec une proposition de démonstration adaptée à votre secteur.',
    intentLabel: 'Votre demande',
    intentDemo: 'Demander une démo',
    intentContact: 'Parler à notre équipe',
    name: 'Nom et prénom',
    namePlaceholder: 'Amina Diallo',
    email: 'E-mail professionnel',
    emailPlaceholder: 'amina.diallo@organisation.com',
    company: 'Organisation',
    companyPlaceholder: 'Nom de votre organisation',
    website: 'Site web',
    websitePlaceholder: 'organisation.com',
    industry: 'Secteur',
    industryPlaceholder: 'Choisissez un secteur',
    industries: [
      { value: 'banking', label: 'Banque' },
      { value: 'insurance', label: 'Assurance' },
      { value: 'telecom', label: 'Télécoms' },
      { value: 'education', label: 'Éducation' },
      { value: 'healthcare', label: 'Santé' },
      { value: 'public', label: 'Secteur public' },
      { value: 'retail', label: 'Commerce et distribution' },
      { value: 'other', label: 'Autre' },
    ],
    message: 'Votre message',
    messagePlaceholder:
      'Combien de visiteurs recevez-vous ? Quelles questions reviennent le plus souvent ?',
    optional: 'facultatif',
    submit: 'Envoyer ma demande',
    submitting: 'Envoi…',
    privacy:
      'Ces informations servent uniquement à vous recontacter. Aucune inscription n’est créée.',
    successTitle: 'Message reçu.',
    successBody:
      'Notre équipe vous répond sous un jour ouvré, à l’adresse que vous venez d’indiquer.',
    errorGeneric:
      'L’envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement à hello@deezy.chat.',
  },
};

/** Le francais porte le type : une cle absente de l'anglais ne compile pas. */
export type EnterpriseDictionary = typeof enterpriseFr;
