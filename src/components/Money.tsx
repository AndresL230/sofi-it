import { splitAmount } from "../lib/coach";

export function Money({ amount, className }: { amount: number; className?: string }) {
  const { whole, cents } = splitAmount(amount);
  return (
    <div className={className}>
      {whole}
      <sup className="sup">{cents}</sup>
    </div>
  );
}
