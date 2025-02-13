"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import sensorData from "@/data/sensors.json";
import laiData from "@/data/lai_results.json";  // Import LAI data

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SensorDataPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPort, setSelectedPort] = useState(1);
  const [sensor, setSensor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [laiValues, setLaiValues] = useState([]); // State for LAI data

  useEffect(() => {
    // Load sensor data
    setTimeout(() => {
      const data = sensorData.sensors.find((s) => s.port === selectedPort);

      if (data) {
        const filteredData = data.data
          .filter((entry) => entry.timestamp && entry.water_content !== undefined)
          .map((entry) => ({
            ...entry,
            soil_temp: entry.soil_temp === "N/A" || entry.soil_temp === "#N/A" ? null : Number(entry.soil_temp),
            bulk_ec: entry.bulk_ec === "N/A" ? null : Number(entry.bulk_ec),
          }));

        setSensor({ ...data, data: filteredData });

        if (filteredData.length > 0) {
          const latestDate = filteredData[filteredData.length - 1].timestamp.split(" ")[0];
          setSelectedDate(latestDate);
        }
      }

      setLoading(false);
    }, 1000);

    // Load LAI data
    const laiDataForPort = laiData.find((entry) => entry.port === selectedPort);
    if (laiDataForPort) {
      const filteredLaiData = laiDataForPort.LAI_data
        .filter((entry) => entry.timestamp && entry.Refined_LAI !== undefined)
        .map((entry) => ({
          ...entry,
          Refined_LAI: Number(entry.Refined_LAI),
        }));
      setLaiValues(filteredLaiData);
    }

  }, [selectedPort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl font-semibold">
        Loading sensor data, please wait...
      </div>
    );
  }

  if (!sensor) {
    return <div className="text-red-500 text-center mt-10">Sensor data not found.</div>;
  }

  const filteredSensorData = sensor.data.filter((entry) => entry.timestamp.startsWith(selectedDate));
  const timestamps = filteredSensorData.map((entry) => entry.timestamp.split(" ")[1]);

  const filteredLaiData = laiValues.filter((entry) => entry.timestamp.startsWith(selectedDate));
  const laiTimestamps = filteredLaiData.map((entry) => entry.timestamp.split(" ")[1]);

  const createChartData = (label, data, borderColor, gradient) => ({
    labels: timestamps,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderColor: borderColor,
        pointBorderWidth: 2,
        shadowColor: "rgba(0, 0, 0, 0.6)",
        shadowBlur: 10,
      },
    ],
  });

  const laiChartData = {
    labels: laiTimestamps,
    datasets: [
      {
        label: "Refined LAI",
        data: filteredLaiData.map((entry) => entry.Refined_LAI),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.3)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderColor: "green",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#222",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 w-full">
      <div className="w-full max-w-5xl bg-gray-900 p-6 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-4">{sensor.name}, Leaf Area Index </h1>
        <p className="text-sm text-center mb-4">Serial Number: {sensor.serialNumber}</p>

        {/* Sensor Port Selection */}
        <div className="flex justify-center mb-4">
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
          >
            <option value={1}>Sensor 1</option>
            <option value={2}>Sensor 2</option>
            <option value={3}>Sensor 3</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none shadow-lg"
          />
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold text-center mb-3">Water Content</h2>
            <div className="h-72">
              <Line
                data={createChartData(
                  "Water Content",
                  filteredSensorData.map((d) => d.water_content),
                  "blue",
                  "rgba(0, 0, 255, 0.3)"
                )}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold text-center mb-3">Soil Temperature</h2>
            <div className="h-72">
              <Line
                data={createChartData(
                  "Soil Temperature",
                  filteredSensorData.map((d) => d.soil_temp),
                  "orange",
                  "rgba(255, 165, 0, 0.3)"
                )}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl md:col-span-2">
            <h2 className="text-xl font-semibold text-center mb-3">Bulk EC</h2>
            <div className="h-72">
              <Line
                data={createChartData(
                  "Bulk EC",
                  filteredSensorData.map((d) => d.bulk_ec),
                  "green",
                  "rgba(0, 255, 0, 0.3)"
                )}
                options={chartOptions}
              />
            </div>
          </div>

          {/* LAI Graph */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl md:col-span-2">
            <h2 className="text-xl font-semibold text-center mb-3">LAI</h2>
            <div className="h-72">
              <Line data={laiChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
