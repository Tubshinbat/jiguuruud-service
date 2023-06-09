const mongoose = require("mongoose");

const FaqSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  mn: {
    question: {
      type: String,
    },

    answer: {
      type: String,
    },
  },

  eng: {
    question: {
      type: String,
    },

    answer: {
      type: String,
    },
  },

  tags: {
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

module.exports = mongoose.model("Faq", FaqSchema);
