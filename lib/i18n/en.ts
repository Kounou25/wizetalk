import type { Dictionary } from './fr';

/** Typee contre le francais : une cle oubliee ne compile pas. */
export const en: Dictionary = {
  meta: {
    title: 'Deezy — AI Chatbot for Your Website That Answers Customers 24/7',
    description:
      'Turn your website into an AI assistant that answers customers 24/7, captures leads and learns from unanswered questions. Start with 100 free messages.',
  },

  nav: {
    problem: 'The problem',
    solution: 'How it works',
    pricing: 'Pricing',
    faq: 'Questions',
    login: 'Log in',
    signup: 'Try it free',
    dashboard: 'My account',
  },

  hero: {
    badge: 'Turn unanswered questions into customers',
    titleStart: 'Stop losing customers because',
    titleHighlight: 'your website can’t answer them',
    subtitle:
      'Deezy turns your website and documents into an AI assistant that answers visitors 24/7 — and captures their contact when it doesn’t know the answer.',
    ctaPrimary: 'Try Deezy free',
    ctaSecondary: 'See how it works',
    microcopy: '100 free messages · Live in 2 minutes · No commitment',
    installNote: 'One line to paste on your site. Nothing else to do.',
    liveBadge: 'Answer from your website',
    mockup: {
      title: 'Assistant',
      online: 'Online',
      welcome: 'Hi! How can I help you?',
      question: 'Do you deliver on Saturdays?',
      answer: 'Yes. We deliver every Saturday, for any order placed before 6 PM.',
      sourceLabel: 'From your page',
      sourceName: 'Shipping & Returns',
      placeholder: 'Write your message…',
    },
  },

  proof: {
    title: 'Your website. Your content. Your answers. Your customers.',
    items: [
      {
        title: 'It answers with your information',
        body: 'Your pages and your documents — never generic knowledge picked up elsewhere.',
      },
      {
        title: 'It says when it doesn’t know',
        body: 'No improvised price or delivery time. Doubt beats a wrong answer.',
      },
      {
        title: 'Your content stays yours',
        body: 'What you teach it never answers on behalf of another business.',
      },
    ],
  },

  problem: {
    eyebrow: 'The real cost',
    title: 'Every unanswered question is a potential lost customer.',
    lead: 'Your website already holds the answers. Your visitors just can’t find them — and nobody tells you when they leave.',
    items: [
      {
        step: '01',
        title: 'They leave',
        body: 'One unanswered question, and the tab closes. You’ll never know they were there.',
      },
      {
        step: '02',
        title: 'They wait',
        body: 'They fill in your form, then wait hours. Often until the next morning.',
      },
      {
        step: '03',
        title: 'They ask somewhere else',
        body: 'While you’re closed, they’re already comparing your competitors.',
      },
      {
        step: '04',
        title: 'You never know',
        body: 'No counter measures the visitors who left because they couldn’t find their answer.',
      },
    ],
    flow: {
      label: 'Today, on your website',
      steps: ['A visitor', 'Has a question', 'No answer', 'They leave'],
    },
    cta: 'Stop losing these visitors',
  },

  change: {
    eyebrow: 'The change',
    title: 'What if your website could answer every visitor instantly?',
    lead: 'Deezy is an assistant that knows your business, speaks your customers’ language, and never stops.',
    items: [
      {
        title: 'It knows your website',
        body: 'Give it your address: it reads your pages and keeps what matters to your customers.',
      },
      {
        title: 'It reads your documents',
        body: 'Pricing, catalogue, policies — everything your website doesn’t say yet.',
      },
      {
        title: 'It answers instantly',
        body: 'No queue, no form, no “we’ll get back to you”.',
      },
      {
        title: 'It speaks the customer’s language',
        body: 'A question asked in French gets a French answer. Nothing to configure.',
      },
      {
        title: 'It works at night',
        body: 'Evenings, weekends, holidays: that’s when your visitors hesitate and decide.',
      },
      {
        title: 'It captures leads',
        body: 'When it doesn’t know, it asks for an email instead of letting the visitor go.',
      },
      {
        title: 'It shows its sources',
        body: 'Every answer links back to the page it came from. Verifiable in one click.',
      },
    ],
  },

  recovery: {
    eyebrow: 'The difference',
    title: 'AI that knows when it doesn’t know.',
    lead: 'Deezy answers from your content. It doesn’t invent prices, delivery times or company policies — because you would be the one honouring them.',
    conversation: {
      question: 'How much is your Pro plan?',
      refusal: 'I couldn’t find that information in what I’ve read from your website.',
      invite: 'Leave your email and the team will get back to you directly.',
      placeholder: 'you@example.com',
      send: 'Send my question',
      sent: 'Your question is on its way. Someone will get back to you.',
    },
    funnelLabel: 'What happens next',
    funnel: {
      start: 'A visitor has a question',
      branchAnswer: {
        label: 'Deezy has the answer',
        steps: ['It answers immediately', 'The visitor keeps browsing'],
        outcome: 'Customer reassured',
      },
      branchLead: {
        label: 'Deezy doesn’t know',
        steps: ['It asks for their email', 'You get the question and the contact'],
        outcome: 'Lead recovered',
      },
    },
    payoff:
      'When Deezy cannot answer, you don’t lose the visitor: you get their question and their contact, at the exact moment their buying intent is highest.',
    cta: 'Recover my leads',
  },

  insight: {
    eyebrow: 'What you learn',
    title: 'Discover what your customers want to know.',
    lead: 'Every unanswered question shows you exactly what your website is missing.',
    listTitle: 'What your customers ask',
    items: [
      { question: 'How much is the Pro plan?', count: '7×' },
      { question: 'Do you deliver on Saturdays?', count: '4×' },
      { question: 'Do you take back old equipment?', count: '2×' },
    ],
    payoff: 'Add the missing information once. Deezy takes care of the rest.',
    note: 'Deezy doesn’t just answer your customers. It shows you what’s blocking your sales.',
  },

  beforeAfter: {
    eyebrow: 'The difference, in five seconds',
    title: 'The same visitor. Two outcomes.',
    without: {
      label: 'Without Deezy',
      turns: [
        { question: 'Do you deliver to my city?', answer: 'Contact us' },
        { question: 'How much does delivery cost?', answer: 'Contact us' },
      ],
      outcome: 'The visitor leaves.',
    },
    with: {
      label: 'With Deezy',
      turns: [
        {
          question: 'Do you deliver to my city?',
          answer: 'Yes, within 24 to 48 hours. Delivery is free over €60.',
        },
        {
          question: 'Great, I’d like to order.',
          answer: 'Let me put you in touch right away.',
        },
      ],
      sourceLabel: 'From your page',
      sourceName: 'Shipping & Returns',
      outcome: 'The visitor becomes a customer.',
    },
  },

  why: {
    eyebrow: 'Why Deezy',
    title: 'Not another chatbot. A better way to turn traffic into customers.',
    lead: 'Four things most assistants don’t do.',
    cards: [
      {
        title: 'Answers from your business',
        body: 'Deezy uses your website and your documents, not generic AI knowledge.',
      },
      {
        title: 'Never guesses',
        body: 'When the information is missing, it says so instead of inventing a plausible answer.',
      },
      {
        title: 'Recovers lost leads',
        body: 'With no answer available, it captures the visitor’s email and question.',
      },
      {
        title: 'Teaches you your gaps',
        body: 'You see what people ask, and what your website doesn’t say yet.',
      },
    ],
  },

  comparison: {
    eyebrow: 'Comparison',
    title: 'What the other options do.',
    lead: 'You’ve probably tried one already. Here is exactly where each one stops.',
    columns: [
      'Instant answers',
      'Uses your content',
      'Doesn’t guess',
      'Captures leads',
      'Learns from questions',
    ],
    rows: [
      {
        label: 'The contact form',
        values: [false, false, true, true, false],
        note: 'You reply tomorrow. They ordered elsewhere tonight.',
      },
      {
        label: 'The FAQ page',
        values: [true, true, true, false, false],
        note: 'Out of date the moment you change a price.',
      },
      {
        label: 'The scripted chatbot',
        values: [true, 'partial', true, true, false],
        note: 'Stuck at the first question you didn’t anticipate.',
      },
      {
        label: 'A generic AI chatbot',
        values: [true, false, false, false, false],
        note: 'Invents a price, and you’re the one who honours it.',
      },
      {
        label: 'Deezy',
        values: [true, true, true, true, true],
        note: 'Knows your business, shows its sources, and says so when it doesn’t know.',
      },
    ],
    highlightRow: 4,
    legend: { yes: 'Yes', partial: 'Partly', no: 'No' },
  },

  install: {
    eyebrow: 'Getting started',
    title: 'From zero to live in 2 minutes.',
    lead: 'No training. No complicated setup. No developer required.',
    steps: [
      {
        step: '01',
        title: 'Add your website',
        body: 'Deezy reads it and keeps what matters to your customers.',
      },
      {
        step: '02',
        title: 'Add your documents',
        body: 'Pricing, catalogue, policies: everything your website doesn’t say yet.',
      },
      {
        step: '03',
        title: 'Paste one line of code',
        body: 'The assistant appears on your site. Your visitors can talk to it.',
      },
    ],
    codeLabel: 'The line to paste, before the closing tag',
    cta: 'Try Deezy free',
  },

  platforms: {
    eyebrow: 'Compatibility',
    title: 'Works with the website you already have.',
    lead: 'WordPress, Shopify, Wix, Squarespace or a custom site: no plugin to install, no developer to book.',
    hints: {
      WordPress: 'Theme or plugin',
      Shopify: 'Theme editor',
      Wix: 'Custom code',
      Squarespace: 'Code injection',
      Webflow: 'Project settings',
      Framer: 'Custom code',
      'Next.js': 'Script tag',
      HTML: 'Custom site',
    } as Record<string, string>,
    fallback: 'If you can add one line of code, you can use Deezy.',
  },

  benefits: {
    eyebrow: 'What you gain',
    title: 'Your website keeps working, even when you don’t.',
    items: [
      {
        title: 'Open 24/7',
        body: 'Your evening, weekend and holiday visitors get an answer.',
      },
      {
        title: 'In the visitor’s language',
        body: 'A question asked in French gets a French answer. Nothing to configure.',
      },
      {
        title: 'In your brand’s colours',
        body: 'Its name, welcome message, colour and position: you choose everything.',
      },
      {
        title: 'Without touching your site',
        body: 'It sits on top of your design, and disappears in one click if you want.',
      },
      {
        title: 'Every conversation',
        body: 'You see what people ask, what gets answered, and what stays unanswered.',
      },
      {
        title: 'Your data stays yours',
        body: 'Your business content never answers on behalf of another company.',
      },
    ],
  },

  results: {
    eyebrow: 'Concretely',
    title: 'What you can count on from day one.',
    items: [
      { value: '24/7', label: 'Your visitors get an answer' },
      { value: '2 min', label: 'To go live' },
      { value: '1 line', label: 'To paste on your site' },
      { value: '100%', label: 'Of answers drawn from your content' },
    ],
    note: 'These are product facts, not customer averages. We’ll publish real results the day we have them.',
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'One price, three sizes.',
    lead: 'Each plan gives you a monthly message quota. No commitment, cancel anytime.',
    roi: 'If Deezy recovers a single customer, it has already paid for itself.',
    startingOffer: '100 free messages when you create your account, no commitment',
    popular: 'Most popular',
    notIncluded: 'Not included',
    perMonth: '/month',
    messagesSuffix: 'messages per month',
    limitLabels: {
      bot: '{n} assistant',
      bots: '{n} assistants',
      pages: 'Up to {n} pages per assistant',
      documents: '{n} documents per assistant',
      documentsUnlimited: 'Unlimited documents',
    },
    featureLabels: {
      gapsReport: 'Unanswered questions report',
      removeBranding: 'No Deezy mention',
      prioritySupport: 'Priority support',
    },
    billing: {
      monthly: 'Monthly',
      annual: 'Annual',
      save: '2 months free',
      annualNote: '{total} $ per year',
    },
    plans: [
      {
        id: 'essential',
        name: 'Essential',
        description: 'For one site, one business.',
        inherits: '',
        extras: [
          'Visitor email capture',
          'Email alert for every lead',
          'In your brand’s colours',
        ],
        cta: 'Get started',
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For a site with daily traffic.',
        inherits: 'Everything in Essential, plus:',
        extras: ['Support reply within 24 h'],
        cta: 'Get started',
      },
      {
        id: 'business',
        name: 'Business',
        description: 'For several sites or several brands.',
        inherits: 'Everything in Growth, plus:',
        extras: [] as string[],
        cta: 'Get started',
      },
    ],
    custom: {
      label: 'Need more?',
      description:
        'High volumes, several teams, specific needs: we build the offer with you.',
      cta: 'Email us',
    },
    footnote:
      'A message is one answer sent by the assistant to a visitor. The quota renews every month and does not roll over. Once reached, your assistant keeps collecting your visitors’ emails.',
  },

  faq: {
    eyebrow: 'Your questions',
    title: 'What people ask before getting started',
    items: [
      {
        question: 'Is Deezy really using my website content?',
        answer:
          'Yes, and only that. Deezy reads your pages and your documents, then builds its answers from what it found there. Every answer links back to the page it came from, so you can check.',
      },
      {
        question: 'Do I need to write questions and answers by hand?',
        answer:
          'No, and that’s the whole point. Your website address is enough. You can then add documents for what your site doesn’t say yet, but you never write a script.',
      },
      {
        question: 'What happens when Deezy doesn’t know something?',
        answer:
          'It says so plainly, and offers the visitor a chance to leave their email. You get their question and their address while their buying intent is highest. The question also lands in your unanswered questions report.',
      },
      {
        question: 'Can Deezy invent information?',
        answer:
          'It is built not to: when nothing in your content answers, it declines rather than guessing. An imagined price or delivery time would commit you to your customer — we prefer a cautious answer.',
      },
      {
        question: 'What counts as a message?',
        answer:
          'One answer sent by the assistant to a visitor. Analysing your site and processing your documents use no messages: they are bounded by your plan’s page and document limits. The quota renews every month and does not roll over.',
      },
      {
        question: 'What happens when I reach my quota?',
        answer:
          'Your assistant stops answering, but it doesn’t disappear from your site: it keeps offering visitors the chance to leave their email. You keep recovering leads, and you can see in your account what you could have answered.',
      },
      {
        question: 'Do I need a developer?',
        answer:
          'No. If you can add a tracking code or a line in your website settings, you can install Deezy. WordPress, Shopify, Wix, Squarespace and the rest are covered.',
      },
      {
        question: 'How long does setup take?',
        answer:
          'A few minutes. You give your address, you wait while your site is read, you paste one line of code. It’s live.',
      },
      {
        question: 'What happens when I update my website?',
        answer:
          'You update your site as usual, then start a new analysis from your account. Deezy re-reads what changed.',
      },
      {
        question: 'Will Deezy slow down my website?',
        answer:
          'No. The script loads after your page and never blocks its rendering. The assistant sits on top of your site, without touching your design.',
      },
      {
        question: 'Can I customise the assistant?',
        answer:
          'Yes: its name, welcome message, main colour and position on the page. It can also be switched off in one click, without removing the script.',
      },
      {
        question: 'Can I see my visitors’ conversations?',
        answer:
          'Yes. Every exchange is available from your account, with unanswered questions grouped and ranked by frequency.',
      },
      {
        question: 'Does Deezy really capture leads?',
        answer:
          'When it can’t find the answer, it offers the visitor a chance to leave their address. You get the contact along with their question. This capture can be switched off if you already have a form.',
      },
      {
        question: 'Is my business data shared with other customers?',
        answer:
          'No. Your business content only powers your own assistant, and never answers on behalf of anyone else.',
      },
    ],
  },

  finalCta: {
    title: 'How many customers left your website without getting an answer?',
    lead: 'You can’t recover yesterday’s visitors. But you can answer the next one.',
    cta: 'Create my account',
    microcopy: '100 free messages · Live in minutes · No commitment',
  },

  footer: {
    tagline:
      'Your customers get an answer right away. You recover the ones who would have left.',
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
    signupLead: '100 free messages to try it out. No commitment.',
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
      account: 'Account',
      signedInAs: 'Signed in as',
      settings: 'Settings',
    },

    billing: {
      title: 'Subscription',
      lead: 'Your plan, its billing and your invoices.',
      noPlan: 'You are using your free messages. Choose a plan to keep going.',
      currentPlan: 'Current plan',
      monthly: 'Monthly',
      annual: 'Annual',
      perMonth: '/month',
      perYear: '/year',
      annualSave: '2 months free',
      renewsOn: 'Next billed on',
      endsOn: 'Your access ends on',
      cancelNotice:
        'Cancellation recorded. You keep access until the end of the period you paid for.',
      manage: 'Manage my subscription',
      manageHint: 'Cancellation, payment method and invoices.',
      choose: 'Choose this plan',
      switchTo: 'Switch to this plan',
      current: 'Your plan',
      statusLabels: {
        pending: 'Payment pending',
        active: 'Active',
        on_hold: 'Payment failed',
        paused: 'Paused',
        cancelled: 'Cancelled',
        failed: 'Failed',
        expired: 'Ended',
      },
      checkoutError: 'Checkout could not be opened. Please try again in a moment.',
      checkoutDone: 'Payment recorded. Your plan activates once the provider confirms.',
      portalAbsent: 'No subscription to manage yet.',
      portalError: 'The portal is temporarily unavailable. Please try again.',
    },

    upgrade: {
      titleMessages: 'You have used every message in your plan this month',
      titleBots: 'You have reached your number of assistants',
      titleDocuments: 'You have reached your number of documents',
      titlePages: 'You have reached your page limit',
      titleGaps: 'This report is not included in your plan',
      titleBranding: 'Removing the mention is not included in your plan',
      lead: 'Here is what you get by moving to the {plan} plan.',
      current: 'Today',
      suggested: 'With {plan}',
      rowMessages: 'Messages per month',
      rowBots: 'Assistants',
      rowPages: 'Pages per assistant',
      rowDocuments: 'Documents per assistant',
      rowGaps: 'Unanswered questions report',
      rowBranding: 'No Deezy mention',
      rowSupport: 'Priority support',
      yes: 'Included',
      no: 'Not included',
      unlimited: 'Unlimited',
      cta: 'See the plans',
      dismiss: 'Later',
      topTitle: 'You are already on the most complete plan',
      topBody: 'To go further, write to us: we build the offer with you.',
      topCta: 'Email us',
      noneTitle: 'No higher plan changes this limit',
      noneBody: 'Email us: we will look at your needs and adjust your plan.',
      capNotice:
        'Indexing reached your plan’s ceiling of {limit} pages. If your site has more, the remaining pages are not covered.',
      capCta: 'Raise the limit',
    },

    quota: {
      title: 'Messages',
      action: 'Choose a plan',
      of: 'of',
      remaining: 'left',
      renews: 'Renews on',
      trialNote: 'Free messages, not renewed.',
      exhausted: 'Quota reached',
      exhaustedHint:
        'Your assistant no longer answers, but it keeps collecting your visitors’ emails.',
      limitsTitle: 'What your plan includes',
      limitBots: 'assistant',
      limitBotsPlural: 'assistants',
      limitPages: 'pages indexed per assistant',
      limitDocuments: 'documents per assistant',
      unlimited: 'Unlimited documents',
      plans: {
        trial: 'Trial',
        essential: 'Essential',
        growth: 'Growth',
        business: 'Business',
      },
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
      usageLead: 'Your message quota, and what your plan includes.',

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
      refused: 'Unanswered',
      leads: 'Leads',
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
      gapsLocked: 'Included from the Growth plan',
      gapsLockedTitle: 'The unanswered questions report',
      gapsLockedBody:
        'It groups the questions your assistant couldn’t answer, most frequent first. It is the exact list of what your site is missing — and of what is costing you sales.',
      gapsLockedCta: 'See the plans',
      conversationsDesc: 'Chat history',
      tabOverview: 'Overview',
      tabKnowledge: 'Knowledge',
      tabInstall: 'Install',
      tabSettings: 'Settings',
      tabsLabel: 'Sections of this assistant',
      activityTitle: 'This assistant’s activity',
      activityLead: 'Exchanges with the visitors of your site.',
      loopTitle: 'Unanswered questions and leads',
      loopLead: 'What your site doesn’t say yet, and the contacts recovered in return.',
      answerRate: 'Answer rate',
      answerRateHint: 'of messages found an answer',
      sourcesTitle: 'Knowledge sources',
      sourceWebsite: 'Pages from your site',
      sourceDocuments: 'Documents added',
      sourcesEmpty: 'Nothing indexed yet.',
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
      notifyLeadsTitle: 'Email me for every lead',
      notifyLeadsBody:
        'You get the question and the address as soon as it is captured, so you can follow up while interest is still high.',
      /* La mention du widget est ecrite en dur en francais : la citer telle
         quelle evite de promettre un texte qui n'existe pas. */
      brandingTitle: 'Remove the “Propulsé par Deezy” mention',
      brandingBody:
        'The small line at the bottom of the chat window disappears from the widget on your site.',
      brandingLocked:
        'Your current plan shows the mention at the bottom of the widget. Higher plans let you remove it.',
      brandingCta: 'See how',
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
