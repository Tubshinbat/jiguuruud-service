const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createFaq,
  getFaq,
  getFullData,
  multDeleteFaq,
  updateFaq,
  getFaqs,
} = require("../controller/Faqs");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createFaq)
  .get(getFaqs);
router
  .route("/excel")
  .get(protect, authorize("admin", "operator"), getFullData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteFaq);
router
  .route("/:id")
  .get(getFaq)
  .put(protect, authorize("admin", "operator"), updateFaq);

module.exports = router;
