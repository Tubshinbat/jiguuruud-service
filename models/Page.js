const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PageSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  mainLink: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  newsActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  listActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  pageActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  pageParentActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  modalActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  choiseModal: {
    type: String,
  },

  modal: {
    type: String,
  },

  mn: {
    name: {
      type: String,
    },

    pageInfo: {
      type: String,
    },
  },
  eng: {
    name: {
      type: String,
    },

    pageInfo: {
      type: String,
    },
  },
  menu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Menu",
    },
  ],

  footerMenu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "FooterMenu",
    },
  ],

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "NewsCategory",
    },
  ],

  pictures: {
    type: [String],
  },

  page: {
    type: mongoose.Schema.ObjectId,
    ref: "Page",
  },

  views: {
    type: Number,
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

module.exports = mongoose.model("Page", PageSchema);
