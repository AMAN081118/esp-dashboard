import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface UptimeDay {
  day: string;
  uptimeSeconds: number;
}

function formatUptime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ActiveSessions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UptimeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayUptime, setTodayUptime] = useState<number | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/api/uptime/by-day", { params: { days: 14 } }),
      axios.get("/api/uptime/day", { params: { date: todayStr } }),
    ])
      .then(([byDayRes, todayRes]) => {
        setRows(byDayRes.data);
        setTodayUptime(todayRes.data.uptimeSeconds);
      })
      .catch(() => {
        setRows([]);
        setTodayUptime(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  // Ensure today is included and has correct uptime
  let days = rows.filter((r) => r.day !== todayStr);
  if (todayUptime !== null) {
    days = [{ day: todayStr, uptimeSeconds: todayUptime }, ...days];
  } else if (!loading && !rows.find((r) => r.day === todayStr)) {
    days = [{ day: todayStr, uptimeSeconds: 0 }, ...days];
  }
  // Sort descending (today first)
  days = [...days].sort((a, b) => b.day.localeCompare(a.day));

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Daily Uptime History</h2>
      {loading ? (
        <div>Loading...</div>
      ) : days.length === 0 ? (
        <div>No data found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((row) => (
            <Card
              key={row.day}
              className={
                row.day === todayStr ? "border-blue-500 border-2" : ""
              }
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div className="text-lg font-semibold mb-2">
                  {row.day === todayStr ? "Today" : row.day}
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {formatUptime(row.uptimeSeconds)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total uptime
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
