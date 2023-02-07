var userController = require("../controllers/UserController")
var express = require('express');
var router = express.Router();

// Working fine.
router.post("/register", userController.registerUser);

// Working fine.
router.post("/registerCamera/:emailId", userController.registerCamera);


// Working fine.
router.delete("/deleteCamera/:emailId/:cameraId", userController.deleteCamera);

// Working fine.
router.put("/updateCamera/:emailId", userController.updateCamera);


// have one end point to refresh the feed with openvidu server for a single camera
router.get("/refreshConnection/:emailId/:cameraId", userController.registerCamera);

// have one end point to refresh the feed with openvidu server for a all the cameras camera
router.get("/refreshConnection/:emailId", userController.registerCamera);


// have one end point to return camera id , name and token details for accessing livefeed
// Working fine.
router.get("/liveFeed/:emailId", userController.liveFeed);




// Check if a user is already present or not, will be useful for bloom filter
router.get("/:emailId", userController.find);

// User Login
router.post("/login", userController.login);

module.exports = router;