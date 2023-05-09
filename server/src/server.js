const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config({path : "./config.env"})
var bodyParser = require("body-parser");
var http = require("http");
var OpenVidu = require("openvidu-node-client").OpenVidu;
var UserRouter = require("./routers/UserRouter")


const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const checkForNewVideos = require('./upload');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});


const upload = multer({ storage: storage });



app.use(express.json());
app.use(cors({
    origin: "*",
  }));

// const { mongoDB } = require('../config');
const port = process.env.PORT || 8080;
const mongoDB = process.env.ATLAS_URI;

var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 100
};

mongoose.connect(mongoDB, options, (err, res) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);
    }
});


app.get("/", function(req,resp){
    resp.send("MultiCamera Object Tracking Endpoints");
});


// Allow application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Allow application/json
app.use(bodyParser.json());


// Handle the file upload and conversion
app.post('/upload', upload.single('file'), function(req, res) {
  console.log("******************************** Inside upload")
  const inputFile = `./uploads/${req.file.filename}`;
  const outputFile = `./uploads/${req.file.filename.replace(/\.[^/.]+$/, '')}.mp4`;
  console.log("******************************** Inside upload")
  
  ffmpeg(inputFile)
    .output(outputFile)
    .on('end', function() {
      console.log('Video conversion complete');
      fs.unlink(inputFile, function (err) {
          if (err) {
              console.log('Error deleting input file:', err);
          } else {
              console.log('Input file deleted successfully');
          }})
      res.status(200).send('Video uploaded and converted successfully');
    })
    .run();
});

app.use("/users", UserRouter);



// Open Vidu Basic node implementation for connection to a web conference



// console.warn('Application server connecting to OpenVidu at ' + process.env.OPENVIDU_URL);

// var openvidu = new OpenVidu(
//   process.env.OPENVIDU_URL,
//   process.env.OPENVIDU_SECRET
// );

// app.post("/api/sessions", async (req, res) => {
//   console.log('LINE 63')
//   var session = await openvidu.createSession(req.body);
//   res.send(session.sessionId);
// });

// app.post("/api/sessions/:sessionId/connections", async (req, res) => {
//   var session = openvidu.activeSessions.find(
//     (s) => s.sessionId === req.params.sessionId
//   );
//   if (!session) {
//     console.log('LINE 72')
//     res.status(404).send();
//   } else {
//     console.log('LINE 75')
//     var connection = await session.createConnection(req.body);
//     res.send(connection.token);
//   }
// });


// // how to create session to publish IP cameras
// // 1st need to create a session object using app.post("/api/sessions", async (req, res)
// // then using that sessionId need to register the IP camera URI


// var connectionProperties = {
//   type: "IPCAM",
//   rtspUri: "rtsp://your.camera.ip:7777/path",
//   adaptativeBitrate: true,
//   onlyPlayWithSubscribers: false,
//   networkCache: 1000
// };



// // this API should return the stream created for that IP camera,
// // that can be accessed on the UI using Subscribe from other user's stream - https://docs.openvidu.io/en/stable/cheatsheet/subscribe-unsubscribe/

// app.post("/api/sessions/:sessionId/ipcamera", async (req, res) => {
//   var session = openvidu.activeSessions.find(
//     (s) => s.sessionId === req.params.sessionId
//   );
//   if (!session) {
//     res.status(404).send();
//   } else {
//     var connection = await session.createConnection(connectionProperties);
//     res.send(connection);
//   }
// });






app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
    // Call the checkForNewVideos function when the Node.js application starts up
   // checkForNewVideos();
})


module.exports = app;
