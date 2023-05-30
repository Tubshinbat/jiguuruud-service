const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createNewsCategories,
  getNewsCategories,
  getNewsCategory,
  deleteNewsCategory,
  updateNewsCategory,
  changePosition,
} = require("../controller/NewsCategories");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createNewsCategories)
  .get(getNewsCategories);

router
  .route("/change")
  .post(protect, authorize("admin", "operator"), changePosition);

// "/api/v1/News-categories/id"
router
  .route("/:id")
  .get(getNewsCategory)
  .delete(protect, authorize("admin"), deleteNewsCategory)
  .put(protect, authorize("admin", "operator"), updateNewsCategory);

module.exports = router;
