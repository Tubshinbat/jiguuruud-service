const NewsCategories = require("../models/NewsCategories");
const News = require("../models/news");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { valueRequired } = require("../lib/check");

exports.createNewsCategories = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  const parentId = req.body.parentId || null;
  let position = 0;

  language === "eng" ? delete req.body.mn : delete req.body.eng;
  delete req.body.name;

  req.body[language] = {
    name,
  };

  if (parentId) {
    const category = await NewsCategories.findOne({ parentId }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  } else {
    const category = await NewsCategories.findOne({ parentId: null }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  }

  req.body.position = position;

  const category = await NewsCategories.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

function createCategory(categories, parentId = null) {
  const categoryList = [];
  let category = null;
  const language = req.cookies.language || "mn";

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      [language]: {
        name: cate.name,
      },
      slug: cate.slug,
      position: cate.position,
      children: createCategory(categories, cate._id),
    });
  }

  return categoryList;
}

exports.getNewsCategories = asyncHandler(async (req, res) => {
  NewsCategories.find({})
    .sort({ position: 1 })
    .exec((error, categories) => {
      if (error) {
        return res.status(400).json({
          success: false,
          error,
        });
      }
      if (categories) {
        const categoryList = createCategory(categories);

        res.status(200).json({
          success: true,
          data: categoryList,
        });
      }
    });
});

exports.getNewsCategory = asyncHandler(async (req, res) => {
  const categories = await NewsCategories.findById(req.params.id);

  if (!categories) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: categories,
  });
});

exports.deleteNewsCategory = asyncHandler(async (req, res) => {
  const category = NewsCategories.findById(req.params.id);
  const verify = req.params.verify;

  if (category) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const news = News.find({}).where("categories").in(req.params.id);

  if (news && news.length > 0) {
    if (valueRequired(verify)) {
      throw new MyError(
        "Холбогдсон мэдээллүүдээс тус ангилалыг мөн адил арилгах болно",
        400
      );
    }

    if (verify == "cancel") {
      throw new MyError("Устгах үйлдэл амжилтгүй боллоо", 400);
    }
  }

  if (verify == "accept") {
    News.updateMany(
      { categories: { $in: [req.params.id] } },
      { $pullAll: { categories: [req.params.id] } }
    );
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateNewsCategory = asyncHandler(async (req, res) => {
  const name = req.body.name;
  let language = req.cookies.language || "mn";

  req.body[language] = {
    name,
  };

  ["name"].map((el) => delete req.body[el]);

  const newsCategory = await NewsCategories.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!newsCategory) {
    throw new MyError("Мэдээлэл солигдсонгүй дахин оролдоно уу", 400);
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});
