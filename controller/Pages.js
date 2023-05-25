const Page = require("../models/Page");

// utils
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate");

// Lib
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

// Plus
const asyncHandler = require("express-async-handler");
const {
  useNewsCategorySearch,
  usePageSearch,
  useMenuSearch,
  useFooterMenuSearch,
  RegexOptions,
  userSearch,
} = require("../lib/searchOfterModel");
const { query } = require("express");
const { create } = require("../models/Page");

exports.createPage = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.status = req.body.status || true;
  req.body.isNewsCategory = req.body.isNewsCategory || false;
  req.body.isMenu = req.body.isMenu || false;
  req.body.isMenuList = req.body.isMenuList || false;
  req.body.isMenuPageList = req.body.isMenuPageList || false;
  req.body.isPage = req.body.isPage || false;
  req.body.isModal = req.body.isModal || false;

  // FIELDS
  const newsCategories = req.body.categories;
  const footerMenu = req.body.footerMenu;
  const menu = req.body.menu;
  const createAt = req.body.createAt;

  if (!valueRequired(createAt)) {
    req.body.createAt = Date.now();
  }

  if (req.body.isNewsCategory === true) {
    if (valueRequired(newsCategories) === false || newsCategories.length <= 0)
      req.body.categories = [];
  } else {
    delete req.body.newsCategories;
  }

  if (req.body.isMenu === true) {
  } else {
    req.body.isMenuList = false;
    req.body.isMenuPageList = false;
  }

  if (req.body.isPage === true) {
  } else {
    delete req.body.page;
  }

  if (req.body.isModal == true) {
  } else {
    delete req.body.modal;
  }

  // main menus
  if (valueRequired(footerMenu) === false || footerMenu.length <= 0) {
    footerMenu = [];
  }

  if (valueRequired(menu) === false || menu.length <= 0) {
    menu = [];
  }

  if (valueRequired(req.body.menu) === false || req.body.menu.length <= 0) {
    req.body.menu = [];
  }
});

