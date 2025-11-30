import { useState } from "react";
import axios from "axios";

export default function History() {
  const [filters, setFilters] = useState({
    date: "",
    time: "",
    year: new Date().getFullYear(),
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get("/api/history", {
        params: filters,
        withCredentials: true,
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  // Generate year options for the past 1 year
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Machine Data History</h1>
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap gap-4 mb-6 items-end"
      >
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Time</label>
          <input
            type="time"
            name="time"
            value={filters.time}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Timestamp</th>
              <th className="p-2 border">RPM</th>
              <th className="p-2 border">Vibration</th>
              <th className="p-2 border">Encoder</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row: any, idx: number) => (
                <tr key={idx}>
                  <td className="border p-2">{row.timestamp}</td>
                  <td className="border p-2">{row.rpm}</td>
                  <td className="border p-2">{row.vibration}</td>
                  <td className="border p-2">{row.encoder}</td>
                  <td className="border p-2">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
