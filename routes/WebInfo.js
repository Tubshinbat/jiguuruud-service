const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createWebinfo,
  updateWebInfo,
  getWebinfo,
} = require("../controller/WebInfo");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createWebinfo)
  .get(getWebinfo);

router.route("/").put(protect, authorize("admin", "operator"), updateWebInfo);

module.exports = router;
