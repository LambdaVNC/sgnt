const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { User } = require("../models/user_model");
const { Act } = require("../models/act_model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("../config/passport_local")(passport);

// ---------- Show Pages ----------
const showMainPage = async (req, res) => {
  let act;
  act = await Act.findOne();
  if (!act) {
    act = {
      title: "BEKLEMEDE KALIN...",
      description:
        "Etkinliğimiz yayına girdiği zaman burada yer alacaktır. Sizleri haberdar edeceğiz...",
      location: "-",
      price: 0,
      iban: 0,
      image: undefined
    };
    res.render("index", {
      layout: "../views/layout/main_page.ejs",
      user: req.user,
      act,
    });
  } else {
    res.render("index", {
      layout: "../views/layout/main_page.ejs",
      user: req.user,
      act,
    });
  }
};

const showLoginPage = (req, res) => {
  res.render("login", {
    layout: "../views/layout/auth_layout.ejs",
    user: req.user,
  });
};

const showRegisterPage = (req, res) => {
  res.render("register", {
    layout: "../views/layout/auth_layout.ejs",
    user: req.user,
  });
};

const showForgotPasswordPage = (req, res) => {
  res.render("forgot_password", {
    layout: "../views/layout/auth_layout.ejs",
    user: req.user,
  });
};

const showPublishActivityPage = async (req, res) => {
  const publishedAct = await Act.findOne();
  const loggedUser = await User.findById(req.user._id);
  publishedAct == null ? publishedAct == undefined : publishedAct;
  res.render("published_activity", {
    layout: "../views/layout/user_layout.ejs",
    user: req.user,
    act: publishedAct,
    loggedUser,
  });
};

const showJoinedPage = (req, res) => {
  res.render("joined_activity", {
    layout: "../views/layout/user_layout.ejs",
    user: req.user,
  });
};

const showAnnouncementPage = (req, res) => {
  res.render("announcement", {
    layout: "../views/layout/user_layout.ejs",
    user: req.user,
  });
};

const showInfoPage = (req, res) => {
  res.render("info", {
    layout: "../views/layout/user_layout.ejs",
    user: req.user,
  });
};

const showNewPasswordPage = async (req, res, next) => {
  const token = req.params.token;
  const idInLink = req.params.id;
  if (token && idInLink) {
    const _user = await User.findOne({ _id: idInLink });
    const secretKey =
      process.env.FORGOT_PASSWORD_JWT_SECRET + "-" + _user.password;
    // Have Token
    try {
      jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
          req.flash("validation_errors", [
            { msg: "Hatalı veya süresi geçmiş link" },
          ]);
          return res.redirect("/login");
        } else {
          res.render("new_password", {
            layout: "../views/layout/auth_layout.ejs",
            token,
            id: idInLink,
          });
        }
      });
    } catch (error) {
      console.log(err);
    }
  } else {
    req.flash("validation_errors", [
      { msg: "Lütfen maildeki butona tıklayın. Hatalı id veya token." },
    ]);
    return res.redirect("/forgot-password");
  }
};

// ---------- End Show Pages ----------

// ***************** Post Processes *****************

