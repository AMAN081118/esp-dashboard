import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import SensorChart from "@/components/SensorChart";
import SensorTable from "@/components/SensorTable";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { fetchLiveData } from "@/lib/api";
import axios from "axios";

interface SensorData {
  timestamp: string;
  rpm: number;
  vibration: number;
  encoder: number;
  status?: string;
  worker_id?: number;
  machine_id?: string;
}

function formatTimeRemaining(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [liveData, setLiveData] = useState<SensorData>({
    rpm: 0,
    encoder: 0,
    vibration: 0,
    timestamp: "",
    status: "Off",
  });
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [todayUptime, setTodayUptime] = useState<number>(0);

  // On mount, fetch last 50 readings from backend
  useEffect(() => {
    fetchLiveData().then((result) => {
      setDataHistory(result.slice(-50));
    });
  }, []);

  // Use WebSocket for live data
  useWebSocket("ws://localhost:5000", (data) => {
    setLiveData(data);
    setDataHistory((prev) => [...prev.slice(-49), data]); // keep last 50 points
  });

  // Fetch today's uptime in seconds, and update every 10 seconds
  useEffect(() => {
    const fetchUptime = () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      axios
        .get("/api/uptime/day", { params: { date: todayStr } })
        .then((res) => setTodayUptime(res.data.uptimeSeconds || 0))
        .catch(() => setTodayUptime(0));
    };
    fetchUptime();
    const interval = setInterval(fetchUptime, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Use backend-provided status for machine state, but set to Off if no new data in 1s
  const [machineState, setMachineState] = useState<string>(
    liveData.status || "Off",
  );
  useEffect(() => {
    setMachineState(liveData.status || "Off");
    let timeout = setTimeout(() => {
      setMachineState("Off");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [liveData.timestamp]);

  // Get machine_id and worker_id from the latest liveData
  const machineId = liveData.machine_id;
  const workerId = liveData.worker_id;

  const timeRemaining = Math.max(28800 - todayUptime, 0); // 8 hours in seconds

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Greeting, Uptime, Time Remaining, and Machine State in a single row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
          <Card className="bg-white shadow border-0 flex-1 flex items-center justify-center">
            <CardContent className="py-4 flex flex-col items-center">
              <CardTitle className="text-lg font-bold mb-1">
                Hello,{" "}
                <span className="text-blue-600">{user?.name || "User"}</span>
              </CardTitle>
              <CardDescription className="text-xs text-center">
                Track your machine and team performance in real time.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-tr from-green-500 to-green-300 text-white shadow-lg border-0 flex-1">
            <CardContent className="py-4 flex flex-col items-center">
              <div className="text-xl font-bold">
                {Math.floor(todayUptime / 60)}m {todayUptime % 60}s
              </div>
              <div className="text-lg font-bold opacity-100">Uptime Today</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-lg border-0 flex-1">
            <CardContent className="py-4 flex flex-col items-center">
              <div className="text-xl font-bold">
                {formatTimeRemaining(timeRemaining)}
              </div>
              <div className="text-lg font-bold opacity-100">
                Time Remaining
              </div>
              <div className="text-md text-blue-100 mt-1">For 8h shift</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow border-0 flex-1 flex items-center justify-center">
            <CardContent className="py-4 flex flex-col items-center">
              <span
                className={`inline-block w-4 h-4 rounded-full mb-1 ${
                  machineState === "Off"
                    ? "bg-gray-400"
                    : machineState === "Idle"
                    ? "bg-yellow-400 animate-pulse"
                    : machineState === "Traversing"
                    ? "bg-blue-400 animate-pulse"
                    : "bg-green-500 animate-pulse"
                }`}
              ></span>
              <span className="font-semibold text-sm">{machineState}</span>
              <span className="text-xs text-muted-foreground mt-1">
                Machine State
              </span>
            </CardContent>
          </Card>
        </div>
        {/* Live Indicator on Performance Card */}
        {/* <div className="mb-4">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              machineState === "Off"
                ? "bg-gray-400"
                : machineState === "Idle"
                ? "bg-yellow-400 animate-pulse"
                : machineState === "Traversing"
                ? "bg-blue-400 animate-pulse"
                : "bg-green-500 animate-pulse"
            }`}
          ></span>
          <span className="font-semibold">{machineState}</span>
        </div> */}

        {/* Performance Chart & Recent Readings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <Card className="col-span-2 bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Performance</span>
              </CardTitle>
              <CardDescription>
                Live sensor data from your machines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SensorChart data={dataHistory} />
            </CardContent>
          </Card>

          {/* Recent Readings Card */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>
                Latest sensor logs with worker info.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[400px]">
              <SensorTable />
            </CardContent>
          </Card>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-between">
          <div>
            <Button variant="outline" className="mr-2">
              <ExportButton />
            </Button>
            <Button variant="secondary">Help & Info</Button>
          </div>
          <Button
            variant="destructive"
            className="mt-2 md:mt-0"
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </main>
    </div>
  );
}
