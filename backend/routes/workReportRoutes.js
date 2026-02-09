const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  submitWorkReport,
  approveReport,
  rejectReport,
  getCampReports
} = require("../controllers/workReportController");


router.post(
  "/submit/:volunteerId",
  upload.array("images", 5),
  submitWorkReport
);

router.get(
  "/camp/:campId",
  getCampReports
);


router.put(
  "/approve/:reportId",
  approveReport
);


router.put(
  "/reject/:reportId",
  rejectReport
);


module.exports = router;
