const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ServiceSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  direct: {
    type: String,
    enum: [true, false],
    trim: false,
  },

  slug: String,

  mn: {
    name: {
      type: String,
    },
    details: {
      type: String,
    },
  },

  eng: {
    name: {
      type: String,
    },
    details: {
      type: String,
    },
  },

  pictures: {
    type: [String],
  },

  views: {
    type: Number,
    default: 0,
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

ServiceSchema.pre("save", function (next) {
  const date = Date.now();
  if (this.mn.name) this.slug = slugify(this.mn.name) + date;
  if (this.eng.name) this.slug = slugify(this.eng.name) + date;
  next();
});

ServiceSchema.pre("update", function (next) {
  const date = Date.now();
  if (this.mn.name) this.slug = slugify(this.mn.name) + date;
  if (this.eng.name) this.slug = slugify(this.eng.name) + date;
  next();
});

module.exports = mongoose.model("Service", ServiceSchema);
