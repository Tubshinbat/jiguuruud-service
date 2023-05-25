const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const BannerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  type: {
    type: String,
    enum: ["photo", "video"],
    default: "photo",
  },

  color: {
    type: String,
    defaut: "#fff",
  },

  eng: {
    name: {
      type: String,
    },

    details: {
      type: String,
    },
  },

  mn: {
    name: {
      type: String,
    },

    details: {
      type: String,
    },
  },

  banner: {
    type: String,
  },

  video: {
    type: String,
  },

  link: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

BannerSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

BannerSchema.pre("updateOne", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("Banner", BannerSchema);
