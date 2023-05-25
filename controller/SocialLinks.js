const SocialLink = require("../models/SocialLink");
const asyncHandler = require("express-async-handler");

// UTILS
const MyError = require("../utils/myError");

exports.createLinks = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.updateUser = req.userId;
  let link = await SocialLink.create(req.body);

  res.status(200).json({
    success: true,
    data: link,
  });
});

exports.getLinks = asyncHandler(async (req, res) => {
  const query = await SocialLink.find({}).sort({ createAt: -1 });

  res.status(200).json({
    success: true,
    data: query,
  });
});

exports.getLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.findById(req.params.id);

  if (!link) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: link,
  });
});

exports.deleteLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.findById(req.params.id);

  if (!link) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  link.remove();

  res.status(200).json({
    success: true,
    data: link,
  });
});

exports.updateLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!link) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: link,
  });
});
