const path = require("path");
const ncp = require("ncp").ncp;

// Copy .hbs files from src to dist
ncp(
  path.join(__dirname, "src", "email"),
  path.join(__dirname, "dist", "email"),
  function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("Handlebars files copied to dist!");
  }
);
