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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SensorPort1() {
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch("/api/sensors/port1");
        if (!response.ok) {
          throw new Error("Failed to fetch sensor data");
        }
        const result = await response.json();
        const dataArray = result.data || result.etResults;
        if (!dataArray || !Array.isArray(dataArray)) {
          throw new Error("API response is missing a valid data array");
        }
        const processedData = dataArray.filter(
          (entry) => entry.timestamp && entry.water_content !== undefined
        );
        setSensorData(processedData);
        if (processedData.length > 0) {
          const latestDate = processedData[processedData.length - 1].timestamp.split(" ")[0];
          setSelectedDate(latestDate);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching sensor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl font-semibold">
        Loading sensor data, please wait...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!sensorData || sensorData.length === 0) {
    return <div className="text-red-500 text-center mt-10">Sensor data not found.</div>;
  }

  // Filter data based on selected date (format: "YYYY-MM-DD")
  const filteredSensorData = sensorData.filter((entry) =>
    entry.timestamp.startsWith(selectedDate)
  );
  console.log("Filtered sensor data for", selectedDate, ":", filteredSensorData);

  // Extract time portion (HH:MM:SS) for x-axis labels
  const timeLabels = filteredSensorData.map((entry) => entry.timestamp.split(" ")[1]);

  // Helper function to determine Y-axis min/max for proper scaling
  const getMinMax = (data) => {
    if (data.length === 0) return { min: 0, max: 1 };
    const values = data.filter((d) => d !== null);
    if (values.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...values) - 0.05, max: Math.max(...values) + 0.05 };
  };

  const waterContentMinMax = getMinMax(filteredSensorData.map((d) => d.water_content));
  const soilTempMinMax = getMinMax(filteredSensorData.map((d) => d.soil_temp));

  // Compute ET values using the formula: ET = |Δ(water_content)| * 200
  const etValues = filteredSensorData.map((entry, index, arr) => {
    if (index === 0) return 0;
    const diff = Math.abs(Number(entry.water_content) - Number(arr[index - 1].water_content));
    return diff * 200;
  });
  const etMinMax = getMinMax(etValues);

  // Function to create chart data
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
      legend: {
        position: "top",
        labels: { color: "white", font: { size: 14 } },
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "white",
        bodyColor: "white",
      },
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
        <h1 className="text-3xl font-bold text-center mb-4">Sensor Port 1 Data</h1>
        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
          />
        </div>
        {/* Arrange graphs in a grid with three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold text-center mb-3">Water Content</h2>
            <div className="h-72">
              <Line
                data={createChartData(
                  "Water Content",
                  filteredSensorData.map(d => d.water_content),
                  "blue"
                )}
                options={chartOptions(waterContentMinMax.min, waterContentMinMax.max)}
              />
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold text-center mb-3">Soil Temperature</h2>
            <div className="h-72">
              <Line
                data={createChartData(
                  "Soil Temperature",
                  filteredSensorData.map(d => d.soil_temp),
                  "orange"
                )}
                options={chartOptions(soilTempMinMax.min, soilTempMinMax.max)}
              />
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold text-center mb-3">Evapotranspiration</h2>
            {/* Display the ET calculation formula above the graph */}
            <div className="text-center mb-2 text-sm text-gray-300">
              ET = |Δ(water_content)| × 200
            </div>
            <div className="h-72">
              <Line
                data={createChartData("Evapotranspiration", etValues, "purple")}
                options={chartOptions(etMinMax.min, etMinMax.max)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
