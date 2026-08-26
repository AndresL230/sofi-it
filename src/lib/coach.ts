// Domain logic ported from the Claude Design prototype (Purchase Coach.dc.html).
// Everything here is mocked demo data — swap for real API calls later.

export type View = "home" | "answer" | "goals";
export type Mode = 0 | 1 | 2 | 3;
export type Range = "3M" | "6M" | "YTD" | "1Y" | "ALL";

export interface Goal {
  name: string;
  target: number;
  saved: number;
  by: string;
  weekly: number;
}

export interface Query {
  amount: number;
  mode: Mode;
  label: string;
}

export interface Verdict {
  word: string;
  clause: string;
  bg: string;
  ink: string;
}

export interface CardInfo {
  name: string;
  back: string;
  reason: string;
  delta?: string;
  badge?: string;
  badgeBg: string;
  badgeInk: string;
  art: string;
  art2: string;
  last4: string;
  short: string;
  winner: boolean;
  dim: boolean;
  bg: string;
  shadow: string;
  opacity: number;
  backColor: string;
}

export const RANGES: Range[] = ["3M", "6M", "YTD", "1Y", "ALL"];

export const CHART_PATHS: Record<Range, string> = {
  "3M": "M0,40 C40,44 70,30 110,34 C160,39 200,20 240,24 C270,27 285,14 300,12",
  "6M": "M0,52 C45,48 80,56 120,44 C160,32 190,40 225,28 C260,17 280,20 300,10",
  YTD: "M0,58 C50,50 90,54 130,40 C170,26 210,34 250,22 C275,15 288,16 300,10",
  "1Y": "M0,62 C40,58 90,44 140,48 C190,52 230,28 265,20 C282,16 292,13 300,9",
  ALL: "M0,68 C50,62 100,52 150,44 C200,36 250,24 300,8",
};

export const TXNS = [
  { ic: "DG", name: "Daily Grind Coffee", cat: "Dining", amt: "−$6.75" },
  { ic: "HM", name: "Harvest Market", cat: "Groceries", amt: "−$54.20" },
  { ic: "CT", name: "City Transit", cat: "Transport", amt: "−$2.40" },
  { ic: "SC", name: "Sunset Cinema", cat: "Entertainment", amt: "−$32.00" },
];

export const CHIPS = ["$60 dinner", "$140 running shoes", "$1,200 flight to Lisbon in March"];

export function tenWeeks(): string {
  return new Date(Date.now() + 70 * 864e5).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function lisbonGoal(): Goal {
  return { name: "Lisbon trip", target: 2400, saved: 1150, by: tenWeeks(), weekly: 125 };
}

export function parseQuery(text: string): Query | null {
  const m = text.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/);
  const amount = m ? parseFloat(m[1].replace(/,/g, "")) : 0;
  if (!amount) return null;
  const t = text.toLowerCase();
  let mode: Mode;
  if (/dinner|coffee|lunch|uber|brunch|drink|takeout|restaurant/.test(t)) mode = 1;
  else if (/shoe|sneaker|monitor|ticket|clothes|jacket|headphone|boot/.test(t)) mode = 2;
  else if (/flight|trip|laptop|move|vacation|hotel/.test(t)) mode = 3;
  else mode = amount < 100 ? 1 : amount <= 500 ? 2 : 3;
  return { amount, mode, label: text.trim() };
}

export function splitAmount(amount: number): { whole: string; cents: string } {
  const whole = "$" + Math.round(amount).toLocaleString("en-US");
  const cents = amount % 1 ? String(Math.round((amount % 1) * 100)).padStart(2, "0") : "00";
  return { whole, cents };
}

type BadgeTone = "gold" | "salmon" | "gray";
const BADGES: Record<BadgeTone, { bg: string; ink: string }> = {
  gold: { bg: "#F5CE6E", ink: "#5C4405" },
  salmon: { bg: "#F4DCD6", ink: "#B4483A" },
  gray: { bg: "#E6E3EA", ink: "#53565A" },
};

const ART: Record<string, { a: string; b: string; l4: string; net: string }> = {
  "Meridian Unlimited 2%": { a: "#0E8FA8", b: "#065E71", l4: "··4021", net: "2% EVERYTHING" },
  "Amex Gold": { a: "#D9B457", b: "#A87F2A", l4: "··1005", net: "GOLD" },
  "Citi Custom Cash": { a: "#9A9DA3", b: "#63666C", l4: "··8834", net: "CUSTOM CASH" },
  "Sapphire Preferred": { a: "#2A2F5E", b: "#14173A", l4: "··5512", net: "SAPPHIRE" },
  "Freedom Unlimited": { a: "#4E6E8E", b: "#2E4258", l4: "··7290", net: "FREEDOM" },
};

interface RawCard {
  name: string;
  back: string;
  reason: string;
  delta?: string;
  badge?: string;
  bt?: BadgeTone;
  winner?: boolean;
  dim?: boolean;
}

