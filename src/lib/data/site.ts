export type Suite = {
  slug: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  color: string;
  colorVar: string;
  icon: string;
  features: string[];
  href: string;
};

export const suites: Suite[] = [
  {
    slug: "flow",
    name: "Flow",
    fullName: "EKAM AI Flow",
    tagline: "Pages and apps, built from a prompt",
    description:
      "From a prompt to a live launch page or a full app in minutes. Design, copy, structure, frontend, and backend, built by AI agents and ready to publish.",
    color: "#12bcff",
    colorVar: "var(--color-2)",
    icon: "sparkles",
    features: [
      "Prompt-based pages and apps",
      "Live deploy included",
      "Custom domains + SSL",
      "Frontend + backend generation",
      "Real-time preview",
      "One-click redeploy",
    ],
    href: "/flow",
  },
  {
    slug: "pentest",
    name: "Pentest Suite",
    fullName: "EKAM AI Pentest",
    tagline: "Pre-launch security scan",
    description:
      "Run a structured pre-launch security scan on a target you own or are authorized to test. Reports findings with evidence, severity, and remediation guidance.",
    color: "#91e500",
    colorVar: "var(--color-1)",
    icon: "shield",
    features: [
      "Authorized targets only",
      "Evidence-backed findings",
      "Severity & remediation guidance",
      "OWASP Top 10 coverage",
      "12 specialist agents in parallel",
      "Pre-launch checks",
    ],
    href: "/pentest",
  },
  {
    slug: "search",
    name: "Search Suite",
    fullName: "EKAM AI Search",
    tagline: "Market research for your launch",
    description:
      "Free market research that feeds your launch. Surface competitors, positioning angles, and audience language before you commit to a message.",
    color: "#2f44ff",
    colorVar: "var(--color-3)",
    icon: "search",
    features: [
      "Audience signals",
      "Competitor map",
      "Launch angles",
      "Positioning drafts",
      "Pricing research",
      "Hand-off to Flow",
    ],
    href: "/search",
  },
];

export type PricingTier = {
  name: string;
  price: number;
  period: string;
  description: string;
  cta: string;
  featured?: boolean;
  features: string[];
  credits?: string;
  seats?: string;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Free trial",
    price: 0,
    period: "/14 days",
    description: "Every suite, 5 generations. No card required.",
    cta: "Start free trial",
    features: [
      "Full access for 14 days",
      "Every suite included",
      "No credit card required",
      "5 generations",
      "Community support",
    ],
    credits: "5 generations",
    seats: "1 seat",
  },
  {
    name: "Starter",
    price: 29,
    period: "/month",
    description: "Ship one polished landing site or small MVP per month.",
    cta: "Start with Starter",
    features: [
      "EKAM AI Flow access",
      "75 credits / month",
      "2 team members",
      "Custom domain",
      "Email support",
    ],
    credits: "75 credits / month",
    seats: "2 seats",
  },
  {
    name: "Pro",
    price: 99,
    period: "/month",
    description: "Build and iterate a full product, or run agency client work.",
    cta: "Start with Pro",
    featured: true,
    features: [
      "EKAM AI Flow: pages and apps",
      "350 credits / month",
      "10 team members",
      "Deploy to production",
      "Priority support",
      "Custom domains",
    ],
    credits: "350 credits / month",
    seats: "10 seats",
  },
  {
    name: "Enterprise",
    price: 299,
    period: "/month",
    description: "Run Flow + Pentest + Search with unlimited seats.",
    cta: "Talk to us",
    features: [
      "Flow + Pentest + Search",
      "1,200 credits / month",
      "Unlimited team members",
      "Priority execution",
      "Pre-launch security scans",
      "Dedicated support",
      "Custom integrations",
    ],
    credits: "1,200 credits / month",
    seats: "Unlimited",
  },
];

export const creditPacks = [
  { credits: "25 credits", price: "$15", desc: "One-time" },
  { credits: "100 credits", price: "$49", desc: "One-time", popular: true },
  { credits: "400 credits", price: "$159", desc: "One-time" },
];

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  companies: string[];
  initials: string;
};

