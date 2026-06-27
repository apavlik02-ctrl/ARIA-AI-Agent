/**
 * ARIA Tools Library
 * 
 * Reusable TypeScript implementations of ARIA's core tools.
 * Use this in your Next.js app for consistent behavior across API routes,
 * server components, and client-side logic.
 * 
 * Location suggestion: lib/aria-tools.ts
 */

export interface Question {
  id: number;
  domain: string;
  difficulty: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  know_this: string;
  metadata?: any;
}

export interface ReadinessAnalysis {
  previous_readiness: number | null;
  new_readiness: number;
  change: number;
  domain_breakdown: Record<string, number>;
  weak_domains: string[];
  priority_domains: string[];
  recommendations: string[];
  next_actions: string[];
  days_until_exam?: number;
  study_intensity?: string;
  analyzed_at: string;
}

export interface StudySchedule {
  exam_date: string;
  days_until_exam: number;
  starting_readiness: number;
  target_readiness: number;
  daily_minutes: number;
  weak_domains_focus: string[];
  schedule: Array<{
    day: number;
    date: string;
    focus_domains: string[];
    minutes: number;
    event: string;
    spaced_repetition: boolean;
  }>;
  generated_at: string;
  notes: string;
}

export interface RegulationResult {
  state: string;
  topic: string;
  value: number | null;
  details: string;
  exam_note: string;
  source: string;
}

// Domain weights for readiness calculation
const DOMAIN_WEIGHTS: Record<string, number> = {
  life_types: 0.28,
  policy_provisions: 0.22,
  health_insurance: 0.25,
  riders: 0.15,
  regulations: 0.10,
  annuities: 0.10,
  federal_tax: 0.07,
  qualified_plans: 0.07,
};

const WI_REGULATIONS: Record<string, any> = {
  grace_period: {
    days: 31,
    details: "Wisconsin requires a 31-day grace period for life insurance policies.",
    exam_note: "WI uses 31 days (some states use 30). Important state-specific fact.",
  },
  free_look: {
    days: 10,
    details: "Standard free-look period in Wisconsin is 10 days for individual life policies (30 days for replacements).",
    exam_note: "Free look is 10 days standard, longer for replacements.",
  },
  incontestability: {
    years: 2,
    details: "Incontestability period is 2 years in Wisconsin.",
    exam_note: "Standard 2-year incontestability clause.",
  },
  replacement: {
    details: "Wisconsin has strict replacement rules. A comparison document is required, and a 20-30 day free look often applies to replaced policies.",
    exam_note: "Replacement triggers additional disclosures and longer free look.",
  },
};

