const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const {
    getAdminUsers,
    updateUser,
    toggleUserStatus,
    deleteUser
} = require("../controllers/adminUser.controller");

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get("/", getAdminUsers);
router.put("/:id", updateUser);
router.post("/:id/toggle-status", toggleUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;
