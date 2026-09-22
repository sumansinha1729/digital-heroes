export function TextField({ label, error, id, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-xl border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-accent-action/40 ${
          error ? "border-danger" : "border-border-light"
        }`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
