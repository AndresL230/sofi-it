import { useCallback, useEffect, useRef, useState } from "react";
import { lisbonGoal, parseQuery, tenWeeks, type Goal, type Mode, type Range, type View } from "./lib/coach";
import { Nav } from "./components/Nav";
import { CoachInput } from "./components/CoachInput";
import { HomeView } from "./components/HomeView";
import { AnswerView } from "./components/AnswerView";
import { GoalsView, type GoalForm } from "./components/GoalsView";
import { Toast } from "./components/Toast";

export interface AppProps {
  /** How long the "Reading your accounts…" shimmer shows before the answer. */
  shimmerMs?: number;
  /** Show the "demo: skip to tomorrow" control on held purchases. */
  demoControls?: boolean;
  /** Start with the Lisbon goal already tracked. */
  startWithGoal?: boolean;
}

interface State {
  view: View;
  mode: Mode;
  amount: number;
  label: string;
  loading: boolean;
  goal: Goal | null;
  held: boolean;
  reask: boolean;
  toast: string;
  expand: boolean;
  range: Range;
  query: string;
  form: GoalForm;
}

const EMPTY_FORM: GoalForm = { name: "", target: "", date: "", monthly: "" };

export default function App({ shimmerMs = 600, demoControls = true, startWithGoal = true }: AppProps) {
  const [s, setS] = useState<State>(() => ({
    view: "home",
    mode: 0,
    amount: 0,
    label: "",
    loading: false,
    goal: startWithGoal ? lisbonGoal() : null,
    held: false,
    reask: false,
    toast: "",
    expand: false,
    range: "6M",
    query: "",
    form: EMPTY_FORM,
  }));
  const patch = useCallback((p: Partial<State>) => setS((prev) => ({ ...prev, ...p })), []);

  const toastTimer = useRef<number | undefined>(undefined);
  const submitTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(submitTimer.current);
    },
    [],
  );

  const toast = useCallback(
    (text: string) => {
      window.clearTimeout(toastTimer.current);
      patch({ toast: text });
      toastTimer.current = window.setTimeout(() => patch({ toast: "" }), 3800);
    },
    [patch],
  );

  const submit = useCallback(
    (text: string) => {
      const q = parseQuery(text);
      if (!q) {
        toast('Include a dollar amount — try "$60 dinner".');
        return;
      }
      patch({ loading: true, query: text });
      window.clearTimeout(submitTimer.current);
      submitTimer.current = window.setTimeout(
        () => patch({ view: "answer", ...q, loading: false, held: false, reask: false, expand: false }),
        shimmerMs,
      );
    },
    [patch, toast, shimmerMs],
  );

  const goHome = useCallback(() => patch({ view: "home", query: "" }), [patch]);
  const addGoal = useCallback(
    (goal: Goal, msg?: string) => {
      patch({ goal });
      if (msg) toast(msg);
    },
    [patch, toast],
  );

  return (
    <>
      <Nav onHome={goHome} />
      <main className="page">
        {s.view !== "goals" && (
          <CoachInput
            query={s.query}
            loading={s.loading}
            goal={s.goal}
            onQuery={(query) => patch({ query })}
            onSubmit={submit}
            onGoals={() => patch({ view: "goals" })}
          />
        )}

        {s.view === "home" && <HomeView range={s.range} onRange={(range) => patch({ range })} />}

        {s.view === "answer" && (
          <AnswerView
            mode={s.mode}
            amount={s.amount}
            goal={s.goal}
            expand={s.expand}
            held={s.held}
            reask={s.reask}
            demoControls={demoControls}
            onHome={goHome}
            onToggleExpand={() => patch({ expand: !s.expand })}
            onHold={() => patch({ held: true, reask: false })}
            onSkipDay={() => patch({ reask: true })}
            onBuy={() => {
              toast("Logged. Meridian 2% is ready when you are.");
              patch({ view: "home", held: false, reask: false, query: "" });
            }}
            onLetGo={() => {
              toast(s.goal ? "Saved $140. Lisbon says thanks." : "Saved $140.");
              patch({ view: "home", held: false, reask: false, query: "" });
            }}
            onTrackLisbon={() => {
              addGoal(lisbonGoal(), "Lisbon is now a tracked goal — small purchases will check against it.");
              patch({ view: "home", query: "" });
            }}
          />
        )}

        {s.view === "goals" && (
          <GoalsView
            goal={s.goal}
            form={s.form}
            onForm={(p) => patch({ form: { ...s.form, ...p } })}
            onHome={goHome}
            onDelete={() => {
              patch({ goal: null });
              toast("Goal removed.");
            }}
            onAddSuggested={() => addGoal(lisbonGoal(), "Lisbon is now a tracked goal.")}
            onAddFromForm={() => {
              const f = s.form;
              const target = parseFloat((f.target || "").replace(/[^\d.]/g, "")) || 2400;
              const isLisbon = !f.name || f.name.toLowerCase().includes("lisbon");
              addGoal(
                {
                  name: f.name || "Lisbon trip",
                  target,
                  saved: isLisbon ? 1150 : 0,
                  by: f.date || tenWeeks(),
                  weekly: 125,
                },
                "Goal tracked.",
              );
              patch({ form: EMPTY_FORM });
            }}
          />
        )}
      </main>
      <Toast text={s.toast} />
    </>
  );
}
