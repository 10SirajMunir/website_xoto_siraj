/* Stand-in maths for design review. Production figures must come from XOTO's rule tables. */

export const DEFAULT_RATE = 4.5;
export const DBR_CAP = .5;

export const RESIDENCY = [
  { id: 'resident', label: 'Resident', ltv: .8 },
  { id: 'national', label: 'UAE national', ltv: .85 },
  { id: 'non-resident', label: 'Non-resident', ltv: .6 },
];

export function monthlyPayment(loan, ratePct = DEFAULT_RATE, years = 25) {
  const r = ratePct / 1200;
  const n = years * 12;
  return loan * r / (1 - Math.pow(1 + r, -n));
}

export function mortgageEstimate({ salary, debts = 0, years = 25, ltv = .8, rate = DEFAULT_RATE }) {
  const cap = salary * DBR_CAP;
  const room = Math.max(0, cap - debts);
  const loan = room <= 0 ? 0 : room / monthlyPayment(1, rate, years);
  const price = loan / ltv;
  const verdict = room <= 0 ? 'no' : loan < 400000 ? 'mid' : 'yes';
  return { cap, room, loan, price, verdict };
}

export const VERDICT_LABEL = {
  yes: 'Eligible',
  mid: 'Eligible for a lower amount',
  no: 'Not eligible yet',
};

export const aed = (v) => `AED ${Math.round(v).toLocaleString('en-US')}`;
export const aedShort = (v) => (v >= 1e6 ? `AED ${(v / 1e6).toFixed(2)}M` : `AED ${Math.round(v / 1000)}K`);