// When user is try to sign up
const register = async (req, res, next) => {
  const errorsArray = validationResult(req);

  // Validation have mistake
  if (!errorsArray.isEmpty()) {
    req.flash("validation_errors", errorsArray.array());
    req.flash("firstName", req.body.firstName);
    req.flash("lastName", req.body.lastName);
    req.flash("email", req.body.email);
    req.flash("phone", req.body.phone);
    res.redirect("/register");
  } else {
    // No validation error, lets save the user
    try {
      // Go controle the database have _user?
      const _user = await User.findOne({ email: req.body.email });
      if (_user && _user.verifyEmail == true) {
        // ----- Verilen email kullanımda ve doğrulandı -----
        console.log("Verilen email kullanımda ve doğrulandı");
        req.flash("validation_errors", [{ msg: "Bu email kullanımda" }]);
        req.flash("firstName", req.body.firstName);
        req.flash("lastName", req.body.lastName);
        req.flash("email", req.body.email);
        req.flash("phone", req.body.phone);
        res.redirect("/register");
      } else if (_user && _user.verifyEmail == false) {
        // ----- Verilen email'i almış biri var fakat doğrulanmamış! -----
        console.log("Verilen email'i almış biri var fakat doğrulanmamış!");

        await User.findOneAndDelete({ email: req.body.email });

        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          password: req.body.password,
        });
        await newUser.save();

        // JWT Processes

        const jwtInfo = {
          id: newUser.id,
          email: newUser.email,
        };

        const jwtToken = jwt.sign(
          jwtInfo,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Mail posting Processes
        const url = process.env.WEBSITE_URL + "verify?id=" + jwtToken;

        console.log("gidecek url : " + url);
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GOOGLE_USER,
            pass: process.env.GOOGLE_PASSWORD,
          },
        });

        transporter.sendMail(
          {
            from: "Sosyal Genç Nesil Topluluğu - SGNT < bltycxkk@gmail.com",
            to: newUser.email,
            subject: "Email Doğrulaması - SGNT",

            html: `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Doğrulama Maili</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
            </head>
            
            <body>
                <div style="margin: 20px; display: flex; justify-content: center; align-items: center;">
                    <div>
                        <div
                            style=" border-radius: 15px; margin-top: 20px; padding: 40px; border: 1px solid green; box-shadow: green 0 0 20px;">
                            <h2
                                style="margin-bottom : 50px ;font-family: 'Montserrat', sans-serif; font-weight: 700;">
                                ${newUser.firstName} selam👋, SGNT topluluk sitesine üyeliğinin tamamlanması için kaydını doğruluyorsun💪, aşağıdaki butona tıklaman yeterli, seni yönlendireceğiz.🚀 Teşekkürler...</h2>
                            <h4 style="margin-bottom: 20px;font-family: 'Montserrat', sans-serif; font-weight: 700;"> Merhaba, <br>
                                Üyeliğinizi doğrulamak için lütfen aşağıdaki butona tıklayın:</h4>
                            <a style="margin-bottom: 20px; padding: 10px; letter-spacing: 1px; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 20px; color: white; border: 1px solid yellowgreen; border-radius: 15px; background-color: green; box-shadow: green 0 0 20px;"
                                href="${url}">🛡Doğrula</a>
                            <p style="font-family: 'Montserrat', sans-serif;">Eğer bu işlemi siz yapmadıysanız, lütfen bu maili
                                dikkate almayınız.</p>
                        </div>
                    </div>
                </div>
            </body>
            
            </html>
            `,
          },
          (err, info) => {
            if (err) {
              console.log("Have mistake : " + err);
            }
            console.log("Message send is done : " );
            console.log(info);
            transporter.close();
          }
        );

        req.flash("success_messages", [
          {
            msg: "Email'inizi doğrulayın... Bilgi: Gönderdiğimiz mail Spam Kutusu'na düşmüş olabilir ve bu email daha önce üye kayıt esnasında kullanılmış olup ancak bilgi güvenliği için doğrulama yapacak kişiye giriş izni veriyoruz.",
          },
        ]);
        res.redirect("/login");
      } else if (_user == null) {
        // ----- Yeni kullanıcı kaydı -----
        console.log(
          "user var ve email doğrulanmamış veya hiç yoktu. sonuç: KAYIT TAMAM!"
        );
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          password: req.body.password,
        });
        await newUser.save();

        // JWT Processes

        const jwtInfo = {
          id: newUser.id,
          email: newUser.email,
        };

        const jwtToken = jwt.sign(
          jwtInfo,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          { expiresIn: "1h" }
        );


        // Mail posting Processes
        const url = process.env.WEBSITE_URL + "verify?id=" + jwtToken;

        // Define Transporter
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GOOGLE_USER,
            pass: process.env.GOOGLE_PASSWORD,
          },
        });

        transporter.sendMail(
          {
            from: "Sosyal Genç Nesil Topluluğu - SGNT < bltycxkk@gmail.com",
            to: newUser.email,
            subject: "Email Doğrulaması - SGNT",
            html: `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Doğrulama Maili</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
            </head>
            
            <body>
                <div style="margin: 20px; display: flex; justify-content: center; align-items: center;">
                    <div>
                        <div
                            style=" border-radius: 15px; margin-top: 20px; padding: 40px; border: 1px solid green; box-shadow: green 0 0 20px;">
                            <h2
                                style="margin-bottom : 50px ;font-family: 'Montserrat', sans-serif; font-weight: 700;">
                                ${newUser.firstName} selam👋, SGNT topluluk sitesine üyeliğinin tamamlanması için kaydını doğruluyorsun💪, aşağıdaki butona tıklaman yeterli, seni yönlendireceğiz.🚀 Teşekkürler...</h2>
                            <h4 style="margin-bottom: 20px;font-family: 'Montserrat', sans-serif; font-weight: 700;"> Merhaba, <br>
                                Üyeliğinizi doğrulamak için lütfen aşağıdaki butona tıklayın:</h4>
                            <a style="margin-bottom: 20px; padding: 10px; letter-spacing: 1px; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 20px; color: white; border: 1px solid green; border-radius: 15px; background-color: green; box-shadow: green 0 0 20px;"
                                href="${url}">🛡Doğrula</a>
                            <p style="font-family: 'Montserrat', sans-serif;">Eğer bu işlemi siz yapmadıysanız, lütfen bu maili
                                dikkate almayınız.</p>
                        </div>
                    </div>
                </div>
            </body>
            
            </html>
          `,
          },
          (err, info) => {
            if (err) {
              console.log("Have mistake : " + err);
            }
            console.log("Message send is done : ");
            console.log(info);
            transporter.close();
          }
        );
        req.flash("success_messages", [
          { msg: "E-mail doğrulaması için lütfen mail kutunuzu kontrol edin. Not: Spam Kutusu'na düşmüş olabilir." },
        ]);
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
    }
  }
};

