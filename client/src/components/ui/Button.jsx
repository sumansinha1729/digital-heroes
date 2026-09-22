const VARIANT_CLASSES = {
  primary: "bg-accent-action text-white hover:scale-[1.02] hover:shadow-lg",
  secondary: "bg-transparent border border-border-light text-text-primary hover:bg-surface",
  charity: "bg-accent-charity text-white hover:scale-[1.02] hover:shadow-lg",
};

export function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 font-sans font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
