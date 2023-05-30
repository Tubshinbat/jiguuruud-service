// MODELS
const Banner = require("../models/Banner");

// MIDLE
const asyncHandler = require("express-async-handler");

// UTILS
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");

//LIB
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createBanner = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const { name, details } = req.body;
  req.body.createUser = req.userId;
  const type = req.body.type;

  const typeBanner = await Banner.find({ type: type });

  if (typeBanner && typeBanner.length > 0 && req.body.type === "video") {
    throw new MyError(
      "Өмнө видео баннер оруулсан зөвхөн ганцхан видео баннер оруулах боломжтой",
      400
    );
  }

  req.body[language] = {
    name,
    details,
  };

  const banner = await Banner.create(req.body);
  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getBanners = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //BANNER SEARCH FIELDS
  const name = req.query.name;
  const link = req.query.link;
  const type = req.query.type;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  // Query start
  const query = Banner.find();

  // -- Search
  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(link))
    query.find({ link: { $regex: ".*" + link + ".*", $options: "i" } });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  // SORT
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

  // QUERY BUILDS
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Banner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const banner = await query.exec();

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banner,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //BANNER SEARCH FIELDS
  const name = req.query.name;
  const link = req.query.link;
  const type = req.query.type;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  // Query start
  const query = Banner.find();

  // -- Search
  if (valueRequired(name)) {
    query.find({
      $or: [
        { "eng.name": RegexOptions(name) },
        { "mn.name": RegexOptions(name) },
      ],
    });
  }

  if (valueRequired(link))
    query.find({ link: { $regex: ".*" + link + ".*", $options: "i" } });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  // SORT
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

  // QUERY BUILDS
  query.select(select);
  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });

  const banner = await query.exec();

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banner,
  });
});

exports.multDeleteBanner = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBanner = await Banner.find({ _id: { $in: ids } });

  if (findBanner.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  findBanner.map(async (el) => {
    el.photo && (await imageDelete(el.photo));
    el.video && (await imageDelete(el.video));
  });

  await Banner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!banner) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  let banner = await Banner.findById(req.params.id);
  const { name, details } = req.body;
  const language = req.cookies.language || "mn";

  if (!banner) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй", 404);
  }

  language === "eng" ? delete req.body.mn : delete req.body.eng;
  req.body[language] = {
    name,
    details,
  };

  if (req.body.type == "photo") req.body.video = "";
  else req.body.picture = "";

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getCountBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.count();
  res.status(200).json({
    success: true,
    data: banner,
  });
});