// Verify your email
const verifyEmail = async (req, res, next) => {
  const token = req.query.id;
  if (token) {
    // Have Token
    try {
      jwt.verify(
        token,
        process.env.CONFIRM_MAIL_JWT_SECRET,
        async (err, decoded) => {
          if (err) {
            req.flash("validation_errors", [
              { msg: "Hatalı veya süresi geçmiş link" },
            ]);
            return res.redirect("/login");
          } else {
            const idInToken = decoded.id;
            const update = await User.findByIdAndUpdate(
              idInToken,
              { verifyEmail: true },
              { new: true }
            );
            if (update) {
              req.flash("success_messages", [
                { msg: "Başarıyla e-mail doğrulandı! Giriş yapabilirsiniz" },
              ]);
              return res.redirect("/login");
            } else {
              req.flash("validation_errors", [
                { msg: "Lütfen tekrar kullanıcı oluşturun" },
              ]);
              return res.redirect("/login");
            }
          }
        }
      );
    } catch (error) {
      console.log(err);
    }
  } else {
    console.log("Token is invalid!");
  }
};

// Participant requester
const sendParticipantRequest = async (req, res, next) => {
  const whoSend = await User.findById(req.user._id);
  if (whoSend.tags.includes("participant")) {
    req.flash("success_messages", [
      {
        msg: "Zaten etkinlik katılımcıları arasındasınız. Belirtilen saatte etkinlik yerinde olmayı unutmayın ki unutulmayacak anılarınız olsun 😉",
      },
    ]);
    return res.redirect("/user-panel/published");
  } else if (whoSend.tags.includes("request")) {
    req.flash("success_messages", [
      {
        msg: "Etkinliğe katılım isteğin yöneticilere iletildi. Gereken ücret havalesini yaptıktan sonraki 48 saat içerisinde isteğin kabul görmez ise bize 'anasayfa > iletişim' kısmından ulaşabilirsin",
      },
    ]);
    return res.redirect("/user-panel/published");
  } else {
    try {
      const sendRequest = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { tags: "request" } },
        { new: true }
      );
      if (sendRequest) {
        req.flash("success_messages", [
          { msg: "Katılım isteği gönderimi başarılı" },
        ]);
        return res.redirect("/user-panel/published");
      } else {
        req.flash("validation_errors", [
          {
            msg: "İsteğiniz anormal bir şekilde iletilemedi. Sayfayı yenileyip tekrar deneyin olmaması takdirde bize Anasayfa > İletişim kısmından ulaşın.",
          },
        ]);
        return res.redirect("/user-panel/published");
      }
    } catch (error) {
      req.flash("validation_errors", [
        {
          msg: "İsteğiniz anormal bir şekilde iletilemedi. Sayfayı yenileyip tekrar deneyin olmaması takdirde bize Anasayfa > İletişim kısmından ulaşın.",
        },
      ]);
      return res.redirect("/user-panel/published");
    }
  }
};

// When user is try to login
const login = (req, res, next) => {
  const errorsArray = validationResult(req);

  // Validation have mistake
  if (!errorsArray.isEmpty()) {
    req.flash("validation_errors", errorsArray.array());
    req.flash("email", req.body.email);
    res.redirect("/login");
  } else {
    // No validation error
  }
};

// Logout User
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log("logout hatası :" + err);
    } else {
      req.session.destroy((err) => {
        if (err) {
          console.log("session destroy hatası :" + err);
        } else {
          res.clearCookie("connect.sid");
          res.render("login", {
            layout: "../views/layout/auth_layout.ejs",
            title: "SGNT - Logout",
            success_messages: [{ msg: "Başarıyla çıkış yapıldı" }],
          });
        }
      });
    }
  });
};

