const Contact = require("../models/Contact");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { RegexOptions } = require("../lib/searchOfterModel");
const { valueRequired } = require("../lib/check");

exports.createContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.create(req.body);
  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.getContacts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //   Contact Fileds
  const name = req.query.name;
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(email)) {
    query.find({ email: RegexOptions(email) });
  }

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
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

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Book, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const contact = await query.exec();

  res.status(200).json({
    success: true,
    count: contact.length,
    data: contact,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //   Contact Fileds
  const name = req.query.name;
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(email)) {
    query.find({ email: RegexOptions(email) });
  }

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
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
  const contact = await query.exec();

  res.status(200).json({
    success: true,
    count: contact.length,
    data: contact,
  });
});

exports.multDeleteContact = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findContacts = await Contact.find({ _id: { $in: ids } });

  if (findContacts.length <= 0) {
    throw new MyError("Таны сонгосон сэтгэгдэлүүд олдсонгүй", 404);
  }

  const contact = await Contact.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new MyError("Сэтгэгдэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.getCountContact = asyncHandler(async (req, res) => {
  const count = await Contact.count();
  res.status(200).json({
    success: true,
    data: count,
  });
});
