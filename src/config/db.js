const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("DB connection is done!");
  })
  .catch((err) => {
    console.log("Mistake : " + err);
  });
