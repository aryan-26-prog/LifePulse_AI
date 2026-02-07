import math


# ================= UTILITY =================

def normalize(value, max_val):
    try:
        return min(float(value) / float(max_val), 1)
    except:
        return 0


# ================= WEATHER MODIFIER =================

def weather_modifier(weather):

    modifier = 1.0

    humidity = float(weather.get("humidity", 50))
    wind = float(weather.get("windSpeed", 3))
    temp = float(weather.get("temperature", 25))

    if humidity > 80:
        modifier += 0.10

    if wind < 1:
        modifier += 0.15
    elif wind < 2:
        modifier += 0.07

    if temp > 38:
        modifier += 0.10

    if temp < 5:
        modifier += 0.08

    return modifier


# ================= HUMAN VULNERABILITY =================

def human_vulnerability(health):

    stress = min(float(health.get("stress", 0)), 10) / 10

    sleep = float(health.get("sleep", 7))
    sleep_penalty = 0

    if sleep < 5:
        sleep_penalty = 0.4
    elif sleep < 7:
        sleep_penalty = 0.2

    symptom_weights = {
        "cough": 0.2,
        "fever": 0.25,
        "breathing_issue": 0.4,
        "headache": 0.15
    }

    symptom_score = sum(
        symptom_weights.get(s, 0.1)
        for s in health.get("symptoms", [])
    )

    vulnerability = stress * 0.5 + sleep_penalty + symptom_score

    return min(vulnerability, 1)


# ================= TREND INTELLIGENCE =================

def trend_factor(current_aqi, history):

    try:
        history = [float(x) for x in history]
    except:
        history = []

    if len(history) < 2:
        return 1

    momentum = history[-1] - history[0]

    if momentum > 30:
        return 1.12
    elif momentum > 10:
        return 1.05
    elif momentum < -20:
        return 0.92

    return 1


# ================= AQI → RISK MAPPING =================

def classify_risk(aqi):

    if aqi <= 50:
        return "LOW"

    elif aqi <= 200:
        return "MEDIUM"

    elif aqi <= 300:
        return "HIGH"

    return "SEVERE"


# ================= FINAL AI ENGINE =================

def calculate_risk(health, env, history=None):

    if history is None:
        history = []

    base_aqi = float(env.get("aqi", 0))

    weather = {
        "temperature": env.get("temperature", 25),
        "humidity": env.get("humidity", 50),
        "windSpeed": env.get("windSpeed", 3)
    }

    # ===== Weather + Trend Adjusted AQI =====
    weather_adj = base_aqi * weather_modifier(weather)
    trend_adj = weather_adj * trend_factor(base_aqi, history)

    adjusted_aqi = min(500, trend_adj)

    # ===== Risk Classification =====
    risk = classify_risk(adjusted_aqi)

    # ===== Scores =====
    env_score = normalize(adjusted_aqi, 500)
    human_score = human_vulnerability(health)

    confidence = (env_score * 0.7) + (human_score * 0.3)

    return {
        "risk": risk,
        "finalAQI": int(adjusted_aqi),
        "envScore": round(env_score, 2),
        "humanScore": round(human_score, 2),
        "confidence": round(confidence, 2)
    }