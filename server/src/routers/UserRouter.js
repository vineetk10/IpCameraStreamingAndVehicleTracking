var userController = require("../controllers/UserController")
var express = require('express');
var router = express.Router();

// Register a User
router.post("/register", userController.registerUser);

// Check if a user is already present or not, will be useful for bloom filter
router.get("/find/:emailId", userController.find);

// User Login
router.post("/login", userController.login);

module.exports = router;