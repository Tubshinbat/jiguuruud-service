const Menu = require("../models/FooterMenu");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.createMenu = asyncHandler(async (req, res, next) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  const parentId = req.body.parentId || null;
  let position = 0;

  if (parentId) {
    const menu = await Menu.findOne({ parentId }).sort({
      position: -1,
    });
    if (menu) {
      position = menu.position + 1;
    }
  } else {
    const menu = await Menu.findOne({ parentId: null }).sort({ position: -1 });
    if (menu) {
      position = menu.position + 1;
    }
  }
  req.body.position = position;

  const nameUnique = await Menu.find({}).where("name").equals(name);

  if (nameUnique.length > 0) {
    req.body.slug =
      nameUnique[nameUnique.length - 1].slug +
      (nameUnique.length + 1).toString();
  }

  delete req.body.name;
  if (req.body.model === null) delete req.body.model;
  if (req.body.direct === null) delete req.body.direct;

  req.body[language] = {
    name,
  };

  const menu = await Menu.create(req.body);

  res.status(200).json({
    success: true,
    data: menu,
  });
});

function createMenus(categories, parentId = null) {
  const categoryList = [];
  let category = null;

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      eng: {
        name: cate.eng.name,
      },
      mn: {
        name: cate.mn.name,
      },
      slug: cate.slug,
      isModel: cate.isModel,
      isDirect: cate.isDirect,
      direct: cate.direct,
      model: cate.model,
      picture: cate.picture || null,
      position: cate.position,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.getMenus = asyncHandler(async (req, res) => {
  Menu.find({})
    .sort({ position: 1 })
    .exec((error, categories) => {
      if (error)
        return res.status(400).json({
          success: false,
          error,
        });
      if (categories) {
        const categoryList = createMenus(categories);
        res.status(200).json({
          success: true,
          data: categoryList,
        });
      }
    });
});

exports.getMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    throw new MyError(`Өгөгдөл олдсонгүй`, 404);
  }

  res.status(200).json({
    success: true,
    data: menu,
  });
});

const parentCheck = (menus) => {
  menus.map(async (menu) => {
    const result = await Menu.find({ parentId: menu._id });
    if (result && result.length > 0) {
      parentCheck(result);
    }

    await Menu.findByIdAndDelete(menu._id);
  });
};

exports.deleteMenu = asyncHandler(async (req, res) => {
  const category = await Menu.findById(req.params.id);
  if (!category) {
    throw new MyError(`Мэдээлэл олдсон`, 404);
  }
  const parentMenus = await Menu.find({ parentId: req.params.id });
  if (parentMenus) {
    parentCheck(parentMenus);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.changePosition = asyncHandler(async (req, res) => {
  const menus = req.body.data;

  if (!menus && menus.length > 0) {
    throw new MyError("Дата илгээгүй байна дахин шалгана уу", 404);
  }

  const positionChange = (categories, pKey = null) => {
    if (categories) {
      categories.map(async (el, index) => {
        const data = {
          position: index,
          parentId: pKey,
        };
        await Menu.findByIdAndUpdate(el.key, data);
        if (el.children && el.children.length > 0) {
          const parentKey = el.key;
          positionChange(el.children, parentKey);
        }
      });
    }
  };
  positionChange(menus);
  res.status(200).json({
    success: true,
  });
});

exports.updateMenu = asyncHandler(async (req, res) => {
  const language = req.cookies.language || "mn";
  const name = req.body.name;

  delete req.body.name;
  if (req.body.model === null) delete req.body.model;
  if (req.body.direct === null) delete req.body.direct;

  req.body[language] = {
    name,
  };

  const category = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new MyError("Шинэчлэгдэсэнгүй дахин оролдоно уу", 404);
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});
