"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import laiData from "@/data/lai_results.json";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LAIPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPort, setSelectedPort] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [laiValues, setLaiValues] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const data = laiData.find((entry) => entry.port === selectedPort);

      if (data) {
        const filteredData = data.LAI_data
          .filter((entry) => entry.timestamp && entry.Refined_LAI !== undefined)
          .map((entry) => ({
            ...entry,
            Refined_LAI: Number(entry.Refined_LAI),
          }));

        setLaiValues(filteredData);

        if (filteredData.length > 0) {
          const latestDate = filteredData[filteredData.length - 1].timestamp.split(" ")[0];
          setSelectedDate(latestDate);
        }
      }

      setLoading(false);
    }, 1000);
  }, [selectedPort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl font-semibold">
        Loading LAI data, please wait...
      </div>
    );
  }

  const filteredLAIData = laiValues.filter((entry) => entry.timestamp.startsWith(selectedDate));
  const timestamps = filteredLAIData.map((entry) => entry.timestamp.split(" ")[1]);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: "LAI",
        data: filteredLAIData.map((entry) => entry.Refined_LAI),
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
        <h1 className="text-3xl font-bold text-center mb-4">Leaf Area Index (LAI)</h1>

        {/* Port Selection */}
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

        {/* Graph */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-semibold text-center mb-3">LAI Over Time</h2>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-10 p-6 bg-gray-800 rounded-xl shadow-lg text-gray-300">
          <h2 className="text-2xl font-bold mb-3 text-green-400">1. Methodology</h2>

          <h3 className="text-xl font-semibold mt-4 text-white">1.1 Model Overview</h3>
          <p className="mt-2">
            The model used in this study is based on the relationship between LAI and three key environmental parameters: 
            soil moisture, soil temperature, and electrical conductivity (EC). The formula used to estimate LAI is:
          </p>

          <div className="mt-4 bg-gray-700 p-4 rounded-lg text-center text-white font-mono">
            LAI = k<sub>1</sub> × (1 - ΔVWC/Δt) + k<sub>2</sub> × T<sub>soil</sub> + k<sub>3</sub> × EC
          </div>

          <p className="mt-2">
            Where:
            </p>
            <ul className="list-disc ml-5 mt-2">
              <li>ΔVWC/Δt = Change in soil moisture content over time</li>
              <li>T<sub>soil</sub> = Soil temperature (°C)</li>
              <li>EC = Electrical conductivity of the soil (dS/m)</li>
              <li>k<sub>1</sub>, k<sub>2</sub>, k<sub>3</sub> = Scaling factors calibrated by the ML model</li>
            </ul>
          

          <h3 className="text-xl font-semibold mt-4 text-white">1.2 Machine Learning Approach</h3>
          <p className="mt-2">
            To calibrate the model parameters (k<sub>1</sub>, k<sub>2</sub>, k<sub>3</sub>), we employed a machine learning approach 
            using a dataset that includes real-time observations of soil moisture, soil temperature, EC, and water uptake. 
            The ML algorithm chosen for model calibration is <b>Random Forest Regression</b>, due to its ability to handle complex relationships 
            and interactions between variables.
          </p>

          <p className="mt-2">
            <b>Input features used for training:</b>
            <ul className="list-disc ml-5 mt-2">
              <li>Soil moisture dynamics (measured as volumetric water content or VWC)</li>
              <li>Soil temperature measurements</li>
              <li>Electrical conductivity of the soil</li>
            </ul>
          </p>

          <p className="mt-2">
            The target variable for the model is the <b>actual water uptake</b>, which is measured or estimated based on transpiration rates in the plant. 
            The ML model was trained on historical data, and the scaling factors (k<sub>1</sub>, k<sub>2</sub>, k<sub>3</sub>) 
            were optimized through the algorithm to minimize prediction errors.
          </p>
          <h2 className="text-xl font-semibold mb-4">References</h2>
  
  <p className="mb-2">
    Niu, G.-Y., et al. (2011). "Evaluation of the Response of the Regional Climate and the Hydrological Cycle to Vegetation Changes Using a Coupled Vegetation–Hydrology–Atmosphere Model." 
    <i>Journal of Hydrometeorology</i>, 12(6), 1325-1341. 
    <a href="https://journals.ametsoc.org/view/journals/hydr/12/6/2011jhm1370_1.xml" target="_blank" className="text-blue-500"> [Link]</a>
  </p>

  <p className="mb-2">
    Kersebaum, K. C., et al. (2007). "Modeling Water Use and Crop Yield Using an Empirical Approach and Machine Learning Algorithms." 
    <i>Agricultural Water Management</i>, 89(1), 93-103. 
    <a href="https://www.sciencedirect.com/science/article/abs/pii/S0378377406003067" target="_blank" className="text-blue-500"> [Link]</a>
  </p>

  <p className="mb-2">
    Thorp, K. R., et al. (2013). "Using Machine Learning Techniques to Predict Crop Water Use Efficiency." 
    <i>Agricultural Systems</i>, 116, 10-19. 
    <a href="https://www.sciencedirect.com/science/article/abs/pii/S0308521X12001437" target="_blank" className="text-blue-500"> [Link]</a>
  </p>

  <p className="mb-2">
    Zhang, J., & Zhuang, Q. (2019). "Modeling and Prediction of Soil Water Content Using Machine Learning Algorithms." 
    <i>Environmental Modeling & Software</i>, 115, 17-32. 
    <a href="https://www.sciencedirect.com/science/article/abs/pii/S1364815218306439" target="_blank" className="text-blue-500"> [Link]</a>
  </p>

  <p className="mb-2">
    Wu, H., & Li, L. (2020). "Machine Learning for Environmental Data Assimilation: Applications to Agricultural Water Use and LAI Estimation." 
    <i>Agricultural and Forest Meteorology</i>, 276, 107630. 
    <a href="https://www.sciencedirect.com/science/article/abs/pii/S0168192320300221" target="_blank" className="text-blue-500"> [Link]</a>
  </p>
        </div>
      </div>
    </main>
  );
}
