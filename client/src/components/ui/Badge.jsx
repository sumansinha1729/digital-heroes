const VARIANT_CLASSES = {
  charity: "bg-accent-charity/10 text-accent-charity",
  prize: "bg-accent-prize/10 text-accent-prize",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-text-muted/10 text-text-muted",
};

export function Badge({ variant = "neutral", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  );
}
