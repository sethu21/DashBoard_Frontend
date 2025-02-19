"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Soil correction factors based on soil type:
const SOIL_TYPES = {
  Podzols: 1.1,  // low water retention
  Gleysols: 0.9,  // high water retention
  Cambisols: 1.0, // balanced
};

export default function ETPage() {
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [soilType, setSoilType] = useState("Cambisols");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchETData = async () => {
      try {
        const response = await fetch("/api/sensors/et");
        if (!response.ok) {
          throw new Error("Failed to fetch sensor data");
        }
        const result = await response.json();
        const dataArray = result.data;
        if (!dataArray || !Array.isArray(dataArray)) {
          throw new Error("API response is missing a valid data array");
        }
        // Sort the data by timestamp ascending
        const sortedData = dataArray.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setSensorData(sortedData);
        if (sortedData.length > 0) {
          const defaultDate = sortedData[sortedData.length - 1].timestamp.split(" ")[0];
          setSelectedDate(defaultDate);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching ET data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchETData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl font-semibold">
        Loading evapotranspiration data, please wait...
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }
  if (!sensorData || sensorData.length === 0) {
    return <div className="text-red-500 text-center mt-10">Sensor data not found.</div>;
  }

  // Filter data for the selected date (timestamp format assumed "YYYY-MM-DD HH:MM:SS")
  const filteredData = sensorData.filter((row) =>
    row.timestamp.startsWith(selectedDate)
  );
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <p className="mb-4">No ET data found for {selectedDate}</p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
        />
      </div>
    );
  }

  // Use the time portion ("HH:MM:SS") for x-axis labels
  const timeLabels = filteredData.map((row) => row.timestamp.split(" ")[1]);

  // Calculate ET for each measurement interval.
  // p1: sensor at 15cm, p2: sensor at 30cm, p3: sensor at 45cm.
  // The formula is:
  //   ET = (|Δθ₁₅|×200 + |Δθ₃₀|×150 + |Δθ₄₅|×150) × βₛ
  // where Δθ is the absolute change between the current and previous moisture measurement.
  const etValues = filteredData.map((row, index, arr) => {
    if (index === 0) return 0;
    const prev = arr[index - 1];
    const diffP1 = Math.abs(Number(row.p1) - Number(prev.p1));
    const diffP2 = Math.abs(Number(row.p2) - Number(prev.p2));
    const diffP3 = Math.abs(Number(row.p3) - Number(prev.p3));
    // Multiply by the corresponding depth interval and soil correction factor.
    const et = (diffP1 * 200 + diffP2 * 150 + diffP3 * 150) * SOIL_TYPES[soilType];
    return Number(et.toFixed(3));
  });

  // Y-axis scaling helper
  const getMinMax = (data) => {
    if (data.length === 0) return { min: 0, max: 1 };
    const values = data.filter((d) => d !== null);
    if (values.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...values) - 0.05, max: Math.max(...values) + 0.05 };
  };
  const etMinMax = getMinMax(etValues);

  const createChartData = (label, data, borderColor) => ({
    labels: timeLabels,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor: "transparent",
        fill: false,
        borderWidth: 3,
        pointRadius: 2,
        tension: 0.1,
      },
    ],
  });

  const chartOptions = (min, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "white", font: { size: 14 } } },
      tooltip: { backgroundColor: "#222", titleColor: "white", bodyColor: "white" },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.3)", lineWidth: 1.5 },
        ticks: { color: "white", font: { size: 12 }, maxRotation: 45 },
      },
      y: {
        min,
        max,
        grid: { color: "rgba(255,255,255,0.3)", lineWidth: 1.5 },
        ticks: { color: "white", font: { size: 12 } },
      },
    },
  });

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6 w-full">
      <div className="w-full max-w-5xl bg-gray-800 p-6 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-4">Evapotranspiration (ET) Data</h1>
        <div className="flex justify-center mb-6 space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
          />
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
          >
            {Object.keys(SOIL_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {/* ET Description Section */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center text-sm text-gray-300">
          <strong>ET Calculation Formula:</strong> <br />
          ET = (|Δθ₁₅| × 200 + |Δθ₃₀| × 150 + |Δθ₄₅| × 150) × βₛ <br />
          <br />
          <strong>Where:</strong> <br />
          Δθ₁₅: Change in soil moisture at 15 cm (Port 1) <br />
          Δθ₃₀: Change in soil moisture at 30 cm (Port 2) <br />
          Δθ₄₅: Change in soil moisture at 45 cm (Port 3) <br />
          200 mm, 150 mm, 150 mm: Depth intervals for each sensor, respectively <br />
          βₛ: Soil correction factor (Podzols: 1.1, Gleysols: 0.9, Cambisols: 1.0) <br />
          <br />
          <strong>Delta Calculation Detail:</strong> The delta (Δθ) for each sensor is computed as the absolute difference between the current soil moisture value and the previous measurement. This represents the magnitude of change in soil moisture over each time interval.
          <br /><br />
          <strong>Reference:</strong> For further details on soil water retention and correction factors, you can consult the DOE’s ORNL DANCE database at <a href="https://dance.ornl.gov" target="_blank" className="text-blue-500">https://dance.ornl.gov</a>.
        </div>
        {/* Graph: ET */}
        <div className="bg-gray-700 p-6 rounded-xl shadow-2xl">
          <div className="h-96">
            <Line
              data={createChartData("Evapotranspiration (mm)", etValues, "purple")}
              options={chartOptions(etMinMax.min, etMinMax.max)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
