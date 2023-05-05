const mongoose = require("mongoose");

const ActSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
  },
  location: { type: String },
  price: {
    type: Number,
  },
  iban: {
    type: String,
    default: "TR35 0011 1000 0000 0096 9281 95",
  },
  ibanOwner: {
    type: String,
  },
  image: {
    type: String,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Act = mongoose.model("Act", ActSchema);

module.exports = {
  Act,
};
