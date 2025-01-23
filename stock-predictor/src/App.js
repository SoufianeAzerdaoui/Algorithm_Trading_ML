import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload a file");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Log the response for debugging
      console.log('Predictions:', response.data);

      // Set predictions for rendering
      setPredictions(response.data);

    } catch (err) {
      // Log detailed error information for debugging
      console.error('Error uploading file or running predictions:', err);

      // Handle different types of errors (network, server, etc.)
      if (err.response) {
        // The server responded with a status other than 2xx
        setError(`Server Error: ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made, but no response was received
        setError('Network Error: No response from server.');
      } else {
        // Something else caused the error
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="App">
      <h1>Stock Predictor</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Predict</button>

      {error && <p className="error">{error}</p>}

      <h2>Predictions:</h2>
      {predictions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred, index) => (
              <tr key={index}>
                <td>{pred.timestamp}</td>
                <td>{pred.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No predictions yet</p>
      )}
    </div>
  );
}

export default App;
