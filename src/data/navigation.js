/* Site map from the live xoto.ae menu. `phase` marks which redesign phase designs that page (see plan.md). */

export const NAV = [
  { label: 'Buy', href: '/properties', phase: 4 },
  { label: 'Rent', href: '/rent/search', phase: 4 },
  { label: 'Sell', href: '/properties', phase: 4, page: 'Sell' },
  { label: 'Mortgages', href: '/service/mortgage', phase: 3 },
  {
    label: 'Home upgrades',
    items: [
      { label: 'Interiors', text: 'Interior design and fit-out', href: '/service/interior', phase: 5 },
      { label: 'Landscaping', text: 'Gardens and outdoor spaces', href: '/service/landscaping', phase: 5 },
      { label: 'AI design planner', text: 'See design options for your space', href: '/aiPlanner/interior', phase: 5 },
      { label: 'XOTO Store', text: 'Shop for your home', href: '/store', phase: 5 },
    ],
  },
  {
    label: 'Partners',
    items: [
      { label: 'Agent ecosystem', text: 'For real estate agents', href: '/agents', phase: 6 },
      { label: 'Partner ecosystem', text: 'Developers, banks and service partners', href: '/ecosystem', phase: 6 },
    ],
  },
  {
    label: 'Knowledge Hub',
    items: [
      { label: 'Calculators', text: 'Mortgage and affordability', href: '/mortgages/calculator', phase: 3 },
      { label: 'Blogs', text: 'Guides to UAE property', href: '/Blogs', phase: 7 },
      { label: 'Case studies', href: '/case-studies', phase: 7 },
      { label: 'Training', href: '/training', phase: 7 },
      { label: 'About us', href: '/about', phase: 7 },
    ],
  },
];

export const LOGIN = [
  { label: 'Customer', text: 'Your applications and saved homes', href: '/user/login', phase: 8, page: 'Customer login' },
  { label: 'Partner', text: 'Agents, developers and banks', href: '/login', phase: 8, page: 'Partner login' },
];

export const CONTACT = { label: 'Contact us', href: '/contact', phase: 7, page: 'Contact' };

export const FOOTER_GROUPS = [
  {
    title: 'Our offerings',
    links: [
      { label: 'Buy a home', href: '/properties', phase: 4 },
      { label: 'Rent a home', href: '/rent/search', phase: 4 },
      { label: 'Sell a home', href: '/properties', phase: 4 },
      { label: 'Mortgages', href: '/service/mortgage', phase: 3 },
      { label: 'Calculators', href: '/mortgages/calculator', phase: 3 },
    ],
  },
  { title: 'Home upgrades', links: NAV[4].items },
  {
    title: 'Partners',
    links: [
      ...NAV[5].items,
      { label: 'Meet XO', href: '/xo', phase: 6 },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about', phase: 7 },
      { label: 'Knowledge Hub', href: '/Blogs', phase: 7 },
      { label: 'Contact us', href: '/contact', phase: 7 },
      { label: 'Privacy policy', href: '/privacy-policy', phase: 7 },
      { label: 'Terms of use', href: '#', phase: 7 },
    ],
  },
];

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/xotoproptech' },
  { label: 'Facebook', href: 'https://www.facebook.com/xotouae' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/xotouae' },
];
