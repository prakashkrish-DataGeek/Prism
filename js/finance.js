/* ============================================================
   finance.js — pure client-side financial math
   All returns are category-level assumptions (never fund-specific).
   For learning purposes only. Past performance ≠ future results.
   ============================================================ */

/** Format a rupee amount into human Indian units (₹, K, L, Cr). */
export function inr(n, opts = {}) {
  const { compact = true, decimals = 0 } = opts;
  if (!isFinite(n)) return '₹0';
  const neg = n < 0; n = Math.abs(n);
  let out;
  if (compact) {
    if (n >= 1e7) out = '₹' + (n / 1e7).toFixed(n >= 1e8 ? 1 : 2) + ' Cr';
    else if (n >= 1e5) out = '₹' + (n / 1e5).toFixed(n >= 1e6 ? 1 : 2) + ' L';
    else if (n >= 1e3) out = '₹' + (n / 1e3).toFixed(0) + 'K';
    else out = '₹' + Math.round(n);
  } else {
    out = '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: decimals });
  }
  return (neg ? '-' : '') + out;
}

/** Full rupee string with Indian grouping, no compaction. */
export function inrFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/** Future value of a monthly SIP. Returns series + totals. */
export function sip(monthly, years, annualRatePct) {
  const r = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);
  const series = []; // yearly snapshots
  let corpus = 0;
  for (let m = 1; m <= months; m++) {
    corpus = (corpus + monthly) * (1 + r);
    if (m % 12 === 0 || m === months) {
      series.push({ year: m / 12, invested: monthly * m, corpus });
    }
  }
  const invested = monthly * months;
  return { invested, corpus, gains: corpus - invested, series, months };
}

/** Future value of a lumpsum. */
export function lumpsum(principal, years, annualRatePct) {
  const corpus = principal * Math.pow(1 + annualRatePct / 100, years);
  return { invested: principal, corpus, gains: corpus - principal };
}

/** Fixed deposit (compounded quarterly) future value for a recurring monthly deposit. */
export function rdFD(monthly, years, annualRatePct) {
  // approximate monthly recurring deposit compounded monthly at FD rate
  const r = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);
  const series = [];
  let corpus = 0;
  for (let m = 1; m <= months; m++) {
    corpus = (corpus + monthly) * (1 + r);
    if (m % 12 === 0 || m === months) series.push({ year: m / 12, corpus });
  }
  return { corpus, series };
}

/** Opportunity cost: what a one-time spend could become. */
export function opportunityCost(amount, years, cagrPct) {
  return amount * Math.pow(1 + cagrPct / 100, years);
}

/**
 * FIRE calculation.
 * Corpus target uses the 4% safe withdrawal rule on inflation-adjusted expenses.
 */
export function fire({ currentAge, retireAge, monthlyExpense, currentSavings, monthlySip, returnPct, inflationPct = 6, swr = 4 }) {
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  // expenses grow with inflation until retirement
  const futureAnnualExpense = monthlyExpense * 12 * Math.pow(1 + inflationPct / 100, yearsToRetire);
  const fireNumber = futureAnnualExpense / (swr / 100);

  // project corpus from current savings + SIP
  const rMonthly = returnPct / 100 / 12;
  const months = yearsToRetire * 12;
  let corpus = currentSavings;
  const series = [];
  for (let m = 1; m <= months; m++) {
    corpus = corpus * (1 + rMonthly) + monthlySip;
    if (m % 12 === 0) series.push({ age: currentAge + m / 12, corpus });
  }
  const projectedCorpus = corpus;
  const surplus = projectedCorpus - fireNumber;

  // Required SIP to exactly hit FIRE number
  const fvCurrent = currentSavings * Math.pow(1 + rMonthly, months);
  const annuityFactor = (Math.pow(1 + rMonthly, months) - 1) / rMonthly;
  const requiredSip = Math.max(0, (fireNumber - fvCurrent) / annuityFactor);

  return { yearsToRetire, fireNumber, projectedCorpus, surplus, requiredSip, futureAnnualExpense, series, onTrack: surplus >= 0 };
}

/** Given a target corpus, solve the monthly SIP required. */
export function sipForTarget(target, years, annualRatePct, startingCorpus = 0) {
  const r = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);
  const fvStart = startingCorpus * Math.pow(1 + r, months);
  const annuityFactor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return Math.max(0, (target - fvStart) / annuityFactor);
}

/** 50/30/20 budget split. */
export function budget(income, split = { needs: 50, wants: 30, invest: 20 }) {
  return {
    needs: income * split.needs / 100,
    wants: income * split.wants / 100,
    invest: income * split.invest / 100,
    split,
  };
}

/** Direct vs Regular plan drag: TER difference over time on a SIP. */
export function terDrag(monthly, years, grossReturnPct, directTer, regularTer) {
  const direct = sip(monthly, years, grossReturnPct - directTer).corpus;
  const regular = sip(monthly, years, grossReturnPct - regularTer).corpus;
  return { direct, regular, lost: direct - regular };
}

/** Real (inflation-adjusted) value of money over time. */
export function realValue(amount, years, inflationPct) {
  return amount / Math.pow(1 + inflationPct / 100, years);
}

/** ELSS / 80C tax saved at a given slab. */
export function taxSaved(investment, slabPct) {
  const eligible = Math.min(investment, 150000);
  return eligible * slabPct / 100;
}

/** EPF corpus estimate. Employee+employer 12% each of basic; grows at epfRate. */
export function epf({ monthlyBasic, years, epfRate = 8.15, growthPct = 5 }) {
  const contribMonthly = monthlyBasic * 0.24; // 12% + 12%
  let corpus = 0;
  const rMonthly = epfRate / 100 / 12;
  let basic = monthlyBasic;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) corpus = corpus * (1 + rMonthly) + basic * 0.24;
    basic *= (1 + growthPct / 100); // annual salary growth
  }
  return { corpus, contribMonthly };
}

/** Historic crash scenarios for the Stress Test. */
export const CRASHES = [
  { id: 'covid', label: '2020 COVID crash', drop: 38, recoveryMonths: 8, note: 'Nifty fell ~38% in 33 days, fully recovered in about 8 months.' },
  { id: 'lehman', label: '2008 Global Financial Crisis', drop: 60, recoveryMonths: 17, note: 'The deepest modern crash. SIP investors who kept buying caught the recovery.' },
  { id: 'demon', label: '2016 Demonetisation', drop: 6, recoveryMonths: 2, note: 'A sharp scare that recovered within weeks — noise, not signal.' },
  { id: 'dotcom', label: '2000 Dot-com / 2001', drop: 35, recoveryMonths: 30, note: 'Long grind back — why time horizon matters.' },
];

/** Simulate recovery path of lumpsum vs SIP-through-the-crash. */
export function stressTest(portfolio, dropPct, recoveryMonths) {
  const bottom = portfolio * (1 - dropPct / 100);
  // simple recovery curve back to pre-crash value
  const path = [];
  for (let m = 0; m <= recoveryMonths; m++) {
    const t = m / recoveryMonths;
    const eased = bottom + (portfolio - bottom) * (t * t * (3 - 2 * t)); // smoothstep
    path.push({ month: m, value: eased });
  }
  return { bottom, path };
}
