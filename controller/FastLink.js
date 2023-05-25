const FastLink = require("../models/FastLink");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const {  imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createFastLink = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { name, about } = req.body;

  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  if (valueRequired(req.body.picture)) {
    throw new MyError("Зураг оруулна уу", 404);
  }

  const fastLink = await FastLink.create(req.body);

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.getFastLinks = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status || null;
  const name = req.query.name;
  const about = req.query.about;
  const direct = req.query.direct;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  ["status", "name", "about", "direct"].forEach((el) => delete req.query[el]);

  // Query
  const query = FastLink.find();

  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(about)) {
    query.find({
      $or: [
        { "eng.about": RegexOptions(about) },
        { "mn.about": RegexOptions(about) },
      ],
    });
  }

  if (valueRequired(direct)) {
    query.find({ direct: RegexOptions(direct) });
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, FastLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const fastLink = await query.exec();

  res.status(200).json({
    success: true,
    count: fastLink.length,
    data: fastLink,
    pagination,
  });
});

const getFullData = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status || null;
  const name = req.query.name;
  const about = req.query.about;
  const direct = req.query.direct;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  ["status", "name", "about", "direct"].forEach((el) => delete req.query[el]);

  // Query
  const query = FastLink.find();

  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(about)) {
    query.find({
      $or: [
        { "eng.about": RegexOptions(about) },
        { "mn.about": RegexOptions(about) },
      ],
    });
  }

  if (valueRequired(direct)) {
    query.find({ direct: RegexOptions(direct) });
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const fastLink = await query.exec();

  res.status(200).json({
    success: true,
    count: fastLink.length,
    data: fastLink,
  });
});

exports.multDeleteFastLink = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findFastLink = await FastLink.find({ _id: { $in: ids } });

  if (findFastLink.length <= 0) {
    throw new MyError("Сонгодсон өгөгдлүүд олдсонгүй", 404);
  }

  findFastLink.map(async (el) => {
    await imageDelete(el.picture);
  });

  const fastLink = await FastLink.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getFastLink = asyncHandler(async (req, res, next) => {
  const fastLink = await FastLink.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!fastLink) {
    throw new MyError("Тухайн линк байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.updateFastLink = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { name, about } = req.body;

  language === "eng" ? delete req.body.mn : delete req.body.eng;
  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  let fastLink = await FastLink.findById(req.params.id);

  if (!fastLink) {
    throw new MyError("Өгөгдөл олдсонгүй. ", 404);
  }

  if (!req.body.picture) {
    throw new MyError("Зураг оруулна уу", 400);
  }

  req.body.updateAt = Date.now();
  req.body.updateUser = req.userId;

  fastLink = await FastLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: fastLink,
  });
});

exports.getCountFastLink = asyncHandler(async (req,res) => {
    const count = await Book.count();
    res.status(200).json({
        success: true,
        data: count,
    })
})
