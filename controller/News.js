const News = require("../models/News");
const NewsCategories = require("../models/NewsCategories");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const {
  RegexOptions,
  useNewsCategorySearch,
  userSearch,
} = require("../lib/searchOfterModel");

exports.createNews = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  req.body.createUser = req.userId;
  req.body.status = (valueRequired(req.body.status) && req.body.status) || true;
  req.body.star = (valueRequired(req.body.star) && req.body.star) || false;

  // FIELDS
  const name = req.body.name;
  const details = req.body.details;
  const shortDetails = req.body.shortDetails;

  //DELETE FIELDS
  ["language", "shortDetails", "name", "details"].map(
    (data) => delete req.body[data]
  );

  req.body[language] = {
    name,
    details,
    shortDetails,
  };

  const news = await News.create(req.body);

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getNews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  // NEWS FIELDS
  const select = req.query.select;
  const status = req.query.status;
  const name = req.query.name;
  const type = req.query.type;
  const categories = req.query.categories;
  const details = req.query.details;
  const category = req.query.category;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const sortNews = req.query.sortNews;
  let star = req.query.star;

  //DELETE
  [
    "select",
    "sort",
    "page",
    "limit",
    "category",
    "details",
    "status",
    "name",
    "star",
    "sortNews",
  ].forEach((el) => delete req.query[el]);

  if (valueRequired(sortNews)) {
    if (sortNews === "views") sort = { views: -1 };
    if (sortNews === "star") star = "true";
    if (sortNews === "last") sort = { createAt: -1 };
  }

  const query = News.find({});

  // -- SEARCH
  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(details)) {
    query.find({
      $or: [
        { "eng.details": RegexOptions(details) },
        { "mn.details": RegexOptions(details) },
      ],
    });
  }
  if (valueRequired(type)) {
    query.where("type").equals(type);
  }

  if (valueRequired(category)) {
    const result = await useNewsCategorySearch(category);
    if (result && result.length > 0) {
      query.where("categories").in(result);
    }
  }

  if (valueRequired(categories)) {
    query.where("categories").in(categories);
  }

  if (valueRequired(type)) {
    query.where("type").equals(type);
  }

  if (valueRequired(createUser)) {
    const result = await userSearch(createUser);
    if (result && result.length > 0) {
      query.where("createUser").in(result);
    }
  }

  if (valueRequired(updateUser)) {
    const result = await userSearch(updateUser);
    if (result && result.length > 0) {
      query.where("updateUser").in(result);
    }
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let sortName = "";
      if (
        spliteSort[0] === "name" ||
        spliteSort[0] === "details" ||
        spliteSort[0] === "shortDetails"
      ) {
        sortName = `${language}.${spliteSort[0]}`;
      } else {
        sortName = spliteSort[0];
      }

      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [sortName]: 1 };
      } else {
        convertSort = { [sortName]: -1 };
      }
      if (sortName != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("categories");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, News, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const news = await query.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  let sort = req.query.sort || { createAt: -1 };

  // NEWS FIELDS
  const select = req.query.select;
  const status = req.query.status;
  const name = req.query.name;
  const type = req.query.type;
  const categories = req.query.categories;
  const details = req.query.details;
  const category = req.query.category;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const sortNews = req.query.sortNews;
  let star = req.query.star;

  //DELETE
  [
    "select",
    "sort",
    "page",
    "limit",
    "category",
    "details",
    "status",
    "name",
    "star",
    "sortNews",
  ].forEach((el) => delete req.query[el]);

  if (valueRequired(sortNews)) {
    if (sortNews === "views") sort = { views: -1 };
    if (sortNews === "star") star = "true";
    if (sortNews === "last") sort = { createAt: -1 };
  }

  const query = News.find();
  // -- SEARCH
  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(details)) {
    query.find({
      $or: [
        { "eng.details": RegexOptions(details) },
        { "mn.details": RegexOptions(details) },
      ],
    });
  }
  if (valueRequired(type)) {
    query.where("type").equals(type);
  }

  if (valueRequired(category)) {
    const result = await useNewsCategorySearch(category);
    if (result && result.length > 0) {
      query.where("categories").in(result);
    }
  }

  if (valueRequired(categories)) {
    query.where("categories").in(categories);
  }

  if (valueRequired(type)) {
    query.where("type").equals(type);
  }

  if (valueRequired(createUser)) {
    const result = await userSearch(createUser);
    if (result && result.length > 0) {
      query.where("createUser").in(result);
    }
  }

  if (valueRequired(updateUser)) {
    const result = await userSearch(updateUser);
    if (result && result.length > 0) {
      query.where("updateUser").in(result);
    }
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let sortName = "";
      if (
        spliteSort[0] === "name" ||
        spliteSort[0] === "details" ||
        spliteSort[0] === "shortDetails"
      ) {
        sortName = `${language}.${spliteSort[0]}`;
      } else {
        sortName = spliteSort[0];
      }

      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [sortName]: 1 };
      } else {
        convertSort = { [sortName]: -1 };
      }
      if (sortName != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("categories");
  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });

  const news = await query.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
  });
});

exports.multDeleteNews = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findDatas = await News.find({ _id: { $in: ids } });

  if (findDatas.length <= 0) {
    throw new MyError("Сонгосон өгөгдөлүүд олдсонгүй.", 404);
  }

  findDatas.map((el) => {
    if (el.pictures && el.pictures.length > 0) {
      el.pictures.map(async (picture) => {
        await imageDelete(picture);
      });
    }
  });

  const news = await News.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getOneNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.updateNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  const { name, details } = req.body;
  const language = req.cookies.language || "mn";

  if (!news) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  language === "eng" ? delete req.body.mn : delete req.body.eng;
  req.body[language] = {
    name,
    details,
  };

  req.body.updateAt = Date.now();
  req.body.updateUser = req.userId;

  const updateNews = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updateNews,
  });
});

exports.getNewsCount = asyncHandler(async (req, res) => {
  const news = await News.count();
  res.status(200).json({
    success: true,
    data: news,
  });
});
