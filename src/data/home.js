/* Homepage content. Homes and figures are samples for design review, not live listings or offers. */

/* Landing hero. Headings and features come from the live xoto.ae hero; pins sit on towers in the 3D model. */
export const HERO = {
  eyebrow: 'Discover · Finance · Enhance',
  title: 'Your home journey, powered by AI',
  subtitle: 'Buy, rent, finance and upgrade your home in the UAE, all in one place.',
  actions: [
    { label: 'Get a home loan', href: '/service/mortgage', phase: 3, page: 'Mortgages', variant: 'primary' },
    { label: 'Explore homes', href: '/properties', phase: 4, page: 'Properties', variant: 'ghost' },
  ],
  features: ['One-stop solution', 'Faster turnaround', 'Professional teams', 'Across the UAE'],
  pins: [
    { id: 'buy', tower: 3, label: 'Buy', text: 'Ready and off-plan homes', href: '/properties', phase: 4, page: 'Buy' },
    { id: 'rent', tower: 9, label: 'Rent', text: 'Homes to rent across the UAE', href: '/rent/search', phase: 4, page: 'Rent' },
    { id: 'finance', tower: 5, label: 'Mortgages', text: 'Check what you can borrow', href: '/service/mortgage', phase: 3, page: 'Mortgages' },
    { id: 'hq', tower: 8, kind: 'hq', label: 'XOTO HQ', text: 'One by Omniyat, Business Bay', href: '/contact', phase: 7, page: 'Contact' },
  ],
};

export const SERVICES = [
  { n: '01', title: 'Find your dream home', text: 'Search ready and off-plan homes across the UAE, matched to what you qualify for.', image: '/images/svc-buy.webp', href: '/properties', page: 'Buy', phase: 4 },
  { n: '02', title: 'Finance your home the smart way', text: 'Check eligibility, compare partner-bank options and apply in one place.', image: '/images/svc-finance.webp', href: '/service/mortgage', page: 'Mortgages', phase: 3 },
  { n: '03', title: 'Sell to maximize value', text: 'List your property and reach serious buyers already qualified by XO.', image: '/images/svc-sell.webp', href: '/properties', page: 'Sell', phase: 4 },
  { n: '04', title: 'Find the perfect rental', text: 'Know the rules, the fees and the area before you sign.', image: '/images/svc-rent.webp', href: '/rent/search', page: 'Rent', phase: 4 },
  { n: '05', title: 'Monetize your property', text: 'See what your home could earn, with area guides and rental yields to hand.', image: '/images/svc-monetize.webp', href: '/properties', page: 'Monetize', phase: 4 },
  { n: '06', title: "Maximize your property's value", text: 'Interior design, landscaping and smart home, with estimates based on your area.', image: '/images/svc-value.webp', href: '/service/interior', page: 'Home services', phase: 5 },
];

export const FEATURED_HOMES = [
  { title: '2 bed, Dubai Marina', tagline: 'Waterfront living, ready to move in', price: 'AED 2.40M', monthly: 'AED 10,672', image: '/images/home-marina.webp' },
  { title: '3 bed, Yas Island', tagline: 'Light-filled family townhouse', price: 'AED 2.65M', monthly: 'AED 11,783', image: '/images/home-villa.webp' },
  { title: '1 bed, Business Bay', tagline: 'Skyline views from an off-plan tower', price: 'AED 1.85M', monthly: 'AED 8,226', image: '/images/home-loft.webp' },
];

export const CHAPTERS = [
  {
    title: 'Know what you can afford',
    text: 'Share your salary and any loans. XO applies the UAE lending rules and gives a clear verdict, not a maybe.',
    screen: 'eligibility',
    prompt: 'How much can I borrow on AED 30,000 a month?',
  },
  {
    title: 'See homes that actually fit',
    text: 'XO matches live UAE inventory to what you qualify for and what you want, then compares them side by side.',
    screen: 'homes',
    prompt: 'Find me a 2-bed home in my budget',
  },
  {
    title: 'See every cost before you commit',
    text: 'Registration, trustee, agent and mortgage fees by emirate, plus the total cash you will need.',
    screen: 'costs',
    prompt: 'What fees do I pay when buying in Dubai?',
  },
  {
    title: 'Reach a person when it matters',
    text: 'For anything complex or urgent, XO offers a human advisor and sends your request to the right XOTO team.',
    screen: 'advisor',
    prompt: "I'd like to talk to a human advisor",
  },
];

export const TOOLS = [
  { name: 'Connect', text: 'Where customers and partners meet.' },
  { name: 'XO', text: 'The AI guide that matches and assists.' },
  { name: 'Grid', text: 'UAE property inventory, presentations and leads.' },
  { name: 'Vault', text: 'Mortgages, tracking and commission payouts.' },
];

export const FACTS = [
  { value: '21', label: 'Languages, by text or live voice' },
  { value: '7', label: 'Emirates, with buying costs for each' },
  { value: '50%', label: 'Debt-burden cap built into every check' },
  { value: '0', label: 'Figures guessed by AI. Every number comes from rule tables' },
];

export const PARTNERS = [
  { title: 'Agents', text: 'Book a pilot and bring your first five clients.', href: '/agents', cta: 'Become an agent' },
  { title: 'Developers', text: 'Put your projects in front of qualified buyers.', href: '#', soon: true },
  { title: 'Financial institutions', text: 'Join the partner-bank network behind XOTO Vault.', href: '#', soon: true },
];

export const ASK_TOPICS = ['Golden Visa', 'Ejari', 'Off-plan and escrow', 'Area guides and yields'];

export const HERO_PROMPTS = [
  'How much can I borrow on AED 30,000 a month?',
  'Show me 2-bed homes in Dubai Marina',
  'What fees do I pay when buying in Dubai?',
  'Can I buy off-plan as a non-resident?',
];
