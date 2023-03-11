const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


// Set up the S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
  secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
});

// Set up the parameters for the video upload
const bucketName = '295b';
const contentType = 'video/mp4';

// Define the directory to watch for new videos
const videoDir = './uploads/';

// to find the length of the video
const { exec } = require('child_process');

function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        const duration = parseFloat(stdout);
        if (isNaN(duration)) {
          reject(new Error('Failed to parse duration'));
        } else {
          resolve(duration);
        }
      }
    });
  });
}



// Function to upload a single video file to S3 and delete it from the directory
function uploadVideo(videoPath) {
    let length;
    console.log('Inside uploadVideo')
    getVideoDuration(videoPath)
    .then(duration => 
        //console.error(`Duration of the video ${duration}`) 
        length = duration 
    )
    .catch(err => console.error(`Failed to get video duration: ${err.message}`));
    const key = path.basename(videoPath);
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(videoPath),
      ContentType: contentType,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const s3URI = `s3://${bucketName}/${key}`;
        
        // S3 URI can be used for playback
        console.log(`Video uploaded successfully. URL: ${data.Location} S3 URI: ${s3URI}, duration: ${length}`);
        // Delete the video file from the directory
        fs.unlink(videoPath, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Video deleted from directory: ${videoPath}`);
          }
        });
        // Update the recording details in the DB
      }
    });
  }
  

// Function to check for new videos in the directory and upload them to S3
function checkForNewVideos() {
   console.log('Inside checkForNewVideos')
  fs.readdir(videoDir, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        const videoPath = path.join(videoDir, file);
        fs.stat(videoPath, (err, stats) => {
          if (err) {
            console.error(err);
          } else {
            // Only upload files that are videos and haven't been uploaded before
            if (stats.isFile() && path.extname(file).toLowerCase() === '.mp4') {
              const key = path.basename(videoPath);
              const s3params = {
                Bucket: bucketName,
                Key: key,
              };
              s3.headObject(s3params, (err, data) => {
                if (err) {
                  if (err.code === 'NotFound') {
                    // File doesn't exist in S3, so upload it
                    uploadVideo(videoPath);
                  } else {
                    console.error(err);
                  }
                }
              });
            }
          }
        });
      });
    }
  });
}

// Schedule the checkForNewVideos function to run every 5 minutes
setInterval(checkForNewVideos, 1 * 60 * 1000);
module.exports = checkForNewVideos;