export const team: TeamMember[] = [
  {
    name: "Bhargav Vyas",
    role: "Co-Founder & CEO",
    bio: "Co-founder of EKAM AI, focused on product direction and go-to-market. Believes the best launch tool is one that ships and secures in the same motion.",
    companies: [],
    initials: "BV",
  },
  {
    name: "Meet Savaliya",
    role: "Co-Founder & CTO",
    bio: "Co-founder of EKAM AI, leading engineering and the agent orchestration behind Flow, Pentest, and Search.",
    companies: [],
    initials: "MS",
  },
];

export const values = [
  {
    title: "Ship to production",
    desc: "Every feature we build is designed to deliver real outcomes, not demos or prototypes. We build for the launch moment, not the demo moment.",
    icon: "rocket",
  },
  {
    title: "AI as infrastructure",
    desc: "We orchestrate the best models into execution workflows, not another chatbot wrapper. EKAM AI is the execution layer, not a model.",
    icon: "cpu",
  },
  {
    title: "Trust by default",
    desc: "A real company, a real team, transparent practices. Your data stays yours. We operate with enterprise patterns from day one.",
    icon: "shield",
  },
  {
    title: "Scale from day one",
    desc: "Built on enterprise patterns, from Kubernetes to distributed systems, because startups deserve enterprise-grade tools.",
    icon: "layers",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  author: string;
  featured?: boolean;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "free-mobile-app-builder-idea-to-launch-with-ai",
    title: "Free Mobile App Builder: Idea to Launch With AI",
    excerpt:
      "Build and launch a mobile app for free with EKAM AI's AI-powered builder. No code needed. Includes pre-launch security scanning.",
    category: "guide",
    tags: ["mobile", "no-code", "launch"],
    date: "Jul 2, 2026",
    readTime: "9 min read",
    author: "Bhargav Vyas",
    featured: true,
    content: `Mobile app development has traditionally been a slow, expensive process. You needed designers, frontend engineers, backend engineers, and a deployment pipeline, and that was before you got to security review.

EKAM AI Flow changes that. Describe your app, share a few references, and the agent team plans the structure, generates the code, designs the UI, writes the copy, and deploys it. In this post, we walk through the full workflow, from idea to a live, scanned mobile app.

## Step 1: Describe your app

Start with a prompt. The more specific you are about audience, core flows, and the feeling you want, the better the first pass. EKAM AI Flow handles the rest.

## Step 2: Add references

Drop in screenshots of apps you love. EKAM AI matches the structure and voice, without a setup marathon.

## Step 3: Generate and preview

Flow generates the app in seconds. Preview it, iterate on copy and visuals, and run a pre-launch scan before you announce.

## Step 4: Ship

One click. Your project goes live on a public URL you own, ready to share.`,
  },
  {
    slug: "web-page-creator-online-no-code-site-builder",
    title: "Web Page Creator Online: No-Code Site Builder",
    excerpt:
      "The fastest web page creator online for founders & indie hackers. Build, secure, and launch your site in minutes, no coding required.",
    category: "product",
    tags: ["website builder", "no-code", "launch"],
    date: "Jun 30, 2026",
    readTime: "7 min read",
    author: "Meet Savaliya",
    content: `The fastest web page creator online for founders and indie hackers is one that doesn't make you choose between speed and quality. EKAM AI Flow gives you both, plus a pre-launch security scan so you ship with confidence.`,
  },
  {
    slug: "ai-website-design-tools-no-code-sites-2026",
    title: "AI Website Design Tools: No-Code Sites (2026)",
    excerpt:
      "Compare the best AI website design tools in 2026. See how EKAM AI stacks up against Relume, Wix, and Webflow for founders.",
    category: "compare",
    tags: ["website builder", "design", "launch"],
    date: "Jun 27, 2026",
    readTime: "10 min read",
    author: "Meet Savaliya",
    content: `In 2026, the AI website design landscape is more crowded than ever. We compare EKAM AI against Relume, Wix, and Webflow, and show why pairing generation with a pre-launch security scan matters.`,
  },
  {
    slug: "ai-landing-page-builder-prompt-to-live-page",
    title: "AI Landing Page Builder: Prompt to Live Page",
    excerpt:
      "Build a high-converting landing page with AI in minutes. EKAM AI generates, optimizes, and security-scans your launch page, no code needed.",
    category: "product",
    tags: ["landing pages", "website builder", "launch"],
    date: "Jun 24, 2026",
    readTime: "9 min read",
    author: "Bhargav Vyas",
    content: `A high-converting landing page needs three things: clear copy, a credible design, and a fast deploy. EKAM AI Flow delivers all three from a single prompt.`,
  },
  {
    slug: "ai-powered-website-builder-free-no-code",
    title: "AI-Powered Website Builder: Free & No-Code",
    excerpt:
      "Build a stunning website with AI in minutes, no coding needed. EKAM AI generates pages, copy, and layouts instantly. Free to start.",
    category: "product",
    tags: ["website builder", "no-code", "launch"],
    date: "Jun 20, 2026",
    readTime: "10 min read",
    author: "Meet Savaliya",
    content: `A free, no-code website builder that actually produces production-grade output. Here's how EKAM AI Flow does it.`,
  },
  {
    slug: "2026-launch-stack-solo-founders",
    title: "The 2026 launch stack for solo founders: idea to live to secure in a weekend",
    excerpt:
      "The end-to-end map for launching solo in 2026: validate the idea, build a custom landing page, capture intent, secure it before launch.",
    category: "guide",
    tags: ["flow", "guide", "launch"],
    date: "Jun 18, 2026",
    readTime: "7 min read",
    author: "Meet Savaliya",
    content: `Launching solo in 2026 is easier than ever if you have the right stack. This is the end-to-end map we recommend to every founder who asks.`,
  },
  {
    slug: "how-to-build-landing-page-with-ai-that-doesnt-look-ai-generated",
    title: "How to build a landing page with AI that doesn't look AI-generated",
    excerpt:
      "Most AI landing pages look identical because they share the same template assets. Here's how to build one with custom images, icons and fonts.",
    category: "guide",
    tags: ["flow", "landing-pages", "guide"],
    date: "Jun 18, 2026",
    readTime: "5 min read",
    author: "Bhargav Vyas",
    content: `Most AI landing pages look identical because they share the same template assets. Here's how to break out of that pattern with EKAM AI Flow.`,
  },
  {
    slug: "how-to-pentest-your-web-app-before-launch",
    title: "How to pentest your web app before launch (without hiring a firm)",
    excerpt:
      "A practical pre-launch security pass for founders: what a real pentest checks, how to run one on your own app in minutes.",
    category: "guide",
    tags: ["pentest", "security", "guide"],
    date: "Jun 18, 2026",
    readTime: "5 min read",
    author: "Meet Savaliya",
    content: `A practical pre-launch security pass for founders. What a real pentest checks, how to run one on your own app in minutes, and how to read and fix the findings.`,
  },
  {
    slug: "owasp-top-10-explained-for-founders",
    title: "The OWASP Top 10, explained for founders (with real examples)",
    excerpt:
      "A plain-English walk through the OWASP Top 10 web security risks for founders: what each one is, how it bites you.",
    category: "guide",
    tags: ["pentest", "security", "guide"],
    date: "Jun 15, 2026",
    readTime: "11 min read",
    author: "Meet Savaliya",
    content: `A plain-English walk through the OWASP Top 10 web security risks for founders: what each one is, how it bites you, and the single most important thing to do about it.`,
  },
];

