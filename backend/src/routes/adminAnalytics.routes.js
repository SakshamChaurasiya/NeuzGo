const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const { getAdminAnalytics } = require("../controllers/adminAnalytics.controller");

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get("/", getAdminAnalytics);

module.exports = router;
