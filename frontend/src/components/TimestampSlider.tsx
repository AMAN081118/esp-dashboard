import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { fetchHistory } from "@/lib/api";

interface SensorData {
  timestamp: string;
  rpm: number;
  vibration: number;
  encoder: number;
}

export default function TimestampSlider() {
  const [data, setData] = useState<SensorData[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      // const result = await fetchLiveData(); // you can use fetchHistory() here too
      const result = await fetchHistory();
      setData(result);
    };
    load();
  }, []);

  const current = data[index] ?? null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">⏱️ Preview by Time</h3>

      {data.length > 0 ? (
        <>
          <Slider
            min={0}
            max={data.length - 1}
            step={1}
            value={[index]}
            onValueChange={(val) => setIndex(val[0])}
          />

          <div className="mt-4 p-4 bg-gray-100 rounded shadow text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <strong>Time:</strong>{" "}
              {new Date(current?.timestamp).toLocaleTimeString()}
            </div>
            <div>
              <strong>RPM:</strong> {current?.rpm}
            </div>
            <div>
              <strong>Vibration:</strong> {current?.vibration}
            </div>
            <div>
              <strong>Encoder:</strong> {current?.encoder}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Loading data...</p>
      )}
    </div>
  );
}
