import type { EnterpriseDictionary } from './fr';

/**
 * Offre Enterprise, en anglais.
 *
 * Typee contre le francais : une cle oubliee ne compile pas. Les memes regles
 * de redaction s'appliquent — voir l'en-tete de fr.ts. En particulier : aucune
 * certification, aucun gain chiffre, et les fonctionnalites non livrees
 * annoncees comme relevant de l'implementation.
 */
export const enterpriseEn: EnterpriseDictionary = {
  meta: {
    title: 'Deezy Enterprise — AI-powered customer assistance for organizations',
    description:
      'Deezy Enterprise gives your visitors instant answers drawn from your organization’s trusted information, 24/7 and in their language. Banking, insurance, telecom, education, healthcare.',
  },

  nav: {
    label: 'Enterprise',
    solution: 'Solution',
    useCases: 'Use cases',
    security: 'Security',
    pricing: 'Pricing',
    faq: 'Questions',
    cta: 'Book a demo',
  },

  hero: {
    badge: 'Deezy Enterprise',
    title: 'AI-powered customer assistance for your organization.',
    subtitle:
      'Give your customers instant answers using your organization’s trusted information — 24/7, across every language and every visit.',
    ctaPrimary: 'Book a demo',
    ctaSecondary: 'Talk to our team',
    reassurance: 'Built around your knowledge. Controlled by your team.',
    mockup: {
      title: 'Assistant',
      online: 'Online',
      question: 'What documents do I need to open an account?',
      answer:
        'A valid ID, proof of address issued within the last three months, and proof of income. You can submit your file in branch or online.',
      sourceLabel: 'From your page',
      sourceName: 'Opening an account — required documents',
      placeholder: 'Write your message…',
      languages: 'EN · FR · AR',
    },
  },

  positioning: {
    title: 'AI-powered customer assistance, not just another AI chatbot.',
    items: [
      {
        title: 'Your information, not generic answers',
        body: 'The assistant answers from your pages, your documents and your approved content.',
      },
      {
        title: 'It stays quiet when it doesn’t know',
        body: 'Without reliable information it says so and points the visitor onward — instead of improvising.',
      },
      {
        title: 'Your teams stay in control',
        body: 'You decide the sources, the scope, and when a human takes the conversation back.',
      },
    ],
  },

  problem: {
    eyebrow: 'Where it starts',
    title: 'Your customers already have questions.',
    lead: 'The answers are already on your website. Your visitors have to go looking for them — and they don’t look for long.',
    steps: [
      'Browse several pages',
      'Open documents',
      'Search the FAQ',
      'Contact support',
      'Wait for a reply',
    ],
    costsTitle: 'What that produces',
    costs: [
      {
        title: 'Frustration',
        body: 'The information exists, but it stays out of reach.',
      },
      {
        title: 'Drop-offs',
        body: 'The visitor leaves, and nobody knows they left.',
      },
      {
        title: 'Repetitive requests',
        body: 'The same simple questions take up your teams’ entire day.',
      },
      {
        title: 'Lost opportunities',
        body: 'A prospect who gets no answer won’t come back to ask somewhere else on your site.',
      },
    ],
    payoff:
      'Deezy helps visitors get the information they need without making them search for it.',
    photoAlt: 'A person checking their phone outside a building',
  },

  solution: {
    eyebrow: 'How it works',
    title: 'One AI assistant. Your organization’s knowledge.',
    lead: 'Three steps, and no knowledge base to write from scratch: Deezy starts from what you already publish.',
    steps: [
      {
        index: '01',
        title: 'Connect your knowledge',
        body: 'Website, documentation, PDFs, FAQs, product information, policies, approved content.',
      },
      {
        index: '02',
        title: 'Deezy learns your information',
        body: 'The sources you provide are analysed and indexed into a knowledge base specific to your organization.',
      },
      {
        index: '03',
        title: 'Your visitors get instant answers',
        body: 'The question is asked right on your website, and the answer arrives in seconds, with its source.',
      },
    ],
    flow: {
      sourceTitle: 'Your sources',
      sourceItems: ['Website', 'Documents', 'FAQs', 'Policies'],
      engineTitle: 'Deezy',
      engineBody: 'Searches your content, then writes the answer',
      visitorTitle: 'Your visitor',
      visitorBody: 'An instant answer, with its source',
    },
  },

  grounded: {
    eyebrow: 'Reliability',
    title: 'Answers grounded in your organization’s knowledge.',
    lead: 'Deezy is designed to answer from the information you provide — and to recognise the limits of what it knows.',
    points: [
      {
        title: 'Sources you control',
        body: 'You choose what goes into the knowledge base: pages, documents, approved content.',
      },
      {
        title: 'Knowledge you can update',
        body: 'Fix a page, replace a document: re-syncing brings the answer up to date.',
      },
      {
        title: 'The source shown with the answer',
        body: 'Visitors see where the information came from, and can open the original page.',
      },
      {
        title: 'The right not to answer',
        body: 'When no relevant content comes back, the assistant says so and points to the right contact.',
      },
    ],
    note: 'We don’t claim “zero hallucinations” or guaranteed accuracy: no AI can honestly promise that. What we design is an assistant aligned with your approved sources, one that would rather stay quiet than invent.',
  },

  control: {
    eyebrow: 'Governance',
    title: 'AI assistance, without giving up control.',
    lead: 'Your organization defines what Deezy knows, how it responds, and when it should hand the conversation to a human.',
    nowTitle: 'What your team manages from the interface',
    now: [
      'Knowledge sources',
      'Indexed content and its updates',
      'The welcome message',
      'Which domains may display the assistant',
      'Contact capture and its alerts',
      'Turning the assistant on or pausing it',
    ],
    setupTitle: 'What we define together during implementation',
    setup: [
      'Tone of voice and answer style',
      'Allowed topics and restricted topics',
      'Escalation rules',
      'Handover to a human channel',
    ],
    setupNote:
      'These are set during discovery, then applied to your deployment. We’d rather say it plainly than imply a self-service console that doesn’t exist yet.',
  },

  handoff: {
    eyebrow: 'Human handoff',
    title: 'AI when possible. Humans when needed.',
    lead: 'An assistant that tries to handle everything ends up handling the important things badly. Deezy is built to recognise what is beyond it.',
    simpleLabel: 'Simple question',
    simpleSteps: [
      'The visitor asks their question',
      'Deezy answers, with its source',
      'The visitor carries on',
    ],
    complexLabel: 'Complex request',
    complexSteps: [
      'The visitor describes their situation',
      'Deezy recognises the limit and offers a contact',
      'Your team is alerted and takes over',
    ],
    points: [
      {
        title: 'Route',
        body: 'To the right department, rather than an approximate answer.',
      },
      {
        title: 'Offer a contact',
        body: 'At the exact moment the visitor’s intent is strongest.',
      },
      {
        title: 'Capture details',
        body: 'Along with the unanswered question, so the callback is useful.',
      },
      {
        title: 'Transfer',
        body: 'To a human channel, depending on the integrations in place.',
      },
    ],
    note: 'Contact capture and team alerts work today. Transfer to a live agent depends on your organization’s tooling, and is addressed during implementation.',

    simplePreview: {
      question: 'Are you open on Saturdays?',
      answer: 'Yes, from 9 AM to 1 PM in every branch.',
      sourceLabel: 'From your “Opening hours” page',
    },

    photoAlt: 'Two advisors wearing headsets, talking with customers from their office',
    teamLabel: 'Your team takes over',
    agentAlt: 'Portrait of a support advisor',
  },

  analytics: {
    eyebrow: 'Analytics',
    title: 'Turn customer questions into business insights.',
    lead: 'Every conversation says something about your offer, your content and your customers. Someone still has to read them.',
    items: [
      'The most frequent questions',
      'The most searched topics',
      'Questions left unanswered',
      'Information that is hard to find on your site',
      'Emerging needs',
      'Commercial opportunities',
      'How the assistant is performing',
    ],
    payoff:
      'Every unanswered question is an opportunity to improve your customer experience.',
    dashboard: {
      title: 'Overview',
      demoBadge: 'Demonstration data',
      period: 'Last 30 days',
      metrics: [
        { label: 'Conversations', value: '12,480' },
        { label: 'Answer rate', value: '87%' },
        { label: 'Unanswered questions', value: '214' },
        { label: 'Leads generated', value: '1,260' },
      ],
      topTitle: 'Top questions',
      top: [
        { question: 'What documents are needed to open an account?', count: '1,204' },
        { question: 'What are the account maintenance fees?', count: '948' },
        { question: 'Where is the nearest branch?', count: '731' },
        { question: 'How do I replace a lost card?', count: '612' },
      ],
      caption:
        'Interface illustration. These values are fictional and do not represent any customer’s performance.',
    },
  },

  multilingual: {
    eyebrow: 'Multilingual',
    title: 'Serve customers in their language.',
    lead: 'Deezy answers in the language the visitor uses, from the same knowledge base — without duplicating your content.',
    payoff: 'One knowledge base. A multilingual customer experience.',
    audienceTitle: 'Particularly useful for',
    audience: [
      'International banks',
      'Telecom operators',
      'Hospitality',
      'Universities',
      'Organizations operating across several countries',
    ],
    note: 'Accuracy depends on the language of your sources: content published in a single language is still answered in the others, with the precision of the original.',
  },

  useCases: {
    eyebrow: 'Industries',
    title: 'Built for organizations where every question matters.',
    lead: 'The same assistant, adapted to the vocabulary, content and procedures of your industry.',
    items: [
      {
        key: 'banking',
        title: 'Banking',
        body: 'Help visitors understand products, procedures, fees and account-opening requirements.',
      },
      {
        key: 'insurance',
        title: 'Insurance',
        body: 'Make policies, products and procedures easier to understand.',
      },
      {
        key: 'telecom',
        title: 'Telecom',
        body: 'Help customers find plans, services, pricing and support information instantly.',
      },
      {
        key: 'education',
        title: 'Education',
        body: 'Answer questions about admissions, programs, tuition and student services.',
      },
      {
        key: 'healthcare',
        title: 'Healthcare',
        body: 'Help visitors find services, schedules and general information faster.',
      },
      {
        key: 'enterprise',
        title: 'Enterprise',
        body: 'Make complex websites easier to navigate and easier to understand.',
      },
    ],
    disclaimers: [
      'Banking: the public assistant answers general website questions. It does not access customer accounts or transactional systems.',
      'Healthcare: the assistant provides general information. It does not give diagnoses or personalised medical advice.',
    ],
  },

  value: {
    eyebrow: 'What changes',
    title: 'More than automation. Better customer experiences.',
    lead: 'The point isn’t to take humans out of the loop — it’s to take out of their day what doesn’t need a human.',
    items: [
      {
        title: 'Reduce repetitive questions',
        body: 'Simple, recurring requests get answered without taking up your teams’ time.',
      },
      {
        title: 'Improve customer experience',
        body: 'Visitors get their answer at the moment they ask, not the next day.',
      },
      {
        title: 'Capture more opportunities',
        body: 'Interested visitors are identified and followed up, instead of leaving the site in silence.',
      },
      {
        title: 'Understand your customers',
        body: 'Their questions show what is missing from your content and your services.',
      },
    ],
    cta: 'Talk to our team',
    note: 'We don’t publish a figure we can’t yet prove on your own scope. That is exactly what the pilot is for.',
  },

  integrations: {
    eyebrow: 'Ecosystem',
    title: 'Works with your digital ecosystem.',
    lead: 'The starting point is always the same: your website. The rest is decided by your deployment.',
    availableTitle: 'Available today',
    available: [
      {
        title: 'Website',
        body: 'One line to add, on any website technology.',
      },
      {
        title: 'Documents',
        body: 'PDFs and office documents added to the knowledge base.',
      },
      {
        title: 'Email alerts',
        body: 'Your teams notified as soon as a visitor leaves their details.',
      },
    ],
    onRequestTitle: 'Depending on your deployment',
    onRequest: [
      'API',
      'Webhooks',
      'CRM',
      'Customer support tools',
      'Analytics',
      'Custom integrations',
    ],
    note: 'Available depending on your deployment and integration requirements. We’d rather discuss these from your real environment than display a list of connectors.',
  },

  security: {
    eyebrow: 'Security & privacy',
    title: 'Designed with control and privacy in mind.',
    lead: 'The public assistant on your website needs no access to your sensitive systems in order to answer visitor questions.',
    points: [
      {
        title: 'It only knows what you give it',
        body: 'Deezy operates solely on the information your organization chooses to provide.',
      },
      {
        title: 'No access to customer accounts',
        body: 'Answering general questions on a public website requires neither customer accounts nor transactional systems.',
      },
      {
        title: 'Sensitive information stays out',
        body: 'What must not be exposed never enters the knowledge base.',
      },
      {
        title: 'The sources remain yours',
        body: 'You decide what is indexed, what is removed, and when the assistant is live.',
      },
      {
        title: 'Access depends on the deployment',
        body: 'Data scope and permissions are agreed with you, according to your configuration.',
      },
    ],
    note: 'We claim no certification we do not hold. Compliance requirements specific to your organization are reviewed during discovery, and anything still part of implementation is presented as such.',
  },

  scale: {
    eyebrow: 'Scale',
    title: 'From one website to your entire digital presence.',
    lead: 'Deployment starts on a controlled scope, then grows at the pace of your results.',
    items: [
      'Multiple websites',
      'Multiple brands',
      'Multiple languages',
      'Multiple assistants',
      'Multiple teams',
      'Multiple knowledge sources',
    ],
    payoff:
      'Deezy follows the organization as it is, not as a tool would like it to be.',
  },

  workflow: {
    eyebrow: 'Our method',
    title: 'A five-step deployment.',
    lead: 'The same path for a bank, an insurer or a university: understand, connect, test, refine, extend.',
    steps: [
      {
        index: '01',
        title: 'Discovery',
        body: 'We understand your organization’s needs and the scope to cover.',
      },
      {
        index: '02',
        title: 'Knowledge setup',
        body: 'We connect the relevant information sources, and check what comes out of them.',
      },
      {
        index: '03',
        title: 'Pilot',
        body: 'We deploy Deezy on a controlled scope, with evaluation criteria agreed in advance.',
      },
      {
        index: '04',
        title: 'Optimization',
        body: 'We analyse the conversations, close the gaps and adjust how the assistant behaves.',
      },
      {
        index: '05',
        title: 'Scale',
        body: 'We extend the deployment once the results are validated.',
      },
    ],
    cta: 'Talk to our team',
    photoAlt:
      'Two people in a working session, one at a flip chart, the other at a laptop',
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'Enterprise pricing',
    lead: 'Every organization has different requirements. We’ll design a plan based on your traffic, number of assistants, integrations and support needs.',
    includesTitle: 'What we scope together',
    includes: [
      'Expected conversation volume',
      'Number of assistants and websites',
      'Knowledge sources to connect',
      'Required integrations',
      'Level of support and guidance',
    ],
    cta: 'Talk to our team',
    note: 'No public price list, and no headline rate: an Enterprise quote made without knowing your scope would be wrong in both directions.',
  },

  editions: {
    title: 'Deezy for businesses of every size.',
    lead: 'The same product, two ways to deploy it.',
    business: {
      name: 'Deezy Business',
      body: 'Launch your AI website assistant in minutes, on your own.',
      cta: 'Start for free',
      items: ['Live immediately', 'Public pricing', 'Self-service setup'],
    },
    enterprise: {
      name: 'Deezy Enterprise',
      body: 'A tailored AI customer assistant for larger organizations.',
      cta: 'Talk to our team',
      items: [
        'Guided discovery and pilot',
        'Custom integrations',
        'A plan built on your scope',
      ],
    },
  },

  faq: {
    eyebrow: 'Frequently asked',
    title: 'What organizations ask us.',
    items: [
      {
        question: 'Can Deezy access customer accounts?',
        answer:
          'No. Deezy’s public website assistant does not need access to customer accounts or transactional banking systems to answer general visitor questions.',
      },
      {
        question: 'What information can Deezy use?',
        answer:
          'Websites, documents, FAQs, product information and other approved sources supported by your deployment.',
      },
      {
        question: 'Can we control what Deezy answers?',
        answer:
          'Deezy is designed to operate around your organization’s knowledge and configurable behavior, with options for escalation when a human is needed. Sources, content and activation are managed from the interface; tone, covered topics and escalation rules are agreed during implementation.',
      },
      {
        question: 'Can Deezy handle multiple languages?',
        answer:
          'Yes. Deezy can respond in the language used by the visitor, depending on the languages supported by the deployment and the language coverage of your sources.',
      },
      {
        question: 'Can Deezy integrate with our systems?',
        answer:
          'Custom integrations can be discussed depending on your organization’s requirements. The website and email alerts work from day one; the rest is scoped with you.',
      },
      {
        question: 'How does Enterprise pricing work?',
        answer:
          'Enterprise plans are customized according to usage, deployment requirements, integrations and support needs.',
      },
      {
        question: 'Where is our data stored?',
        answer:
          'The content you index and the resulting conversations are stored in a managed PostgreSQL database. Location, retention and access are confirmed during discovery, according to your organization’s requirements.',
      },
    ],
  },

  finalCta: {
    title: 'Ready to give your customers better answers?',
    lead: 'Let’s build an AI assistant around your organization’s knowledge.',
    ctaPrimary: 'Book a demo',
    ctaSecondary: 'Talk to our team',
  },

  form: {
    eyebrow: 'Get in touch',
    title: 'Let’s talk about your organization.',
    lead: 'Tell us about your needs in a few lines. We’ll come back with a demo tailored to your industry.',
    intentLabel: 'Your request',
    intentDemo: 'Book a demo',
    intentContact: 'Talk to our team',
    name: 'Name',
    namePlaceholder: 'Amina Diallo',
    email: 'Work email',
    emailPlaceholder: 'amina.diallo@organization.com',
    company: 'Company',
    companyPlaceholder: 'Your organization’s name',
    website: 'Company website',
    websitePlaceholder: 'organization.com',
    industry: 'Industry',
    industryPlaceholder: 'Choose an industry',
    industries: [
      { value: 'banking', label: 'Banking' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'telecom', label: 'Telecom' },
      { value: 'education', label: 'Education' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'public', label: 'Public sector' },
      { value: 'retail', label: 'Retail' },
      { value: 'other', label: 'Other' },
    ],
    message: 'Message',
    messagePlaceholder:
      'How many visitors do you get? Which questions come up most often?',
    optional: 'optional',
    submit: 'Send my request',
    submitting: 'Sending…',
    privacy:
      'These details are only used to get back to you. No account is created.',
    successTitle: 'Message received.',
    successBody:
      'Our team will reply within one business day, at the address you just provided.',
    errorGeneric:
      'Sending failed. Try again in a moment, or write to us directly at hello@deezy.chat.',
  },
};