export type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
  type: "feature" | "fix" | "chore" | "improvement";
  month: string;
};

export const changelog: ChangelogEntry[] = [
  {
    date: "May 12, 2026",
    title: "Discord community goes public",
    description:
      "Floating Discord launcher across the marketing site and dashboard. New permanent invite link, fresh #showcase and #build-help channels. Discord OAuth available on signup and login.",
    type: "feature",
    month: "May 2026",
  },
  {
    date: "May 9, 2026",
    title: "Analytics rebuilt around GA4",
    description:
      "GA4 page_view events now fire on SPA route changes, giving accurate funnels across the app. Ads conversion tracking running side-by-side with GA4.",
    type: "chore",
    month: "May 2026",
  },
  {
    date: "May 5, 2026",
    title: "Studio: faster session switching and live state",
    description:
      "Per-session message cache: switching between chats is instant. WebSocket is now the single state writer; SSE falls back automatically when sockets are blocked.",
    type: "feature",
    month: "May 2026",
  },
  {
    date: "Apr 28, 2026",
    title: "Pentest: 3 new vulnerability classes",
    description:
      "Added SSRF, race conditions, and business-logic checks. Scan reports now include request/response evidence for every finding.",
    type: "feature",
    month: "April 2026",
  },
  {
    date: "Apr 21, 2026",
    title: "Flow: custom fonts and brand kits",
    description:
      "Upload your own font files and brand colors. Flow applies them consistently across generated pages and apps.",
    type: "feature",
    month: "April 2026",
  },
  {
    date: "Apr 14, 2026",
    title: "Search: competitor positioning drafts",
    description:
      "Search now generates three positioning drafts you can hand directly to Flow as a starting prompt.",
    type: "improvement",
    month: "April 2026",
  },
  {
    date: "Apr 2, 2026",
    title: "Fixed: deploy hook race condition",
    description:
      "Resolved a race condition where rapid successive deploys could lock each other out. Deploys are now strictly ordered per project.",
    type: "fix",
    month: "April 2026",
  },
  {
    date: "Mar 20, 2026",
    title: "Dashboard redesigned",
    description:
      "New dashboard with project cards, recent activity, and a credit usage chart. Mobile layout improved across the board.",
    type: "feature",
    month: "March 2026",
  },
];

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  initials: string;
  company: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "We shipped our launch page in an afternoon and ran a pre-launch scan before announcing. Zero criticals at launch, which is the only reason we slept that night.",
    author: "Anya Petrova",
    role: "Founder, Northwind Labs",
    initials: "AP",
    company: "Northwind Labs",
  },
  {
    quote:
      "From a prompt to a live landing page in 47 minutes. We've stopped using our previous builder entirely.",
    author: "Marcus Lee",
    role: "Indie hacker, Hushnote",
    initials: "ML",
    company: "Hushnote",
  },
  {
    quote:
      "The Pentest suite found three high-severity findings before we announced. That alone paid for a year of EKAM AI.",
    author: "Sara Okafor",
    role: "CTO, Sentinel Ops",
    initials: "SO",
    company: "Sentinel Ops",
  },
  {
    quote:
      "Search gave us three positioning angles we hadn't considered. We picked one, fed it to Flow, and the page basically wrote itself.",
    author: "Diego Ramirez",
    role: "Founder, Mira Health",
    initials: "DR",
    company: "Mira Health",
  },
  {
    quote:
      "I run an agency. EKAM AI replaced four tools in our stack: design, copy, deploy, and security. My clients are happier and my margins are up.",
    author: "Priya Nair",
    role: "Founder, Slate Studio",
    initials: "PN",
    company: "Slate Studio",
  },
  {
    quote:
      "The agent graph is the magic. Watching the planner, designer, engineer, and tester coordinate in real time is genuinely impressive.",
    author: "Tom Whitfield",
    role: "Engineer, Cobalt",
    initials: "TW",
    company: "Cobalt",
  },
];

