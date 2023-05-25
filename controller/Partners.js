const Partner = require("../models/Partner");
const asyncHandler = require("express-async-handler");

//  UTILS
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate");
const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createPartner = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || true;
  req.body.createUser = req.userId;

  const partner = await Partner.create(req.body);

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.getPartners = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  // SEARCH
  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(link)) {
    query.find({ link: RegexOptions(link) });
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  // -- SORT
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

  //Query builds
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Partner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const partners = await query.exec();

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  // SEARCH
  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(link)) {
    query.find({ link: RegexOptions(link) });
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  // -- SORT
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

  //Query builds
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const partners = await query.exec();

  res.status(200).json({
    success: true,
    data: partners,
  });
});

exports.multDeletePartner = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findPartners = await Partner.find({ _id: { $in: ids } });

  if (findPartners.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд байхгүй байна.", 404);
  }

  findPartners.map((el) => {
    if (el.pictures && el.pictures.length > 0) {
      el.pictures.map(async (picture) => {
        await imageDelete(picture);
      });
    }
  });

  await Partner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.updatePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  req.body.updateAt = Date.now();
  req.body.updateUser = req.userId;

  const updatePartner = await Partner.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatePartner,
  });
});

exports.getPartnerCount = asyncHandler(async (req, res) => {
  const partner = await Partner.count();
  res.status(200).json({
    success: true,
    data: partner,
  });
});
