const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const MongoDBStore = require("connect-mongodb-session")(session);

module.exports = function (app) {
  const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_STRING,
    collection: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        // 2 Saatlik giriş hakkı
      },
      store: sessionStore,
    })
  );

  app.use(express.static("public"));
  app.use(expressLayouts);
  app.set("view engine", "ejs");
  app.set("views", path.resolve(__dirname, "../views"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(flash());
  app.use((req, res, next) => {
    res.locals.validation_errors = req.flash("validation_errors");
    res.locals.success_messages = req.flash("success_messages");
    res.locals.login_error = req.flash("error");
    res.locals.firstName = req.flash("firstName");
    res.locals.lastName = req.flash("lastName");
    res.locals.email = req.flash("email");
    res.locals.phone = req.flash("phone");
    next();
  });

  // Her istekte session'ın süresini kontrol etmek için bir middleware
  const sessionTimeout = 2 * 60 * 60 * 1000;
  app.use(function (req, res, next) {
    if (req.session && req.session.user) {
      const now = new Date().getTime();
      const lastAccess = new Date(req.session.lastAccess).getTime();
      if (now - lastAccess > sessionTimeout) {
        req.session.destroy(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/login");
          }
        });
      } else {
        req.session.lastAccess = now;
      }
    }
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());
  
};
