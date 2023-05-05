const { body } = require("express-validator");

const validateRegister = () => {
  return [
    body("firstName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("İsim minimum 3 karakterli olmalıdır!")
      .isLength({ max: 30 })
      .withMessage("İsim maksimum 30 karakterli olmalıdır!"),
    body("lastName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Soyisim minimum 3 karakterli olmalıdır!")
      .isLength({ max: 30 })
      .withMessage("Soyisim maksimum 30 karakterli olmalıdır!"),
    body("email").trim().isEmail().withMessage("Email geçerli değil!"),
    body("phone")
      .trim()
      .isMobilePhone()
      .withMessage("Telefon numarası geçerli değil!")
      .isInt()
      .withMessage("Telefon numarası geçerli değil!!"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre minimum 6 karakterli olmalı!")
      .isLength({ max: 30 })
      .withMessage("Şifre maksimum 30 karakterli olmalı!"),
    body("repassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error("Girdiğiniz şifreler eşleşmiyor!");
        }
        return true;
      }),
  ];
};
const validateNewAct = () => {
  return [
    body("actName")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Etkinlik adı minimum 3 karakterli olmalıdır!"),
    body("actDescription")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Açıklama minimum 5 karakterli olmalıdır!"),
    body("actDate")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Tarih kısmı boş olamaz."),
    body("actLocation")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Konum kısmı boş olamaz"),
    body("actPrice")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Etkinlik ücreti minimum 1 haneli olmalı"),
    body("actIban")
      .trim()
      .isLength({ min: 32 })
      .withMessage("İBAN no minimum 26 haneli olmalı!")
      .isLength({ max: 32 })
      .withMessage("İBAN no maksimum 26 haneli olmalı!"),
  ];
};

const validateLogin = () => {
  return [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Lütfen geçerli bir e-mail girin"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre minimum 6 karakterli olmalı!")
      .isLength({ max: 30 })
      .withMessage("Şifre maksimum 30 karakterli olmalı!"),
  ];
};

const validateEmail = () => {
  return [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Lütfen geçerli bir e-mail girin"),
  ];
};

const validateNewPassword = () => {
  return [
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre minimum 6 karakterli olmalıdır"),
    body("repassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw Error("Girdiğiniz şifreler eşleşmiyor");
      }
      return true;
    }),
  ];
};

module.exports = {
  validateRegister,
  validateLogin,
  validateNewAct,
  validateEmail,
  validateNewPassword
};
