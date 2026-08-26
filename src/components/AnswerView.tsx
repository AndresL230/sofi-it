import { cardsFor, footerText, verdictFor, type CardInfo, type Goal, type Mode } from "../lib/coach";
import { CardRow } from "./CardRow";
import { Money } from "./Money";

export interface AnswerHandlers {
  onHome: () => void;
  onToggleExpand: () => void;
  onHold: () => void;
  onSkipDay: () => void;
  onBuy: () => void;
  onLetGo: () => void;
  onTrackLisbon: () => void;
}

interface Props extends AnswerHandlers {
  mode: Mode;
  amount: number;
  goal: Goal | null;
  expand: boolean;
  held: boolean;
  reask: boolean;
  demoControls: boolean;
}

const rise = (delay: number) => ({ animation: `riseIn .45s ${delay}s both` });

export function AnswerView(p: Props) {
  const verdict = verdictFor(p.mode, p.goal);
  const cards = cardsFor(p.mode);

  return (
    <div>
      <button type="button" className="link back-link" onClick={p.onHome}>
        ← Insights
      </button>

      {verdict && (
        <div className="banner" style={{ background: verdict.bg }}>
          <div className="banner__text">
            <b style={{ color: verdict.ink }}>{verdict.word}</b> {verdict.clause}
          </div>
          <Money amount={p.amount} className="banner__amt" />
        </div>
      )}

      {p.mode === 1 && (
        <QuickCheck goal={p.goal} cards={cards} expand={p.expand} onToggleExpand={p.onToggleExpand} />
      )}
      {p.mode === 2 && (
        <Considered
          cards={cards}
          held={p.held}
          reask={p.reask}
          demoControls={p.demoControls}
          onHold={p.onHold}
          onSkipDay={p.onSkipDay}
          onBuy={p.onBuy}
          onLetGo={p.onLetGo}
        />
      )}
      {p.mode === 3 && <Plan amount={p.amount} onTrackLisbon={p.onTrackLisbon} />}

      <div className="footer-note">{footerText(p.mode, p.goal)}</div>
    </div>
  );
}

/* ---------- S1: Quick check ---------- */
function QuickCheck({
  goal,
  cards,
  expand,
  onToggleExpand,
}: {
  goal: Goal | null;
  cards: CardInfo[];
  expand: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="quick">
      <div className="card card--md" style={rise(0.08)}>
        <div className="rec">
          <div className="card-flat card-flat--amex" aria-hidden="true">
            AMEX GOLD
          </div>
          <div className="rec__text">
            <b>Amex Gold</b> — 4x points ≈ <span className="text-green">$4.80 back</span> — and it clears your
            unused <b>$10 dining credit</b>. +$3.60 vs your Meridian 2%.
          </div>
        </div>
        <button type="button" className="link link--sm expand-link" onClick={onToggleExpand} aria-expanded={expand}>
          {expand ? "Hide cards" : "See all cards"}
        </button>
        {expand && cards.map((c) => <CardRow key={c.name} card={c} />)}
      </div>

      <div className="card card--md budget" style={rise(0.14)}>
        <div className="budget__head">
          <b>Dining this month</b>
          <span>$410 of $550 usual</span>
        </div>
        <div className="budget__track" aria-hidden="true">
          <div className="budget__spent" />
          <div className="budget__pending" />
          <div className="budget__usual" />
        </div>
        <div className="budget__note">12 days left · pace says you finish ≈ $585, about $35 over usual.</div>
      </div>

      {goal && (
        <div className="goal-nudge" style={rise(0.2)}>
          ✦ This pushes Lisbon back ~2 days. Skip one dinner this week to stay on pace.
        </div>
      )}

      <div className="summary" style={rise(0.22)}>
        Say yes and dining runs about $35 hot this month — nothing else moves.
      </div>
    </div>
  );
}

