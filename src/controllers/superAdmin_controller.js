const { validationResult } = require("express-validator");
const { Act } = require("../models/act_model");
const { User } = require("../models/user_model");

// ---------- START SHOW PANELS ----------
const showDashboardPage = async (req, res, next) => {
  const act = await Act.findOne();
  let earning, participantNumber, requestNumber;
  if (!act) {
    const act = {
      title: "-",
      description: "no activity",
      date: "-",
      price: 0,
      location: "-",
      iban: "-",
    };
    earning = 0;
    participantNumber = 0;
    requestNumber = 0;
    res.render("superAdmin_dashboard", {
      layout: "../views/layout/superAdmin_layout.ejs",
      act: act,
      user: req.user,
      participantNumber: participantNumber.length,
      requestNumber: requestNumber.length,
      earning,
    });
  } else {
    participantNumber = await User.find({ tags: "participant" });
    requestNumber = await User.find({ tags: "request" });
    earning = act.price * participantNumber.length;
    res.render("superAdmin_dashboard", {
      user: req.user,
      layout: "../views/layout/superAdmin_layout.ejs",
      act: act,
      participantNumber: participantNumber.length,
      requestNumber: requestNumber.length,
      earning,
    });
  }
};

const showPublishedPage = async (req, res, next) => {
  const publishedAct = await Act.find();
  res.render("superAdmin_published_activity", {
    layout: "../views/layout/superAdmin_layout.ejs",
    act: publishedAct[0],
    user: req.user,
  });
};

const showJoinedPage = (req, res, next) => {
  res.render("joined_activity", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
  });
};

const showAddActivityPage = (req, res, next) => {
  res.render("add_activity", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
  });
};

const showAllParticipantsPage = async (req, res, next) => {
  const participants = await User.find({ tags: "participant" });
  res.render("all_participants", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
    allParticipants: participants,
  });
};

const showParticipantRequestsPage = async (req, res, next) => {
  const moment = require("moment");
  const userRequests = await User.find({ tags: "request" });
  res.render("participant_request_list", {
    layout: "../views/layout/superAdmin_layout.ejs",
    reqList: userRequests,
    moment,
    user: req.user,
  });
};

const showMembersListPage = async (req, res, next) => {
  try {
    const now = new Date();
    const allMembers = await User.find();
    res.render("members_list", {
      layout: "../views/layout/superAdmin_layout.ejs",
      allMembers: allMembers,
      user: req.user,
    });
  } catch (err) {
    console.log(err);
  }
};

const showTeamPage = async (req, res, next) => {
  try {
    const team = await User.find({ role: { $ne: "user" } });
    res.render("team", {
      layout: "../views/layout/superAdmin_layout.ejs",
      team,
      user: req.user,
    });
  } catch (err) {
    console.log(err);
  }
};

const showGivePermissionPage = (req, res, next) => {
  res.render("give_permission", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
  });
};

const showInfoPage = (req, res, next) => {
  res.render("info", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
  });
};

const showAnnouncementsPage = (req, res, next) => {
  res.render("announcement", {
    layout: "../views/layout/superAdmin_layout.ejs",
    user: req.user,
  });
};

// ---------- END SHOW PANELS ----------

// ---------- Start superAdmin capability ----------
// Delete All participants from existing activity for new activity
const deleteAllParticipants = async (req, res, next) => {
  try {
    await User.updateMany(
      { tags: "participant" },
      { $pull: { tags: "participant" } }
    );
    req.flash("success_messages", [
      {
        msg: `Tüm katılımcılar başarılı bir şekilde silindi.`,
      },
    ]);
    return res.redirect("/super-admin/all-participants");
  } catch (err) {
    req.flash("validation_errors", [
      { msg: `Bir sorunla karşılaştık: ${err}` },
    ]);
    return res.redirect("/super-admin/all-participants");
  }
};

// When superAdmin want to delete only one participant
const deleteOneParticipant = async (req, res, next) => {
  const willDeleted = await User.find({ email: req.body.deleteOneParticipant });
  if (willDeleted.length !== 0) {
    console.log(willDeleted[0].id);
    await User.findByIdAndUpdate(
      willDeleted[0].id,
      { $pull: { tags: "participant" } },
      { new: true }
    );
    const updatedUser = await User.findById(willDeleted[0]._id);
    console.log(updatedUser);
    req.flash("success_messages", [
      {
        msg: `${
          willDeleted[0].firstName + " " + willDeleted[0].lastName
        } kişisi, ${
          willDeleted[0].email
        } email adresinden bulundu ve katılımcılar arasından silindi`,
      },
    ]);
    return res.redirect("/super-admin/all-participants");
  } else {
    req.flash("validation_errors", [
      {
        msg: `${req.body.deleteOneParticipant} ile kayıtlı bir kişi yok! Doğru yazdığınızdan emin olun.`,
      },
    ]);
    return res.redirect("/super-admin/all-participants");
  }
};

// Delete your activity already have
const deleteAct = async (req, res, next) => {
  const act = await Act.findOneAndDelete();
  const requestedUser = await User.find({ tags: "request" });
  console.log(requestedUser);
  res.redirect("/super-admin/published");
};

