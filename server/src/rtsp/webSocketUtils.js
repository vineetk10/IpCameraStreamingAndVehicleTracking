const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Stream = require('node-rtsp-stream');
var sqsUtils = require("./sqsUtils")

const streams = {};



function startStream (req, userId) {

    const name = req.name
    const streamUrl = req.ip
    const wsPort = req.port
    const stream = new Stream({
        name,
        streamUrl,
        wsPort,
        ffmpegOptions: {
          '-stats': '',
          '-r': 30,
        },
    });

    const outputDir = path.join(__dirname, 'rtspUploads');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const startTimestamp = Date.now();

    const outputFile = `${userId}_${name}_${startTimestamp}.mp4`

    const outputPath = path.join(outputDir, outputFile);
    // const outputPath = path.join(outputDir, `${userId}_${name}_${startTimestamp}.mp4`);

    const ffmpegArgs = [
        '-i',
        streamUrl,
        '-codec',
        'copy',
        '-s',
        '1280x720', // set desired resolution
        '-f',
        'mp4',
        outputPath,
    ];

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    streams[wsPort] = {
        stream: stream,
        ffmpegProcess: ffmpegProcess,
        outputPath: outputPath,
    };

    stream.on('start', () => {
        console.log(`Stream started on port ${wsPort}`);

    });

    ffmpegProcess.stderr.on('data', (data) => {
         console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpegProcess.on('exit', (code) => {
        console.log(`FFmpeg exited with code ${code}`);
    });

    const message = {
        name : name,
        ip: streamUrl,
        port: wsPort,
        userId: userId,
        outputFile: outputFile,
        outputPath: outputPath,
        timestamp: startTimestamp
    }

    console.log('INSIDE function startStream')
    // send a message to SQS
    sqsUtils.sendMessage(message)

}


function stopStream (port){
        
    if (streams[port]) {

        const { stream, ffmpegProcess, outputPath} = streams[port];
        stream.stop();
        ffmpegProcess.kill();
        streams[port] = null;
            // startStream(key = 'stream', url, port);
        console.log('INSIDE function stopStream (port)')
    }
    return Promise.resolve('Stream stopped');
    // will be used in receive message        
}


function pollSQSMessages(){

    sqsUtils.receiveMessage((err, messages) => {
        if (err) {
            console.log('Error receiving messages:', err);
        } else {
            console.log('Polled', messages.length);
            messages.forEach(message => {
            // Extract the URL and timestamp from the message
            // console.log("MESSAGE ************** : ", message)
            const messageBody = JSON.parse(message.Body);
            const receipt = message.ReceiptHandle;

            console.log("MESSAGE ************** : ", messageBody)
            console.log("receipt ************** : ", receipt)

            const port = messageBody.port
            if (!streams[port]) {
                console.log("PORT NOT IN USE ************** : ")
                stopStream(messageBody.port)
            }
            else{
                console.log("PORT STILL IN USE ************** : ")
                // stop the stream
                stopStream(messageBody.port)
                // restart the stream
                startStream(messageBody, messageBody.userId)
            }

            // delete the message
            sqsUtils.deleteMessage(receipt)

            // move the output file to the uploads directory
            const outputDir = path.join(__dirname, 'rtspUploads');        
            const sourcePath = path.join(outputDir, messageBody.outputFile);

            // const destPath = sourcePath.replace('/src/rtsp/rtspUploads/', '/uploads/');


            const updatedFileName = messageBody.outputFile.replace('.mp4', `_${Date.now()}.mp4`); // replace with your desired file name
            const destPath = path.join(__dirname, '..', '..', 'uploads', updatedFileName);


            fs.rename(sourcePath, destPath, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('File moved successfully!');
                    // fs.unlink(sourcePath, (err) => {
                    // if (err) {
                    //     console.error(err);
                    // } else {
                    //     console.log('Original file deleted successfully!');
                    // }
                    // });
                }
            });


            })
        }
    });
   
}



// to refresh camera, check if port is in user or not
function checkPortInUse(port){
    if (!streams[port]) {
        console.log("PORT NOT IN USE ************** : ")
        return false;
    }
    else{
        console.log("checkPortInUse IN USE ************** : " , streams[port].stream.name)
        return true;
    }
}


// to refresh camera, check if camera name is same
function checkPortInUseHasSameCameraName(port, name){
    if (!streams[port]) {
        console.log("PORT NOT IN USE ************** : ")
        return false;
    }
    else{
        console.log("checkPortInUseHasSameCameraName IN USE ************** : " , streams[port].stream.name)
        return (name === streams[port].stream.name);
    }
}


function restartStream(req, userId){
    stopStream(req.port);
    startStream(req, userId);

}


pollSQSMessages();

// Schedule receiveMessages to run every 5 minutes (300000 ms)
setInterval(pollSQSMessages, 5*60*1000);


module.exports = { startStream, stopStream, checkPortInUse, checkPortInUseHasSameCameraName, restartStream };