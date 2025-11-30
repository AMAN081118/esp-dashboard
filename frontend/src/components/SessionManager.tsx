import React, { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  machineId?: string;
  workerId?: number;
}

const UptimePanel: React.FC<Props> = ({ machineId, workerId }) => {
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [uptime, setUptime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setDebug(`Querying: date=${date}`);
    axios
      .get("/api/uptime/day", {
        params: { date },
      })
      .then((res) => {
        setUptime(res.data.uptimeSeconds);
        setDebug((d) => d + ` | API response: ${JSON.stringify(res.data)}`);
      })
      .catch((err) => {
        setUptime(null);
        setDebug(
          (d) => d + ` | API error: ${err?.response?.data?.error || err.message}`,
        );
      })
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="mb-4 p-4 bg-white rounded shadow flex flex-col gap-2">
      <label className="font-semibold">Date:</label>
      <input
        type="date"
        className="border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
      />
      <div className="mt-2 font-bold">
        {loading
          ? "Loading uptime..."
          : uptime !== null
          ? `Total uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s`
          : "No data for this day"}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {machineId && workerId
          ? `Machine ID: ${machineId}, Worker ID: ${workerId}`
          : "Waiting for data..."}
      </div>
      <div className="text-xs text-red-500 mt-2 break-all">{debug}</div>
    </div>
  );
};

export default UptimePanel;
