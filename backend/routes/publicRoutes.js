const express = require("express");
const router = express.Router();

const { getAIRiskPerArea } = require("../controllers/analyticsController");
const {
  getEnvironmentByArea,
  getEnvironmentByCoords,
  getAQIHistory
} = require("../controllers/environmentController");

router.get("/ai-risk/area", getAIRiskPerArea);
router.get("/environment/area", getEnvironmentByArea);
router.get("/environment/coords", getEnvironmentByCoords);
router.get("/environment/history", getAQIHistory);

module.exports = router;
