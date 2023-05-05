const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const superAdminController = require("../controllers/superAdmin_controller");
const validationMiddleware = require("../middlewares/validation_middleware");
const passport = require("passport");
require("../config/passport_local")(passport);
const authMiddleware = require("../middlewares/auth_middleware");
const multerConfig = require("../config/multer_config");

// ---------- START Super Admin ----------

// ---------- GET PROCESSES ----------
// Get Super Admin dashboard
router.get(
  "/dashboard",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showDashboardPage
);

// Get Super Admin Published Page
router.get(
  "/published",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showPublishedPage
);

//  Super Admin gonna logout
router.get(
  "/logout",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.logout
);

// Super Admin trying to join to activity
router.get(
  "/joined",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showJoinedPage
);

// Get add activity page for Super Admin
router.get(
  "/add-activity",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showAddActivityPage
);

// Get all participants
router.get(
  "/all-participants",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showAllParticipantsPage
);

// Get all participant requests
router.get(
  "/participant-request",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showParticipantRequestsPage
);

// Get my all members
router.get(
  "/members-list",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showMembersListPage
);

// Get the my team
router.get(
  "/team",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showTeamPage
);

// Get info page(all roles have this page)
router.get(
  "/info",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showInfoPage
);

// Get annoucements page(all roles have this page)
router.get(
  "/announcements",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showAnnouncementsPage
);

// Give permission someone else like admin
router.get(
  "/give-auth",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.showGivePermissionPage
);

// Delete activity in published
router.get(
  "/delete-act",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.deleteAct
);

// Send participant request button
router.get(
  "/send-participant-request",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.addParticipant
);

// Delete all participants from All participants page by delete all participants button
router.get(
  "/delete-all-participants",
  authMiddleware.loggedIn,
  superAdminController.deleteAllParticipants
);

// ---------- POST PROCESSES ----------
// Add activity to publish
router.post(
  "/add-activity",
  authMiddleware.loggedIn,
  multerConfig.single("image"),
  validationMiddleware.validateNewAct(),
  authMiddleware.authorizeSuperAdmin,
  superAdminController.addActivity
);

// Delete one in participant class
router.post(
  "/delete-one-participant",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.deleteOneParticipant
);

// Accept user request be participant
router.post(
  "/accept-request",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.acceptRequest
);

// Rejection user request be participant
router.post(
  "/rejection-request",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.rejectionRequest
);

// Give permission someone like admin
router.post(
  "/grant-permission",
  authMiddleware.loggedIn,
  authMiddleware.authorizeSuperAdmin,
  superAdminController.grantPermission
);

// ---------- END Super Admin ----------

module.exports = router;