// Add a new activity when your activity list is empty
const addActivity = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    req.flash("validation_errors", errors.array());
    res.redirect("/super-admin/add-activity");
  } else {
    // Super admin var olan halihazırda bir etkinliğin üzerine başka bir etkinlik ekleyemez
    const actNumber = await Act.find();
    if (actNumber.length !== 0) {
      console.log("var olan etkinlik hatası");
      req.flash("validation_errors", [
        { msg: "Yayına yalnızca bir tane etkinlik eklenebilir!" },
      ]);
      return res.redirect("/super-admin/add-activity");
    } else {
      try {
        const newAct = new Act({
          title: req.body.actName,
          description: req.body.actDescription,
          date: req.body.actDate,
          location: req.body.actLocation,
          price: req.body.actPrice,
          iban: req.body.actIban,
          ibanOwner: req.body.actIbanOwner,
          image: req.file.filename,
        });
        await newAct
          .save()
          .then((_) => {
            req.flash("success_messages", [
              { msg: "Etkinlik başarı ile yayında!" },
            ]);
            return res.redirect("/super-admin/published");
          })
          .catch((err) => {
            req.flash("validation_errors", [
              {
                msg: "Bir sorun var geliştiriciye ulaşın. Dashboard sayfasından bug report butonu ile ulaşım sağlayın. Teşekkürler.",
              },
            ]);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }
};

// Accept the request for your activity
const addParticipant = async (req, res, next) => {
  const me = req.user;
  const newTag = ["request"];
  if (me.tags.includes("participant")) {
    req.flash("success_messages", [
      {
        msg: "Zaten etkinlik katılımcıları arasındasınız. Belirtilen saatte etkinlik yerinde olmayı unutmayın ki unutulmayacak anılarınız olsun 😉",
      },
    ]);
    return res.redirect("/super-admin/published");
  } else if (me.tags.includes("request")) {
    req.flash("success_messages", [
      {
        msg: "Etkinliğe katılım isteğin yöneticilere iletildi. Gereken ücret havalesini yaptıktan sonraki 48 saat içerisinde isteğin kabul görmez ise bize 'anasayfa > iletişim' kısmından ulaş.",
      },
    ]);
    return res.redirect("/super-admin/published");
  } else {
    try {
      await User.findByIdAndUpdate(me._id, { tags: newTag }, { new: true })
        .then((updatedUser) => {
          console.log("Güncellenmiş kullanıcı : " + updatedUser);
          req.flash("success_messages", [
            { msg: "Katılım isteği gönderimi başarılı" },
          ]);
          return res.redirect("/super-admin/published");
        })
        .catch((err) => {
          console.log("Bir hata mevcut : " + err);
        });
    } catch (error) {
      console.log(error);
    }
  }
};

// Accept user request on participant-request page
const acceptRequest = async (req, res, next) => {
  const acceptRequest = await User.findById(req.body.idOfAcceptRequest);
  if (acceptRequest) {
    const updatedTags = ["participant"];
    await User.findByIdAndUpdate(
      req.body.idOfAcceptRequest,
      { tags: updatedTags },
      { new: true }
    );
    req.flash("success_messages", [
      {
        msg: `${acceptRequest.firstName} ${acceptRequest.lastName} kişisinin etkinliğe katılım isteği KABUL edildi.`,
      },
    ]);
    return res.redirect("/super-admin/participant-request");
  } else {
    req.flash("validation_errors", [
      { msg: "Kişiye ulaşılamadı veya db de bulunamadı" },
    ]);
    return res.redirect("/super-admin/participant-request");
  }
};

// Verify your email
const verifyEmail = async (req, res, next) => {
  const token = req.query.id;
};

// Rejection user request on participant-request page
const rejectionRequest = async (req, res, next) => {
  const rejectionRequest = await User.findById(req.body.idOfRejectionRequest);
  if (rejectionRequest) {
    const updatedTags = [];
    await User.findByIdAndUpdate(
      req.body.idOfRejectionRequest,
      { tags: updatedTags },
      { new: true }
    );
    req.flash("success_messages", [
      {
        msg: `${rejectionRequest.firstName} ${rejectionRequest.lastName} kişisinin etkinliğe katılım isteği RED edildi`,
      },
    ]);
    return res.redirect("/super-admin/participant-request");
  }
};

const grantPermission = async (req, res, next) => {
  try {
    const haveIUser = await User.findOne({ email: req.body.user_email });
    if (haveIUser) {
      const givedPermissionUser = await User.findOneAndUpdate(
        { email: req.body.user_email },
        { role: req.body.user_role },
        { new: true }
      );
      if (givedPermissionUser) {
        req.flash("success_messages", [
          {
            msg: `${req.body.user_email} kişisine ${req.body.user_role} rolü verildi`,
          },
        ]);
        return res.redirect("/super-admin/give-auth");
      } else {
        req.flash("validation_errors", [
          {
            msg: `${req.body.user_email} maili ile kayıtlı kişiye rol verilemedi!`,
          },
        ]);
        return res.redirect("/super-admin/give-auth");
      }
    } else {
      req.flash("validation_errors", [
        { msg: `${req.body.user_email} maili ile kayıtlı biri yok!` },
      ]);
      return res.redirect("/super-admin/give-auth");
    }
  } catch (err) {}
};

// Logout
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
module.exports = {
  showDashboardPage,
  showPublishedPage,
  showJoinedPage,
  showAllParticipantsPage,
  showParticipantRequestsPage,
  showAddActivityPage,
  showMembersListPage,
  showTeamPage,
  showGivePermissionPage,
  showAnnouncementsPage,
  showInfoPage,

  logout,
  addParticipant,
  addActivity,
  deleteAllParticipants,
  deleteAct,
  deleteOneParticipant,
  acceptRequest,
  rejectionRequest,
  grantPermission,
  verifyEmail,
};
