import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  LineChart,
  Line,
} from "recharts";
import { fetchDashboardData } from "../utils/fetchDashboardData";

const COLORS = {
  resolved: "#22c55e",
  pending: "#ef4444",
  primary: "#3b82f6",
  secondary: "#a855f7",
  accent: "#f59e0b",
  neutral: "#94a3b8",
};

export default function AnalyticsDashboard({ title = "Analytics Dashboard", refreshKey }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    donutData: [],
    disasterBars: [],
    statePercents: [],
    trendSeries: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const result = await fetchDashboardData();
        if (!mounted) return;
        // Defensive defaults if fetch returns undefined
        setData({
          donutData: result?.donutData ?? [
            { name: "Resolved", value: 0, color: COLORS.resolved },
            { name: "Pending", value: 0, color: COLORS.pending },
          ],
          disasterBars: result?.disasterBars ?? [],
          statePercents: result?.statePercents ?? [],
          trendSeries: result?.trendSeries ?? [],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  // Helpful debug output
  useEffect(() => {
    console.log("Analytics dashboard data:", data);
  }, [data]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">Error loading dashboard: {error}</div>
    );
  }

  const totalReports = (data.donutData || []).reduce(
    (s, d) => s + (Number(d.value) || 0),
    0
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">{title}</h2>
        <div className="dashboard-subtitle">
          Real-time analytics — pulled from Firebase
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Card 1: Res vs Pending */}
        <Card title="Resolved vs Pending" subtitle={`Total: ${totalReports}`}>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(v) => [v, "Cases"]} />
                <Legend verticalAlign="bottom" height={24} />
                <Pie
                  data={data.donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="#ffffff"
                >
                  {data.donutData.map((entry, idx) => (
                    <Cell
                      key={`slice-${idx}`}
                      fill={
                        entry.color ??
                        (idx === 0 ? COLORS.resolved : COLORS.pending)
                      }
                    />
                  ))}
                  {/* show percent as labels */}
                  <LabelList
                    dataKey={(d) =>
                      totalReports
                        ? `${Math.round((d.value / totalReports) * 100)}%`
                        : "0%"
                    }
                    position="inside"
                    fill="#ffffff"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card 2: Top disasters by number */}
        <Card title="Top Disasters" subtitle="by number of cases">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.disasterBars || []}
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                  {(data.disasterBars || []).map((_, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={
                        [COLORS.primary, COLORS.secondary, COLORS.accent][
                          idx % 3
                        ]
                      }
                    />
                  ))}
                  <LabelList dataKey="cases" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card 3: Top disasters by states */}
        <Card title="Most Affected States" subtitle="Share of total (%)">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...(data.statePercents || [])].sort(
                  (a, b) => a.percent - b.percent
                )}
                layout="vertical"
                margin={{ top: 8, right: 12, left: 32, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="state" width={120} />
                <Tooltip formatter={(v) => [`${v}%`, "Percent"]} />
                <Bar
                  dataKey="percent"
                  radius={[0, 6, 6, 0]}
                  fill={COLORS.primary}
                >
                  <LabelList
                    dataKey={(d) => `${d.percent}%`}
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card 4: Line trend */}
        <Card title="Cases Reported" subtitle="Last 7 days">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.trendSeries || []}
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {subtitle && <div className="card-sub">{subtitle}</div>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