const SAMPLE_QUESTIONS: Question[] = [
  // ── Life Types ──────────────────────────────────────────────────────────────
  {
    id: 1,
    domain: "life_types",
    difficulty: "medium",
    question: "Which type of life insurance provides the greatest amount of protection for the lowest initial premium?",
    options: ["A) Whole Life", "B) Level Term", "C) Universal Life", "D) Variable Universal Life"],
    correct: "B",
    explanation: "Level Term is pure protection with no cash value, making it the least expensive for a given death benefit amount.",
    know_this: "Term = highest death benefit per premium dollar in early years.",
  },
  {
    id: 2,
    domain: "life_types",
    difficulty: "easy",
    question: "Which policy type builds guaranteed cash value?",
    options: ["A) Term Life", "B) Whole Life", "C) Annual Renewable Term", "D) Decreasing Term"],
    correct: "B",
    explanation: "Whole Life is a permanent policy with guaranteed cash value accumulation and level premiums.",
    know_this: "Whole Life = permanent + guaranteed cash value + level premium.",
  },
  {
    id: 7,
    domain: "life_types",
    difficulty: "hard",
    question: "In Universal Life Option B, the death benefit is equal to:",
    options: ["A) The face amount only", "B) The face amount plus the cash value", "C) The cash value only", "D) The premiums paid plus interest"],
    correct: "B",
    explanation: "Option B (Increasing) pays the face amount plus the current cash value at death.",
    know_this: "Option B = Face + Cash Value. Option A = Level face amount.",
  },
  {
    id: 12,
    domain: "life_types",
    difficulty: "medium",
    question: "Variable Life insurance differs from Whole Life primarily because:",
    options: ["A) It has no cash value", "B) The death benefit and cash value fluctuate with investment subaccounts", "C) Premiums are flexible", "D) It requires no medical underwriting"],
    correct: "B",
    explanation: "Variable Life ties the cash value and potentially the death benefit to investment subaccounts, introducing market risk.",
    know_this: "Variable products = investment risk transferred to policyowner. Requires securities license.",
  },
  {
    id: 13,
    domain: "life_types",
    difficulty: "easy",
    question: "Decreasing Term insurance is most commonly used to:",
    options: ["A) Cover final expenses", "B) Fund a buy-sell agreement", "C) Cover a mortgage balance", "D) Provide retirement income"],
    correct: "C",
    explanation: "The decreasing death benefit mirrors a declining mortgage balance, making it ideal for mortgage protection.",
    know_this: "Decreasing Term = mortgage protection. Death benefit decreases; premium stays level.",
  },
  {
    id: 14,
    domain: "life_types",
    difficulty: "hard",
    question: "A survivorship (second-to-die) life policy pays the death benefit:",
    options: ["A) When the first insured dies", "B) When the second insured dies", "C) When either insured becomes disabled", "D) At the end of the policy term"],
    correct: "B",
    explanation: "Survivorship policies insure two lives and pay only upon the death of the last survivor, commonly used for estate planning.",
    know_this: "Second-to-die = estate planning tool. Lower premium than two individual policies.",
  },

  // ── Policy Provisions ────────────────────────────────────────────────────────
  {
    id: 3,
    domain: "policy_provisions",
    difficulty: "easy",
    question: "In Wisconsin, the standard grace period for life insurance policies is:",
    options: ["A) 10 days", "B) 30 days", "C) 31 days", "D) 60 days"],
    correct: "C",
    explanation: "Wisconsin statute sets the grace period at 31 days for life insurance.",
    know_this: "WI = 31 days (not 30). State-specific fact frequently tested.",
  },
  {
    id: 8,
    domain: "policy_provisions",
    difficulty: "medium",
    question: "The incontestability clause generally prevents the insurer from contesting the policy after how many years?",
    options: ["A) 1 year", "B) 2 years", "C) 3 years", "D) 5 years"],
    correct: "B",
    explanation: "Most states, including Wisconsin, use a 2-year incontestability period.",
    know_this: "Incontestability = 2 years standard. Fraud is still contestable after this period in many states.",
  },
  {
    id: 15,
    domain: "policy_provisions",
    difficulty: "medium",
    question: "The free-look period for a standard individual life policy in Wisconsin is:",
    options: ["A) 5 days", "B) 10 days", "C) 20 days", "D) 31 days"],
    correct: "B",
    explanation: "Wisconsin requires a 10-day free-look period for standard life policies (30 days for replacements).",
    know_this: "Free look = 10 days standard, 30 days for replacement. Full refund if returned.",
  },
  {
    id: 16,
    domain: "policy_provisions",
    difficulty: "hard",
    question: "Which nonforfeiture option provides the original face amount of coverage for a shortened period?",
    options: ["A) Reduced Paid-Up", "B) Extended Term", "C) Cash Surrender", "D) Automatic Premium Loan"],
    correct: "B",
    explanation: "Extended Term uses the cash value to purchase term insurance for the original face amount for as long as the value will support.",
    know_this: "Extended Term = same face, shorter period. Reduced Paid-Up = lower face, permanent coverage.",
  },
  {
    id: 17,
    domain: "policy_provisions",
    difficulty: "easy",
    question: "The Misstatement of Age clause allows an insurer to:",
    options: ["A) Cancel the policy", "B) Adjust the death benefit to what the premium would have purchased at the correct age", "C) Refund all premiums paid", "D) Sue the insured for fraud"],
    correct: "B",
    explanation: "Rather than voiding the policy, the insurer adjusts the benefit to what the paid premium would have purchased at the correct age.",
    know_this: "Misstatement of age → adjusted benefit, not policy cancellation.",
  },
  {
    id: 18,
    domain: "policy_provisions",
    difficulty: "medium",
    question: "Which dividend option uses dividends to purchase small additional amounts of paid-up whole life insurance?",
    options: ["A) Cash", "B) Reduction of Premium", "C) Paid-Up Additions", "D) Accumulate at Interest"],
    correct: "C",
    explanation: "Paid-Up Additions (PUAs) use dividends to buy small chunks of single-premium whole life, increasing both death benefit and cash value.",
    know_this: "PUAs = most popular dividend option. Grows death benefit and cash value tax-deferred.",
  },

  // ── Health Insurance ─────────────────────────────────────────────────────────
  {
    id: 4,
    domain: "health_insurance",
    difficulty: "medium",
    question: "Which managed care plan typically requires a primary care physician (PCP) and referrals to see specialists?",
    options: ["A) PPO", "B) HMO", "C) POS", "D) EPO"],
    correct: "B",
    explanation: "HMOs use a gatekeeper model with PCPs and required referrals. PPOs offer more flexibility without referrals.",
    know_this: "HMO = gatekeeper + referrals. PPO = flexibility + higher out-of-network cost.",
  },
  {
    id: 9,
    domain: "health_insurance",
    difficulty: "hard",
    question: "Under an Own-Occupation disability definition, benefits are paid if the insured cannot perform the duties of:",
    options: ["A) Any occupation", "B) Their own occupation", "C) A similar occupation", "D) Any occupation they are suited for by education"],
    correct: "B",
    explanation: "Own-Occupation is the most favorable definition for the insured — they receive benefits if they can't do their specific job.",
    know_this: "Own-Occ = broadest protection (most expensive). Any-Occ = narrower (cheaper for insurer).",
  },
  {
    id: 19,
    domain: "health_insurance",
    difficulty: "easy",
    question: "Medicare Part A primarily covers:",
    options: ["A) Physician services", "B) Prescription drugs", "C) Hospital and inpatient care", "D) Dental and vision"],
    correct: "C",
    explanation: "Medicare Part A covers inpatient hospital stays, skilled nursing facility care, hospice, and some home health care.",
    know_this: "Part A = Hospital. Part B = Medical (doctor visits). Part D = Drugs.",
  },
  {
    id: 20,
    domain: "health_insurance",
    difficulty: "medium",
    question: "COBRA allows a qualifying employee to continue group health coverage for up to:",
    options: ["A) 6 months", "B) 12 months", "C) 18 months", "D) 36 months"],
    correct: "C",
    explanation: "COBRA generally provides up to 18 months of continuation coverage for the employee (36 months for dependents in certain qualifying events).",
    know_this: "COBRA = 18 months for employee, up to 36 months for dependents (disability, divorce, death).",
  },
  {
    id: 21,
    domain: "health_insurance",
    difficulty: "hard",
    question: "A disability income policy with a 90-day elimination period means:",
    options: ["A) Benefits are paid immediately for 90 days", "B) No benefits are paid during the first 90 days of disability", "C) The policy expires after 90 days", "D) Premiums are waived for 90 days"],
    correct: "B",
    explanation: "The elimination period is a waiting period before benefits begin — functionally a deductible measured in time rather than dollars.",
    know_this: "Longer elimination period = lower premium. 90-day is common for long-term disability.",
  },
  {
    id: 22,
    domain: "health_insurance",
    difficulty: "medium",
    question: "Which of the following is NOT a qualifying event under HIPAA for special enrollment?",
    options: ["A) Marriage", "B) Birth of a child", "C) Voluntary resignation", "D) Loss of other coverage"],
    correct: "C",
    explanation: "Voluntary resignation is not a HIPAA qualifying event. Marriage, birth/adoption, and loss of coverage are qualifying events.",
    know_this: "HIPAA special enrollment: marriage, birth/adoption, loss of coverage. Voluntary quit = NOT qualifying.",
  },

  // ── Riders ───────────────────────────────────────────────────────────────────
  {
    id: 5,
    domain: "riders",
    difficulty: "hard",
    question: "An Accelerated Death Benefit rider typically allows access to what percentage of the death benefit while the insured is still living?",
    options: ["A) 25%", "B) 50%", "C) Up to 100% in some cases", "D) Only the cash value"],
    correct: "C",
    explanation: "Many modern ADB/Living Benefit riders allow access to a significant portion (sometimes up to 100%) of the death benefit for terminal, chronic, or critical illness.",
    know_this: "ADB is also called Living Needs Benefit. Not the same as a viatical settlement.",
  },
  {
    id: 10,
    domain: "riders",
    difficulty: "medium",
    question: "The Waiver of Premium rider typically becomes effective after the insured has been disabled for how long?",
    options: ["A) 30 days", "B) 90 days", "C) 6 months", "D) 1 year"],
    correct: "C",
    explanation: "Most Waiver of Premium riders have a 6-month elimination period before premiums are waived.",
    know_this: "Common waiting period for Waiver of Premium is 6 months.",
  },
  {
    id: 23,
    domain: "riders",
    difficulty: "easy",
    question: "A Guaranteed Insurability rider allows the insured to:",
    options: ["A) Convert term to whole life without evidence of insurability", "B) Purchase additional coverage at specified times without a medical exam", "C) Waive premiums during disability", "D) Receive a return of all premiums paid"],
    correct: "B",
    explanation: "The GI rider lets the insured buy additional life insurance at specific option dates without proving insurability.",
    know_this: "GI rider = buy more coverage at option dates, no medical questions. Great for young insureds.",
  },
  {
    id: 24,
    domain: "riders",
    difficulty: "medium",
    question: "A Return of Premium (ROP) rider on a term policy provides:",
    options: ["A) Return of cash value at surrender", "B) A refund of premiums if the insured outlives the term", "C) A waiver of future premiums", "D) Double the death benefit for accidental death"],
    correct: "B",
    explanation: "If the insured survives to the end of the term, the insurer returns all (or a portion of) premiums paid — at the cost of a higher premium.",
    know_this: "ROP rider = get premiums back if you outlive the term. Higher cost, but popular marketing feature.",
  },
  {
    id: 25,
    domain: "riders",
    difficulty: "hard",
    question: "Which rider pays an additional death benefit if death results from an accident?",
    options: ["A) Waiver of Premium", "B) Guaranteed Insurability", "C) Accidental Death Benefit (ADB)", "D) Cost of Living Adjustment (COLA)"],
    correct: "C",
    explanation: "The Accidental Death Benefit rider (also called double indemnity) pays an additional benefit — often equal to the face amount — if death is accidental.",
    know_this: "ADB/Double Indemnity = extra benefit for accidental death. Usually 1× or 2× the face amount.",
  },

  // ── Annuities ────────────────────────────────────────────────────────────────
  {
    id: 26,
    domain: "annuities",
    difficulty: "easy",
    question: "Which phase of an annuity is the period during which the contract grows in value?",
    options: ["A) Annuity phase", "B) Accumulation phase", "C) Distribution phase", "D) Surrender phase"],
    correct: "B",
    explanation: "The accumulation phase is when premiums are paid and the contract value grows, either tax-deferred (non-qualified) or with pre-tax contributions (qualified).",
    know_this: "Accumulation = growth phase. Annuity (distribution) phase = payout phase.",
  },
  {
    id: 27,
    domain: "annuities",
    difficulty: "medium",
    question: "A straight life annuity payout option provides income:",
    options: ["A) For a fixed number of years only", "B) For the annuitant's lifetime, with no further payments after death", "C) To the annuitant and then a survivor for life", "D) Until the account value is depleted"],
    correct: "B",
    explanation: "A straight life (life only) annuity pays for the annuitant's lifetime. Payments stop at death — even if only one payment was received.",
    know_this: "Straight life = highest monthly payment but no survivor benefit. Payments end at death.",
  },
  {
    id: 28,
    domain: "annuities",
    difficulty: "medium",
    question: "A Fixed Indexed Annuity (FIA) credits interest based on:",
    options: ["A) A fixed interest rate set by the insurer", "B) Performance of investment subaccounts", "C) A stock index, subject to a cap and floor", "D) The prime rate"],
    correct: "C",
    explanation: "FIAs link interest credits to an index (e.g., S&P 500) but use caps, participation rates, and spreads — and a 0% floor protects against index losses.",
    know_this: "FIA: upside from index, downside protected by 0% floor. Not a direct investment in the index.",
  },
  {
    id: 29,
    domain: "annuities",
    difficulty: "hard",
    question: "Annuity death benefits paid to a non-spouse beneficiary are:",
    options: ["A) Always income-tax free", "B) Subject to income tax on the gain above cost basis", "C) Subject to estate tax only", "D) Not taxable until age 59½"],
    correct: "B",
    explanation: "The gain (earnings above cost basis) in a non-qualified annuity is taxable as ordinary income to the beneficiary when distributed.",
    know_this: "Non-qualified annuity death benefit: principal (cost basis) is tax-free; gain is taxed as ordinary income.",
  },
  {
    id: 30,
    domain: "annuities",
    difficulty: "easy",
    question: "The primary purpose of an annuity is to:",
    options: ["A) Provide a death benefit to heirs", "B) Protect against outliving one's income", "C) Generate tax-free retirement income", "D) Fund a college savings plan"],
    correct: "B",
    explanation: "Annuities are designed to convert accumulated assets into a guaranteed income stream, protecting against longevity risk.",
    know_this: "Annuity = hedge against outliving money (longevity risk). Life insurance = hedge against dying too soon.",
  },

  // ── Regulations ──────────────────────────────────────────────────────────────
  {
    id: 6,
    domain: "regulations",
    difficulty: "medium",
    question: "Inducing a policyowner to replace an existing policy with a new one through misrepresentation is called:",
    options: ["A) Churning", "B) Twisting", "C) Rebating", "D) Sliding"],
    correct: "B",
    explanation: "Twisting involves misrepresentation to induce replacement. Churning is excessive replacements primarily for commission.",
    know_this: "Twisting = misrepresentation. Churning = volume of replacements for commission.",
  },
  {
    id: 11,
    domain: "regulations",
    difficulty: "easy",
    question: "Which of the following is prohibited under Wisconsin insurance law?",
    options: ["A) Twisting", "B) Rebating", "C) Churning", "D) All of the above"],
    correct: "D",
    explanation: "Twisting, churning, and rebating are all unfair trade practices prohibited in Wisconsin.",
    know_this: "All three (Twisting, Churning, Rebating) are prohibited unfair trade practices.",
  },
  {
    id: 31,
    domain: "regulations",
    difficulty: "medium",
    question: "Which entity licenses and regulates insurance agents in Wisconsin?",
    options: ["A) FINRA", "B) The Wisconsin OCI (Office of the Commissioner of Insurance)", "C) The NAIC", "D) The Federal Reserve"],
    correct: "B",
    explanation: "Insurance is regulated at the state level. In Wisconsin, the OCI oversees licensing, market conduct, and consumer protection.",
    know_this: "Insurance is state-regulated. Wisconsin OCI = Wisconsin's insurance regulator.",
  },
  {
    id: 32,
    domain: "regulations",
    difficulty: "hard",
    question: "An agent who accepts a commission from both the buyer and seller in the same transaction is known as a:",
    options: ["A) Broker", "B) Dual agent", "C) Surplus lines agent", "D) Managing general agent"],
    correct: "B",
    explanation: "A dual agent represents both parties and must disclose this relationship; it raises conflict-of-interest concerns.",
    know_this: "Dual agency = represent both parties. Must disclose. Creates conflict of interest.",
  },
  {
    id: 33,
    domain: "regulations",
    difficulty: "easy",
    question: "The concept of utmost good faith (uberrimae fidei) requires:",
    options: ["A) The insurer to pay all claims", "B) Both parties to disclose all material facts honestly", "C) The agent to always recommend the cheapest policy", "D) The insured to accept any policy offered"],
    correct: "B",
    explanation: "Insurance contracts require utmost good faith — both the insurer and insured must disclose all material facts affecting the risk.",
    know_this: "Uberrimae fidei = full disclosure from BOTH parties. Concealment or misrepresentation voids coverage.",
  },

  // ── Federal Tax ──────────────────────────────────────────────────────────────
  {
    id: 34,
    domain: "federal_tax",
    difficulty: "easy",
    question: "Life insurance death benefits paid to a named beneficiary are generally:",
    options: ["A) Subject to income tax", "B) Income-tax free", "C) Subject to capital gains tax", "D) Taxable as ordinary income"],
    correct: "B",
    explanation: "Under IRC §101(a), life insurance death benefits are generally excludable from the beneficiary's gross income.",
    know_this: "Death benefit = income-tax free to beneficiary. (Estate tax may still apply for large estates.)",
  },
  {
    id: 35,
    domain: "federal_tax",
    difficulty: "medium",
    question: "The transfer-for-value rule states that if a life insurance policy is transferred for valuable consideration, the death benefit in excess of the consideration paid is:",
    options: ["A) Still fully income-tax free", "B) Taxable as ordinary income", "C) Subject to gift tax only", "D) Exempt if the transfer is to a family member"],
    correct: "B",
    explanation: "The transfer-for-value rule removes the income-tax exclusion on the death benefit in excess of what was paid for the policy, with certain exceptions.",
    know_this: "Transfer-for-value = death benefit loses tax-free status (excess over price paid is taxable). Exceptions: transfers to insured, partner, or corporation.",
  },
  {
    id: 36,
    domain: "federal_tax",
    difficulty: "medium",
    question: "Policy loans taken from a life insurance policy are generally:",
    options: ["A) Taxable as ordinary income when taken", "B) Not taxable as long as the policy remains in force", "C) Subject to a 10% penalty if taken before age 59½", "D) Taxable only if used for personal expenses"],
    correct: "B",
    explanation: "Policy loans are not a taxable event as long as the policy remains in force. If the policy lapses or is surrendered with an outstanding loan, the loan becomes taxable income to the extent of gain.",
    know_this: "Policy loans = not taxable while policy is in force. Lapse with outstanding loan = taxable event.",
  },
  {
    id: 37,
    domain: "federal_tax",
    difficulty: "hard",
    question: "A Modified Endowment Contract (MEC) is created when:",
    options: ["A) Cash value exceeds the death benefit", "B) A policy fails the 7-pay test", "C) The insured reaches age 100", "D) Premiums are paid for fewer than 10 years"],
    correct: "B",
    explanation: "A policy becomes a MEC if premiums paid exceed the 7-pay limit in any of the first 7 years. MECs lose FIFO tax treatment; distributions are LIFO (gain first) and subject to a 10% penalty before age 59½.",
    know_this: "MEC = fails 7-pay test. Loses favorable loan/withdrawal tax treatment. Gain taxed first + 10% penalty before 59½.",
  },
  {
    id: 38,
    domain: "federal_tax",
    difficulty: "easy",
    question: "Employer-paid group life insurance is income-tax free to the employee for coverage up to:",
    options: ["A) $25,000", "B) $50,000", "C) $100,000", "D) Unlimited"],
    correct: "B",
    explanation: "Under IRC §79, the cost of the first $50,000 of employer-paid group life coverage is excluded from the employee's gross income.",
    know_this: "§79 exclusion = first $50,000 of group life is tax-free. Cost of coverage over $50,000 is imputed income.",
  },

  // ── Qualified Plans ──────────────────────────────────────────────────────────
  {
    id: 39,
    domain: "qualified_plans",
    difficulty: "easy",
    question: "Contributions to a traditional 401(k) plan are made with:",
    options: ["A) After-tax dollars", "B) Pre-tax dollars", "C) Tax-free dollars that never get taxed", "D) Dollars matched 2-for-1 by the IRS"],
    correct: "B",
    explanation: "Traditional 401(k) contributions are pre-tax, reducing current taxable income. Withdrawals in retirement are taxed as ordinary income.",
    know_this: "Traditional 401(k)/IRA = pre-tax contributions, taxed at withdrawal. Roth = after-tax, tax-free at withdrawal.",
  },
  {
    id: 40,
    domain: "qualified_plans",
    difficulty: "medium",
    question: "Required Minimum Distributions (RMDs) from a traditional IRA must begin by:",
    options: ["A) Age 59½", "B) Age 65", "C) April 1 of the year following the year the account owner turns 73", "D) The year the account owner retires"],
    correct: "C",
    explanation: "Under SECURE Act 2.0 (2023), the RMD starting age was increased to 73. The first RMD can be deferred until April 1 of the following year.",
    know_this: "RMD age = 73 (per SECURE 2.0). Roth IRAs have NO RMDs during the owner's lifetime.",
  },
  {
    id: 41,
    domain: "qualified_plans",
    difficulty: "hard",
    question: "A Section 412(e)(3) plan is a type of defined benefit plan funded exclusively by:",
    options: ["A) Mutual funds", "B) Annuity contracts and/or life insurance", "C) Government bonds", "D) Employer stock"],
    correct: "B",
    explanation: "412(e)(3) plans (formerly 412(i)) are fully insured defined benefit plans funded solely by guaranteed insurance contracts.",
    know_this: "412(e)(3) = fully insured DB plan using annuities/life insurance. Guaranteed benefits, no investment risk.",
  },
  {
    id: 42,
    domain: "qualified_plans",
    difficulty: "medium",
    question: "A SEP-IRA is designed primarily for:",
    options: ["A) Employees of large corporations", "B) Self-employed individuals and small business owners", "C) Government employees", "D) Non-profit organization employees"],
    correct: "B",
    explanation: "Simplified Employee Pension (SEP) IRAs allow self-employed individuals and small businesses to make tax-deductible contributions up to 25% of compensation.",
    know_this: "SEP-IRA = self-employed/small business. High contribution limit (25% of comp or IRS max). Employer-only contributions.",
  },
  {
    id: 43,
    domain: "qualified_plans",
    difficulty: "easy",
    question: "Which qualified plan feature requires an employer to contribute to all eligible employees' accounts regardless of whether employees contribute?",
    options: ["A) Matching contribution", "B) Profit-sharing contribution", "C) Non-elective contribution", "D) Vesting schedule"],
    correct: "C",
    explanation: "Non-elective contributions are employer contributions made to all eligible employees whether or not the employee contributes — common in SIMPLE IRAs and safe-harbor 401(k)s.",
    know_this: "Non-elective = employer must contribute to ALL eligible employees. Matching = only for employees who contribute.",
  },
];

