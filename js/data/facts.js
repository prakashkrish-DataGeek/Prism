/* Today's Financial Fact — rotating daily. Educational, category-level only. */
export const FACTS = [
  "If you invested ₹500/month in a Nifty 50 index fund since 2014, you'd have put in ₹66,000 — and it could have grown to over ₹1.6 lakh. Time did most of the work.",
  "₹5,000/month for 30 years at 12% becomes about ₹1.76 crore. You'd have invested ₹18 lakh. The other ₹1.58 crore is compounding.",
  "A ₹200 daily food-delivery habit is ₹73,000 a year. Invested at 12% for 20 years, that's roughly ₹60 lakh.",
  "Starting a SIP at 22 instead of 32 can nearly double your retirement corpus — for the same monthly amount. The extra decade is priceless.",
  "The average equity mutual fund charges a 'regular' plan investor ~1% more per year than a 'direct' plan. Over 25 years that gap can eat 20%+ of your corpus.",
  "At 6% inflation, ₹1 lakh today buys what ₹31,000 will buy in 20 years. Cash 'saved' under the mattress quietly loses.",
  "A 7% fixed deposit after 30% tax and 6% inflation gives a *negative* real return. Safe isn't always safe.",
  "The Nifty 50 fell ~38% in 33 days during the 2020 COVID crash — and fully recovered in about 8 months. Panic sellers locked in the loss.",
  "ELSS funds save tax under Section 80C *and* invest in equity. A 30%-slab taxpayer saves up to ₹46,800 a year while building wealth.",
  "Your employer's EPF match is free money — a 12% contribution you never see. Ignoring it is leaving salary on the table.",
  "Over 60% of actively managed large-cap funds in India have underperformed the Nifty 50 over 10 years. Boring index funds quietly win.",
  "₹1,000/month from age 22 beats ₹5,000/month from age 35 by retirement. Starting early, not investing more, is the cheat code.",
  "UPI made spending frictionless — a tap and it's gone. The same friction that helps merchants can hurt your savings rate.",
  "The '4% rule' says a corpus 25× your annual expenses can fund retirement. Spend ₹6 lakh a year? You need about ₹1.5 crore.",
  "Buy-Now-Pay-Later feels free, but splitting a ₹10,000 purchase into EMIs is still spending ₹10,000 — plus fees you don't notice.",
  "Sovereign Gold Bonds pay 2.5% interest *on top of* gold's price — and capital gains are tax-free if held to maturity.",
  "Debt funds beat idle savings accounts for your emergency fund: liquid funds have historically returned more with same-day access.",
  "The 50/30/20 rule: half your take-home for needs, a third for wants, a fifth invested — before you spend a rupee on anything else.",
  "A single missed decade of investing can cost more than a lifetime of skipping small purchases. Time in the market > timing the market.",
  "Rupee-cost averaging: SIPs buy more units when markets fall and fewer when they rise. Volatility becomes your friend, not your enemy.",
  "LTCG on equity is just 12.5% above ₹1.25 lakh of gains per year. Long-term equity is one of India's most tax-efficient assets.",
  "NPS gives an *extra* ₹50,000 tax deduction under 80CCD(1B) — over and above the ₹1.5 lakh 80C limit.",
  "The 'latte factor': small daily spends feel harmless, but ₹150/day is ₹54,750/year. Awareness beats restriction.",
  "Index funds in India can cost as little as 0.1–0.2% per year. A 1.5% active fund has to beat the index by 1.3% just to break even.",
  "Emergency fund first, investments second: 3–6 months of expenses in a liquid fund keeps you from selling investments in a crisis.",
  "₹15,000 spent on a weekend trip today could be about ₹1.4 lakh in 20 years at 12%. Not saying don't go — just know the trade-off.",
  "Loss aversion: humans feel a ₹1,000 loss about twice as strongly as a ₹1,000 gain. That's why market dips feel scarier than they are.",
  "The best-performing investors in one famous brokerage study were the ones who forgot they had an account. Doing nothing often wins.",
  "Compounding is exponential, not linear. The last 10 years of a 30-year SIP usually create more wealth than the first 20 combined.",
  "Direct plan vs regular plan is the same fund, same manager — you just skip the distributor commission. Always check for 'Direct'.",
];

export function factOfTheDay() {
  const day = Math.floor(Date.now() / 86400000);
  return FACTS[day % FACTS.length];
}
