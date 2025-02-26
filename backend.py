from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import papermill as pm
import os
import shutil

# Create FastAPI app
app = FastAPI()

# Allow frontend (React) to communicate with backend
origins = [
    "http://localhost:3000",  # Adjust if frontend runs on a different port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],  # Only allow POST
    allow_headers=["*"],
)

# Directory paths
NOTEBOOK_DIR = "C:/Users/PC/Desktop/ml_project/Algorithm_Trading_ML/"
DATA_DIR = "data"
PREDICTIONS_FILE = os.path.join(DATA_DIR, "final_predictions.csv")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)


def execute_pipeline():
    """Runs the Jupyter notebooks for data processing and model training."""
    try:
        print("Running notebook: Fetch Data")
        pm.execute_notebook(
            os.path.join(NOTEBOOK_DIR, 'get_any_data_from_finance_yahoo.ipynb'),
            os.path.join(NOTEBOOK_DIR, 'output_get_any_data_from_finance_yahoo.ipynb')
        )

        print("Running notebook: Preprocess Data")
        pm.execute_notebook(
            os.path.join(NOTEBOOK_DIR, 'DataProprecessing.ipynb'),
            os.path.join(NOTEBOOK_DIR, 'output_DataProprecessing.ipynb')
        )

        print("Running notebook: Train and Evaluate Models")
        pm.execute_notebook(
            os.path.join(NOTEBOOK_DIR, 'Models.ipynb'),
            os.path.join(NOTEBOOK_DIR, 'output_Models.ipynb')
        )

        print("✅ Pipeline execution completed successfully.")
        return True
    except Exception as e:
        print(f"❌ Pipeline execution failed: {e}")
        return str(e)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Receives a CSV file, runs the pipeline, and returns predictions."""
    try:
        # Save uploaded file
        input_file_path = os.path.join(DATA_DIR, file.filename)
        with open(input_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        print(f"📂 File saved: {input_file_path}")

        # Run the ML pipeline
        result = execute_pipeline()
        if result is not True:
            raise HTTPException(status_code=500, detail=f"Pipeline failed: {result}")

        # Check if predictions exist
        if not os.path.exists(PREDICTIONS_FILE):
            print(f"❌ Prediction file not found: {os.path.abspath(PREDICTIONS_FILE)}")
            raise HTTPException(status_code=404, detail="Prediction file not found.")

        # Load predictions
        predictions = pd.read_csv(PREDICTIONS_FILE)

        print("✅ Predictions generated successfully.")
        return JSONResponse(content=predictions.to_dict(orient="records"))

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# Run FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