export type FAQ = {
  q: string;
  a: string;
};

export const generalFAQs: FAQ[] = [
  {
    q: "What is EKAM AI?",
    a: "EKAM AI is an AI platform that turns a prompt into a deployed launch page, then runs an authorized pre-launch security scan so you ship with confidence. It's not a model; it's an execution layer that orchestrates specialized AI agents as one team.",
  },
  {
    q: "Is EKAM AI free to try?",
    a: "Yes. The 14-day free trial gives you full access to every suite (Flow, Pentest, and Search) with 5 generations. No credit card required.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. EKAM AI Flow handles design, copy, structure, frontend, backend, and deploy from a single prompt. You describe what you want and the agents handle the rest.",
  },
  {
    q: "Can I run Pentest on any site?",
    a: "No. Pentest is only for targets you own or are explicitly authorized to test. Unauthorized scanning is against our terms and is not permitted under any circumstances.",
  },
  {
    q: "Where is my data stored?",
    a: "EKAM AI is operated by EKAM INNOVATIONS LLP, based in GIFT City, Gandhinagar, India. Data is processed in India. See our Privacy Policy and Security pages for the full picture, including subprocessors and encryption.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from the dashboard, no questions asked. Your plan stays active until the end of the current billing period, then drops to Free.",
  },
];

