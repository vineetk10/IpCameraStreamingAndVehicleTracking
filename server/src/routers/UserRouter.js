var userController = require("../controllers/UserController")
var express = require('express');
var router = express.Router();



// Working fine.
router.post("/register", userController.registerUser);


// Working fine.
router.post("/registerCamera/:id", userController.registerCamera);


// TO refresh IP camera, stop it  pass action in the query param, id is user id, pass camera id in the body
router.put("/registerCamera/:id", userController.refreshCamera);


// PUT http://localhost:8000/users/registerCamera/63e08cd02e597b0ed6ce32be?action=refresh
// content-type: application/json

// {
//     "_id": "64178c9a31e127c75db4404a",
//     "ip" : "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4",
//     "name": "testingRTSP",
//     "port": 50000,
//     "isRTSP": true
// }


// Working fine.
router.delete("/deleteCamera/:emailId/:cameraId", userController.deleteCamera);


// Working fine.
router.put("/updateCamera/:emailId", userController.updateCamera);


// // have one end point to refresh the feed with openvidu server for a single camera
// router.get("/refreshConnection/:emailId/:cameraId", userController.registerCamera);

// // have one end point to refresh the feed with openvidu server for a all the cameras camera
// router.get("/refreshConnection/:emailId", userController.registerCamera);


// have one end point to return camera id , name and token details for accessing livefeed
// Working fine.

router.get("/getCameras/:emailId", userController.getCameras);
router.get("/liveFeed/:emailId", userController.liveFeed);




// Check if a user is already present or not, will be useful for bloom filter
router.get("/:emailId", userController.find);

// User Login
router.post("/login", userController.login);

// Fetch the recordings for a user
router.get("/recordings/:id", userController.fetchRecordings);

// Fetch the queries for a user, based on _id
router.get("/queries/:id", userController.fetchQueries);

// Delete the queries for a user, based on _id
router.delete("/queries/:id/:query_id", userController.deleteQuery);

module.exports = router;
