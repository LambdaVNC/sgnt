const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const adminController = require("../controllers/admin_controller");
const validationMiddleware = require("../middlewares/validation_middleware");
const passport = require("passport");
require("../config/passport_local")(passport);
const authMiddleware = require("../middlewares/auth_middleware");

// ---------- START Admin ----------
// KAZANÇ ve EMAİL GÖSTERİLMEYECEK

// ---------- GET PROCESSES ----------
router.get(
  "/dashboard",
  authMiddleware.authorizeAdmin,
  adminController.showDashboardPage
);
router.get(
  "/published",
  authMiddleware.authorizeAdmin,
  adminController.showPublishedPage
);
router.get(
  "/all-participants",
  authMiddleware.authorizeAdmin,
  adminController.showAllParticipantsPage
);
router.get(
  "/participant-request",
  authMiddleware.authorizeAdmin,
  adminController.showParticipantRequestsPage
);
router.get(
  "/info",
  authMiddleware.authorizeAdmin,
  adminController.showInfoPage
);
router.get(
  "/team",
  authMiddleware.authorizeAdmin,
  adminController.showTeamPage
);
router.get(
  "/announcements",
  authMiddleware.authorizeAdmin,
  adminController.showAnnouncementsPage
);
router.get(
  "/send-participant-request",
  authMiddleware.authorizeAdmin,
  adminController.sendParticipantRequest
);
router.get("/logout", authMiddleware.authorizeAdmin, adminController.logout);

// ---------- POST PROCESSES ----------
router.post("/accept-request", adminController.acceptRequest);
router.post("/rejection-request", adminController.rejectionRequest);
// router.post("/published", adminController.joinActivity)
// router.post("/participant-request", adminController.acceptParticipantRequest)

// ---------- END Admin ----------

module.exports = router;
