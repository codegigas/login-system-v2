const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const config = require("./src/config/config.js");
const mongodb = require("./src/config/mongodb.js");
const authRoutes = require("./src/routes/auth.js");

const app = express();
app.set("view engine", "ejs");
app.set("views", "./src/views");

function sessionWithJWT(config) {
  const token_key = "JWT";
  const token_secret = "keyboard cat";
  
  const sessionWithJWT = (req, res, next) => {
    var token = req.cookies[token_key];
    if (!token) {
      const payload = {
        bUserIsAuthenticated: false,
        pageViews: 0,
        objUser: {
          username: "guest"
        }
      };
      token = jwt.sign(payload, token_secret);
      res.cookie(token_key, token);
      req.session = payload;
    } else {
      var payload = jwt.verify(token, token_secret);
      req.session = payload;
    }
    next();
  }

  return sessionWithJWT;
}

app.use(cookieParser());
app.use(sessionWithJWT());
app.use(authRoutes.routes);

app.get("/", (req, res) => {
  req.session.pageViews++;
  console.log(req.session);

  const data = {
    bUserIsAuthenticated: req.session.bUserIsAuthenticated,
    objUser: {
      username: req.session.objUser.username
    }
  }

  res.render("home.ejs", data);

});

(async () => {
  try {
    await mongodb.connect();
    app.listen(config.PORT, () => {
      console.log(`Server is listening on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
    await mongodb.disconnect();
  }

})()