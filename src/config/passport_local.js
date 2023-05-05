const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models/user_model");

// passport-local konfigürasyonu
module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const _userFinder = await User.findOne({ email: email });

          if (!_userFinder) {
            console.log("böyle biri yok");
            return done(null, false, { message: "Email veya şifre yanlış." });
          } else if (_userFinder && _userFinder.verifyEmail == false) {
            return done(null, false, { message: "Lütfen emaili doğrulayın" });
          } else if (_userFinder.password !== password) {
            return done(null, false, { message: "Email veya şifre yanlış." });
          } else {
            return done(null, _userFinder);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // session yönetimi
  passport.serializeUser((user, done) => {
    done(null, user.id);
    console.log("Sessiona bu id'li kişi kaydedildi : " + user.id);
  });

  
  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => {
        console.log("veri tabanında kişi arandı ve bulundu");
        const newUser = {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          tags: user.tags,
        };
        done(null, newUser);
      })
      .catch(err => done(err));
  });
  

};
