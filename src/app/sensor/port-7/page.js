"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import sensorData from "@/data/sensors.json";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SensorPort7() {
  const [loading, setLoading] = useState(true);
  const [sensor, setSensor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setTimeout(() => { // Simulating loading delay
      const data = sensorData.sensors.find((s) => s.port === 7);
      
      if (data) {
        setSensor(data);

        if (data.data.length > 0) {
          const latestDate = data.data[data.data.length - 1].timestamp.split(" ")[0];
          setSelectedDate(latestDate);
        }
      }
      
      setLoading(false);
    }, 1000); // 1-second loading effect
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl font-semibold">
        Loading battery data, please wait...
      </div>
    );
  }

  if (!sensor) {
    return <div className="text-red-500 text-center mt-10">Battery data not found.</div>;
  }

  const filteredSensorData = sensor.data.filter((entry) => entry.timestamp.startsWith(selectedDate));
  const timestamps = filteredSensorData.map((entry) => entry.timestamp.split(" ")[1]);

  const createChartData = (label, data, borderColor) => ({
    labels: timestamps,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor: borderColor,
        fill: false,
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">{sensor.name}</h1>

        {/* Date Picker */}
        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white outline-none"
          />
        </div>

        {/* Graphs */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-gray-700 p-4 rounded-lg w-full md:w-[50%] max-w-[600px]">
            <h2 className="text-lg font-semibold text-center mb-2">Battery Percentage</h2>
            <div className="h-64">
              <Line data={createChartData("Battery %", filteredSensorData.map((d) => d.battery_percent), "blue")} options={chartOptions} />
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg w-full md:w-[50%] max-w-[600px]">
            <h2 className="text-lg font-semibold text-center mb-2">Battery Voltage</h2>
            <div className="h-64">
              <Line data={createChartData("Battery Voltage", filteredSensorData.map((d) => d.battery_voltage), "green")} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
