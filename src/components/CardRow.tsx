import type { CardInfo } from "../lib/coach";

export function CardRow({ card }: { card: CardInfo }) {
  return (
    <div
      className="card-row"
      style={{ background: card.bg, boxShadow: card.shadow, opacity: card.opacity }}
    >
      <div
        className="card-art"
        style={{ background: `linear-gradient(135deg, ${card.art}, ${card.art2})` }}
        aria-hidden="true"
      >
        <div className="card-art__orb" />
        <div className="card-art__chip" />
        <div className="card-art__name">{card.short}</div>
        <div className="card-art__last4">{card.last4}</div>
      </div>
      <div className="card-row__body">
        <div className="card-row__title">
          <span className="card-row__name">{card.name}</span>
          {card.badge && (
            <span className="badge" style={{ background: card.badgeBg, color: card.badgeInk }}>
              {card.badge}
            </span>
          )}
        </div>
        <div className="card-row__reason">{card.reason}</div>
      </div>
      <div className="card-row__right">
        <div className="card-row__back" style={{ color: card.backColor }}>
          {card.back}
        </div>
        {card.delta && <div className="card-row__delta">{card.delta}</div>}
      </div>
    </div>
  );
}
