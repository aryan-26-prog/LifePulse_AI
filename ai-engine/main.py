from fastapi import FastAPI
from schemas import PredictionRequest
from risk_engine import calculate_risk

app = FastAPI(title="LifePulse AI Risk Engine")


@app.post("/predict")
def predict(data: PredictionRequest):

    results = []

    for h in data.health_data:

        risk = calculate_risk(
            h.dict(),
            data.environment.dict(),
            data.history or []
        )

        results.append({
            "risk": risk,
            "symptoms": h.symptoms
        })

    return {"predictions": results}