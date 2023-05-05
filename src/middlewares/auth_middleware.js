const express = require("express");
const app = express();
const authMiddleware = require("../middlewares/auth_middleware");

const roleRouter = (req, res, next) => {
  const userRole = req.user.role;
  // Kullanıcının rolüne göre publish rotasına yönlendir.
  if (req.user.role === "user") {
    return res.redirect("/user-panel/published");
  } else if (userRole === "superAdmin") {
    return res.redirect("/super-admin/dashboard");
  } else if (userRole === "admin") {
    return res.redirect("/admin-panel/dashboard");
  }
  // Kullanıcının rolü belirsizse, login sayfasına yönlendir.
  req.flash("validation_errors", [
    { msg: "Bu rotaya erişiminiz bulunmamaktadır!" },
  ]);
  return res.redirect("/login");
};

// Middleware for role based authorization
const authorizeUser = (req, res, next) => {
  const userRole = req.user;
  if (req.isAuthenticated() && userRole.role == "user") {
    return next();
  } else if (!req.isAuthenticated() || userRole.role !== "user") {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  } else if (typeof userRole == undefined) {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  }
  req.flash("validation_errors", [
    { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
  ]);
  return res.redirect("/login");
};

const authorizeSuperAdmin = (req, res, next) => {
  // ********* ÖNEMLİ **********
  // req.session.role kullanıcı daha giriş yapmamış iken req.user.role kullanıcı giriş yapmış iken dönüyor buraya böyle bak
  const userRole = req.user;
  if (req.isAuthenticated() && userRole.role == "superAdmin") {
    return next();
  } else if (!req.isAuthenticated() || userRole.role !== "superAdmin") {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  } else if (typeof userRole == undefined) {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  }
  req.flash("validation_errors", [
    { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
  ]);
  return res.redirect("/login");
};

const authorizeAdmin = (req, res, next) => {
  const userRole = req.user;
  if (req.isAuthenticated() && userRole.role == "admin") {
    return next();
  } else if (!req.isAuthenticated() || userRole.role !== "admin") {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  } else if (typeof userRole == undefined) {
    req.flash("validation_errors", [
      { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
    ]);
    return res.redirect("/login");
  }
  req.flash("validation_errors", [
    { msg: "Bu rota için yetkiniz bulunmamaktadır!" },
  ]);
  return res.redirect("/login");
};

const loggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", ["Bu rota için yetkiniz bulunmamaktadır!"]);
    return res.redirect("/login");
  }
};

const loggedOut = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    const userRole = req.user.role;
    // Kullanıcının rolüne göre publish rotasına yönlendir.
    if (req.user.role === "user") {
      return res.redirect("/user-panel/published");
    } else if (userRole === "superAdmin") {
      return res.redirect("/super-admin/dashboard");
    } else if (userRole === "admin") {
      return res.redirect("/admin-panel/dashboard");
    } else {
      req.flash("error", ["Bu rota için yetkiniz bulunmamaktadır!"]);
      return res.redirect("/login");
    }
  }
};

module.exports = {
  authorizeUser,
  authorizeAdmin,
  authorizeSuperAdmin,

  roleRouter,
  loggedOut,
  loggedIn,
};