function mk(c: RawCard): CardInfo {
  const A = ART[c.name];
  const winner = !!c.winner;
  return {
    name: c.name,
    back: c.back,
    reason: c.reason,
    delta: c.delta,
    badge: c.badge,
    badgeBg: c.bt ? BADGES[c.bt].bg : "",
    badgeInk: c.bt ? BADGES[c.bt].ink : "",
    art: A.a,
    art2: A.b,
    last4: A.l4,
    short: A.net,
    winner,
    dim: !!c.dim,
    opacity: c.dim ? 0.6 : 1,
    bg: winner ? "#fff" : "#FAFAF9",
    shadow: winner ? "inset 3px 0 0 #0E8FA8, 0 4px 16px rgba(14,143,168,.16)" : "none",
    backColor: winner ? "#0E9E5F" : "#1A1A1C",
  };
}

const CAP_BADGE = "5% cap reached — $13 of $500 left";

export function cardsFor(mode: Mode): CardInfo[] {
  if (mode === 1)
    return ([
      { name: "Amex Gold", back: "$4.80", reason: "4x points ≈ $4.80 back — and it clears your unused $10 dining credit. +$3.60 vs your Meridian 2%.", winner: true },
      { name: "Sapphire Preferred", back: "$1.80", delta: "−$3.00 vs best", reason: "3x dining — no credit to clear" },
      { name: "Meridian Unlimited 2%", back: "$1.20", delta: "−$3.60 vs best", reason: "Flat 2%, your default card" },
      { name: "Freedom Unlimited", back: "$0.90", delta: "−$3.90 vs best", reason: "1.5% flat" },
      { name: "Citi Custom Cash", back: "—", reason: "5% top category (dining)", badge: CAP_BADGE, bt: "gold", dim: true },
    ] as RawCard[]).map(mk);
  if (mode === 2)
    return ([
      { name: "Meridian Unlimited 2%", back: "$2.80", reason: "Flat 2% — no bonus category applies to apparel. Simple and best.", winner: true },
      { name: "Freedom Unlimited", back: "$2.10", delta: "−$0.70 vs best", reason: "1.5% flat", badge: "Would hit 34% utilization — pay before statement close (the 12th)", bt: "salmon" },
      { name: "Amex Gold", back: "$1.40", delta: "−$1.40 vs best", reason: "1x here", badge: "no bonus category", bt: "gray" },
      { name: "Sapphire Preferred", back: "$1.40", delta: "−$1.40 vs best", reason: "1x here", badge: "no bonus category", bt: "gray" },
      { name: "Citi Custom Cash", back: "—", reason: "Top category is dining this month", badge: CAP_BADGE, bt: "gold", dim: true },
    ] as RawCard[]).map(mk);
  return ([
    { name: "Sapphire Preferred", back: "$24.00", reason: "2x travel + trip delay/cancellation protection — worth more than the points gap on a big trip.", winner: true },
    { name: "Meridian Unlimited 2%", back: "$24.00", delta: "same $ back, no protection", reason: "Flat 2% — but no travel protection on a $1,200 booking" },
    { name: "Freedom Unlimited", back: "$18.00", delta: "−$6.00 vs best", reason: "1.5% flat", badge: "Would push utilization past 30%", bt: "salmon" },
    { name: "Amex Gold", back: "$12.00", delta: "−$12.00 vs best", reason: "1x on airfare booked direct", badge: "no bonus category", bt: "gray" },
    { name: "Citi Custom Cash", back: "—", reason: "Top category is dining this month", badge: CAP_BADGE, bt: "gold", dim: true },
  ] as RawCard[]).map(mk);
}

export function verdictFor(mode: Mode, goal: Goal | null): Verdict | null {
  if (mode === 1)
    return goal
      ? { word: "Tight.", clause: "Doable — but it's Lisbon money now.", bg: "linear-gradient(90deg,#FBEFD2,#F7E0DA)", ink: "#B4483A" }
      : { word: "Fine.", clause: "Dining has room this month.", bg: "#E2F2F6", ink: "#0B7288" };
  if (mode === 2)
    return {
      word: "Fine, with a caveat.",
      clause: "$612 of discretionary room left before your next paycheck (Fri) after rent and subscriptions.",
      bg: "#E2F2F6",
      ink: "#0B7288",
    };
  return null;
}

export function footerText(mode: Mode, goal: Goal | null): string {
  const g = goal ? (mode === 1 ? " · Lisbon −2 days" : " · Lisbon unchanged") : "";
  if (mode === 1) return "If you buy: checking $3,180 · Amex Gold → $350 · Dining $470 of $550 usual" + g;
  if (mode === 2) return "If you buy: checking $3,100 · Meridian 2% → $480 · Shopping $355 of $250 usual" + g;
  return "If you buy today: checking $2,040 · Sapphire Preferred → $1,820 · Travel $1,200 this month" + g;
}

export function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US");
}
