import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import "chartjs-chart-financial";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import 'chartjs-adapter-date-fns';

// Register necessary chart controllers and components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  CandlestickController,
  CandlestickElement
);

// Styled components
const Container = styled.div`
  max-width: 900px;
  margin: 30px auto;
  text-align: center;
  font-family: Arial, sans-serif;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: block;
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px auto;
  max-width: 200px;
  &:hover {
    background-color: #0056b3;
  }
`;

const UploadButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-top: 20px;
`;

const DecisionLabel = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => (props.decision === "BUY" ? "#4CAF50" : "#FF5252")};
`;

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [predictions, setPredictions] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a CSV file");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setMessage("❌ Only CSV files are allowed");
      return;
    }

    setMessage("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8002/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPredictions(response.data);
      setMessage("✅ Prediction complete!");
    } catch (err) {
      setMessage(err.response?.data.error || "❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (predictions.length > 0 && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
  
      const ctx = chartRef.current.getContext("2d");
  
      const priceData = predictions.map((pred) => ({
        x: new Date(pred.date),
        y: parseFloat(pred.close),
      }));
  
      const buySignals = predictions
        .filter((pred) => pred.decision === "BUY")
        .map((pred) => ({
          x: new Date(pred.date),
          y: parseFloat(pred.close),
        }));
  
      const sellSignals = predictions
        .filter((pred) => pred.decision === "SELL")
        .map((pred) => ({
          x: new Date(pred.date),
          y: parseFloat(pred.close),
        }));
  
      const chartData = {
        datasets: [
          {
            label: "Stock Price",
            data: priceData,
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.5)",
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
          {
            label: "BUY Signal",
            data: buySignals,
            borderColor: "green",
            backgroundColor: "green",
            pointStyle: "triangle",
            pointRadius: 6,
            pointRotation: 180,
          },
          {
            label: "SELL Signal",
            data: sellSignals,
            borderColor: "red",
            backgroundColor: "red",
            pointStyle: "triangle",
            pointRadius: 6,
          },
        ],
      };
  
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              tooltipFormat: "yyyy-MM-dd",
            },
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Price (USD)",
            },
          },
        },
      };
  
      chartInstance.current = new ChartJS(ctx, {
        type: "line",
        data: chartData,
        options: options,
      });
    }
  }, [predictions]);
  
  return (
    <Container>
      <h1>📈 Stock Prediction System</h1>
      <FileLabel htmlFor="file-upload">📂 {file ? file.name : "Choose File"}</FileLabel>
      <FileInput id="file-upload" type="file" onChange={handleFileChange} />
      <UploadButton onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload and Predict"}
      </UploadButton>
      {message && <p>{message}</p>}
      {predictions.length > 0 && (
        <>
          <h2>📊 Prediction Results</h2>
          <ChartContainer>
            <canvas ref={chartRef}></canvas>
          </ChartContainer>
        </>
      )}
    </Container>
  );
}

export default App;
