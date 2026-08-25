import type { Dictionary } from './fr';

/** Typee contre le francais : une cle oubliee ne compile pas. */
export const en: Dictionary = {
  meta: {
    title: 'Deezy — the AI chatbot that answers your customers 24/7',
    description:
      'Build your own AI chatbot assistant in minutes. It learns your website and your documents, answers your visitors around the clock, and collects their email when it does not know.',
  },

  nav: {
    problem: 'Why Deezy',
    solution: 'What changes',
    pricing: 'Pricing',
    faq: 'Questions',
    login: 'Log in',
    signup: 'Create my assistant',
    dashboard: 'My account',
  },

  hero: {
    badge: 'It never answers at random',
    titleStart: 'Stop losing customers',
    titleHighlight: 'for lack of an answer',
    subtitleStart: 'Build ',
    subtitleStrong: 'your own AI chatbot assistant',
    subtitleEnd:
      ' in minutes. It learns your site and your documents, answers your visitors around the clock, and collects their email when it does not know.',
    ctaPrimary: 'Create my AI assistant',
    ctaSecondary: 'See what changes',
    reassurance: '7-day free trial — Live in 2 minutes — Cancel in one click',
    installNote: 'One line to paste on your site. Nothing else to do.',
    proofs: ['Nothing to write', 'No installation', '7 days to judge'],
    liveBadge: 'Answer taken from your site',
    mockup: {
      title: 'Assistant',
      online: 'Online',
      welcome: 'Hi! How can I help you?',
      question: 'Do you ship to Belgium?',
      answer:
        'Yes, we ship to Belgium within 48 hours. Shipping is free on orders over EUR 60.',
      placeholder: 'Type your message…',
    },
  },

  logos: {
    label: 'Join the companies making their site speak',
  },

  problem: {
    eyebrow: 'The real cost',
    title: 'Sound familiar?',
    lead: 'Your site already holds the answers. Your visitors cannot find them — and nobody tells you when they leave.',
    items: [
      {
        title: 'They leave without buying',
        body: 'One unanswered question and the tab closes. You will never know they were there, or what they were after.',
      },
      {
        title: 'You repeat the same answers',
        body: 'Opening hours, delivery, prices. Several times a day. Time you are not spending selling.',
      },
      {
        title: 'Your contact form arrives too late',
        body: 'You reply tomorrow morning. The customer ordered elsewhere the same evening.',
      },
      {
        title: 'Evenings and weekends, nobody answers',
        body: 'And that is exactly when your visitors compare, hesitate and decide.',
      },
    ],
  },

  showcase: {
    eyebrow: 'What Deezy changes',
    title: 'A salesperson who knows your business, available at all times.',
    lead: 'Not a scripted robot. An AI chatbot fed by what you already know — your site, your documents — answering in your place.',
    rows: [
      {
        eyebrow: 'What it knows',
        title: 'It knows your business, not generalities',
        body: 'Give it your website address and Deezy reads the whole thing. Add your documents — prices, catalogue, terms — and it knows those too. You write no question-and-answer pairs.',
        points: [
          'Your entire site, read automatically',
          'Your internal documents, added in a few clicks',
          'No question-and-answer pairs to write',
        ],
      },
      {
        eyebrow: 'Trust',
        title: 'It never makes things up',
        body: 'An assistant that invents a price or a delivery time commits you to your customer. Deezy only says what it read on your side, and shows where the answer came from. When it does not know, it says so.',
        points: [
          'Every answer links back to its source',
          'No improvised price or delivery time',
          'It would rather stay quiet than be wrong',
        ],
      },
      {
        eyebrow: 'Customers recovered',
        title: 'A visitor without an answer is no longer a lost visitor',
        body: 'When Deezy cannot find it, it does not let them go: it offers to take their email. You get the contact along with their question, ready to call back.',
        points: [
          'The contact arrives with their question',
          'At the moment the intent to buy is strongest',
          'You call back, you close',
        ],
      },
      {
        eyebrow: 'What you learn',
        title: 'You find out what your customers want to know',
        body: 'Unanswered questions are grouped together, most frequent first. That is the exact list of what your site is missing — and what is costing you sales.',
        points: [
          'Ranked by frequency',
          'Every conversation available to read',
          'You fill the gaps, Deezy follows',
        ],
      },
    ],
    visuals: {
      crawlTitle: 'Your business, learned in minutes',
      crawlLines: ['Your site is read', 'Your documents are added', 'Your assistant is ready'],
      confidenceQuestion: 'Do you ship to Belgium?',
      confidenceAnswer:
        'Yes, we ship to Belgium within 48 hours. Shipping is free on orders over EUR 60.',
      verifiedLabel: 'Verified answer',
      sourceLabel: 'From your page',
      sourceName: 'Shipping and returns',
      leadQuestion: 'How much is the Pro pack?',
      leadRefusal:
        'I cannot find that information. Leave me your email and we will get back to you.',
      leadPlaceholder: 'you@example.com',
      leadSend: 'Send',
      gapsTitle: 'What your customers ask',
      gaps: [
        { question: 'How much is the Pro pack?', count: '7x' },
        { question: 'Do you deliver on Saturdays?', count: '4x' },
        { question: 'Do you take back old equipment?', count: '2x' },
      ],
    },
  },

  comparison: {
    eyebrow: 'Comparison',
    title: 'What the other solutions do.',
    lead: 'You have probably tried one already. Here is where each one stops.',
    columns: ['Answers instantly', 'Always current', 'Invents nothing'],
    rows: [
      {
        label: 'The contact form',
        values: [false, true, true],
        note: 'You reply tomorrow. They bought tonight.',
      },
      {
        label: 'The FAQ page',
        values: [true, false, true],
        note: 'Out of date at your first price change.',
      },
      {
        label: 'The scripted bot',
        values: [true, false, true],
        note: 'Stuck on the first unexpected question.',
      },
      {
        label: 'A generic AI assistant',
        values: [true, false, false],
        note: 'Invents a price, and you have to honour it.',
      },
      {
        label: 'Deezy',
        values: [true, true, true],
        note: 'Knows your business, shows its sources, stays quiet when it does not know.',
      },
    ],
    highlightRow: 4,
  },

  solution: {
    eyebrow: 'Getting started',
    title: 'Your assistant is live in two minutes.',
    lead: 'Nothing to prepare, nothing to configure, no technical skills.',
    steps: [
      {
        title: 'Give your website address',
        body: 'Deezy goes through it and keeps what matters to your customers.',
      },
      {
        title: 'Add your documents',
        body: 'Prices, catalogue, terms: everything your site does not say yet.',
      },
      {
        title: 'Paste one line on your site',
        body: 'The assistant appears. Your visitors can talk to it.',
      },
    ],
    analysis: ['Your site is read', 'Your documents are added', 'Your assistant is ready'],
    dashboard: {
      status: 'Live',
      botName: 'My company assistant',
      stats: [
        { value: '18', label: 'pages read' },
        { value: '6', label: 'documents' },
        { value: '57', label: 'conversations' },
      ],
      recentTitle: 'What your customers asked',
      recent: [
        'Do you ship to Belgium?',
        'What are your Saturday hours?',
        'Do you offer a warranty?',
      ],
      answered: 'answered',
      caption: 'You finally know what your customers are looking for.',
    },
  },

  platforms: {
    eyebrow: 'Compatibility',
    title: 'It works on your site, whatever it is.',
    lead: 'WordPress, Shopify, Wix, Squarespace or a custom build: if you can add one line of code, Deezy works. No plugin to install, no developer to book.',
    hints: {
      WordPress: 'Theme or plugin',
      Shopify: 'Theme editor',
      Wix: 'Custom code',
      Squarespace: 'Code injection',
      Webflow: 'Project settings',
      Framer: 'Custom code',
      'Next.js': 'Script tag',
      HTML: 'Custom build',
    },
    fallback:
      'Your platform is not listed? It most likely works anyway — and we will help you check.',
  },

  features: {
    eyebrow: 'What you gain',
    title: 'An assistant you can trust with your customers.',
    items: [
      {
        title: 'It works while you sleep',
        body: 'Your evening, weekend and holiday visitors get an answer. Without waking you up.',
      },
      {
        title: 'It speaks your customer’s language',
        body: 'A question asked in French gets an answer in French. Nothing to set up.',
      },
      {
        title: 'It looks like your brand',
        body: 'Its name, its welcome message, its colour, where it sits on the page: you choose.',
      },
      {
        title: 'It does not break your site',
        body: 'It sits on top without touching your design, and disappears in one click if you want.',
      },
      {
        title: 'You read every conversation',
        body: 'You know what you are asked, what is answered, and what stays unanswered.',
      },
      {
        title: 'Your data stays yours',
        body: 'Your company’s content never answers for anyone else.',
      },
    ],
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'One price, three sizes.',
    lead: 'Try it for 7 days. Cancel in one click, no questions asked.',
    trialBadge: '7-day free trial on every plan',
    popular: 'Most popular',
    notIncluded: 'Not included',
    perMonth: '/month',
    billing: {
      monthly: 'Monthly',
      annual: 'Yearly',
      save: '2 months free',
      annualNote: 'billed {total} $ a year',
    },
    plans: [
      {
        name: 'Essential',
        monthly: 12,
        annual: 10,
        annualTotal: 120,
        description: 'For one site, one business.',
        inherits: '',
        features: [
          '1 assistant',
          'Up to 100 pages of your site',
          '20 documents',
          '500 answers per month',
          'Collect your visitors’ emails',
          'Styled to match your brand',
        ],
        excluded: [
          'Multiple assistants',
          'Unanswered questions report',
          'Deezy branding removal',
          'Priority support',
        ],
        cta: 'Try for 7 days',
      },
      {
        name: 'Growth',
        monthly: 24,
        annual: 20,
        annualTotal: 240,
        description: 'For a site with visitors every day.',
        inherits: 'Everything in Essential, plus:',
        features: [
          '3 assistants',
          'Up to 500 pages and 100 documents',
          '3,000 answers per month',
          'Unanswered questions report',
          'Support reply within 24 h',
        ],
        excluded: ['Deezy branding removal', 'Priority support'],
        cta: 'Try for 7 days',
      },
      {
        name: 'Business',
        monthly: 48,
        annual: 40,
        annualTotal: 480,
        description: 'For several sites or several brands.',
        inherits: 'Everything in Growth, plus:',
        features: [
          '10 assistants',
          'Up to 2,000 pages, unlimited documents',
          '15,000 answers per month',
          'Deezy branding removed',
          'Priority support',
        ],
        excluded: [],
        cta: 'Try for 7 days',
      },
    ],
    custom: {
      label: 'Need more?',
      description:
        'High volume, several teams, specific needs: we build the offer with you.',
      cta: 'Get in touch',
    },
    footnote:
      'Change plan at any time. One answer means one message sent by the assistant to a visitor.',
  },

  faq: {
    eyebrow: 'Frequently asked',
    title: 'What people ask us most',
    items: [
      {
        question: 'What exactly is Deezy?',
        answer:
          'An AI chatbot assistant you build yourself, for your site. You give it your address and your documents, you pick its name and colours — it then answers your visitors in your place, day and night, with your information and never generalities.',
      },
      {
        question: 'Do I have to prepare questions and answers?',
        answer:
          'No, and that is the whole point. Your website address is enough: Deezy reads it and draws the answers from it. You can then add your documents for what your site does not say yet.',
      },
      {
        question: 'What happens when it does not know the answer?',
        answer:
          'It says so plainly, and offers the visitor a callback by email. We would rather give a cautious answer than an invented one: a made-up price would commit you to your customer.',
      },
      {
        question: 'How long does setup take?',
        answer:
          'A few minutes. You give your address, wait while your site is read, then paste one line. It is live.',
      },
      {
        question: 'Do I need a developer?',
        answer:
          'No. If you can add a tracking code or one line in your site settings, you can install Deezy. WordPress, Shopify, Wix, Squarespace and the rest are covered.',
      },
      {
        question: 'What about when I change my prices or hours?',
        answer:
          'You update your site as usual, then run an update from your account. Deezy re-reads what changed.',
      },
      {
        question: 'Will it break my site?',
        answer:
          'No. The assistant sits on top of your site without touching your design, and you can switch it off in one click without removing anything.',
      },
      {
        question: 'Could my information end up serving a competitor?',
        answer:
          'Never. Your company content only answers your visitors, on your site. It never serves another account.',
      },
    ],
  },

  finalCta: {
    titleStart: 'How many customers left',
    titleHighlight: 'without asking their question?',
    lead: 'You will never know about yesterday’s. From now on, you can answer them.',
    primary: 'Create my AI assistant',
    secondary: 'I already have an account',
  },

  footer: {
    tagline:
      'Your customers get an answer right away. You recover the ones who would have left.',
    productTitle: 'Product',
    howItWorks: 'What changes',
    accountTitle: 'Account',
    login: 'Log in',
    signup: 'Create an account',
    rights: 'All rights reserved.',
  },

  auth: {
    loginTitle: 'Welcome back',
    loginLead: 'Log in to find your assistants.',
    signupTitle: 'Create your assistant',
    signupLead: '7-day free trial, cancel in one click.',
    googleLogin: 'Log in with Google',
    googleSignup: 'Sign up with Google',
    redirecting: 'Redirecting…',
    or: 'or',
    fullName: 'Full name',
    fullNamePlaceholder: 'Jane Miller',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordHint: 'At least 8 characters.',
    submitLogin: 'Log in',
    submitSignup: 'Create my account',
    pending: 'One moment…',
    noAccount: 'No account yet?',
    createAccount: 'Create an account',
    hasAccount: 'Already registered?',
    signIn: 'Log in',
  },

  dashboard: {
    nav: {
      section: 'Manage',
      overview: 'Overview',
      bots: 'My assistants',
      newBot: 'New assistant',
      help: 'Help',
      logout: 'Log out',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      usageTitle: 'Messages this month',
      usageAction: 'Upgrade',
      usageOf: 'of',
      account: 'Account',
      signedInAs: 'Signed in as',
      settings: 'Settings',
    },

    status: {
      draft: 'Never analysed',
      crawling: 'Analysing',
      ready: 'Ready',
      error: 'Analysis failed',
    },

    account: {
      title: 'Settings',
      lead: 'Your profile, the interface language and your password.',

      profileTitle: 'Profile',
      profileLead: 'The name shown in the messages we send you.',
      fullName: 'Full name',
      fullNamePlaceholder: 'Marie Dupont',
      email: 'Email address',
      emailHint: 'The sign-in address cannot be changed from this page.',
      signedInWith: 'Signed in with',
      providerPassword: 'Password',
      providerGoogle: 'Google',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Changes saved.',

      languageTitle: 'Language',
      languageLead: 'Applies to the dashboard and to the messages we send you.',

      securityTitle: 'Password',
      securityLead: 'Choose a new password for your account.',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      passwordHint: '8 characters minimum.',
      updatePassword: 'Update',
      updating: 'Updating…',
      passwordSaved: 'Password updated.',
      googleOnly:
        'Your account signs in with Google. The password is changed from your Google account, not here.',

      usageTitle: 'Usage',
      usageLead: 'Messages handled by your assistants this month.',
      usageEmpty: 'No assistants yet.',

      errorName: 'Enter your full name.',
      errorPassword: 'The password must be at least 8 characters.',
      errorMismatch: 'The two passwords do not match.',
      errorCurrentPassword: 'The current password is incorrect.',
      errorGeneric: 'The change could not be saved. Please try again.',
    },

    help: {
      title: 'Help',
      lead: 'How to get started, what we get asked the most, and how to reach us.',
      startTitle: 'Get started in three steps',
      faqTitle: 'Frequently asked questions',
      contactTitle: 'Your question is not here?',
      contactLead:
        'Write to us describing what you are trying to do. We answer within one business day.',
      contactCta: 'Email us',
      newBotCta: 'Create an assistant',
      siteCta: 'See the overview',
    },

    overview: {
      title: 'Overview',
      lead: 'The state of your assistants at a glance.',
      assistants: 'Assistants',
      pages: 'Pages indexed',
      conversations: 'Conversations',
      leads: 'Leads',
      leadsPending: 'to call back',
      vsPrevious: 'compared with the previous 7 days',
      yourBots: 'Your assistants',
      seeAll: 'See all',
      recentLeadsTitle: 'Latest leads',
      recentLeadsLead: 'Visitors waiting for an answer.',
      recentLeadsEmpty: 'No leads yet.',
      recentLeadsNew: 'New',
      emptyTitle: 'Create your first assistant',
      emptyBody:
        'Give us your website address. We read your pages and your assistant is ready in minutes.',
      emptyCta: 'Create an assistant',
    },

    chart: {
      title: 'Activity',
      rangeLabel: 'Time range',
      range7: '7d',
      range30: '30d',
      range90: '90d',
      empty: 'No conversations in this period.',
      totalOne: 'conversation in total.',
      totalMany: 'conversations in total.',
      conversations: 'Conversations',
      messages: 'Messages',
      showTable: 'Show table',
      hideTable: 'Hide table',
      day: 'Day',
      aria: 'Conversations and messages per day',
    },

    botCard: {
      neverAnalysed: 'Never analysed',
      analysedOn: 'Analysed on',
    },

    botsList: {
      title: 'My assistants',
      lead: 'One assistant per website.',
      emptyTitle: 'No assistants yet',
    },

    newBot: {
      back: 'My assistants',
      title: 'Create an assistant',
      lead: 'Two details are enough. The rest is automatic.',
      nameLabel: 'Assistant name',
      namePlaceholder: 'My company assistant',
      nameHint: 'This name appears at the top of the chat window on your site.',
      urlLabel: 'Your website address',
      urlPlaceholder: 'mycompany.com',
      urlHint:
        'We will crawl this site and its internal pages. No other domain is visited.',
      submit: 'Create my assistant',
      submitting: 'Creating…',
      steps: [
        'We crawl your site and extract the useful content.',
        'You test your assistant straight from the dashboard.',
        'You paste one line of code on your site. It is live.',
      ],
    },

    botPage: {
      back: 'My assistants',
      deactivated: 'Disabled',
      pages: 'Pages indexed',
      sections: 'Sections',
      conversations: 'Conversations',
      leadsTitle: 'Leads',
      leadsDesc: 'Visitors to call back',
      gapsTitle: 'Unanswered questions',
      gapsDesc: 'What your site is missing',
      conversationsDesc: 'Chat history',
    },

    documents: {
      title: 'Your documents',
      lead: 'Everything your site does not say: prices, catalogue, terms. The assistant will use them to answer.',
      drop: 'Drop your files here',
      browse: 'or browse your computer',
      accepted: 'PDF, Word or text — 10 MB per file maximum',
      uploading: 'Uploading…',
      reading: 'Reading the document…',
      empty: 'No documents yet.',
      remove: 'Remove this document',
      truncated: 'Very long document: only the beginning was kept.',
      addedOn: 'Added on',
      errorTooLarge: 'File too large (10 MB maximum).',
      errorFormat: 'Format not supported. PDF, Word or text only.',
    },

    knowledge: {
      title: 'Knowledge base',
      never: 'This site has not been analysed yet.',
      lastSync: 'Last analysed on',
      analyse: 'Run the analysis',
      sync: 'Sync now',
      running: 'Analysing…',
      hint: 'Analysis usually takes one to two minutes. Keep this tab open in the meantime.',
      pagesDoneOne: 'page processed',
      pagesDoneMany: 'pages processed',
      sections: 'sections',
      phases: {
        pending: 'Preparing…',
        crawling: 'Crawling your site…',
        embedding: 'Building the knowledge base…',
        done: 'Done',
        error: 'Error',
      },
    },

    test: {
      title: 'Test your assistant',
      lead: 'Ask a question the way a visitor to your site would.',
      suggestions: [
        'What services do you offer?',
        'How can I contact you?',
        'What are your prices?',
      ],
      placeholder: 'What services do you offer?',
      send: 'Send',
    },

    install: {
      title: 'Installation',
      lead: 'Pick your technology, copy the code, paste it on your site. The assistant appears automatically.',
      copy: 'Copy',
      copied: 'Copied',
    },

    settings: {
      activeTitle: 'Assistant active',
      inactiveTitle: 'Assistant disabled',
      activeBody: 'It is answering visitors on your site.',
      inactiveBody:
        'The widget no longer appears on your site. No need to remove the script — just switch it back on here.',
      title: 'Customisation',
      lead: 'The preview updates as you type.',
      nameLabel: 'Assistant name',
      welcomeLabel: 'Welcome message',
      chars: 'characters',
      colorLabel: 'Primary colour',
      positionLabel: 'Position on your site',
      bottomLeft: 'Bottom left',
      bottomRight: 'Bottom right',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      preview: 'Preview',
      previewPlaceholder: 'Your welcome message will appear here.',
      leadCaptureTitle: 'Collect emails on unanswered questions',
      leadCaptureBody:
        'When the assistant does not know, it offers the visitor a callback instead of letting them leave.',
      dangerTitle: 'Delete this assistant',
      dangerBody:
        'Indexed pages, sections and chat history will be permanently deleted. This cannot be undone.',
      delete: 'Delete',
      confirmPrefix: 'Delete',
      confirmSuffix: 'and all of its data?',
      confirmYes: 'Yes, delete',
      cancel: 'Cancel',
    },

    conversations: {
      title: 'Conversations',
      lead: 'The last 50 exchanges with your visitors.',
      emptyTitle: 'No conversations yet',
      emptyBody:
        'They will show up here as soon as visitors start chatting with your assistant on your site.',
      messageOne: 'message',
      messageMany: 'messages',
    },

    leads: {
      title: 'Leads',
      lead: 'Visitors who left their email because the assistant did not have the answer.',
      pending: 'pending.',
      disabled:
        'Collection is turned off for this assistant. New visitors will no longer see the callback form.',
      emptyTitle: 'No leads yet',
      emptyBody:
        'As soon as a visitor asks an unanswered question and leaves their email, they will appear here with their question.',
      handled: 'Handled',
      reopen: 'Reopen',
      remove: 'Delete this lead',
      mailSubject: 'Your question on our site',
      mailGreeting: 'Hello,',
      mailIntro: 'You asked us:',
    },

    gaps: {
      title: 'Unanswered questions',
      lead: 'What your visitors ask that your site does not say. Most frequent first — those are the ones worth a page, or one more paragraph.',
      emptyTitle: 'Your site answers everything',
      emptyBody:
        'No question went unanswered across the last 200 conversations. That is a good sign.',
      lastTime: 'Last asked on',
      cta: 'Add this information to your site, then run a sync: the assistant will know it.',
      ctaAction: 'Sync',
    },
  },
};
