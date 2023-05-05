const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const adminController = require("../controllers/admin_controller");
const validationMiddleware = require("../middlewares/validation_middleware");
const passport = require("passport");
require("../config/passport_local")(passport);
const authMiddleware = require("../middlewares/auth_middleware");

// ---------- GET PROCESSES ----------
router.get(
  "/published",
  authMiddleware.authorizeUser,
  authController.showPublishActivityPage
);

router.get(
  "/announcements",
  authMiddleware.authorizeUser,
  authController.showAnnouncementPage
);

router.get("/info", authMiddleware.authorizeUser, authController.showInfoPage);

router.get(
  "/send-participant-request",
  authMiddleware.authorizeUser,
  authController.sendParticipantRequest
);
router.get(
  "/logout",
  authMiddleware.loggedIn,
  authMiddleware.authorizeUser,
  authController.logout
);

// ---------- END User Panel ----------

module.exports = router;
