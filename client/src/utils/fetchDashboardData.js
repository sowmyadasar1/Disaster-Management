import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

function toDateMaybe(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  if (!isNaN(parsed)) return parsed;
  return null;
}

export async function fetchDashboardData() {
  try {
    const reportsRef = collection(db, "reports");
    const snapshot = await getDocs(reportsRef);
    const reports = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      reports.push({ id: doc.id, ...d });
    });

    // 1. resolved vs pending
    const statusCount = { resolved: 0, pending: 0 };
    reports.forEach(r => {
      const status = (r.status || "").toString().toLowerCase();
      if (status === "resolved" || status === "done" || status === "closed") statusCount.resolved += 1;
      else statusCount.pending += 1;
    });
    const donutData = [
      { name: "Resolved", value: statusCount.resolved, color: "#22c55e" },
      { name: "Pending", value: statusCount.pending, color: "#ef4444" }
    ];

    // 2. top disasters (by r.type)
    const disasterCount = {};
    reports.forEach(r => {
      const t = (r.type || "Unknown").toString();
      disasterCount[t] = (disasterCount[t] || 0) + 1;
    });
    const disasterBars = Object.entries(disasterCount)
      .map(([type, cases]) => ({ type, cases }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 3);

    // 3. top states
    const locationCount = {};
    reports.forEach(r => {
      const loc = (r.location || "").toString();
      const parts = loc.split(",").map(s => s.trim()).filter(Boolean);
      const state = parts.length > 0 ? parts[parts.length - 1] : loc || "Unknown";
      locationCount[state] = (locationCount[state] || 0) + 1;
    });
    const totalReports = Math.max(1, reports.length);
    const statePercents = Object.entries(locationCount)
      .map(([state, count]) => ({ state, percent: Math.round((count / totalReports) * 100) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);

    // 4. last 7 days trend
    const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const trendMap = {};
    dayLabels.forEach(d => (trendMap[d] = 0));
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(0,0,0,0);
    cutoff.setDate(now.getDate() - 6);

    reports.forEach(r => {
      const d = toDateMaybe(r.createdAt);
      if (d && d >= cutoff) {
        trendMap[dayLabels[d.getDay()]] += 1;
      }
    });

    const trendSeries = dayLabels.map(day => ({ day, cases: trendMap[day] || 0 }));

    return { donutData, disasterBars, statePercents, trendSeries };
  } catch (err) {
    console.error("fetchDashboardData error:", err);
    // return safe defaults so UI doesn't crash
    return {
      donutData: [{ name: "Resolved", value: 0, color: "#22c55e" }, { name: "Pending", value: 0, color: "#ef4444" }],
      disasterBars: [],
      statePercents: [],
      trendSeries: [{ day: "Sun", cases: 0 }, { day: "Mon", cases: 0 }, { day: "Tue", cases: 0 }, { day: "Wed", cases: 0 }, { day: "Thu", cases: 0 }, { day: "Fri", cases: 0 }, { day: "Sat", cases: 0 }],
    };
  }
}
