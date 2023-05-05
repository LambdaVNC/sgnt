const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "İsim alanı boş olamaz"],
      trim: true,
      min: [3 , "İsim minimum 3 karakterli olmalı"],
      max: [30, "İsim maximum 30 karakterli olmalı"]
    },
    lastName: {
      type: String,
      required: [true, "Soyisim alanı boş olamaz"],
      trim: true,
      min: [3 , "Soyisim minimum 3 karakterli olmalı"],
      max: [30, "Soyisim maximum 30 karakterli olmalı"]
    },
    email: {
      type: String,
      required: [true, "Email alanı boş olamaz"],
      unique: [true, "Email Benzersiz olmalı"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon numarası alanı boş olamaz"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Şifre alanı boş olamaz"],
      trim: true,
      min: [6, "Şifre minimum 6 karakterli olmalı"],
      max: [30, "Şifre maximum 30 karakterli olmalı"]
    },
    verifyEmail: {
      type: Boolean,
      default: false,
    },
    role: {
      type:String,
      default: "user"
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { collection: "users", timestamps: true }
);

const User = mongoose.model("User", UserSchema);


module.exports = {
  User,
};
