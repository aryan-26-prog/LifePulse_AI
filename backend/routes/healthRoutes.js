const healthRouter = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { submitHealth } = require("../controllers/healthController");

healthRouter.post("/", submitHealth);

module.exports = healthRouter;