/**
 * Get Wisconsin (or general) insurance regulation
 */
export function getInsuranceRegulation(state: string, topic: string): RegulationResult {
  const normalizedState = state.toLowerCase();
  const normalizedTopic = topic.toLowerCase();

  if (normalizedState === "wisconsin" && WI_REGULATIONS[normalizedTopic]) {
    const data = WI_REGULATIONS[normalizedTopic];
    return {
      state: "Wisconsin",
      topic: normalizedTopic,
      value: data.days || data.years || null,
      details: data.details,
      exam_note: data.exam_note,
      source: "Wisconsin OCI (simulated)",
    };
  }

  return {
    state,
    topic: normalizedTopic,
    value: null,
    details: "General NAIC guidance applies. Verify with current state DOI.",
    exam_note: "State variations exist — always confirm with official sources for the exam.",
    source: "NAIC Model + Simulator",
  };
}

/**
 * Generate practice questions
 */
export function generatePracticeQuestions(
  domains: string[],
  count: number = 6,
  difficulty: string = "mixed",
  state: string = "Wisconsin"
): Question[] {
  let pool = SAMPLE_QUESTIONS.filter(q => domains.includes(q.domain));

  if (pool.length === 0) pool = SAMPLE_QUESTIONS;

  if (difficulty !== "mixed") {
    const filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }

  const selected = pool.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, pool.length));

  return selected.map(q => ({
    ...q,
    metadata: {
      generated_for_state: state,
      exam_weight: DOMAIN_WEIGHTS[q.domain] || 0.2,
      recommended_review: q.know_this,
      passpro_tags: [q.domain, q.difficulty],
    },
  }));
}

