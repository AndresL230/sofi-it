import { fmtUsd, tenWeeks, type Goal } from "../lib/coach";

export interface GoalForm {
  name: string;
  target: string;
  date: string;
  monthly: string;
}

interface Props {
  goal: Goal | null;
  form: GoalForm;
  onForm: (patch: Partial<GoalForm>) => void;
  onHome: () => void;
  onDelete: () => void;
  onAddSuggested: () => void;
  onAddFromForm: () => void;
}

export function GoalsView({ goal, form, onForm, onHome, onDelete, onAddSuggested, onAddFromForm }: Props) {
  return (
    <div className="goals">
      <button type="button" className="link back-link" onClick={onHome}>
        ← Insights
      </button>
      <h1>Goals</h1>

      {goal ? (
        <div className="card card--goal goal-card">
          <div className="goal-card__head">
            <div className="goal-card__name">✦ {goal.name}</div>
            <span className="pill-ok">on track</span>
          </div>
          <div
            className="goal-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal.target}
            aria-valuenow={goal.saved}
          >
            <div className="goal-track__fill" style={{ width: `${Math.round((goal.saved / goal.target) * 100)}%` }} />
          </div>
          <div className="goal-meta">
            <span>
              {fmtUsd(goal.saved)} of {fmtUsd(goal.target)} · vault
            </span>
            <span>by {goal.by}</span>
          </div>
          <div className="goal-pace">${goal.weekly}/week keeps you on pace.</div>
          <button type="button" className="link link--danger" onClick={onDelete}>
            Stop tracking
          </button>
        </div>
      ) : (
        <>
          <div className="card empty">Nothing tracked yet.</div>
          <div className="suggest">
            <div className="suggest__text">
              <b>✦ Lisbon trip — $2,400 by {tenWeeks()}</b>
              <br />
              <span className="suggest__sub">$1,150 already in your vault.</span>
            </div>
            <button type="button" className="btn-track" onClick={onAddSuggested}>
              Track it
            </button>
          </div>
          <form
            className="card card--goal add-goal"
            onSubmit={(e) => {
              e.preventDefault();
              onAddFromForm();
            }}
          >
            <div className="add-goal__title">Add a goal</div>
            <div className="add-goal__grid">
              <input className="field" value={form.name} onChange={(e) => onForm({ name: e.target.value })} placeholder="Name" aria-label="Goal name" />
              <input className="field" value={form.target} onChange={(e) => onForm({ target: e.target.value })} placeholder="Target $" aria-label="Target amount" inputMode="decimal" />
              <input className="field" value={form.date} onChange={(e) => onForm({ date: e.target.value })} placeholder="Target date" aria-label="Target date" />
              <input className="field" value={form.monthly} onChange={(e) => onForm({ monthly: e.target.value })} placeholder="Monthly $ (optional)" aria-label="Monthly contribution" inputMode="decimal" />
            </div>
            <button type="submit" className="btn-submit">
              Track goal
            </button>
          </form>
        </>
      )}
    </div>
  );
}
