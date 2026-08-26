import { CHART_PATHS, RANGES, TXNS, type Range } from "../lib/coach";

interface Props {
  range: Range;
  onRange: (r: Range) => void;
}

const BARS = [
  { label: "May", h: 74 },
  { label: "Jun", h: 82 },
  { label: "Jul", h: 70 },
  { label: "Aug", h: 58, current: true },
];

export function HomeView({ range, onRange }: Props) {
  return (
    <div className="home-grid">
      <section className="card card--lg" aria-label="Net worth">
        <div className="stat__label">Net worth</div>
        <div className="stat__value">
          $18,412<sup className="sup">06</sup>
        </div>
        <div className="stat__delta">▲ $1,240 past 6 months</div>
        <svg viewBox="0 0 300 72" className="sparkline" aria-hidden="true">
          <path d={CHART_PATHS[range]} fill="none" stroke="#0E8FA8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="ranges" role="tablist" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              className={`range${r === range ? " is-active" : ""}`}
              onClick={() => onRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="accounts">
          <div className="account-row">
            <span>
              Cash <span className="account-row__count">· 2</span>
            </span>
            <span className="account-row__amt">
              $12,140 <span className="chev">›</span>
            </span>
          </div>
          <div className="account-row">
            <span>
              Credit cards <span className="account-row__count">· 5</span>
            </span>
            <span className="account-row__amt is-neg">
              −$2,680 <span className="chev">›</span>
            </span>
          </div>
          <div className="account-row">
            <span>
              Investments <span className="account-row__count">· 1</span>
            </span>
            <span className="account-row__amt">
              $8,952 <span className="chev">›</span>
            </span>
          </div>
        </div>
        <button type="button" className="link">
          View more
        </button>
      </section>

      <section className="card card--lg" aria-label="Spending">
        <div className="stat__label">Spending</div>
        <div className="stat__value">
          $2,340<sup className="sup">44</sup>
        </div>
        <div className="stat__note">this month so far</div>
        <div className="bars" aria-hidden="true">
          {BARS.map((b) => (
            <div key={b.label} className={`bar${b.current ? " is-current" : ""}`}>
              <div className="bar__fill" style={{ height: b.h }} />
              <div className="bar__label">{b.label}</div>
            </div>
          ))}
        </div>
        <div className="txns">
          {TXNS.map((t) => (
            <div key={t.name} className="txn">
              <div className="txn__avatar">{t.ic}</div>
              <div className="txn__body">
                <div className="txn__name">{t.name}</div>
                <div className="txn__acct">Checking ··4021</div>
              </div>
              <div className="txn__cat">{t.cat}</div>
              <div className="txn__amt">{t.amt}</div>
              <div className="chev">›</div>
            </div>
          ))}
        </div>
        <button type="button" className="link view-more">
          View all transactions
        </button>
      </section>
    </div>
  );
}
