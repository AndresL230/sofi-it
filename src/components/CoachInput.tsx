import { CHIPS, fmtUsd, type Goal } from "../lib/coach";

interface Props {
  query: string;
  loading: boolean;
  goal: Goal | null;
  onQuery: (v: string) => void;
  onSubmit: (text: string) => void;
  onGoals: () => void;
}

export function CoachInput({ query, loading, goal, onQuery, onSubmit, onGoals }: Props) {
  return (
    <>
      <div className="insights-head">
        <h1>My financial insights</h1>
        <div className="quick-actions">
          <button type="button" className="quick-action">
            <div className="quick-action__icon quick-action__icon--plus">+</div>
            <div className="quick-action__label">Add</div>
          </button>
          <button type="button" className="quick-action">
            <div className="quick-action__icon">⌕</div>
            <div className="quick-action__label">Search</div>
          </button>
          <button type="button" className="quick-action">
            <div className="quick-action__icon quick-action__icon--gear">⚙</div>
            <div className="quick-action__label">Manage</div>
          </button>
        </div>
      </div>

      <section className="card coach" aria-label="Purchase coach">
        <div className="coach__head">
          <div>
            <div className="coach__title">About to buy something?</div>
            <div className="coach__sub">Check it before you swipe.</div>
          </div>
          <div className="coach__actions">
            {goal && (
              <button type="button" className="goal-pill" onClick={onGoals}>
                ✦ {goal.name.split(" ")[0]} · {fmtUsd(goal.saved)} of {fmtUsd(goal.target)}
              </button>
            )}
            <button type="button" className="link" onClick={onGoals}>
              Goals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="shimmer" aria-busy="true">
            Reading your accounts…
          </div>
        ) : (
          <form
            className="coach__form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(query);
            }}
          >
            <input
              className="coach__input"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder='Try "$60 dinner" or "$1,200 flight to Lisbon in March"'
              aria-label="What are you about to buy?"
            />
            <button type="submit" className="btn-primary">
              Check
            </button>
          </form>
        )}

        <div className="chips">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => onSubmit(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
