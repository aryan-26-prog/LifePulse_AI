const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getAdminDashboard, deleteHealthReport, blockNGO, getFullAreaStats, HealthCSV, getAIRiskPerArea, getAllNGOs, getAllReports, getReportAnalytics } = require("../controllers/adminController");

// ADMIN ONLY
router.get(
  "/dashboard",
  auth,
  allowRoles("admin"),
  getAdminDashboard
);

router.get(
  "/reports",
  auth,
  allowRoles("admin"),
  getAllReports
);


// delete ngo
router.delete(
  "/report/:id",
  auth,
  allowRoles("admin"),
  deleteHealthReport
);

router.get(
  "/ngos",
  auth,
  allowRoles("admin"),
  getAllNGOs
);


//block ngo
router.put(
  "/ngo/:id/block",
  auth,
  allowRoles("admin"),
  blockNGO
);

//get stats
router.get(
  "/stats/area",
  auth,
  allowRoles("admin"),
  getFullAreaStats
);

//get csv
router.get(
  "/export/csv",
  auth,
  allowRoles("admin"),
  HealthCSV
);

router.get(
  "/ai-risk/area",
  auth,
  allowRoles("admin"),
  getAIRiskPerArea
);

router.get(
  "/analytics/reports",
  auth,
  allowRoles("admin"),
  getReportAnalytics
)

module.exports = router;
