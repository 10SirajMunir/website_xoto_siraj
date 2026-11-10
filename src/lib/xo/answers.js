/* Scripted XO replies for design review. The real assistant replaces this file at build time. */
import { aed, aedShort, DEFAULT_RATE, mortgageEstimate, VERDICT_LABEL } from '@/lib/finance';

export const XO_ADVISOR_PROMPT = "I'd like to talk to a human advisor";

export function answer(question) {
  const t = question.toLowerCase();
  const figure = question.replace(/,/g, '').match(/\d{4,7}/);

  if (/advisor|human|person|agent|call/.test(t)) {
    return {
      title: "I'll arrange a callback.",
      intro: 'Please check these before I send them to the right XOTO team.',
      rows: [['Name', 'Your name'], ['Number', '+971 5X XXX XXXX'], ['Language', 'English']],
    };
  }
  if (/fee|cost|upfront|dld|charges/.test(t)) {
    return {
      title: 'Buying costs on AED 2,400,000 in Dubai',
      rows: [
        ['Down payment (20%)', '480,000'],
        ['DLD registration (4%)', '96,000'],
        ['Agent fee (2%)', '48,000'],
        ['Mortgage registration', '4,800'],
        ['Bank fee, up to 1%', '19,200'],
        ['Trustee fee', '4,200'],
        ['Cash needed', aed(652200)],
      ],
    };
  }
  if (/propert|home|bed|apartment|villa|rent|buy/.test(t) && !/borrow|afford/.test(t)) {
    return {
      title: 'Three sample homes in budget',
      rows: [
        ['2 bed, Dubai Marina', aedShort(2400000)],
        ['1 bed, Business Bay', aedShort(1850000)],
        ['3 bed, Yas Island', aedShort(2650000)],
      ],
      note: 'Live inventory from XOTO Grid replaces these samples.',
    };
  }
  if (/golden visa/.test(t)) {
    return { text: 'Property can support a UAE Golden Visa when it meets the value and ownership conditions. I can walk you through them, or an advisor can confirm your case.' };
  }
  if (/ejari/.test(t)) {
    return { text: 'Ejari is the official registration of a rental contract in Dubai. Your landlord or agent usually handles it, and you will need it for most utilities and visas.' };
  }
  if (/off.?plan|escrow/.test(t)) {
    return { text: 'Off-plan payments go into a regulated project escrow account, released to the developer as construction milestones are met.' };
  }
  if (/area|yield/.test(t)) {
    return { text: 'Tell me the emirate or community you have in mind, and I will share what it is like to live there and how rental yields compare.' };
  }
  if (/borrow|afford|mortgage|loan|salary|earn|eligib|emi|month/.test(t) || figure) {
    const salary = figure ? Number(figure[0]) : 30000;
    const e = mortgageEstimate({ salary });
    return {
      verdict: e.verdict,
      verdictLabel: VERDICT_LABEL[e.verdict],
      rows: [
        ['You could borrow up to', aed(e.loan)],
        ['Property price supported', aed(e.price)],
        ['Monthly at the 50% cap', aed(e.room)],
      ],
      note: `Based on ${aed(salary)} a month, no other loans, 25 years at an illustrative ${DEFAULT_RATE}%.`,
    };
  }
  return { text: 'I can help with mortgages, property search, buying costs, renting rules and more. Try asking "How much can I borrow on AED 30,000 a month?"' };
}
