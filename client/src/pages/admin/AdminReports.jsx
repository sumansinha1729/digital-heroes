import { useState, useEffect } from "react";
import { AdminShell } from "../../components/layout/AdminShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { getAdminReports } from "../../api/admin.js";
import { SimpleBarChart } from "./SimpleBarChart.jsx";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMonth(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function StatTile({ label, value }) {
  return (
    <Card>
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 font-sans text-3xl font-bold">{value}</p>
    </Card>
  );
}

export function AdminReports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    getAdminReports().then(setReports);
  }, []);

  if (!reports) {
    return (
      <AdminShell>
        <h1 className="font-sans text-2xl font-semibold">Reports</h1>
        <p className="mt-4 text-sm text-text-muted">Loading…</p>
      </AdminShell>
    );
  }

  const drawData = reports.drawStatistics.map((d) => ({
    month: formatMonth(d.drawMonth),
    total: d.total,
  }));

  return (
    <AdminShell>
      <h1 className="font-sans text-2xl font-semibold">Reports</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total users" value={reports.totalUsers} />
        <StatTile label="Total prize pool" value={formatCurrency(reports.totalPrizePool)} />
        <StatTile
          label="Charities supported"
          value={reports.charityContributions.length}
        />
        <StatTile label="Draws published" value={reports.drawStatistics.length} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-sans text-lg font-semibold">Charity contribution totals</h2>
          <div className="mt-4">
            <SimpleBarChart
              data={reports.charityContributions}
              labelKey="charityName"
              valueKey="total"
              colorClassName="bg-accent-charity"
              formatValue={formatCurrency}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-sans text-lg font-semibold">Draw prize pool by month</h2>
          <div className="mt-4">
            <SimpleBarChart
              data={drawData}
              labelKey="month"
              valueKey="total"
              colorClassName="bg-accent-prize"
              formatValue={formatCurrency}
            />
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
