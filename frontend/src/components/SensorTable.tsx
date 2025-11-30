import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { fetchLiveData } from "@/lib/api";

interface SensorData {
  timestamp: string;
  rpm: number;
  vibration: number;
  encoder: number;
  status?: string;
  worker_id?: number;
  machine_id?: string;
}

export default function SensorTable() {
  const [data, setData] = useState<SensorData[]>([]);

  // On mount, fetch last 10 readings from backend
  useEffect(() => {
    fetchLiveData().then((result) => {
      setData(result.slice(-10));
    });
  }, []);

  // On new WebSocket message, append to table
  useWebSocket("ws://localhost:5000", (msg) => {
    setData((prev) => {
      const next = [...prev, msg];
      return next.slice(-10); // keep only latest 10
    });
  });

  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Status</th>
            {/* <th className="px-3 py-2">RPM</th> */}
            <th className="px-3 py-2">Vibration</th>
            <th className="px-3 py-2">Encoder</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">
                {new Date(d.timestamp).toLocaleTimeString()}
              </td>
              <td
                className={`px-3 py-2 ${
                  d.status == "Machining Active"
                    ? "font-bold text-green-500"
                    : "text-gray-500"
                }`}
              >
                {d.status || "-"}
              </td>
              {/* <td className="px-3 py-2">{d.rpm}</td> */}
              <td className="px-3 py-2">{d.vibration}</td>
              <td className="px-3 py-2">{d.encoder}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
