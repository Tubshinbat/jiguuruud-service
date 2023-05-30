const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBanner,
  getBanners,
  getFullData,
  multDeleteBanner,
  getBanner,
  updateBanner,
} = require("../controller/Banner");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createBanner)
  .get(getBanners);
router
  .route("/excel")
  .get(protect, authorize("admin", "operator"), getFullData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteBanner);
router
  .route("/:id")
  .get(getBanner)
  .put(protect, authorize("admin", "operator"), updateBanner);

module.exports = router;
