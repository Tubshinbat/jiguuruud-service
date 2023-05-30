const NewsCategories = require("../models/NewsCategories");
const News = require("../models/News");
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

function createCategory(categories, parentId = null, language) {
  const categoryList = [];
  let category = null;

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      mn: {
        name: cate["mn"] && cate["mn"].name,
      },
      eng: {
        name: cate["eng"] && cate["eng"].name,
      },

      slug: cate.slug,
      position: cate.position,
      children: createCategory(categories, cate._id, language),
    });
  }

  return categoryList;
}

exports.changePosition = asyncHandler(async (req, res) => {
  menus = req.body.data;

  if (!menus && menus.length > 0) {
    throw new MyError("Дата илгээгүй байна дахин шалгана уу", 404);
  }

  const positionChange = (categories, pKey = null) => {
    if (categories) {
      categories.map(async (el, index) => {
        const data = {
          position: index,
          parentId: pKey,
        };
        await NewsCategories.findByIdAndUpdate(el.key, data);
        if (el.children && el.children.length > 0) {
          const parentKey = el.key;
          positionChange(el.children, parentKey);
        }
      });
    }
  };

  positionChange(menus);

  res.status(200).json({
    success: true,
  });
});

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
        const categoryList = createCategory(
          categories,
          null,
          req.cookies.language
        );

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
  const category = await NewsCategories.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const news = await News.find({}).where("categories").in(req.params.id);

  // if (news && news.length > 0) {
  //   if (valueRequired(verify)) {
  //     throw new MyError(
  //       "Холбогдсон мэдээллүүдээс тус ангилалыг мөн адил арилгах болно",
  //       400
  //     );
  //   }

  //   if (verify == "cancel") {
  //     throw new MyError("Устгах үйлдэл амжилтгүй боллоо", 400);
  //   }
  // }

  // if (verify == "accept") {
  //
  // }

  if (news && news.length > 0) {
    await News.updateMany(
      { categories: { $in: [req.params.id] } },
      { $pullAll: { categories: [req.params.id] } }
    );
  }

  await deleteChildMenus(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
});

const deleteChildMenus = async (parentId) => {
  const menus = await NewsCategories.deleteMany({})
    .where("parentId")
    .in(parentId);

  if (menus && menus.length > 0) {
    await newsPull(menus);
  }
};

const newsPull = async (menus) => {
  menus.map(async (menu) => {
    await News.updateMany(
      { categories: { $in: [menu.id] } },
      { $pullAll: { categories: [menu.id] } }
    );
  });
};

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
    throw new MyError("Өгөгдөл солигдсонгүй дахин оролдоно уу", 400);
  }
  res.status(200).json({
    success: true,
    data: newsCategory,
  });
});
