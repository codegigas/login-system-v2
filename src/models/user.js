"use strict";

const crypto = require("crypto");
const mongodb = require("mongodb");
const { getDb } = require("../config/mongodb");

const bCheckIfUsernameIsAvaliableAsync = async (username) => {
  var result = null;
  try {
    const db = await getDb();
    result = await db.collection("users").findOne({username: username});
  } catch (err) {
    throw new Error(err);
  }

  if (result == null) {
    return true;
  } else {
    return false;
  }
    
}

const bCheckIfEmailIsAvaliableAsync = async (email) => {
  var result = null;
  try {
    const db = await getDb();
    result = await db.collection("users").findOne({email: email});
  } catch (err) {
    throw new Error(err);
  }

  if (result == null) {
    return true;
  } else {
    return false;
  }

}

// Creating a unique salt for a particular user
const generateSalt = () => {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt;
}

// First you need to create a unique salt for every user 
// then this function hashes the user password with their salt creating a hash 
// this hash is stored in the database as a password
const generateHash = (password, salt) => {
  // Hashing user's password and salt with 1000 iterations
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 512, "sha512").toString("hex");
  return hash;
}

const getUserByUsername = async (username) => {
  const db = await getDb();
  return db.collection("users").findOne({username: username});
}

const insertOneAsync = async (user) => {
  var result = null;
  try {
    const db = await getDb();
    result = await db.collection("users").insertOne(user);
  } catch (err) {
    throw new Error(err);
  }

  return result;
}

// Validation Checks
const isUsernameLengthValid = (username) => {
  if (username.length >= 4 && username.length <= 32) { 
    return true; 
  } else { 
    return false; 
  }
}

const isPasswordLengthValid = (password) => {
  if (password.length >= 8 && password.length <= 64) { 
    return true;
  } else {
    return false;
  } 
}

const isEmailValid = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/gm;

  if (regex.test(email)) { 
    return true; 
  } 
  else { 
    return false; 
  }
}

module.exports = {
  bCheckIfUsernameIsAvaliableAsync: bCheckIfUsernameIsAvaliableAsync,
  bCheckIfEmailIsAvaliableAsync: bCheckIfEmailIsAvaliableAsync,
  generateSalt: generateSalt,
  generateHash: generateHash,
  insertOneAsync: insertOneAsync,
  getUserByUsername: getUserByUsername,

  isUsernameLengthValid: isUsernameLengthValid,
  isPasswordLengthValid: isPasswordLengthValid,
  isEmailValid: isEmailValid,
};