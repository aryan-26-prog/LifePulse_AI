from pydantic import BaseModel
from typing import List, Optional


class HealthData(BaseModel):
    sleep: float
    stress: float
    symptoms: List[str]


class EnvironmentData(BaseModel):
    aqi: float
    temperature: float
    humidity: float
    windSpeed: float


class PredictionRequest(BaseModel):
    health_data: List[HealthData]
    environment: EnvironmentData
    history: Optional[List[float]] = []