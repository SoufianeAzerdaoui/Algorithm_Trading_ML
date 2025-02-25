import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale, // Add TimeScale for time-based axis
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
import 'chartjs-adapter-date-fns'; // Add date adapter for time-based axis

// Register necessary chart controllers and components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale, // Register TimeScale
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
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      // Generate OHLC data from actual_price
      const ohlcData = predictions.map((pred, index) => {
        const open = index === 0 ? pred.actual_price : predictions[index - 1].actual_price;
        const close = pred.actual_price;
        const high = Math.max(open, close) + Math.random() * 0.02; // Add small variation
        const low = Math.min(open, close) - Math.random() * 0.02;

        return {
          ...pred,
          open: open.toFixed(2),
          high: high.toFixed(2),
          low: low.toFixed(2),
          close: close.toFixed(2),
        };
      });

      // Candlestick chart configuration
      const candlestickData = {
        labels: ohlcData.map((d) => d.date),
        datasets: [
          {
            label: "Stock Price",
            data: ohlcData.map((d) => ({
              x: d.date,
              o: parseFloat(d.open),
              h: parseFloat(d.high),
              l: parseFloat(d.low),
              c: parseFloat(d.close),
            })),
            color: {
              up: "#4CAF50",
              down: "#FF5252",
              unchanged: "#999",
            },
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time", // Use 'time' scale for time-based axis
            time: {
              unit: "day",
              tooltipFormat: "YYYY-MM-DD",
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
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const data = ctx.raw;
                return [
                  `Open: ${data.o.toFixed(2)}`,
                  `High: ${data.h.toFixed(2)}`,
                  `Low: ${data.l.toFixed(2)}`,
                  `Close: ${data.c.toFixed(2)}`,
                ];
              },
            },
          },
        },
      };

      chartInstance.current = new ChartJS(ctx, {
        type: "candlestick",
        data: candlestickData,
        options: options,
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
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
          <h3 style={{ marginTop: "30px" }}>Prediction Details</h3>
          <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <table style={{ width: "100%", textAlign: "left", border: "1px solid #ddd" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Actual Price</th>
                  <th>Predicted Price</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.actual_price}</td>
                    <td>{item.predicted_price}</td>
                    <td>{item.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Container>
  );
}

export default App;