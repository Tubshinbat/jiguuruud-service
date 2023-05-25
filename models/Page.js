const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PageSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  // NEWSCATEGORIES CONFIG
  isNewsCategory: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  newsCategories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "NewsCategories",
    },
  ],

  // MENU CONFIG
  isMenu: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isMenuList: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isMenuPageList: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  // Page
  isPage: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  chosenPage: {
    type: mongoose.Schema.ObjectId,
    ref: "Page",
  },

  // Modal
  isModal: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  modal: {
    type: String,
    enum:['About','Admission','Banner','Book','Contact','Employees','Fact','Faq','FastLink','FooterMenu',"Media", "MediaCategory", "Menu","News","NewsCategories","Page", "Partner", "Position", "Profession", "Service", "SocialLink", "Statistics_sub","Statistics", 'TopLink']
  },

  // MENU CONFIG

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

  // Details
  eng: {
    name: {
      type: String,
    },
    pageInfo: {
      type: String,
    },
  },

  mn: {
    name: {
      type: String,
    },
    pageInfo: {
      type: String,
    },
  },

  views: {
    type: Number,
  },

  pictures: {
    type: [String],
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
