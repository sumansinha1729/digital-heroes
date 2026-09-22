export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border-light bg-white p-4 shadow-none transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
