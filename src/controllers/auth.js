"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const getLoginPage = (req, res) => {
  const data = {
    pageTitle: "Login",
    bUserIsAuthenticated: req.session.bUserIsAuthenticated
  }
  res.render("auth/login.ejs", data);
}

const getRegisterPage = (req, res) => {
  const data = {
    pageTitle: "Register",
    bUserIsAuthenticated: req.session.bUserIsAuthenticated
  }
  res.render("auth/register.ejs", data);
}

const postLogin = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  var user = null;
  try {
    user = await User.getUserByUsername(username);
  } catch (err) {
    console.log(err);
    res.render("home.ejs");
    return;
  }

  if (user == null) {
    const data = {
      objRegisterErrors: {
        bUserDoesNotExist: true
      }
    }
    res.render("auth/login.ejs", data);
    return;
  }

  const passwordSalt = user.passwordSalt;
  const passwordHash = user.passwordHash;
  const currentPasswordHash = User.generateHash(password, passwordSalt);

  if (passwordHash != currentPasswordHash) {
    const data = {
      objRegisterErrors: {
        bPasswordIsIncorrect: true
      }
    }
    res.render("auth/login.ejs", data);
    return;
  }

  const payload = {
    bUserIsAuthenticated: true,
    objUser: {
      user_id: user._id,
      username: user.username,
      email: user.email
    }
  }
  var kur = jwt.sign(payload, "keyboard cat");

  req.session.bUserIsAuthenticated = true;
  req.session.objUser = {
    user_id: user._id,
    username: user.username,
    email: user.email
  };
  req.session.save((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
}

const postRegister = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const email = req.body.email;

  // Step 1. Input Data Validation
  // Step 2. Database Data Validation

  await User.bCheckIfUsernameIsAvaliableAsync(username);

  var results = null;
  try {
    results = await Promise.all([
      User.bCheckIfUsernameIsAvaliableAsync(username),
      User.bCheckIfEmailIsAvaliableAsync(email),
    ]);
  } catch (err) {
    console.log(err);
    res.render("home.ejs");
    return;
  }

  const bUsernameIsAvaliable = results[0];
  const bEmailIsAvaliable = results[1];

  if (bUsernameIsAvaliable == false || bEmailIsAvaliable == false) {
    const data = {
      objRegisterForm: {
        username: username,
        password: password,
        confirmPassword: confirmPassword,
        email: email,
      },
      objRegisterErrors: {
        bUsernameIsAvaliable: bUsernameIsAvaliable,
        bEmailIsAvaliable: bEmailIsAvaliable
      }
    }
    res.render("auth/register.ejs", data);
    return;
  }

  // Step 3. User Creation
  const passwordSalt = User.generateSalt();
  const passwordHash = User.generateHash(password, passwordSalt);
  
  const user = {
    username: username,
    email: email,
    passwordSalt: passwordSalt,
    passwordHash: passwordHash
  }

  await User.insertOneAsync(user);
  res.render("home.ejs");
  
}

module.exports = {
  getLoginPage: getLoginPage,
  getRegisterPage: getRegisterPage,
  postLogin: postLogin,
  postRegister: postRegister
}