/**
 * Analyze quiz results and return readiness metrics
 */
export function analyzeReadiness(
  quizResults: { overall_score?: number; domain_scores: Record<string, number> },
  examDate?: string,
  previousReadiness?: number
): ReadinessAnalysis {
  const overall = quizResults.overall_score || 50;
  const domainScores = quizResults.domain_scores || {};

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(domainScores).forEach(([domain, score]) => {
    const weight = DOMAIN_WEIGHTS[domain] || 0.2;
    weightedScore += score * weight;
    totalWeight += weight;
  });

  const newReadiness = totalWeight > 0 
    ? Math.round((weightedScore / totalWeight) * 10) / 10 
    : overall;

  const weakDomains = Object.entries(domainScores)
    .filter(([_, score]) => score < 55)
    .map(([domain]) => domain);

  const priorityDomains = Object.entries(domainScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([d]) => d);

  const recommendations: string[] = [];
  if (weakDomains.includes("riders")) recommendations.push("Focus on Accelerated Death Benefit and Waiver of Premium triggers");
  if (weakDomains.includes("health_insurance")) recommendations.push("Review HMO vs PPO differences and Medicare Parts A-D");
  if (weakDomains.includes("policy_provisions")) recommendations.push("Master grace period, free look, and incontestability by state");

  if (recommendations.length === 0) {
    recommendations.push("Continue balanced review with emphasis on identified weak domains");
  }

  const result: ReadinessAnalysis = {
    previous_readiness: previousReadiness ?? null,
    new_readiness: newReadiness,
    change: previousReadiness ? Math.round((newReadiness - previousReadiness) * 10) / 10 : 0,
    domain_breakdown: domainScores,
    weak_domains: weakDomains,
    priority_domains: priorityDomains,
    recommendations,
    next_actions: [
      "Review explanations for missed questions",
      "Schedule targeted practice on weak domains this week",
      "Run a full timed simulation in 7–10 days",
    ],
    analyzed_at: new Date().toISOString(),
  };

  if (examDate) {
    const exam = new Date(examDate);
    const daysLeft = Math.max(Math.ceil((exam.getTime() - Date.now()) / (1000 * 3600 * 24)), 0);
    result.days_until_exam = daysLeft;
    result.study_intensity = daysLeft < 21 ? "High" : daysLeft < 45 ? "Medium" : "Standard";
  }

  return result;
}