exports.getPages = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const isNewsCategory = req.body.isNewsCategory;
  const newsCategories = req.body.newsCategories;
  const isMenu = req.body.isMenu;
  const isMenuList = req.body.isMenuList;
  const isMenuPageList = req.body.isMenuPageList;
  const isPage = req.body.isPage;
  const chosenPage = req.body.chosenPage;
  const isModal = req.body.isModal;
  const modal = req.body.modal;
  const menu = req.body.menu;
  const footerMenu = req.body.footerMenu;
  const name = req.body.name;
  const pageInfo = req.body.pageInfo;
  const createUser = req.body.createUser;
  const updateUser = req.body.updateUser;

  const query = Page.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(isNewsCategory)) {
    if (isNewsCategory.split(",").length > 1) {
      query.where("isNewsCategory").in(isNewsCategory.split(","));
    } else query.where("isNewsCategory").equals(isNewsCategory);
  }

  if (valueRequired(isMenu)) {
    if (isMenu.split(",").length > 1) {
      query.where("isMenu").in(isMenu.split(","));
    } else query.where("isMenu").equals(isMenu);
  }

  if (valueRequired(isMenuList)) {
    if (isMenuList.split(",").length > 1) {
      query.where("isMenuList").in(isMenuList.split(","));
    } else query.where("isMenuList").equals(isMenuList);
  }

  if (valueRequired(isMenuPageList)) {
    if (isMenuPageList.split(",").length > 1) {
      query.where("isMenuPageList").in(isMenuPageList.split(","));
    } else query.where("isMenuPageList").equals(isMenuPageList);
  }

  if (valueRequired(isPage)) {
    if (isPage.split(",").length > 1) {
      query.where("isPage").in(isPage.split(","));
    } else query.where("isPage").equals(isPage);
  }

  if (valueRequired(isModal)) {
    if (isModal.length > 1) {
      query.where("isModal").in(isModal.split(","));
    } else query.where("isModal").equals(isModal);
  }

  if (valueRequired(chosenPage)) {
    const result = await usePageSearch(chosenPage);
    if (result && result.length > 0) {
      query.where("chosenPage").in(result);
    }
  }

  if (valueRequired(newsCategories)) {
    const result = await useNewsCategorySearch(newsCategories);
    if (result && result.length > 0) {
      query.where("newsCategories").in(result);
    }
  }

  if (modal) {
    query.where("modal").in(modal.split(","));
  }

  if (valueRequired(menu)) {
    const result = await useMenuSearch(menu);
    if (result && result.length > 0) {
      query.where("menu").in(result);
    }
  }

  if (valueRequired(footerMenu)) {
    const result = await useFooterMenuSearch(footerMenu);
    if (result && result.length > 0) {
      query.where("footerMenu").in(result);
    }
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

  if (valueRequired(pageInfo)) {
    query.where({
      $or: [
        {
          "eng.pageInfo": RegexOptions(pageInfo),
          "mn.pageInfo": RegexOptions(pageInfo),
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

  query.select(select);
  query.populate("newsCategories");
  query.populate("chosenPage");
  query.populate("footerMenu");
  query.populate("Menu");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, News, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const pages = await query.exec();

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res) => {

  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const isNewsCategory = req.body.isNewsCategory;
  const newsCategories = req.body.newsCategories;
  const isMenu = req.body.isMenu;
  const isMenuList = req.body.isMenuList;
  const isMenuPageList = req.body.isMenuPageList;
  const isPage = req.body.isPage;
  const chosenPage = req.body.chosenPage;
  const isModal = req.body.isModal;
  const modal = req.body.modal;
  const menu = req.body.menu;
  const footerMenu = req.body.footerMenu;
  const name = req.body.name;
  const pageInfo = req.body.pageInfo;
  const createUser = req.body.createUser;
  const updateUser = req.body.updateUser;

  const query = Page.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(isNewsCategory)) {
    if (isNewsCategory.split(",").length > 1) {
      query.where("isNewsCategory").in(isNewsCategory.split(","));
    } else query.where("isNewsCategory").equals(isNewsCategory);
  }

  if (valueRequired(isMenu)) {
    if (isMenu.split(",").length > 1) {
      query.where("isMenu").in(isMenu.split(","));
    } else query.where("isMenu").equals(isMenu);
  }

  if (valueRequired(isMenuList)) {
    if (isMenuList.split(",").length > 1) {
      query.where("isMenuList").in(isMenuList.split(","));
    } else query.where("isMenuList").equals(isMenuList);
  }

  if (valueRequired(isMenuPageList)) {
    if (isMenuPageList.split(",").length > 1) {
      query.where("isMenuPageList").in(isMenuPageList.split(","));
    } else query.where("isMenuPageList").equals(isMenuPageList);
  }

  if (valueRequired(isPage)) {
    if (isPage.split(",").length > 1) {
      query.where("isPage").in(isPage.split(","));
    } else query.where("isPage").equals(isPage);
  }

  if (valueRequired(isModal)) {
    if (isModal.length > 1) {
      query.where("isModal").in(isModal.split(","));
    } else query.where("isModal").equals(isModal);
  }

  if (valueRequired(chosenPage)) {
    const result = await usePageSearch(chosenPage);
    if (result && result.length > 0) {
      query.where("chosenPage").in(result);
    }
  }

  if (valueRequired(newsCategories)) {
    const result = await useNewsCategorySearch(newsCategories);
    if (result && result.length > 0) {
      query.where("newsCategories").in(result);
    }
  }

  if (modal) {
    query.where("modal").in(modal.split(","));
  }

  if (valueRequired(menu)) {
    const result = await useMenuSearch(menu);
    if (result && result.length > 0) {
      query.where("menu").in(result);
    }
  }

  if (valueRequired(footerMenu)) {
    const result = await useFooterMenuSearch(footerMenu);
    if (result && result.length > 0) {
      query.where("footerMenu").in(result);
    }
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

  if (valueRequired(pageInfo)) {
    query.where({
      $or: [
        {
          "eng.pageInfo": RegexOptions(pageInfo),
          "mn.pageInfo": RegexOptions(pageInfo),
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

  query.select(select);
  query.populate("newsCategories");
  query.populate("chosenPage");
  query.populate("footerMenu");
  query.populate("Menu");
  query.populate("createUser");
  query.populate("updateUser");

  const pages = await query.exec();

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
  });
});

exports.multDeletePage = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findDatas = await Page.find({ _id: { $in: ids } });

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

  const pages = await Page.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getPage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  const modal = req.body.modal;

  let pages = [];
  if (!page) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const query = Page.findById(req.params.id);

  if (page.isNewsCategory == true) {
    query.populate("newsCategories");
  }

  if (page.isMenu == true) {
    if (page.isMenuList == true) {
      query.populate("menu");
      query.populate("footerMenu");
    }
    if (page.isMenuPageList == true) {
      pages = await Page.find({})
        .where("menu")
        .in(page.menu)
        .where("footerMenu")
        .in(page.footerMenu).sort({createAt: -1});
    }
  }

  chosenPages = await Page.find({}).where("chosenPage").equals(page._id).sort({createAt: -1});
  const modals = await Page.find({}).where("modal").equals(modal).sort({createAt: -1});
  const result = await query.exec();

  res.status(200).json({
    success: true,
    data: result,
    modals,
    chosenPages,
    pages,
  });
});

exports.getPageCount = asyncHandler(async (req, res) => {
  const pageCount = await Page.count();
  res.status(200).json({
    success: true,
    data: pageCount,
  });
});
