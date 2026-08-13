import type { Dictionary } from './fr';

/** Typee contre le francais : une cle oubliee ne compile pas. */
export const en: Dictionary = {
  meta: {
    title: 'Wizetalk — the AI chatbot that knows your website by heart',
    description:
      'Wizetalk reads your website and answers your visitors around the clock using your own information. One line of code to paste, no FAQ to write.',
  },

  nav: {
    problem: 'The problem',
    solution: 'The solution',
    pricing: 'Pricing',
    faq: 'FAQ',
    login: 'Log in',
    signup: 'Start free',
    dashboard: 'Dashboard',
  },

  hero: {
    badge: 'It only answers what your site actually says',
    titleStart: 'The AI chatbot that knows',
    titleHighlight: 'your site by heart',
    subtitleStart: 'Wizetalk reads your pages and answers visitors 24/7, using ',
    subtitleStrong: 'your own information',
    subtitleEnd: '. You paste one line of code — that is all.',
    ctaPrimary: 'Create my assistant',
    ctaSecondary: 'See how it works',
    proofs: ['No FAQ to write', 'No scripted flows', 'Free to start'],
    liveBadge: 'Answer taken from your site',
    mockup: {
      title: 'Assistant',
      online: 'Online',
      welcome: 'Hi! How can I help you?',
      question: 'Do you ship to Belgium?',
      answer:
        'Yes, we ship to Belgium within 48 hours. Shipping is free on orders over €60.',
      placeholder: 'Type your message…',
    },
  },

  logos: {
    label: 'Join the companies making their site speak',
  },

  problem: {
    eyebrow: 'The problem',
    title: 'Sound familiar?',
    lead: 'Your site is live, it looks good, it holds everything anyone could need. And yet the same questions keep landing in your inbox.',
    items: [
      {
        title: 'Nobody finds the answer',
        body: 'Your hours, your lead times, your delivery area: it is all written somewhere on your site. Provided you land on the right page.',
      },
      {
        title: 'The contact form stays empty',
        body: 'Filling three fields and waiting until tomorrow takes effort. Closing the tab takes none.',
      },
      {
        title: 'You answer the same questions',
        body: '"Do you ship to Belgium?" for the fifteenth time this week. Time you are not spending selling.',
      },
      {
        title: 'A chatbot becomes a second job',
        body: 'Writing flows, maintaining a FAQ, redoing it all every time a price changes. The work never ends.',
      },
    ],
  },

  frustration: {
    eyebrow: 'The frustration',
    title: 'The visitor never comes back.',
    lead: 'You have already tried to fix this. Here is what actually happens each time.',
    attempts: [
      {
        label: 'The contact form',
        reality: 'You reply tomorrow. They ordered elsewhere the same evening.',
      },
      {
        label: 'The scripted chatbot',
        reality:
          'It only understands what you anticipated. The first unexpected question stops it dead.',
      },
      {
        label: 'The FAQ page',
        reality: 'It goes stale the moment a price changes. And nobody reads it to the end.',
      },
      {
        label: 'A generic AI chatbot',
        reality:
          'It invents a lead time, a price, a guarantee. And you are the one who has to honour it.',
      },
    ],
    pivotStart: 'The problem is not a lack of information.',
    pivotEnd: 'It is that it never arrives at the right moment.',
  },

  solution: {
    eyebrow: 'The solution',
    title: 'One line. Two minutes. Done.',
    lead: 'You write nothing, you configure nothing. You give us an address, we handle the rest.',
    steps: [
      {
        title: 'Give us your address',
        body: 'Your site name is enough. No files to upload, no content to prepare.',
      },
      {
        title: 'We read your site',
        body: 'We go through your pages, keep what matters and drop menus, banners and footers.',
      },
      {
        title: 'You paste one line',
        body: 'The script goes just before the closing body tag. The assistant appears immediately.',
      },
    ],
    analysis: ['24 pages found', '18 relevant pages', '342 sections extracted'],
    dashboard: {
      status: 'Ready',
      botName: 'My company assistant',
      stats: [
        { value: '18', label: 'pages indexed' },
        { value: '342', label: 'sections' },
        { value: '57', label: 'conversations' },
      ],
      recentTitle: 'Latest questions from your visitors',
      recent: [
        'Do you ship to Belgium?',
        'What are your Saturday hours?',
        'Do you offer a warranty?',
      ],
      answered: 'answered',
      caption: 'You find out what your visitors are really looking for.',
    },
  },

  platforms: {
    eyebrow: 'Compatibility',
    title: 'Code or no-code, it works the same.',
    leadStart: 'If you can paste one line before the ',
    leadEnd:
      ' tag, Wizetalk works. No plugin to install, no access to your source code needed.',
    hints: {
      WordPress: 'Theme or plugin',
      Shopify: 'theme.liquid',
      Wix: 'Custom code',
      Squarespace: 'Code injection',
      Webflow: 'Project settings',
      Framer: 'Custom tag',
      'Next.js': 'Script component',
      HTML: 'Before </body>',
    },
    fallback:
      'Your platform is not listed? It most likely works anyway — the script is plain HTML.',
  },

  features: {
    eyebrow: 'What actually matters',
    title: 'An assistant you can trust with your customers.',
    items: [
      {
        title: 'It makes nothing up',
        body: 'If the answer is not on your site, the assistant says so and points to you. It never improvises a price or a lead time.',
      },
      {
        title: 'Every answer is sourced',
        body: 'The page it answered from is cited. Your visitors can check — and so can you.',
      },
      {
        title: 'It follows your site',
        body: 'A sync re-reads your pages. Only the ones that changed are reprocessed.',
      },
      {
        title: 'It respects your design',
        body: 'The assistant lives in an isolated frame: no styling leaks in either direction.',
      },
      {
        title: 'You read the conversations',
        body: 'Every exchange is available. You find out what your visitors are really after.',
      },
      {
        title: 'Your data stays yours',
        body: 'Each assistant is walled off. One site’s content can never feed another’s.',
      },
    ],
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'Start free, pay when it works.',
    lead: 'No commitment, cancel any time.',
    popular: 'Most popular',
    perMonth: '/month',
    plans: [
      {
        name: 'Starter',
        price: '€0',
        description: 'To try it on a first site.',
        features: ['1 assistant', '50 pages analysed', '100 messages per month', 'Customisable widget'],
        cta: 'Start free',
      },
      {
        name: 'Pro',
        price: '€29',
        description: 'For an active company website.',
        features: [
          '3 assistants',
          '300 pages analysed',
          '2,000 messages per month',
          'Conversation history',
          'Unlimited syncing',
        ],
        cta: 'Choose Pro',
      },
      {
        name: 'Business',
        price: '€79',
        description: 'For several sites or brands.',
        features: [
          '10 assistants',
          '1,000 pages analysed',
          '10,000 messages per month',
          'Wizetalk branding removed',
          'Priority support',
        ],
        cta: 'Choose Business',
      },
      {
        name: 'Custom',
        price: 'Talk to us',
        description: 'High volume, specific needs.',
        features: ['Unlimited assistants', 'Negotiated volume', 'Hands-on onboarding'],
        cta: 'Get in touch',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      {
        question: 'Do I need to prepare a FAQ or any documents?',
        answer:
          'No. Your website address is enough. We read your pages and draw the answers straight from them.',
      },
      {
        question: 'What happens when the assistant does not know?',
        answer:
          'It says so and invites the visitor to contact you. We would rather give a cautious answer than an invented one: a made-up price or lead time would bind you to your customer.',
      },
      {
        question: 'How long does setup take?',
        answer:
          'Analysing a small business site takes a few minutes. The install itself is pasting one line of code onto your site.',
      },
      {
        question: 'Do I need technical skills?',
        answer:
          'Knowing how to paste a line before the </body> tag is enough. That works from WordPress, Shopify, Webflow, Wix, Squarespace or any custom site.',
      },
      {
        question: 'What happens when my site changes?',
        answer:
          'You run a sync from your dashboard. Only the pages that changed are reprocessed, the rest is kept.',
      },
      {
        question: 'Will the widget break my site design?',
        answer:
          'No. The assistant lives in an isolated frame: none of your styles reach it, and none of its styles escape.',
      },
      {
        question: 'Could my data end up serving another customer?',
        answer:
          'No. Each assistant is walled off and can only query the content of the site it belongs to.',
      },
    ],
  },

  finalCta: {
    titleStart: 'Your site already has the answers.',
    titleHighlight: 'Let it speak.',
    lead: 'Create your assistant in minutes. No credit card, no FAQ to write.',
    primary: 'Create my assistant',
    secondary: 'I already have an account',
  },

  footer: {
    tagline: 'Give us your website, we build your AI assistant. One line of code.',
    productTitle: 'Product',
    howItWorks: 'How it works',
    accountTitle: 'Account',
    login: 'Log in',
    signup: 'Create an account',
    rights: 'All rights reserved.',
  },

  auth: {
    loginTitle: 'Welcome back',
    loginLead: 'Log in to find your assistants.',
    signupTitle: 'Create your assistant',
    signupLead: 'Free to start, no credit card.',
    googleLogin: 'Log in with Google',
    googleSignup: 'Sign up with Google',
    redirecting: 'Redirecting…',
    or: 'or',
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
    },

    status: {
      draft: 'Never analysed',
      crawling: 'Analysing',
      ready: 'Ready',
      error: 'Analysis failed',
    },

    overview: {
      title: 'Overview',
      lead: 'The state of your assistants at a glance.',
      assistants: 'Assistants',
      pages: 'Pages indexed',
      conversations: 'Conversations',
      yourBots: 'Your assistants',
      seeAll: 'See all',
      emptyTitle: 'Create your first assistant',
      emptyBody:
        'Give us your website address. We read your pages and your assistant is ready in minutes.',
      emptyCta: 'Create an assistant',
    },

    chart: {
      title: 'Activity over the last 30 days',
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