/**
 * Create a personalized study schedule
 */
export function createStudySchedule(
  examDate: string,
  currentReadiness: number = 50,
  weakDomains: string[] = [],
  dailyMinutes: number = 45
): StudySchedule {
  const exam = new Date(examDate);
  const today = new Date();
  const daysUntilExam = Math.max(Math.ceil((exam.getTime() - today.getTime()) / (1000 * 3600 * 24)), 1);

  const schedule = [];
  const focusAreas = weakDomains.length > 0 ? weakDomains : ["policy_provisions", "riders"];

  for (let day = 0; day < Math.min(daysUntilExam, 45); day++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + day);

    let focus = [...focusAreas];
    if (day > 10) focus = ["life_types", "annuities", "regulations"];
    if (day > 20) focus = ["mixed_review", "full_simulation"];

    const event = [9, 19, 28].includes(day) ? "Full Timed Simulation + Review" : "Study Block";

    schedule.push({
      day: day + 1,
      date: currentDay.toISOString().split("T")[0],
      focus_domains: focus,
      minutes: dailyMinutes,
      event,
      spaced_repetition: day % 3 === 0,
    });
  }

  return {
    exam_date: examDate,
    days_until_exam: daysUntilExam,
    starting_readiness: currentReadiness,
    target_readiness: 85,
    daily_minutes: dailyMinutes,
    weak_domains_focus: weakDomains,
    schedule,
    generated_at: new Date().toISOString(),
    notes: "Adjust daily_minutes based on your schedule. Re-run analysis after major assessments.",
  };
}
