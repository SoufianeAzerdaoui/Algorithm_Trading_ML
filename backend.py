from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import papermill as pm
import os
import shutil

# Create a FastAPI app
app = FastAPI()

# Allow CORS for the frontend app
origins = [
    "http://localhost:3000",  # React frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


# Endpoint to run the pipeline
def execute_pipeline():
    try:
        print("Running notebook: Fetch Data")
        pm.execute_notebook(
            'get_any_data_from_finance_yahoo.ipynb',
            'output_get_any_data_from_finance_yahoo.ipynb'
        )
        
        print("Running notebook: Preprocess Data")
        pm.execute_notebook(
            'DataProprecessing.ipynb',
            'output_DataProprecessing.ipynb'
        )
        
        print("Running notebook: Train and Evaluate Models")
        pm.execute_notebook(
            'Models.ipynb',
            'output_Models.ipynb'
        )
        
        print("Pipeline execution completed successfully.")
        return True
    except Exception as e:
        print(f"Pipeline execution failed: {e}")
        return str(e)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Ensure the data directory exists
        os.makedirs("data", exist_ok=True)

        # Save the uploaded file
        input_file_path = f"data/{file.filename}"
        with open(input_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Run pipeline
        result = execute_pipeline()
        if result is not True:
            return JSONResponse(status_code=500, content={"error": result})

        # Check if predictions file exists
        predictions_path = "data/final_predictions.csv"
        if not os.path.exists(predictions_path):
            return JSONResponse(status_code=404, content={"error": "Prediction file not found."})

        # Read and return predictions
        predictions = pd.read_csv(predictions_path)
        return JSONResponse(content=predictions.to_dict(orient="records"))

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
