const Position = require("../models/Position");
const asyncHandler = require("express-async-handler");
// UTILS
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createPosition = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const { name, about } = req.body;
  req.body.createUser = req.userId;

  ["language", "about", "name"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  const position = await Position.create(req.body);

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.getPositions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Position.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.where({
      $or: [
        {
          "eng.name": RegexOptions(name),
          "mn.name": RegexOptions(name),
        },
      ],
    });
  }

  if (valueRequired(about)) {
    query.where({
      $or: [
        {
          "eng.about": RegexOptions(about),
          "eng.about": RegexOptions(about),
        },
      ],
    });
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

  // Sort
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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Position, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const positions = await query.exec();

  res.status(200).json({
    success: true,
    count: positions.length,
    data: positions,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Position.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.where({
      $or: [
        {
          "eng.name": RegexOptions(name),
          "mn.name": RegexOptions(name),
        },
      ],
    });
  }

  if (valueRequired(about)) {
    query.where({
      $or: [
        {
          "eng.about": RegexOptions(about),
          "eng.about": RegexOptions(about),
        },
      ],
    });
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

  // Sort
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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Position, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const positions = await query.exec();

  res.status(200).json({
    success: true,
    count: positions.length,
    data: positions,
    pagination,
  });
});

exports.getPosition = asyncHandler(async (req, res) => {
  const position = await Position.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!position) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.updatePosition = asyncHandler(async (req, res) => {
  let position = await Position.findById(req.params.id);

  if (!position) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const language = req.cookies.language || "mn";
  const { name, about } = req.body;

  ["language", "about", "name"].map((el) => delete req.body[el]);

  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body[language] = {
    name,
    about,
  };

  position = await Position.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: position,
  });
});

exports.getCountPosition = asyncHandler(async (req,res) => {
  const position = await Position.count();
  res.status(200).json({
    success:true,
    data: position,
  })
});

exports.getSlugPosition = asyncHandler(async (req,res) => {
  const position = await Position.findOne({slug: req.params.slug}).populate('createUser').populate('updateUser');

  if(!position){
    throw new MyError('Өгөгдөл олдсонгүй',404);
  }

  res.status(200).json({
    success: true,
    data: position,
  })
})