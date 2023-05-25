const TopLink = require("../models/TopLink");
const asyncHandler = require("express-async-handler");

// UTILS
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");

exports.createTopLink = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const { name, about } = req.body;

  ["name", "about"].map((el) => delete req.body[el]);

  req.body[language] = {
    name,
    about,
  };

  const topLink = await TopLink.create(req.body);

  res.status(200).json({
    success: true,
    data: topLink,
  });
});

exports.getTopLinks = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const sort = req.query.sort;

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const direct = req.query.direct;
  const oldDirect = req.query.oldDirect;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

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
          "mn.about": RegexOptions(about),
        },
      ],
    });
  }

  if (valueRequired(direct)) {
    query.where({ direct: RegexOptions(direct) });
  }

  if (valueRequired(oldDirect)) {
    query.where({ oldDirect: RegexOptions(oldDirect) });
  }

  if (valueRequired(updateUser)) {
    const result = userSearch(updateUser);
    if (result && result.length > 0) {
      query.where("updateUser").in(result);
    }
  }

  // SORT

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

  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, TopLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const topLinks = await query.exec();

  res.status(200).json({
    success: true,
    count: pages.length,
    data: topLinks,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {
  const sort = req.query.sort;

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const about = req.query.about;
  const direct = req.query.direct;
  const oldDirect = req.query.oldDirect;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = TopLink.find();

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
          "mn.about": RegexOptions(about),
        },
      ],
    });
  }

  if (valueRequired(direct)) {
    query.where({ direct: RegexOptions(direct) });
  }

  if (valueRequired(oldDirect)) {
    query.where({ oldDirect: RegexOptions(oldDirect) });
  }

  if (valueRequired(updateUser)) {
    const result = userSearch(updateUser);
    if (result && result.length > 0) {
      query.where("updateUser").in(result);
    }
  }

  if (valueRequired(createUser)) {
    const result = userSearch(createUser);
    if (result && result.length > 0) {
      query.where("createUser").in(result);
    }
  }

  // SORT

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

  query.populate("createUser");
  query.populate("updateUser");

  const topLinks = await query.exec();

  res.status(200).json({
    success: true,
    count: pages.length,
    data: topLinks,
  });
});

exports.multDeleteTopLinks = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findDatas = await TopLink.find({ _id: { $in: ids } });

  if (findDatas.length <= 0) {
    throw new MyError("Өгөгдөлүүд олдсонгүй", 404);
  }

  findDatas.map((el) => {
    if (el.pictures && el.pictures.length > 0) {
      el.pictures.map(async (picture) => {
        await imageDelete(picture);
      });
    }
  });

  const pages = await TopLink.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getTopLink= asyncHandler(async (req,res)=> {
  const topLink = await TopLink.findById(req.params.id);
  
  if(!topLink){
    throw new MyError("Өгөгдөл олдсонгүй",404);
  }

  res.status(200).json({
    success: true,
    data: topLink,
  })

})

exports.getTopLinkCount = asyncHandler(async (req,res) => {
  const topLinkCount = await TopLink.count();
  res.status(200).json({
    success:true,
    data: topLinkCount
  })
})