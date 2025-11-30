import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

interface Session {
  id: number;
  machine_id: string;
  start_time: string;
  end_time: string | null;
}

export default function WorkerSession() {
  const { user } = useAuth();
  const [machineId, setMachineId] = useState("");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchActiveSession = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/sessions/active", {
        withCredentials: true,
      });
      setActiveSession(res.data[0] || null);
    } catch {
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.post(
        "/api/sessions/start",
        { machine_id: machineId },
        { withCredentials: true },
      );
      setMachineId("");
      setMsg("Session started!");
      fetchActiveSession();
    } catch {
      setMsg("Failed to start session.");
    }
  };

  const handleEnd = async () => {
    setMsg("");
    try {
      await axios.post("/api/sessions/end", {}, { withCredentials: true });
      setMsg("Session ended.");
      fetchActiveSession();
    } catch {
      setMsg("Failed to end session.");
    }
  };

  useEffect(() => {
    if (user?.role === "worker") fetchActiveSession();
    // eslint-disable-next-line
  }, [user]);

  if (user?.role !== "worker") return null;

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2">🛠️ Machine Session</h2>
          {loading ? (
            <div>Loading...</div>
          ) : activeSession && !activeSession.end_time ? (
            <div>
              <div className="mb-2">
                <strong>Machine:</strong> {activeSession.machine_id}
              </div>
              <div className="mb-2">
                <strong>Started at:</strong>{" "}
                {new Date(activeSession.start_time).toLocaleString()}
              </div>
              <Button onClick={handleEnd} className="bg-red-600 text-white">
                End Session
              </Button>
            </div>
          ) : (
            <form onSubmit={handleStart} className="flex gap-2 items-end">
              <Input
                placeholder="Enter Machine ID"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                required
              />
              <Button type="submit" className="bg-blue-600 text-white">
                Start Session
              </Button>
            </form>
          )}
          {msg && <div className="text-green-600 mt-2">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
