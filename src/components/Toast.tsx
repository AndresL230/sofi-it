export function Toast({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {text}
    </div>
  );
}