export const pricingFAQs: FAQ[] = [
  {
    q: "What is one credit?",
    a: "Credits are the underlying usage unit. As a rough guide: ~1 credit per page generation in Flow, ~10–15 credits for an MVP build run, ~5 credits per Pentest scan. Exact costs depend on project size and the specialist agents involved. You'll always see the credit cost before a run kicks off.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Monthly subscription credits don't roll over; they reset on each renewal. One-time credit packs you purchase on top of a subscription stay on your account until used.",
  },
  {
    q: "Is Pentest available on Pro?",
    a: "Pentest is included on Enterprise. We're rolling it out to Pro on a beta basis; join the Pentest waitlist from your dashboard or contact us for early access.",
  },
  {
    q: "Do you offer agency or volume pricing?",
    a: "Yes. If you ship client work, run more than 10 seats, or need a tailored credit allocation, contact us about our agency partner plan.",
  },
  {
    q: "What about education or non-profit discounts?",
    a: "We offer discounted Pro plans for students, educators and registered non-profits. Email contact@ekamai.in from your institutional address.",
  },
];

export const pentestFindings = [
  {
    severity: "High",
    title: "Reflected XSS in search endpoint",
    location: "/api/search?q=",
    description:
      "User input from the q parameter is reflected into the response without encoding. An attacker can craft a URL that executes JavaScript in a victim's browser.",
    remediation:
      "Encode all user input before reflecting it in HTML. Use a context-aware encoding library. Set a strict Content-Security-Policy header.",
  },
  {
    severity: "Medium",
    title: "Missing rate limit on login",
    location: "/api/auth/login",
    description:
      "The login endpoint has no rate limit. An attacker can brute-force credentials at high speed.",
    remediation:
      "Add a per-IP and per-account rate limit. Use exponential backoff after 5 failed attempts. Consider CAPTCHA after 10 failures.",
  },
  {
    severity: "Low",
    title: "Verbose error in production",
    location: "/api/users/{id}",
    description:
      "The API returns a full stack trace on 500 errors, leaking internal paths and library versions.",
    remediation:
      "Return a generic error message to clients. Log full errors server-side only. Ensure NODE_ENV is set to production.",
  },
];

export const owaspClasses = [
  "Broken Access Control",
  "Cryptographic Failures",
  "Injection",
  "Insecure Design",
  "Security Misconfiguration",
  "Vulnerable Components",
  "Identification & Auth Failures",
  "Software & Data Integrity",
  "Logging & Monitoring Failures",
  "Server-Side Request Forgery",
  "Business Logic Errors",
];

export const stats = [
  { value: "12,400+", label: "Pages shipped" },
  { value: "47 min", label: "Avg time to live" },
  { value: "3,200+", label: "Pre-launch scans" },
  { value: "99.2%", label: "Clean launches" },
];

export const navLinks = [
  { label: "Product Family", children: [
    { label: "Pentest Suite", href: "/pentest", suite: "pentest" },
    { label: "Flow", href: "/flow", suite: "flow" },
    { label: "Search Suite", href: "/search", suite: "search" },
  ]},
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", children: [
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
    { label: "Compare", href: "/blog" },
    { label: "Alternatives", href: "/blog" },
  ]},
  { label: "How it works", href: "/#how-it-works" },
  { label: "Why EKAM AI?", href: "/#why" },
];
