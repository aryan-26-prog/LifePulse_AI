const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getFullAreaStats } = require("../controllers/adminController");
const { deployRelief, assignVolunteers, getCampById, closeCamp, getAllCamps } = require("../controllers/ngoController");
const { getRegisteredVolunteers } = require("../controllers/volunteerController");

// NGO can VIEW stats (read-only)
router.get(
  "/stats/area",
  auth,
  allowRoles("ngo", "admin"),
  getFullAreaStats
);

router.post("/deploy-relief", deployRelief);
router.post("/assign-volunteers", assignVolunteers);
router.get("/camp/:campId", getCampById);
router.post("/close-camp", closeCamp);
router.get("/volunteers", getRegisteredVolunteers);
router.get("/camps", getAllCamps);


module.exports = router;
