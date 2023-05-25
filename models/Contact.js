const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Та өөрийнхөө нэрийг оруулна уу."],
  },

  email: {
    type: String,
    required: [true, "Имэйл хаягаа оруулна уу"],
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Имэйл хаягаа буруу оруулсан байна",
    ],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Холбогдох утасны дугаараа оруулна уу"],
  },
  message: {
    type: String,
    required: [true, "Санал хүсэлтээ бичнэ үү"],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);
