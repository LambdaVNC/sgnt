const authRouter = require("../routers/auth_router");
const superAdminRouter = require("../routers/superAdmin_router");
const adminRouter = require("../routers/admin_router");
const userRouter = require("../routers/user_router");
const authMiddleware = require("../middlewares/auth_middleware");
const validationMiddleware = require("../middlewares/validation_middleware");

module.exports = function (app) {
  app.use("/", authRouter);
  app.use("/user-panel", userRouter);
  app.use("/super-admin", superAdminRouter);
  app.use("/admin-panel", adminRouter);
};
