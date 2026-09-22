const VARIANT_CLASSES = {
  light: { label: "text-text-primary", input: "bg-white text-text-primary border-border-light" },
  dark: { label: "text-text-primary-dark", input: "bg-white/5 text-text-primary-dark border-white/20" },
};

export function TextField({ label, error, id, variant = "light", className = "", ...props }) {
  const styles = VARIANT_CLASSES[variant];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className={`text-sm font-medium ${styles.label}`}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-xl border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-accent-action/40 ${
          error ? "border-danger" : styles.input
        }`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
