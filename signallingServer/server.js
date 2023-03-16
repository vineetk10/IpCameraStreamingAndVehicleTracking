let express = require('express');
let http = require('http');
let app = express();
let cors = require('cors');
let server = http.createServer(app);
let socketio = require('socket.io');
let io = socketio.listen(server);


// Added code to receive file from client
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const checkForNewVideos = require('./upload');
const fs = require('fs');

// Set up the file upload destination
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });


  const upload = multer({ storage: storage });




app.use(cors());
const PORT = process.env.PORT || 8080;

let users = {};

let socketToRoom = {};
let isFirstUser = true;
let sender = "";
const maximum = process.env.MAXIMUM || 4;

io.on('connection', socket => {
    socket.on('join_room', data => {
        if (users[data.room]) {
            const length = users[data.room].length;
            if (length === maximum) {
                socket.to(socket.id).emit('room_full');
                return;
            }
            users[data.room].push({id: socket.id, email: data.email, name: data.name, isIp: data.isIp});
        } else {
            users[data.room] = [{id: socket.id, email: data.email, name: data.name, isIp: data.isIp}];
        }

        if(isFirstUser)
        {
            sender = socket.id
            isFirstUser = false;
        }
        socketToRoom[socket.id] = data.room;

        socket.join(data.room);
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

        const usersInThisRoom = users[data.room].filter(user => user.id !== socket.id);

        console.log(usersInThisRoom);

        io.sockets.to(socket.id).emit('all_users', usersInThisRoom, sender);
    });

    socket.on('offer', data => {
        //console.log(data.sdp);
        socket.to(data.offerReceiveID).emit('getOffer', {sdp: data.sdp, offerSendID: data.offerSendID, offerSendEmail: data.offerSendEmail});
    });

    socket.on('answer', data => {
        //console.log(data.sdp);
        socket.to(data.answerReceiveID).emit('getAnswer', {sdp: data.sdp, answerSendID: data.answerSendID});
    });

    socket.on('candidate', data => {
        //console.log(data.candidate);
        socket.to(data.candidateReceiveID).emit('getCandidate', {candidate: data.candidate, candidateSendID: data.candidateSendID});
    })

    socket.on('disconnect', () => {
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(user => user.id !== socket.id);
            users[roomID] = room;
            if (room.length === 0) {
                delete users[roomID];
                return;
            }
        }
        socket.to(roomID).emit('user_exit', {id: socket.id});
        console.log(users);
    })
});


// Handle the file upload and conversion
app.post('/upload', upload.single('file'), function(req, res, next) {
    const inputFile = `uploads/${req.file.filename}`;
    const outputFile = `uploads/${req.file.filename.replace(/\.[^/.]+$/, '')}.mp4`;
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




server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
    checkForNewVideos();
});
