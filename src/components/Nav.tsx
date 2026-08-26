const LINKS = ["Home", "Banking", "Cards", "Invest", "Coach Insights", "Loans"];

export function Nav({ onHome }: { onHome: () => void }) {
  return (
    <header className="nav">
      <div className="nav__inner">
        <button type="button" className="nav__logo" onClick={onHome} aria-label="meridian home">
          meridian<span>.</span>
        </button>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <span key={l} className={l === "Coach Insights" ? "is-active" : undefined}>
              {l}
            </span>
          ))}
        </nav>
        <div className="nav__plus">Get ✦ Plus</div>
      </div>
    </header>
  );
}
