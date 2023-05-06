const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const path = require("path");


// Database connections
require("./src/config/db");

// app.use configurations
require("./src/startup/use_config")(app);

// route lines
require("./src/startup/routes")(app);

//Server ayaklandı
app.listen(process.env.PORT || 3000, (_) => {
  console.log(`The server is up from port ${process.env.PORT}`);
});
