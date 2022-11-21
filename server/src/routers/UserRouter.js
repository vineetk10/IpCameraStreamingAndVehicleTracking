var userController = require("../controllers/UserController")
var express = require('express');
var router = express.Router();

// Register a User
router.post("/register", userController.registerUser);


router.post("/registerCamera/:emailId", userController.registerCamera);


// Check if a user is already present or not, will be useful for bloom filter
router.get("/:emailId", userController.find);

// User Login
router.post("/login", userController.login);

module.exports = router;