/* ---------- S2: Considered ---------- */
function Considered({
  cards,
  held,
  reask,
  demoControls,
  onHold,
  onSkipDay,
  onBuy,
  onLetGo,
}: {
  cards: CardInfo[];
  held: boolean;
  reask: boolean;
  demoControls: boolean;
  onHold: () => void;
  onSkipDay: () => void;
  onBuy: () => void;
  onLetGo: () => void;
}) {
  const showHold = !held && !reask;
  const showHeld = held && !reask;

  return (
    <div className="considered">
      <div className="stack">
        <div className="card card--md" style={rise(0.08)}>
          <div className="section-title">Which card</div>
          {cards.map((c) => (
            <CardRow key={c.name} card={c} />
          ))}
        </div>
        <div className="card protection" style={rise(0.14)}>
          <span>
            <b>✓</b> Purchase protection: 120 days (Amex Gold)
          </span>
          <span>·</span>
          <span>
            <b>✓</b> Return protection: 90 days (Amex Gold)
          </span>
          <span>·</span>
          <span>No extended-warranty relevance.</span>
        </div>
      </div>

      <div className="stack">
        <div className="card card--md" style={rise(0.18)}>
          <div className="beat__title">Worth a beat</div>
          <div className="beat__p">3rd apparel purchase this quarter ($95 sneakers, $120 boots).</div>
          <div className="beat__p">
            Your boots have worked out to ≈ $8/wear so far. At that rate these are fine; at 3 wears they're
            $47/wear.
          </div>
        </div>

        <div className="card card--md" style={rise(0.24)}>
          {showHold && (
            <button type="button" className="btn-outline" onClick={onHold}>
              Hold it for 24 hours — I'll re-ask you tomorrow.
            </button>
          )}
          {showHeld && (
            <>
              <div className="held">Held. Ask me tomorrow.</div>
              {demoControls && (
                <button type="button" className="demo-skip" onClick={onSkipDay}>
                  ⏭ demo: skip to tomorrow
                </button>
              )}
            </>
          )}
          {reask && (
            <>
              <div className="reask__q">Still want the $140 running shoes?</div>
              <div className="reask__p">Nothing about the answer changed — still fine, Meridian 2% still the card.</div>
              <div className="reask__actions">
                <button type="button" className="btn-buy" onClick={onBuy}>
                  Buy it
                </button>
                <button type="button" className="btn-ghost" onClick={onLetGo}>
                  Let it go
                </button>
              </div>
            </>
          )}
        </div>

        <div className="summary" style={rise(0.28)}>
          This is a want, not a leak — your shopping category is under usual even with it.
        </div>
      </div>
    </div>
  );
}

/* ---------- S3: Plan ---------- */
function Plan({ amount, onTrackLisbon }: { amount: number; onTrackLisbon: () => void }) {
  return (
    <div className="plan">
      <div className="plan__head" style={rise(0.05)}>
        <h2>Not today — but here's the path.</h2>
        <Money amount={amount} className="plan__amt" />
      </div>

      <div className="card timeline-card" style={rise(0.1)}>
        <div className="timeline" role="img" aria-label="Affordability timeline: today to about April 18">
          <div className="timeline__fill" />
          <div className="timeline__dot timeline__dot--today" />
          <div className="timeline__label timeline__label--today">Today</div>
          <div className="timeline__tick" style={{ left: "12%" }} />
          <div className="timeline__tick" style={{ left: "24%" }} />
          <div className="timeline__tick" style={{ left: "36%" }} />
          <div className="timeline__paydays">paydays · biweekly $2,610</div>
          <div className="timeline__dot timeline__dot--redirect" />
          <div className="timeline__label timeline__label--redirect">Mar 27 — with $180/mo redirect</div>
          <div className="timeline__dot timeline__dot--full" />
          <div className="timeline__label timeline__label--full">Affordable in full: ~Apr 18</div>
        </div>
      </div>

      <div className="options" style={rise(0.16)}>
        <div className="card card--goal">
          <div className="option__title">Save on pace</div>
          <div className="option__p">$125/wk from checking · arrives mid-April · $0 interest · no changes to how you live.</div>
          <div className="option__tradeoff">Tradeoff: you book later, and March fares may move.</div>
        </div>
        <div className="card card--goal">
          <div className="option__title">Tighten &amp; make March</div>
          <div className="option__p">Dining to $460 + entertainment to $80 = $180/mo redirected.</div>
          <div className="option__tradeoff">Tradeoff: about two fewer dinners out a month until March.</div>
        </div>
      </div>

      <div className="card card--goal card--points" style={rise(0.22)}>
        <div className="option__title">Points &amp; credits can shrink this</div>
        <div className="option__p">
          48,000 Chase UR → transfer to Iberia ≈ covers a $530 leg. Amex $10 dining credits ×2 remaining this
          quarter. <b>Real out-of-pocket: ≈ $670</b>, which moves "affordable in full" to ~Mar 21.
        </div>
      </div>

      <div className="card card--sapphire" style={rise(0.26)}>
        <div className="card-flat card-flat--sapphire" aria-hidden="true">
          SAPPHIRE PREFERRED
        </div>
        <p>
          <b>Sapphire Preferred for this one</b> — 2x travel plus trip delay/cancellation protection. On a big trip,
          that protection is worth more than the small points gap vs your 2% card.
        </p>
      </div>

      <button type="button" className="btn-purple" style={rise(0.3)} onClick={onTrackLisbon}>
        ✦ Track Lisbon as a goal
      </button>
    </div>
  );
}
