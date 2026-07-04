const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const {
    getAdminNews,
    updateNews,
    approveNews,
    rejectNews,
    deleteNews,
    bulkApproveNews,
    bulkRejectNews,
    bulkDeleteNews
} = require("../controllers/adminNews.controller");

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get("/", getAdminNews);
router.put("/:id", updateNews);
router.post("/bulk-approve", bulkApproveNews);
router.post("/bulk-reject", bulkRejectNews);
router.post("/bulk-delete", bulkDeleteNews);
router.post("/:id/approve", approveNews);
router.post("/:id/reject", rejectNews);
router.delete("/:id", deleteNews);

module.exports = router;
