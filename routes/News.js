const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createNews,
  getNews,
  multDeleteNews,
  updateNews,
  getOneNews,
  excelData,
  getNewsCount,
} = require("../controller/News");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createNews)
  .get(getNews);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getNewsCount);

router.route("/excel").get(excelData);

router.route("/delete").delete(protect, authorize("admin"), multDeleteNews);
router
  .route("/:id")
  .get(getOneNews)
  .put(protect, authorize("admin", "operator"), updateNews);

module.exports = router;
