const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


module.exports = router;
