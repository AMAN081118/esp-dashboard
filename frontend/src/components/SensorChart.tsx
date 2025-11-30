import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
);

interface SensorData {
  timestamp: string;
  rpm: number;
  vibration: number;
  encoder: number;
  status?: string;
  worker_id?: number;
  machine_id?: string;
}

export default function SensorChart({ data }: { data: SensorData[] }) {
  const chartData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Vibration",
        data: data.map((d) => d.vibration),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Encoder",
        data: data.map((d) => d.encoder),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return <Line data={chartData} />;
}
