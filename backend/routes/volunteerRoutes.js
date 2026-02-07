const express = require("express");
const router = express.Router();

const {
  getActiveCamps,
  getVolunteerDashboard,
  joinCamp,
  leaveCamp,
  getRegisteredVolunteers
} = require("../controllers/volunteerController");

/*  STATIC ROUTES FIRST */
router.get("/volunteers", getRegisteredVolunteers);
router.get("/active-camps", getActiveCamps);

/* DYNAMIC ROUTES LAST */
router.get("/:id/dashboard", getVolunteerDashboard);
router.put("/:id/join", joinCamp);
router.put("/:id/leave", leaveCamp);

module.exports = router;
