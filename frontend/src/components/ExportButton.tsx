import { Button } from "@/components/ui/button";
import { fetchHistory } from "@/lib/api";
import Papa from "papaparse";

export default function ExportButton() {
  const handleExport = async () => {
    const data = await fetchHistory();
    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `esp32_readings_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      📤 Export CSV
    </Button>
  );
}
