const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config({path : "./config.env"})
var bodyParser = require("body-parser");
var http = require("http");
var UserRouter = require("./routers/UserRouter")

const path = require('path');
const { spawn } = require('child_process');


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

// TESTING FOR UPLOADING CHUNKS FROM WEBCAM, created the chunks folder for the same


const storage1 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'chunks');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});


const upload1 = multer({ storage: storage1 });


app.post('/uploadChunks', upload1.single('file'), function(req, res) {

  const baseDirectory = './chunks'
  const filename = req.file.filename;
  console.log(filename);

  const inputFile = `./chunks/${req.file.filename}`;
  // const outputFile = `./chunks/${req.file.filename.replace(/\.[^/.]+$/, '')}.mp4`;

  if (filename) {
    const videoName = filename.split(".")[0];
    console.log('Video name:', videoName);

    const individualDetails = videoName.split("_");
    const userid = individualDetails[0];
    const camera = individualDetails[1];
    const startTime = individualDetails[2];
    const chunkTime = individualDetails[3];

    const directoryPath = path.join(baseDirectory, `${userid}_${camera}_${startTime}`);
    const outputFile = `./chunks/${userid}_${camera}_${startTime}/` + chunkTime  + ".webm"

    // Check if directory exists, create it if it doesn't
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    console.log('Input file: ' , inputFile)
    console.log('Output file: ' , outputFile)
   

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

  } else {
    console.log('Filename is undefined or null');
    res.sendStatus(400);
  }
});

    // Example usage in your code
    const baseDirectory = path.resolve('./chunks'); // Resolve to absolute path

app.post('/stopChunks', upload1.single('file'), function(req, res) {

  const baseDirectory = './chunks'
  const filename = req.file.filename;
  console.log(filename);

  const inputFile = `./chunks/${req.file.filename}`;
  // const outputFile = `./chunks/${req.file.filename.replace(/\.[^/.]+$/, '')}.mp4`;

  if (filename) {
    const videoName = filename.split(".")[0];
    console.log('Video name:', videoName);

    const individualDetails = videoName.split("_");
    const userid = individualDetails[0];
    const camera = individualDetails[1];
    const startTime = individualDetails[2];
    const chunkTime = individualDetails[3];

    const directoryPath = path.join(baseDirectory, `${userid}_${camera}_${startTime}`);
    const outputFile = `./chunks/${userid}_${camera}_${startTime}/` + chunkTime  + ".webm"
    // const directoryPath1 = `./chunks/${userid}_${camera}_${startTime}/`

    // const outputFile1 = `./chunks/${userid}_${camera}_${startTime}/` + 'combine.mp4'



    const directoryPath1 = path.join(baseDirectory, `${userid}_${camera}_${startTime}`);
    const outputFile1 = path.join(directoryPath1, videoName + '.mp4');

    // combineAllMP4Files(directoryPath1, outputFile1)


    // Check if directory exists, create it if it doesn't
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    console.log('Input file: ' , inputFile)
    console.log('Output file: ' , outputFile)
   

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

          setTimeout(() => {
            combineAllMP4Files(directoryPath1, outputFile1)
          }, 5000)
      // combineAllMP4Files(directoryPath1, outputFile1)
      res.status(200).send('Video uploaded and converted successfully');
    })
    .run();


    




  } else {
    console.log('Filename is undefined or null');
    res.sendStatus(400);
  }

});


function combineAllMP4Files(directoryPath, outputFilePath) {


  const inputFiles = fs.readdirSync(directoryPath)
  .filter(file => path.extname(file) === '.webm')
  .map(file => path.join(directoryPath, file));

  const ffmpegCommand = ffmpeg({ source: inputFiles[0] });
  for (let i = 1; i < inputFiles.length; i++) {
    ffmpegCommand.input(inputFiles[i]);
  }

  console.log('Directory Path:', directoryPath)
  console.log('Input files:', inputFiles)

  ffmpegCommand
    .on('end', () => {
      console.log("Merge is complete")
      // Move the file to the upload folder
      const destinationPath = path.join('./uploads', path.basename(outputFilePath));
      fs.renameSync(outputFilePath, destinationPath);
      console.log('File moved to:', destinationPath);

      // Delete the original directory and its contents
      fs.rmdirSync(directoryPath, { recursive: true });
      console.log('Directory deleted:', directoryPath);
    })
    .on('error', (err) => console.log("Error:", err))
    .mergeToFile(outputFilePath);
}


function checkRemainingVideos(){
  const chunksDirectory = './chunks';

  // Read the contents of the chunks directory
  fs.readdir(chunksDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    // Filter out directories
    const directories = files.filter(file => {
      const fullPath = path.join(chunksDirectory, file);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log('Directories:', directories);

    directories.forEach(directory => combineAllMP4FilesStartUp(chunksDirectory + "/" + directory))
  });
}

function combineAllMP4FilesStartUp(directoryPath) {
  const inputFiles = fs.readdirSync(directoryPath)
  .filter(file => path.extname(file) === '.mp4')
  .map(file => path.join(directoryPath, file));

  const ffmpegCommand = ffmpeg({ source: inputFiles[0] });
  for (let i = 1; i < inputFiles.length; i++) {
    ffmpegCommand.input(inputFiles[i]);
  }

  console.log('Directory Path:', directoryPath)
  console.log('Input files:', inputFiles)

  const outputFileArray = inputFiles[inputFiles.length - 1].split('/')
  const outputFile = outputFileArray[1] + "_" + outputFileArray[2]
  const outputFilePath = directoryPath + "/" + outputFile
  console.log('Output file:', outputFile)
  console.log('Output filePath:', outputFilePath)

  ffmpegCommand
  .outputOptions('-c:v', 'copy') // Copy the video codec
  .outputOptions('-c:a', 'copy') // Copy the audio codec
    .on('end', () => {
      console.log("Merge is complete")
      // Move the file to the upload folder
      const destinationPath = path.join('./uploads', path.basename(outputFilePath));
      fs.renameSync(outputFilePath, destinationPath);
      console.log('File moved to:', destinationPath);

      // Delete the original directory and its contents
      fs.rmdirSync(directoryPath, { recursive: true });
      console.log('Directory deleted:', directoryPath);
    })
    .on('error', (err) => console.log("Error:", err))
    .mergeToFile(outputFilePath);
}



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
    // Call the checkForNewVideos function when the Node.js application starts up
   // checkForNewVideos();
  //  checkRemainingVideos();
})


module.exports = app;