// When user forgot own password
const forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("validation_errors", errors.array);
    return res.redirect("/forgot-password");
  }
  const emailOfForgotten = req.body.email;
  const forgotUser = await User.findOne({ email: emailOfForgotten });
  if (!forgotUser) {
    req.flash("validation_errors", [
      { msg: "Bu email ile kayıtlı kullanıcı bulunamadı" },
    ]);
    return res.redirect("/forgot-password");
  } else if (forgotUser && forgotUser.verifyEmail == false) {
    req.flash("validation_errors", [
      {
        msg: "Onaylamadığınız e-posta hesabınızın şifresini değiştiremezsiniz. Lütfen önce hesabınızı onaylayın.",
      },
    ]);
    return res.redirect("/forgot-password");
  }

  // if this code is work, client inputted have account
  // Jwt Processes
  const infoJwt = {
    id: forgotUser._id,
    email: forgotUser.email,
  };

  const secretKey =
    process.env.FORGOT_PASSWORD_JWT_SECRET + "-" + forgotUser.password;
  const jwtToken = jwt.sign(infoJwt, secretKey, {
    expiresIn: "1h",
  });

  // E-mail post processes
  const url =
    process.env.WEBSITE_URL + "new-password/" + forgotUser._id + "/" + jwtToken;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_USER,
      pass: process.env.GOOGLE_PASSWORD,
    },
  });

  transporter.sendMail({
    from: "Sosyal Genç Nesil Topluluğu - SGNT < bltycxkk@gmail.com",
    to: forgotUser.email,
    subject: "Şifre Yenileme - SGNT",
    html: `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Doğrulama Maili</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
  </head>
  
  <body>
      <div style="margin: 20px; display: flex; justify-content: center; align-items: center;">
          <div>
              <div
                  style=" border-radius: 15px; margin-top: 20px; padding: 40px; border: 1px solid #01afff; box-shadow:  #01afff 0 0 20px;">
                  <h2
                      style="margin-bottom : 50px ;font-family: 'Montserrat', sans-serif; font-weight: 700;">
                      ${forgotUser.firstName} selam👋, <br> SGNT web sitesine giriş şifreni unutmuşsun anlaşılan🤔. Sorun
                      değil, şifreni hızlıca değiştir ve hemen etkinliğe katıl hadi çabuk ol aşağıdaki butona tıklaman
                      yeterli, seni yönlendireceğiz.🚀 Teşekkürler...</h2>
                  <h4 style="font-family: 'Montserrat', sans-serif; font-weight: 700;"> Merhaba, <br>
                      Şifreni yenilemek için lütfen aşağıdaki butona tıklayın:</h4>
                  <a style="padding: 10px; letter-spacing: 1px; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 20px; color: white; border: 1px solid #01afff; border-radius: 15px; background-color: #01afff; box-shadow: #01afff 0 0 20px;"
                      href="${url}">🔑Şifremi Yenile</a>
                  <p style="font-family: 'Montserrat', sans-serif;">Eğer bu işlemi siz yapmadıysanız, lütfen bu maili
                      dikkate almayınız.</p>
              </div>
          </div>
      </div>
  </body>
  
  </html>
    `,
  });

  req.flash("success_messages", [
    { msg: "Şifrenizi sıfırlamanız için link verdiğiniz maile gönderildi. Not: Gönderdiğimiz mail Spam Kutusu'na düşmüş olabilir." },
  ]);
  return res.redirect("/forgot-password");
};

// Get the new password
const newPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("validation_errors", errors.array());
    return res.redirect("/new-password/" + req.body.id + "/" + req.body.token);
  } else {
    const updatePass = await User.findByIdAndUpdate(
      req.body.id,
      { password: req.body.password },
      { new: true }
    );

    req.flash("success_messages", [{ msg: "Başarıyla şifreniz güncellendi" }]);
    return res.redirect("/login");
  }
};

// ***************** End Post Processes *****************++

module.exports = {
  showMainPage,
  showLoginPage,
  showRegisterPage,
  showForgotPasswordPage,
  showPublishActivityPage,
  showJoinedPage,
  showAnnouncementPage,
  showInfoPage,
  showNewPasswordPage,

  register,
  login,
  logout,
  sendParticipantRequest,
  verifyEmail,
  forgotPassword,
  newPassword,
};
