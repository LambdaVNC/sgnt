const { User } = require("../models/user_model");
const { Act } = require("../models/act_model");

const showDashboardPage = async (req, res, next) => {
  const publishedAct = await Act.findOne();
  let participantNumber, earning, requestNumber;
  if (!publishedAct) {
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
    res.render("admin_dashboard", {
      layout: "../views/layout/admin_layout.ejs",
      user: req.user,
      act: publishedAct,
      participantNumber,
      requestNumber,
      earning,
    });
  }
  participantNumber = await User.find({ tags: "participant" });
  requestNumber = await User.find({ tags: "request" });
  earning = participantNumber * publishedAct.price;
  res.render("admin_dashboard", {
    layout: "../views/layout/admin_layout.ejs",
    user: req.user,
    act: publishedAct,
    participantNumber: participantNumber.length,
    requestNumber: requestNumber.length,
    earning,
  });
};

const showPublishedPage = async (req, res, next) => {
  const act = await Act.findOne();
  res.render("published_activity", {
    layout: "../views/layout/admin_layout",
    user: req.user,
    act,
  });
};

const showAllParticipantsPage = async (req, res, next) => {
  const participants = await User.find({ tags: "participant" });
  res.render("admin_all_participants", {
    layout: "../views/layout/admin_layout.ejs",
    user: req.user,
    allParticipants: participants,
  });
};

const showParticipantRequestsPage = async (req, res, next) => {
  const userRequests = await User.find({ tags: "request" });
  res.render("admin_participant_request_list", {
    layout: "../views/layout/admin_layout.ejs",
    reqList: userRequests,
    user: req.user,
  });
};

const showInfoPage = (req, res, next) => {
  res.render("info", {
    layout: "../views/layout/admin_layout",
    user: req.user,
  });
};

const showAnnouncementsPage = (req, res, next) => {
  res.render("announcement", {
    layout: "../views/layout/admin_layout",
    user: req.user,
  });
};

const showTeamPage = async (req, res, next) => {
  try {
    const team = await User.find({ role: { $ne: "user" } });
    res.render("team", {
      layout: "../views/layout/admin_layout.ejs",
      team,
      user: req.user,
    });
  } catch (err) {
    console.log(err);
  }
};

// ----------------- Admin Capability -------------

const sendParticipantRequest = async (req, res, next) => {
  const me = req.user;
  const newTag = ["request"];
  if (me.tags.includes("participant")) {
    req.flash("success_messages", [
      {
        msg: "Zaten etkinlik katılımcıları arasındasınız. Belirtilen saatte etkinlik yerinde olmayı unutmayın ki unutulmayacak anılarınız olsun 😉",
      },
    ]);
    return res.redirect("/admin-panel/published");
  } else if (me.tags.includes("request")) {
    req.flash("success_messages", [
      {
        msg: "Etkinliğe katılım isteğin yöneticilere iletildi. Gereken ücret havalesini yaptıktan sonraki 48 saat içerisinde isteğin kabul görmez ise bize 'anasayfa > iletişim' kısmından ulaş.",
      },
    ]);
    return res.redirect("/admin-panel/published");
  } else {
    try {
      await User.findByIdAndUpdate(me._id, { tags: newTag }, { new: true })
        .then((updatedUser) => {
          req.flash("success_messages", [
            { msg: "Katılım isteği gönderimi başarılı" },
          ]);
          return res.redirect("/admin-panel/published");
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
    return res.redirect("/admin-panel/participant-request");
  } else {
    req.flash("validation_errors", [
      { msg: "Kişiye ulaşılamadı veya db de bulunamadı" },
    ]);
    return res.redirect("/admin-panel/participant-request");
  }
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
    return res.redirect("/admin-panel/participant-request");
  }
};

const logout = (req, res, next) => {  req.logout((err) => {
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
  showAllParticipantsPage,
  showParticipantRequestsPage,
  showAnnouncementsPage,
  showInfoPage,
  showTeamPage,

  sendParticipantRequest,
  acceptRequest,
  rejectionRequest,
  logout,
};
