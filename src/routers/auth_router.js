const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const validationMiddleware = require("../middlewares/validation_middleware");
const passport = require("passport");
require("../config/passport_local")(passport);
const authMiddleware = require("../middlewares/auth_middleware");

// ---------- START Get Requests For General Purpose ----------

router.get("/", authController.showMainPage);
router.get("/login", authMiddleware.loggedOut, authController.showLoginPage);

router.get(
  "/register",
  authMiddleware.loggedOut,
  authController.showRegisterPage
);

router.get(
  "/forgot-password",
  authMiddleware.loggedOut,
  authController.showForgotPasswordPage
);

router.get("/logout", authMiddleware.loggedIn, authController.logout);
router.get("/new-password/:id/:token", authController.showNewPasswordPage);
router.get("/new-password", authController.showNewPasswordPage);
router.get("/verify", authController.verifyEmail);
// ---------- END Get Requests For General Purpose ----------

// ---------- START Post Requests For General Purpose ----------

router.post(
  "/login",
  validationMiddleware.validateLogin(),
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    failureMessage: true,
  }),
  authMiddleware.roleRouter
);

router.post(
  "/register",
  validationMiddleware.validateRegister(),
  authController.register
);
router.post(
  "/forgot-password",
  validationMiddleware.validateEmail(),
  authController.forgotPassword
);

router.post(
  "/new-password",
  validationMiddleware.validateNewPassword(),
  authController.newPassword
);

// router.post("/reset-password",authController.saveNewPassword)
// ---------- END Post Requests For General Purpose ----------

// ---------- START User Panel ----------

module.exports = router;
