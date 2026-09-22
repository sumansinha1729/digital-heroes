import { Badge } from "../../components/ui/Badge.jsx";

const STATUS_VARIANT = {
  ACTIVE: "success",
  CANCELLED: "neutral",
  LAPSED: "danger",
  INACTIVE: "neutral",
};

const STATUS_LABEL = {
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  LAPSED: "Lapsed",
  INACTIVE: "Not subscribed",
};

export function HeaderBand({ user, subscription }) {
  const status = subscription?.status || "INACTIVE";

  return (
    <div className="border-b border-border-light bg-white px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl">Welcome back, {user.fullName.split(" ")[0]}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          {subscription && (
            <span className="text-sm text-text-muted">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
