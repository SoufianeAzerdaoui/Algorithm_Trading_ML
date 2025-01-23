import papermill as pm

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
    except Exception as e:
        print(f"Pipeline execution failed: {e}")

if __name__ == "__main__":
    execute_pipeline()
