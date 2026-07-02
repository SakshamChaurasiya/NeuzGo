const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
    getBookmarks,
    addBookmarks,
    deleteBookmark,
} = require("../controllers/bookmark.controller");

const router = express.Router();

router.use(protect);

router.route("/")
    .get(getBookmarks)
    .post(addBookmarks);

router.delete("/:id", deleteBookmark);

module.exports = router;