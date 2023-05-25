const Book = require("../models/Book");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createBook = asyncHandler(async (req, res, next) => {
  const book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.getBooks = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // Book fields
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  // -- Search
  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(about)) {
    query.find({ about: RegexOptions(about) });
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

  // QUERY BUILDS
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Book, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const books = await query.exec();

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // Book fields
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  // -- Search
  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(about)) {
    query.find({ about: RegexOptions(about) });
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

  // QUERY BUILDS
  query.select(select);
  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });

  const books = await query.exec();

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  });
});

exports.multDeleteBook = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBooks = await Book.find({ _id: { $in: ids } });

  if (findBooks.length <= 0) {
    throw new MyError("Таны сонгосон номнууд байхгүй байна", 400);
  }

  findBooks.map(async (el) => {
    await imageDelete(el.picture);
  });

  const book = await Book.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!book) {
    throw new MyError("Тухайн ном олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError("Тухайн ном олдсонгүй. ", 404);
  }

  req.body.updateAt = Date.now();
  req.body.updateUser = req.userId;

  const updateBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updateBook,
  });
});

exports.getCountBook = asyncHandler(async (req, res) => {
  const count = await Book.count();
  res.status(200).json({
    success: true,
    data: count,
  });
});
