const Employees = require("../models/Employees");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const { name, about, degree } = req.body;

  ["about", "name", "degree", "language", "picture"].map(
    (el) => delete req.body[el]
  );

  req.body[language] = {
    name,
    about,
    degree,
    picture,
  };
  req.body.crateUser = req.userId;
  const employee = await Employees.create(req.body);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getEmployees = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //EMPLOYEES SEARCH FIELDS
  const status = req.query.status || null;
  const name = req.query.name;
  const email = req.query.email;
  const degree = req.query.degree;
  const about = req.query.about;
  const phoneNumber = req.query.phoneNumber;

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

  if (valueRequired(email)) {
    query.find({
      $or: [
        { "eng.email": RegexOptions(email) },
        { "mn.email": RegexOptions(email) },
      ],
    });
  }

  if (valueRequired(degree)) {
    query.find({
      $or: [
        { "eng.degree": RegexOptions(degree) },
        { "mn.degree": RegexOptions(degree) },
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

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
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

  // Query builds
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Employees, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const employee = await query.exec();

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //EMPLOYEES SEARCH FIELDS
  const status = req.query.status || null;
  const name = req.query.name;
  const email = req.query.email;
  const degree = req.query.degree;
  const about = req.query.about;
  const phoneNumber = req.query.phoneNumber;

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

  if (valueRequired(email)) {
    query.find({
      $or: [
        { "eng.email": RegexOptions(email) },
        { "mn.email": RegexOptions(email) },
      ],
    });
  }

  if (valueRequired(degree)) {
    query.find({
      $or: [
        { "eng.degree": RegexOptions(degree) },
        { "mn.degree": RegexOptions(degree) },
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

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
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

  // Query builds
  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const employee = await query.exec();

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
  });
});

exports.multDeleteEmployees = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findEmployees = await Employees.find({ _id: { $in: ids } });

  if (findEmployees.length <= 0) {
    throw new MyError("Сонгодсон өгөгдөлүүд олдсонгүй", 400);
  }

  findEmployees.map(async (el) => {
    await imageDelete(el.avatar);
  });

  const employee = await Employees.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employees.findById(req.params.id).populate(
    "positions"
  );

  if (!employee) {
    throw new MyError("Тухайн ажилтан байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  const about = req.body.about;
  const degree = req.body.degree;

  ["name", "about", "degree", "language"].map((el) => delete req.body[el]);

  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body[language] = {
    name,
    degree,
    about,
  };

  let employee = await Employees.findById(req.params.id);
  let fileNames = [];
  let oldFiles = req.body.oldPicture || null;

  console.log(req.body);

  if (!employee) {
    throw new MyError("Тухайн ажилтан байхгүй байна. ", 404);
  }

  const files = req.files;
  console.log(files);
  if (files) {
    if (files.picture.length >= 2) {
      fileNames = await multImages(files, "employee");
    } else {
      fileNames = await fileUpload(files.picture, "employee");
      fileNames = [fileNames.fileName];
    }
  }
  if (oldFiles !== null) {
    if (typeof oldFiles != "string") {
      req.body.picture = [...oldFiles, ...fileNames];
    } else {
      req.body.picture = [oldFiles, ...fileNames];
    }
  } else if (fileNames) {
    req.body.picture = fileNames;
  }
  if (typeof req.body.position === "string") {
    req.body.position = [req.body.position];
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  employee = await Employees.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getCountEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employees.count();
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getSlugEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employees.findOne({ slug: req.params.slug })
    .populate("position")
    .populate("createUser");

  if (!employee) {
    throw new MyError("Тухайн ажилтан байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});
